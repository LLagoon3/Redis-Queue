import { Redis } from "ioredis";
import { Job } from "./job";
import { STATUS } from "./const";

export class RedisManager {
  private redis: Redis;
  private queneName: string;

  constructor(queneName: string, redisOptions: Object) {
    this.redis = new Redis(redisOptions);
    this.queneName = queneName;
  }

  async addJob(job: Job) {
    const jobId = await this.getNewJobId();
    const jobKey = await this.getJobKey(jobId);

    Object.entries(job.toObject()).forEach(async ([key, value]) => {
      await this.redis.hset(jobKey, key, value);
    });

    await this.redis.lpush(`${this.queneName}:${STATUS.WAIT}`, jobId);
  }

  private async getNewJobId() {
    const jobId = await this.redis.incr(`${this.queneName}:id`);
    return jobId;
  }

  private async getJobKey(jobId: number) {
    return `${this.queneName}:${jobId}`;
  }
}
