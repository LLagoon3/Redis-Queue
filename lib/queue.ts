import { EventEmitter } from "events";
import { RedisManager } from "./redis.manager";
import { Job } from "./job";

export class Queue {
  private eventEmiiter: EventEmitter;
  private queueName: string;
  private redis: RedisManager;

  constructor(queueName: string, redisOptions?: object) {
    this.queueName = `rq:${queueName}`;
    this.eventEmiiter = new EventEmitter();
    this.redis = new RedisManager(
      this.queueName,
      redisOptions
        ? redisOptions
        : (redisOptions = {
            host: "127.0.0.1",
            port: 6379,
          })
    );
  }

  async add(data: object, options?: object) {
    const job = new Job({ data });
    await this.redis.addJob(job);
    this.eventEmiiter.emit("waiting", job);
  }

  async process(
    callBack: (
      job: Job,
      done: (error?: null | Error, result?: any) => void
    ) => void
  ): Promise<void> {
    const [jobId, job] = await this.redis.processJob();
    const done = (error?: null | Error, result?: any) => {
      if (error) {
        this.eventEmiiter.emit("failed", job, error);
      } else {
        this.redis.completeJob(parseInt(jobId), result);
        this.eventEmiiter.emit("completed", job, result);
      }
    };

    callBack(job, done);
  }

  async close() {
    this.redis.close();
  }
}
