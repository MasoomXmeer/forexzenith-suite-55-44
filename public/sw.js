const CACHE_NAME = 'aone-prime-fx-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/market-data',
  '/api/portfolio',
  '/api/trading-history'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase') ||
      url.hostname.includes('polygon') ||
      url.hostname.includes('alphavantage')) {
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return cache.match(request);
            });
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for trade updates
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-trades') {
    event.waitUntil(syncTrades());
  }
  
  if (event.tag === 'sync-market-data') {
    event.waitUntil(syncMarketData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    notificationData = event.data.json();
  }

  const options = {
    title: notificationData.title || 'Aone Prime FX',
    body: notificationData.body || 'You have a new trading update',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: notificationData.tag || 'general',
    data: notificationData.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  const notification = event.notification;
  const action = event.action;

  if (action === 'dismiss') {
    notification.close();
    return;
  }

  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (notification.data && notification.data.url) {
              client.navigate(notification.data.url);
            }
            notification.close();
            return;
          }
        }
        
        // Open new window if app is not open
        const urlToOpen = notification.data?.url || '/dashboard';
        clients.openWindow(urlToOpen);
        notification.close();
      })
  );
});

// Sync functions
async function syncTrades() {
  try {
    console.log('Service Worker: Syncing trades...');
    // Get pending trades from IndexedDB
    const pendingTrades = await getPendingTrades();
    
    for (const trade of pendingTrades) {
      try {
        const response = await fetch('/api/trades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trade)
        });
        
        if (response.ok) {
          await removePendingTrade(trade.id);
        }
      } catch (error) {
        console.log('Service Worker: Failed to sync trade:', error);
      }
    }
  } catch (error) {
    console.log('Service Worker: Sync trades error:', error);
  }
}

async function syncMarketData() {
  try {
    console.log('Service Worker: Syncing market data...');
    const response = await fetch('/api/market-data');
    
    if (response.ok) {
      const marketData = await response.json();
      await cacheMarketData(marketData);
    }
  } catch (error) {
    console.log('Service Worker: Sync market data error:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingTrades() {
  // Implementation would use IndexedDB to get pending trades
  return [];
}

async function removePendingTrade(tradeId) {
  // Implementation would remove trade from IndexedDB
  console.log('Removing pending trade:', tradeId);
}

async function cacheMarketData(data) {
  // Implementation would cache market data in IndexedDB
  console.log('Caching market data:', data);
}