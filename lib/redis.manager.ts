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

  async processJob(): Promise<[string, Job]> {
    while (true) {
      const [_, jobId] =
        (await this.bclient.brpop(`${this.queneName}:${STATUS.WAIT}`, 0)) || [];

      if (!jobId) {
        continue;
      }

      await this.redis.rpush(`${this.queneName}:${STATUS.ACTIVE}`, jobId);

      const jobKey = this.getJobKey(Number(jobId));
      await this.redis.hset(jobKey, "processedOn", Date.now());

      const result = await this.redis.hgetall(jobKey);

      const job = new Job({
        ...result,
        data: JSON.parse(result.data || "{}"),
      });

      return [jobId!, job];
    }
  }

  async completeJob(jobId: number, returnValue?: string) {
    await this.redis.lrem(`${this.queneName}:${STATUS.ACTIVE}`, 1, jobId);
    await this.redis.rpush(`${this.queneName}:${STATUS.COMPLETE}`, jobId);

    const jobKey = this.getJobKey(jobId);
    await this.redis.hset(jobKey, "finishedOn", Date.now());
    returnValue
      ? await this.redis.hset(jobKey, "returnValue", returnValue)
      : null;
  }

  async failJob(jobId: number, stacktrace?: string) {
    await this.redis.lrem(`${this.queneName}:${STATUS.ACTIVE}`, 1, jobId);
    await this.redis.rpush(`${this.queneName}:${STATUS.FAIL}`, jobId);

    const jobKey = this.getJobKey(jobId);
    await this.redis.hset(jobKey, "stacktrace", stacktrace || "");
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
