/**
 * ========================================
 * SERVICE WORKER для АнтиДолги24
 * Кэширование ресурсов для быстрой загрузки и офлайн-доступа
 * ========================================
 */

const CACHE_NAME = 'antidolgi-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/images/favicon.png',
    '/images/logo.png',
    // Добавь сюда другие критичные файлы
];

// Установка воркера: кэшируем статические файлы
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Кэширование статических файлов');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('❌ Ошибка кэширования:', err))
    );
    // Активируем новый воркер сразу
    self.skipWaiting();
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    // Берём под контроль все страницы
    self.clients.claim();
});

// Стратегия: Cache First для статики, Network First для HTML
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Кэшируем только GET-запросы и только свой домен
    if (request.method !== 'GET' || url.origin !== location.origin) {
        return;
    }
    
    // Для HTML-страниц: сначала сеть, потом кэш (чтобы показывать актуальный контент)
    if (request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Клонируем ответ, чтобы сохранить в кэш и вернуть пользователю
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(request)) // Фолбэк на кэш при офлайне
        );
        return;
    }
    
    // Для стилей, скриптов, картинок: сначала кэш, потом сеть (быстрее)
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    // Параллельно обновляем кэш в фоне
                    fetch(request).then(response => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, response);
                        });
                    });
                    return cached;
                }
                return fetch(request);
            })
    );
});

// Обработка офлайн-страницы (опционально)
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline.html'); // Создай такую страницу при желании
            })
        );
    }
});