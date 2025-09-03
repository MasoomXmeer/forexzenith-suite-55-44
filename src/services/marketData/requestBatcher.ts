export interface BatchRequest<T> {
  key: string;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RequestBatcher<T> {
  private queue = new Map<string, BatchRequest<T>[]>();
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchDelayMs: number;
  private readonly processBatch: (keys: string[]) => Promise<Map<string, T>>;

  constructor(
    batchDelayMs: number = 50,
    processBatch: (keys: string[]) => Promise<Map<string, T>>
  ) {
    this.batchDelayMs = batchDelayMs;
    this.processBatch = processBatch;
  }

  async request(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const requests = this.queue.get(key) || [];
      requests.push({ key, resolve, reject });
      this.queue.set(key, requests);

      this.scheduleBatch();
    });
  }

  private scheduleBatch(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.executeBatch();
    }, this.batchDelayMs);
  }

  private async executeBatch(): Promise<void> {
    this.batchTimer = null;
    
    if (this.queue.size === 0) return;

    const currentQueue = new Map(this.queue);
    this.queue.clear();

    const keys = Array.from(currentQueue.keys());

    try {
      const results = await this.processBatch(keys);

      // Resolve all promises with their results
      currentQueue.forEach((requests, key) => {
        const result = results.get(key);
        if (result !== undefined) {
          requests.forEach(req => req.resolve(result));
        } else {
          const error = new Error(`No result for key: ${key}`);
          requests.forEach(req => req.reject(error));
        }
      });
    } catch (error) {
      // Reject all promises on batch error
      currentQueue.forEach(requests => {
        requests.forEach(req => req.reject(error));
      });
    }
  }

  clear(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.queue.clear();
  }
}