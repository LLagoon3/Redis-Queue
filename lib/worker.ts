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
        } else {
          this.redis.completeJob(parseInt(jobId), result);
          this.eventEmitter.emit("completed", job, result);
        }
      };

      try {
        this.processCallback(job, done);
      } catch (error) {
        done(error as Error);
      }
    }
  }
}
