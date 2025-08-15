const CACHE_NAME = 'stuart-main-street-v1';
const STATIC_CACHE = 'stuart-static-v1';
const DYNAMIC_CACHE = 'stuart-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
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
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
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

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('supabase.co')) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Serve cached page or offline page
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Serve offline page for navigation requests
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Handle static assets (images, CSS, JS)
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return a fallback for images
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              throw error;
            });
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.origin.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for short time
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                // Set a shorter TTL for API responses
                cache.put(request, responseClone);
                // Clean up old API cache entries after 5 minutes
                setTimeout(() => {
                  cache.delete(request);
                }, 5 * 60 * 1000);
              });
          }
          return response;
        })
        .catch(() => {
          // Serve cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Default: network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Stuart Main Street', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic background sync triggered');
  
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Sync content in background
      console.log('Service Worker: Syncing content')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
