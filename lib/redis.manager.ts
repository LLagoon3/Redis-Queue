import { Redis } from "ioredis";
import { Job } from "./job";

export class RedisManager {
  private redis: Redis;
  private queneName: string;

  constructor(queneName: string, redisOptions: Object) {
    this.redis = new Redis(redisOptions);
    this.queneName = queneName;
  }

  async addJob(job: Job) {
    const jobKey = `job:test`;
    Object.entries(job.toObject()).forEach(async ([key, value]) => {
      await this.redis.hset(jobKey, key, value);
    });
  }
}
