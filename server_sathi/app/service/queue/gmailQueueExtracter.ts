import {Queue, Worker, Job} from "bullmq";
import {createClient} from "redis";
import { generateNewAccessToken, getAllUnreadMessages, getMessageMeta, getmessages, markAsbotBlocked, markAsProcessed } from "../googleMail.js";
import { chunkArray, filterMail } from "../../config/helper.js";
import {checkVerdict, extracter} from "../genAi.js"

export const redisConfig: any = {
    host: "localhost",
    port: 6379
}

export const gemailQueue = new Queue("extracted_data", {
    connection: redisConfig,
    defaultJobOptions:{
        attempts: 3,
        backoff:{
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: {age: 2592000 },
        removeOnFail: false
    }
});



new Worker("extracted_data", async (job: any)=>{

    const accessToekn = await generateNewAccessToken(job?.data.emailAddress) as any;
    if (!accessToekn) {
    console.error(`No valid token for ${job?.data.emailAddress} — skipping, needs re-auth`);
    return;   // job gracefully khatam, crash nahi
}
    const messages = await getAllUnreadMessages(accessToekn);
    if(!messages?.length) return;

    const metas: any[]=[]

    for(const message of chunkArray(messages, 10)){
        const results = await Promise.allSettled(
            message.map((m:any)=> getMessageMeta(accessToekn, m?.id))
        );
        for(const r of results){
            if(r.status === "fulfilled" && r.value){
                metas.push(r.value)
            }
        }
    }

    const {allowed, blocked} = filterMail(metas);
    console.log(` ${metas.length} → ${allowed.length} bache, ${blocked.length} block`);
    if(blocked?.length>0){
        const ids = blocked.map(b => b.mail.messageId); 
        await markAsbotBlocked(accessToekn, ids,job.data.emailAddress)

    }
    

    for(const meta of allowed){
         if (!meta?.messageId) {
        console.warn(" Skipping — no messageId:", meta);
        continue;
    }
        try {
            const mail = await getmessages(accessToekn, meta?.messageId,{
                includeAttachments: true,
                maxFileSize: 10*1024*1024
            });
            if(!mail) continue;

            const verdict = await checkVerdict(mail);
        console.log(` LLM blocked: ${verdict?.data?.type} - ${verdict?.data?.confidence_score}-${verdict?.data?.isBusiness}`, verdict?._meta);
            if(!verdict?.data?.isBusiness){
                console.log(` LLM blocked: ${mail.subject}`);
                await markAsbotBlocked(accessToekn, [mail?.messageId], job?.data.emailAddress);
                continue
            }

            console.log(` LLM blocked: ${verdict.data.type} - ${verdict.data.confidence_score}-${verdict.data.isBusiness}`, verdict._meta);

            const data = await extracter(mail, verdict.data.type);
            console.log("here is the extarcted Data", data);

            await markAsProcessed(accessToekn, mail?.messageId,job?.data.emailAddress)
        } catch (error: any) {
            console.error("here is the error", error?.message)
        }
    }


},{
    connection: redisConfig
})


export const redisClient = createClient(redisConfig);

await redisClient.connect();
