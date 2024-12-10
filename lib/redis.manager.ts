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

      const jobKey = this.getJobKey(Number(jobId));
      const result = await this.redis.hgetall(jobKey);

      const job = new Job({
        ...result,
        data: JSON.parse(result.data || "{}"), // JSON 문자열을 객체로 변환
      });

      console.log(job.toObject());
    }
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
