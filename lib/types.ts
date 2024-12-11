export type AddOptions = {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number;
  timeout?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
};
