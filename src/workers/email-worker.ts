import { Worker, Job } from "bullmq";
import { redisConfig } from "../lib/config";
import { Mailer } from "../lib/mailer";


const emailWorker = new Worker(
  "emailQueue",
  async (job: Job) => {
    const { to, subject, text } = job.data;
    console.log(`Processing email for: ${to}`);
    await Mailer({ to, subject, text });
  },
  { connection: redisConfig }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed: ${err.message}`);
});
