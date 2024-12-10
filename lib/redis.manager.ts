import { Redis } from "ioredis";

export class RedisManager {
  private redis: Redis;

  constructor(queneName: string, redisOptions: Object) {
    this.redis = new Redis(redisOptions);
  }

  async addJob(jobData: Object) {
    await this.redis.lpush("queue", JSON.stringify(jobData));
  }
}
