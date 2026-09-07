import { Queue, Worker } from "bullmq";
import {  redisConfig, connection2 } from "./gmailQueueExtracter.js";
import { generateNewAccessTokenOutlook, getAllUnreadMessages, fetchAllMeta, getMessages, markAsBotBlocked, markAsProcessed } from "../hotMail.js";
import { chunkArray, filterMail } from "../../config/helperfunction/helper.js";
import { checkVerdict, extracter } from "../genAi.js";
import { createResearch } from "../../model/researchData.js";
import { upsertDocument } from "../../model/document.js";
import { createCredit, getSubscriptionUserWise } from "../../model/subscription.js";
import logger from "../../utils/logger.js";

export const msQueue = new Queue("ms_extracted", {
    connection: connection2 as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: { age: 2592000 },
        removeOnFail: false
    }
})

new Worker("ms_extracted", async (job: any) => {
    const getSubscriptionDetails = await getSubscriptionUserWise(job?.data?.userId);
    const currentDate = new Date();
    if (getSubscriptionDetails?.endDate && currentDate > getSubscriptionDetails.endDate!) {
        logger.warn("Subscription ended, stopping worker extraction", {
            type: "WORKER_EXTRACTION_MS",
            userId: job?.data?.userId,
            email: job?.data?.emailAddress
        });
        console.error("your subscription account has been ended need to activate");
        return
    }
    if (!getSubscriptionDetails?.remainingCredits || getSubscriptionDetails.remainingCredits <= 0) {
        logger.warn("Zero credits, stopping worker extraction", {
            type: "WORKER_EXTRACTION_MS",
            userId: job?.data?.userId,
            email: job?.data?.emailAddress
        });
        console.error("your credit count is zero need to recharge");
        return
    }
    if (!getSubscriptionDetails?.subscriptionStatus) {
        logger.warn("Subscription inactive, stopping worker extraction", {
            type: "WORKER_EXTRACTION_MS",
            userId: job?.data?.userId,
            email: job?.data?.emailAddress
        });
        console.error("your subscription status is not active");
        return
    }
    const accessToekn = await generateNewAccessTokenOutlook(job?.data?.emailAddress);
    if (!accessToekn) {
        logger.error("Missing token during worker run, skipping", {
            type: "WORKER_EXTRACTION_MS",
            email: job?.data?.emailAddress
        });
        console.error(`No valid token for ${job?.data.emailAddress} — skipping, needs re-auth`);
        return;
    }
    const messages = await getAllUnreadMessages(accessToekn);
    if (!messages.length) return;

    const messageIds = messages.map((m: any) => m?.id);
    const metas = await fetchAllMeta(accessToekn, messageIds);

    const { allowed, blocked } = filterMail(metas);
    console.log(` ${metas.length} → ${allowed.length} bache, ${blocked.length} block`);
    // YE ADD KAR — har blocked mail ka reason dikhega
    for (const b of blocked) {
        console.log(`🚫 FILTER BLOCKED: "${b.mail.subject}" | rule: ${b.rule} | detail: ${b.detail}`);
    }
    if (blocked?.length > 0) {
        const ids = blocked.map(b => b.mail.messageId);
        await markAsBotBlocked(accessToekn, ids, job.data.emailAddress);
        logger.info(`Blocked ${blocked.length} non-relevant messages`, {
            type: "WORKER_EXTRACTION_MS",
            email: job?.data?.emailAddress
        });
    }

    for (const meta of allowed) {
        if (!meta?.messageId) {
            console.warn(" Skipping — no messageId:", meta);
            continue;
        }
        try {
            const mail = await getMessages(accessToekn, meta?.messageId, {
                includeAttachments: true,
                maxFileSize: 10 * 1024 * 1024
            });
            if (!mail) continue;

            const verdict = await checkVerdict(mail);
            console.log(` LLM blocked: ${verdict?.data?.type} - ${verdict?.data?.confidence_score}-${verdict?.data?.isBusiness}`, verdict?._meta);
            await createResearch({
                messageId: mail?.messageId,
                operation: "verdict",
                model: process.env.MODEL!,
                tokenUsage: verdict?._meta?.token_usage ?? {},
                extractedAt: verdict?._meta?.extracted_at ?? null,
                children: [
                    {
                        documentType: verdict?._meta?.document_type ?? null,
                        confidence: verdict?.data?.confidence_score ?? null,
                        completeness: verdict?._meta?.completeness_percent ?? null
                    }
                ]
            });
            if (!verdict?.data?.isBusiness) {
                console.log(`🤖 LLM BLOCKED: "${mail.subject}" | type: ${verdict?.data?.type} | confidence: ${verdict?.data?.confidence_score}`);
                // Agar verdict.data undefined hai toh Vertex AI fail hua hai
                if (!verdict?.data) {
                    console.error(`⚠️ verdict.data is undefined — check Vertex AI / catch block format!`);
                }
                await markAsBotBlocked(accessToekn, [mail?.messageId], job?.data.emailAddress);
                logger.info("Message blocked by LLM verdict (Non-Business)", {
                    type: "LLM_VERDICT_MS",
                    messageId: mail?.messageId,
                    email: job?.data?.emailAddress
                });
                continue;
            }
            console.log(` LLM blocked: ${verdict.data.type} - ${verdict.data.confidence_score}-${verdict.data.isBusiness}`, verdict._meta);
            const data = await extracter(mail);
            console.log("here is the extracted data", data);
            const docs = data?.data?.documents ?? [];
            for (let i = 0; i < docs.length; i++) {
                await upsertDocument(job.data.userId, docs[i], mail.messageId, i)
            }
            await createResearch({
                messageId: mail.messageId,
                operation: "extraction",
                model: process.env.MODEL!,
                tokenUsage: data?._meta?.token_usage ?? {},
                extractedAt: data?._meta?.extracted_at ?? null,
                children: (data?._meta?.documentDetails ?? []).map((d: any) => ({
                    documentType: d.document_type,
                    confidence: d.confidence,
                    completeness: d.completeness,
                }))
            })
            await createCredit(job?.data?.userId, {
                            creditCount: 1,
                            creditFlow: "OUT",
                            creditType: "USAGE"
                        })
            await markAsProcessed(accessToekn, [mail.messageId], job.data.emailAddress);
            logger.info("Successfully extracted and processed email", {
                type: "WORKER_EXTRACTION_MS",
                messageId: mail.messageId,
                email: job?.data?.emailAddress
            });
        } catch (error: any) {
            logger.error("Error processing email in worker", {
                type: "WORKER_EXTRACTION_MS",
                messageId: meta.messageId,
                error: error.message
            });
            console.error("here is the error", error?.message)

        }
    }

}, {
    connection: connection2 as any
})