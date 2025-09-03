// PWA offline cache utility
export class OfflineCache {
  private static DB_NAME = 'aone-prime-fx-cache';
  private static DB_VERSION = 1;
  private static STORE_NAME = 'market-data';

  static async saveMarketData(symbol: string, data: any) {
    const db = await this.openDB();
    const transaction = db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    
    await store.put({
      symbol,
      data,
      timestamp: Date.now()
    });
  }

  static async getMarketData(symbol: string) {
    const db = await this.openDB();
    const transaction = db.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    
    return await store.get(symbol);
  }

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'symbol' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }
}