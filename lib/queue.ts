import { EventEmitter } from "events";
import { RedisManager } from "./redis.manager";
import { Job } from "./job";
import { Worker } from "./worker";
import { AddOptions } from "./types";

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

  async add(data: object, options?: AddOptions) {
    const job = new Job({ data, ...options });
    await this.redis.addJob(job);
    this.eventEmiiter.emit("waiting", job);
  }

  async process(
    callBack: (
      job: Job,
      done: (error?: null | Error, result?: any) => void
    ) => void
  ): Promise<void> {
    const worker = new Worker(this.redis, this.eventEmiiter, callBack);
    worker.start();
  }

  async close() {
    this.redis.close();
  }
}
