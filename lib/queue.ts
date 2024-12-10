import { EventEmitter } from "events";
import { RedisManager } from "./redis.manager";

export class Queue {
  private eventEmiiter: EventEmitter;
  private queueName: string;
  private redis: RedisManager;

  constructor(queueName: string, redisOptions?: Object) {
    this.queueName = queueName;
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

  async add(jobData: Object, options?: Object) {
    await this.redis.addJob(jobData);
  }
}
