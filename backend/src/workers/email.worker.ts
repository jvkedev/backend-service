import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { sendOtpEmail } from "../services/email.service.js";

console.log("🔥 Worker started");

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    try {
      console.log("➡️ Entering processor");
      console.log("📩 Job received:", job.data);

      console.log("📤 Calling email function");

      const result = await sendOtpEmail(job.data.email, job.data.otp);

      console.log("📬 Email sent successfully:", result);
    } catch (err) {
      console.error("❌ Worker crash:", err);
    }
  },
  {
    connection: redisConnection,
  },
);
