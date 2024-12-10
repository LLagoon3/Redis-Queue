import { Redis } from "ioredis";
import { Job } from "./job";
import { STATUS } from "./const";

export class RedisManager {
  private redis: Redis;
  private bclient: Redis;
  private subscriber: Redis;
  private queneName: string;

  constructor(queneName: string, redisOptions: Object) {
    this.redis = new Redis(redisOptions);
    this.bclient = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);
    this.queneName = queneName;

    this.subscriber.subscribe(this.queneName);
  }

  async addJob(job: Job) {
    const jobId = await this.getNewJobId();
    const jobKey = this.getJobKey(jobId);

    await this.redis.hmset(jobKey, job.toObject());

    await this.redis.lpush(`${this.queneName}:${STATUS.WAIT}`, jobId);
  }

  async processJob() {
    while (true) {
      const [_, jobId] =
        (await this.bclient.brpop(`${this.queneName}:${STATUS.WAIT}`, 0)) || [];
      await this.redis.rpoplpush(
        `${this.queneName}:${STATUS.WAIT}`,
        `${this.queneName}:${STATUS.ACTIVE}`
      );

      const jobKey = this.getJobKey(Number(jobId));
      await this.redis.hset(jobKey, "processedOn", Date.now());

      const result = await this.redis.hgetall(jobKey);

      const job = new Job({
        ...result,
        data: JSON.parse(result.data || "{}"),
      });

      return job;
    }
  }

  async doneJob(jobId: number) {
    await this.redis.rpoplpush(
      `${this.queneName}:${STATUS.ACTIVE}`,
      `${this.queneName}:${STATUS.COMPLETE}`
    );
  }

  async close() {
    await this.redis.quit();
    await this.bclient.quit();
    await this.subscriber.quit();
  }

  private async getNewJobId() {
    const jobId = await this.redis.incr(`${this.queneName}:id`);
    return jobId;
  }

  private getJobKey(jobId: number) {
    return `${this.queneName}:${jobId}`;
  }
}
