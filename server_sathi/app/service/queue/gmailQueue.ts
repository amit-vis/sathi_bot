import { Queue, Worker } from "bullmq";
import { redisConfig } from "./gmailQueueExtracter.js";
import { onboardMail, sendOTPResponse } from "../../config/nodemailer.js";

export const sendOTPackGmailQueue = new Queue("mail_trigger", {
  connection: redisConfig,
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


const worker = new Worker(
  "mail_trigger",
  async (job: any) => {
    const { to, otp } = job.data;
    if (job.data.type === "otp") {
      await sendOTPResponse(to, otp);
    } else {
      await onboardMail(to);
    }
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

worker.on("completed", (job) => console.log(`✅ Job done: ${job.id}`));
worker.on("failed", (job, err) => console.error(`❌ Job failed: ${job?.id}`));

// Sirf tab close karo jab app shut down ho raha ho
process.on("SIGTERM", async () => {
  await worker.close();
})