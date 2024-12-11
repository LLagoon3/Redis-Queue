export class Job {
  private name: string;
  private data: object;
  private attempts: number;
  private timestamp: number;
  private delay: number;
  private priority: number;
  private processedOn: number | null;
  private finishedOn: number | null;
  private returnvalue: string | null;

  constructor({
    name = "__default__",
    data,
    attempts = 1,
    timestamp = Date.now(),
    delay = 0,
    priority = 0,
    processedOn = null,
    finishedOn = null,
    returnvalue = null,
  }: {
    name?: string;
    data: object | string;
    attempts?: number;
    timestamp?: number;
    delay?: number;
    priority?: number;
    processedOn?: number | null;
    finishedOn?: number | null;
    returnvalue?: string | null;
  }) {
    this.name = name;
    this.data = typeof data === "string" ? JSON.parse(data) : data;
    this.attempts = attempts;
    this.timestamp = timestamp;
    this.delay = delay;
    this.priority = priority;
    this.processedOn = processedOn;
    this.finishedOn = finishedOn;
    this.returnvalue = returnvalue;
  }

  toObject(): { [k: string]: string | number | null } {
    const baseObject = {
      name: this.name,
      data: JSON.stringify(this.data),
      attempts: this.attempts,
      timestamp: this.timestamp,
      delay: this.delay,
      priority: this.priority,
      processedOn: this.processedOn,
      finishedOn: this.finishedOn,
      returnvalue: this.returnvalue,
    };

    return Object.fromEntries(
      Object.entries(baseObject).filter(([_, value]) => value !== null)
    );
  }
}
