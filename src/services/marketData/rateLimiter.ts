export class RateLimiter {
  private requestHistory = new Map<string, number[]>();
  private readonly maxRequestsPerSecond: number;
  private readonly windowMs: number = 1000;

  constructor(maxRequestsPerSecond: number = 2) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const history = this.requestHistory.get(key) || [];
    
    // Filter out old requests outside the window
    const recentRequests = history.filter(timestamp => 
      now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequestsPerSecond) {
      return false;
    }

    return true;
  }

  recordRequest(key: string): void {
    const now = Date.now();
    const history = this.requestHistory.get(key) || [];
    
    // Keep only recent requests
    const recentRequests = history.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    
    recentRequests.push(now);
    this.requestHistory.set(key, recentRequests);
  }

  getWaitTime(key: string): number {
    if (this.canMakeRequest(key)) return 0;

    const history = this.requestHistory.get(key) || [];
    if (history.length === 0) return 0;

    // Find the oldest request in the window
    const oldestRequest = Math.min(...history);
    const waitTime = this.windowMs - (Date.now() - oldestRequest);
    
    return Math.max(0, waitTime);
  }

  reset(key?: string): void {
    if (key) {
      this.requestHistory.delete(key);
    } else {
      this.requestHistory.clear();
    }
  }
}
