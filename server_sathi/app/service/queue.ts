import {Queue, Worker, Job} from "bullmq";
import {createClient} from "redis";

const redisConfig = {
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




const redisClient = createClient({
    url: "http://localhost:6379"
});

await redisClient.connect();

gemailQueue.add