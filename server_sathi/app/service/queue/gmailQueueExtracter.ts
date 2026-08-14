import { Queue, Worker, Job } from "bullmq";
import { createClient } from "redis";
import { generateNewAccessToken, getAllUnreadMessages, getMessageMeta, getmessages, markAsbotBlocked, markAsProcessed } from "../googleMail.js";
import { chunkArray, filterMail } from "../../config/helperfunction/helper.js";
import { checkVerdict, extracter } from "../genAi.js"
import { upsertDocument } from "../../model/document.js";
import { createResearch } from "../../model/researchData.js";
import { createCredit, getSubscriptionUserWise } from "../../model/subscription.js";

export const redisConfig: any = {
    host: "localhost",
    port: 6379
}

export const gemailQueue = new Queue("extracted_data", {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: { age: 2592000 },
        removeOnFail: false
    }
});



new Worker("extracted_data", async (job: any) => {
    
    const getSubscriptionDetails = await getSubscriptionUserWise(job?.data?.userId);
      const currentDate = new Date();
    if(getSubscriptionDetails?.endDate && currentDate>getSubscriptionDetails.endDate!){
      console.error("your subscription account has been ended need to activate");
      return
    }
    if(getSubscriptionDetails?.remainingCredits && getSubscriptionDetails.remainingCredits>0){
      console.error("your credit count is zero need to recharge");
      return
    }
    if(!getSubscriptionDetails?.subscriptionStatus){
      console.error("your subscription status is not active");
      return
    }

    const accessToekn = await generateNewAccessToken(job?.data.emailAddress) as any;
    if (!accessToekn) {
        console.error(`No valid token for ${job?.data.emailAddress} — skipping, needs re-auth`);
        return;   // job gracefully khatam, crash nahi
    }
    const messages = await getAllUnreadMessages(accessToekn);
    if (!messages?.length) return;

    const metas: any[] = []

    for (const message of chunkArray(messages, 10)) {
        const results = await Promise.allSettled(
            message.map((m: any) => getMessageMeta(accessToekn, m?.id))
        );
        for (const r of results) {
            if (r.status === "fulfilled" && r.value) {
                metas.push(r.value)
            }
        }
    }

    const { allowed, blocked } = filterMail(metas);
    console.log(` ${metas.length} → ${allowed.length} bache, ${blocked.length} block`);
    if (blocked?.length > 0) {
        const ids = blocked.map(b => b.mail.messageId);
        await markAsbotBlocked(accessToekn, ids, job.data.emailAddress)

    }


    for (const meta of allowed) {
        if (!meta?.messageId) {
            console.warn(" Skipping — no messageId:", meta);
            continue;
        }
        try {
            const mail = await getmessages(accessToekn, meta?.messageId, {
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
                children:[
                    {
                        documentType: verdict?._meta?.document_type ?? null,
                        confidence: verdict?.data?.confidence_score ?? null,
                        completeness: verdict?._meta?.completeness_percent ?? null
                    }
                ]
            })
            if (!verdict?.data?.isBusiness) {
                console.log(` LLM blocked: ${mail.subject}`);
                await markAsbotBlocked(accessToekn, [mail?.messageId], job?.data.emailAddress);
                continue
            }

            console.log(` LLM blocked: ${verdict.data.type} - ${verdict.data.confidence_score}-${verdict.data.isBusiness}`, verdict._meta);

            const data = await extracter(mail);
            console.log("here is the extracted data", data)
            const docs = data?.data?.documents ?? [];
            for (let i = 0; i < docs.length; i++) {
                await upsertDocument(job.data.userId, docs[i], mail.messageId, i);   // 👈 i pass
            }

            await createResearch({
                messageId: mail.messageId,
                operation:"extraction",
                model: process.env.MODEL!,
                tokenUsage: data?._meta?.token_usage ?? {},
                extractedAt: data?._meta?.extracted_at ?? null,
                children: (data?._meta?.documentDetails ?? []).map((d: any)=>({
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
        } catch (error: any) {
            console.error("here is the error", error?.message)
        }
    }


}, {
    connection: redisConfig
})


export const redisClient = createClient(redisConfig);

await redisClient.connect();
