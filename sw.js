/**
 * TTG - Service Worker
 * 支持离线缓存和静态部署
 */

const CACHE_NAME = 'ttg-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/chat.html',
    '/about.html',
    '/style.css',
    '/script.js',
    '/f.ico',
    '/manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求并使用缓存优先策略
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 如果缓存中有，直接返回缓存
            if (response) {
                return response;
            }

            // 否则发起网络请求
            return fetch(event.request).then((networkResponse) => {
                // 只缓存成功的 GET 请求
                if (
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type !== 'basic' ||
                    event.request.method !== 'GET'
                ) {
                    return networkResponse;
                }

                // 克隆响应（因为 response 只能使用一次）
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // 网络请求失败时，返回离线页面（如果有的话）
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
