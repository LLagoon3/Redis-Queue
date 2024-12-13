import { EventEmitter } from "events";
import { RedisManager } from "./redis.manager";
import { Job } from "./job";
import { ProcessCallback } from "./types";

export class Worker {
  constructor(
    private redis: RedisManager,
    private eventEmitter: EventEmitter,
    private concurrency: number,
    private processCallback: ProcessCallback
  ) {}

  async start(): Promise<void> {
    while (true) {
      const [jobId, job] = await this.redis.processJob();
      if (!jobId || !job) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const done = (error?: null | Error, result?: any) => {
        if (error) {
          this.eventEmitter.emit("failed", job, error);
          this.redis.failJob(parseInt(jobId), error.message);
        } else {
          this.redis.completeJob(parseInt(jobId), result);
          this.eventEmitter.emit("completed", job, result);
        }
      };

      const abortController = new AbortController();
      const signal = abortController.signal;

      try {
        const timeout = new Promise((_, reject) => {
          setTimeout(() => {
            abortController.abort();
            reject(new Error("Task Timeout"));
          }, 1000);
        });

        const task = this.processCallback(job, done, signal);

        await Promise.race([task, timeout]);
      } catch (error) {
        done(error as Error);
      }
    }
  }
}
