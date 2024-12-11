import { EventEmitter } from "events";
import { RedisManager } from "./redis.manager";
import { Job } from "./job";

export class Worker {
  constructor(
    private redis: RedisManager,
    private eventEmitter: EventEmitter,
    private processCallback: (
      job: Job,
      done: (error?: null | Error, result?: any) => void
    ) => void
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
        // 작업 처리
        await this.processCallback(job, done);
      } catch (error) {
        done(error as Error);
      }
    }
  }
}
