// Basic service worker for offline support
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('codestash-v1').then((cache) => {
      return cache.addAll(['/', '/favicon.ico', '/manifest.json'])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
