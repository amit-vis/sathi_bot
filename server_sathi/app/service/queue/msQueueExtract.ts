import { Queue, Worker } from "bullmq";
import { redisClient, redisConfig } from "./gmailQueueExtracter.js";
import { generateNewAccessTokenOutlook } from "../hotMail.js";

export const msQueue = new Queue("ms_extracted",{
    connection: redisConfig,
    defaultJobOptions:{
        attempts: 3,
        backoff:{
            type: "exponential",
            delay: 5000
        },
        removeOnComplete:{age: 2592000},
        removeOnFail: false
    }
})

new Worker("ms_extracted", async (job: any)=>{
   console.log("here is the job", job)
},{
    connection: redisConfig
})