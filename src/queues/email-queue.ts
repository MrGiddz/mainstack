import { Queue } from "bullmq";
import { redisConfig } from "../lib/config";


export const emailQueue = new Queue("emailQueue", {
  connection: redisConfig,
});
