// ============================================
// Service Worker - 伊吹しろう Official Website
// ============================================

const CACHE_VERSION = 'v1.0.9';
const CACHE_NAME = `ibukishirou-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/profile.html',
  '/calendar.html',
  '/achievements.html',
  '/goods.html',
  '/contact.html',
  '/guidelines.html',
  '/faq.html',
  '/privacy.html',
  '/terms.html',
  '/css/style.css',
  '/css/calendar.css',
  '/css/loading.css',
  '/css/profile.css',
  '/css/achievements.css',
  '/js/main.js',
  '/js/components.js',
  '/js/calendar.js',
  '/js/loading.js',
  '/js/breadcrumb.js',
  '/js/share.js',
  '/js/faq.js',
  '/js/fetch-achievements.js',
  '/js/fetch-goods.js',
  '/js/fetch-guidelines.js',
  '/js/fetch-links.js',
  '/assets/img/logo_wolf.webp',
  '/assets/img/icon-192x192.png',
  '/assets/img/icon-512x512.png',
  '/assets/audio/voice01.mp3',
  '/assets/audio/voice02.mp3',
  '/assets/audio/voice03.mp3',
  '/site.webmanifest'
];

// インストール時
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// アクティベート時（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('ibukishirou-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// フェッチ時（Network First with Cache Fallback戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同じオリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // HTML、CSS、JSはNetwork Firstで最新を取得
  if (
    request.method === 'GET' &&
    (request.destination === 'document' ||
     request.destination === 'script' ||
     request.destination === 'style')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したレスポンスをキャッシュに保存
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから返す
          return caches.match(request);
        })
    );
  }
  // 画像などはCache Firstで高速化
  else if (
    request.method === 'GET' &&
    (request.destination === 'image' ||
     request.destination === 'font')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            });
        })
    );
  }
  // その他のリクエストはNetwork Firstでフォールバック
  else if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// メッセージ受信（キャッシュクリアなど）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});
