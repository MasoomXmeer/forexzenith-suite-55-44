export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export class DataCache<T> {
  private cache = new Map<string, CachedData<T>>();
  private readonly freshnessMs: number;

  constructor(freshnessMs: number = 500) {
    this.freshnessMs = freshnessMs;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.freshnessMs) {
      return null; // Stale data
    }

    return cached.data;
  }

  getWithAge(key: string): { data: T; age: number } | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    return {
      data: cached.data,
      age: Date.now() - cached.timestamp
    };
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age <= this.freshnessMs;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}