// PWA type definitions
declare global {
  interface Window {
    workbox: any;
  }

  interface Navigator {
    standalone?: boolean;
  }

  interface ServiceWorkerRegistration {
    sync?: SyncManager;
  }

  interface SyncManager {
    register(tag: string): Promise<void>;
  }
}

export interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string | Uint8Array;
}

export {};