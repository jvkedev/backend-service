import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { sendOtpEmail } from "../services/email.service.js";
import logger from "../utils/logger.js";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { email, otp } = job.data;

    const baseMeta = {
      jobId: job.id,
      queue: "email-queue",
      attemptsMode: job.attemptsMade,
      email,
    };

    try {
      logger.info("Email job started", baseMeta);

      await sendOtpEmail(email, otp);

      logger.info("Emal sent successfully", baseMeta);
    } catch (error) {
      logger.error("Email job failed", {
        ...baseMeta,
        err: error,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 8,
  },
);
