import { AddOptions } from "./types";

type JobOptions = {
  name?: string;
  data: object | string;
  timestamp?: number;
  processedOn?: number | null;
  finishedOn?: number | null;
  returnvalue?: string | null;
  stacktrace?: string | null;
} & AddOptions;

export class Job {
  private name: string = "__default__";
  private data: object = {};
  private timestamp: number = Date.now();
  private processedOn: number | null = null;
  private finishedOn: number | null = null;
  private returnvalue: string | null = null;
  private stacktrace: string | null = null;
  private priority: number = 0;
  private delay: number = 0;
  private attempts: number = 0;
  private backoff: number = 0;
  private timeout: number = 0;
  private removeOnComplete: boolean = false;
  private removeOnFail: boolean = false;

  constructor({
    name,
    data,
    timestamp,
    processedOn,
    finishedOn,
    returnvalue,
    stacktrace,
    priority,
    delay,
    attempts,
    backoff,
    timeout,
    removeOnComplete,
    removeOnFail,
  }: JobOptions) {
    Object.assign(this, {
      name: name ?? this.name,
      data: typeof data === "string" ? JSON.parse(data) : data,
      timestamp: timestamp ?? this.timestamp,
      processedOn,
      finishedOn,
      returnvalue,
      stacktrace,
      priority: priority ?? this.priority,
      delay: delay ?? this.delay,
      attempts: attempts ?? this.attempts,
      backoff: backoff ?? this.backoff,
      timeout: timeout ?? this.timeout,
      removeOnComplete: removeOnComplete ?? this.removeOnComplete,
      removeOnFail: removeOnFail ?? this.removeOnFail,
    });
  }

  toObject(): Record<string, string | number | boolean | null> {
    const objectRepresentation = {
      name: this.name,
      data: JSON.stringify(this.data),
      timestamp: this.timestamp,
      processedOn: this.processedOn,
      finishedOn: this.finishedOn,
      returnvalue: this.returnvalue,
      stacktrace: this.stacktrace,
      priority: this.priority,
      delay: this.delay,
      attempts: this.attempts,
      backoff: this.backoff,
      timeout: this.timeout,
      removeOnComplete: this.removeOnComplete,
      removeOnFail: this.removeOnFail,
    };

    return Object.fromEntries(
      Object.entries(objectRepresentation).filter(
        ([_, value]) => value !== null
      )
    );
  }
}
