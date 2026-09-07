import { Queue, Worker } from "bullmq";
import { redisConfig, connection2 } from "./gmailQueueExtracter.js";
import { accountDeleteMail, onboardMail, sendOTPResponse } from "../../config/nodemailer.js";
export const sendOTPackGmailQueue = new Queue("mail_trigger", {
    connection: connection2,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: true
    }
});
const worker = new Worker("mail_trigger", async (job) => {
    const { to, otp, userName } = job.data;
    if (job.data.type === "otp") {
        await sendOTPResponse(to, otp);
    }
    else if (job.data.type === "onboard") {
        await onboardMail(to, userName);
    }
    else if (job.data.type === "deleteuser") {
        await accountDeleteMail(to, userName);
    }
}, {
    connection: connection2,
    concurrency: 5,
});
worker.on("completed", (job) => console.log(`✅ Job done: ${job.id}`));
worker.on("failed", (job, err) => console.error(`❌ Job failed: ${job?.id}`));
// Sirf tab close karo jab app shut down ho raha ho
process.on("SIGTERM", async () => {
    await worker.close();
});
//# sourceMappingURL=gmailQueue.js.map