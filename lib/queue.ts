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
  }
}
