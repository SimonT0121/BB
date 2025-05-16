/**
 * service-worker.js - 服務工作線程
 * 
 * 此文件提供離線功能、緩存策略和背景同步功能，
 * 讓使用者在沒有網絡連接的情況下也能使用應用程式。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

// 緩存名稱
const CACHE_NAME = 'baby-grow-cache-v1';

// 需要緩存的資源
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/db.js',
  '/js/ui.js',
  '/js/config.js',
  '/manifest.json',
  '/assets/icons/baby-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js'
];

// 安裝事件 - 緩存核心資源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安裝中');
  
  // 跳過等待，直接激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 緩存資源中');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('[Service Worker] 緩存資源失敗:', error);
      })
  );
});

// 激活事件 - 清理舊緩存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中');
  
  // 控制未控制的客戶端
  self.clients.claim();
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] 清理舊緩存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
});

// 請求攔截 - 實現離線功能
self.addEventListener('fetch', (event) => {
  // 跳過不支持的請求
  if (event.request.method !== 'GET') return;
  
  // 跳過 Chrome 擴充功能的請求
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // 對應用程式資源使用 Cache-First 策略
  if (isAppResource(event.request.url)) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // 對其他資源使用 Network-First 策略
    event.respondWith(networkFirstStrategy(event.request));
  }
});

/**
 * 判斷 URL 是否為應用程式資源
 * @param {string} url - 請求 URL
 * @returns {boolean} 是否為應用程式資源
 */
function isAppResource(url) {
  // 檢查 URL 是否為我們要緩存的應用程式資源
  return ASSETS_TO_CACHE.some(asset => {
    // 處理相對路徑
    const assetUrl = new URL(asset, self.location.origin).href;
    return url === assetUrl;
  });
}

/**
 * Cache-First 策略
 * 優先從緩存中獲取，如果緩存中沒有則從網絡獲取並緩存
 * @param {Request} request - 請求對象
 * @returns {Promise<Response>} 響應
 */
async function cacheFirstStrategy(request) {
  const cacheResponse = await caches.match(request);
  
  if (cacheResponse) {
    // 找到緩存的響應
    return cacheResponse;
  }
  
  // 從網絡獲取
  try {
    const networkResponse = await fetch(request);
    
    // 確保獲得有效響應
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }
    
    // 緩存新響應（注意：響應是流，只能使用一次）
    const responseToCache = networkResponse.clone();
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] 網絡請求失敗:', error);
    
    // 如果沒有緩存且網絡請求失敗，返回一個離線頁面或錯誤響應
    return new Response('Network request failed and no cache available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Network-First 策略
 * 優先從網絡獲取，如果網絡獲取失敗則從緩存中獲取
 * @param {Request} request - 請求對象
 * @returns {Promise<Response>} 響應
 */
async function networkFirstStrategy(request) {
  try {
    // 嘗試從網絡獲取
    const networkResponse = await fetch(request);
    
    // 確保獲得有效響應
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }
    
    // 緩存新響應
    const responseToCache = networkResponse.clone();
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 使用緩存回退策略');
    
    // 網絡請求失敗，嘗試從緩存獲取
    const cacheResponse = await caches.match(request);
    
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // 如果沒有緩存，返回一個離線響應
    return new Response('You are offline and there is no cached response available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// 消息事件 - 用於與頁面通信
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});