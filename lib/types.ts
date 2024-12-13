import { Job } from "./job";

export type AddOptions = {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number;
  timeout?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
};

export type ProcessDoneCallback = (err?: Error | null) => void;
export type ProcessCallback = (
  job: Job,
  done?: ProcessDoneCallback,
  signal?: AbortSignal
) => void | Promise<void>;
