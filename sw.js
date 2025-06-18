// Service Worker for Caching Static Assets
const CACHE_NAME = 'eventsweb-v1.0.0';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/sw.js'
];

// Image assets to cache (with size limits)
const IMAGE_CACHE_NAME = 'eventsweb-images-v1.0.0';
const MAX_IMAGE_SIZE = 200 * 1024; // 200KB limit per image
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB total cache limit

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method !== 'GET') {
        return; // Only handle GET requests
    }
    
    // Handle image requests
    if (request.destination === 'image' || isImageRequest(request.url)) {
        event.respondWith(handleImageRequest(request));
        return;
    }
    
    // Handle static asset requests
    if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
        event.respondWith(handleStaticAssetRequest(request));
        return;
    }
    
    // Handle other requests with network-first strategy
    event.respondWith(handleNetworkFirstRequest(request));
});

// Handle image requests with size validation and caching
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cached image is still valid (within 30 days)
        const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
        const now = new Date();
        
        if (now - cachedDate < CACHE_DURATION) {
            console.log('Serving cached image:', request.url);
            return cachedResponse;
        } else {
            // Remove expired cache entry
            await cache.delete(request);
        }
    }
    
    try {
        console.log('Fetching image from network:', request.url);
        const response = await fetch(request);
        
        if (response.ok) {
            const responseClone = response.clone();
            const arrayBuffer = await responseClone.arrayBuffer();
            
            // Check image size limit
            if (arrayBuffer.byteLength <= MAX_IMAGE_SIZE) {
                // Add timestamp header for cache validation
                const responseWithTimestamp = new Response(arrayBuffer, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        ...Object.fromEntries(response.headers.entries()),
                        'sw-cached-date': new Date().toISOString(),
                        'cache-control': `public, max-age=${CACHE_DURATION / 1000}`
                    }
                });
                
                // Cache the image
                await cache.put(request, responseWithTimestamp.clone());
                console.log('Image cached successfully:', request.url);
                
                // Clean up cache if it's getting too large
                await cleanupImageCache();
                
                return responseWithTimestamp;
            } else {
                console.warn('Image too large to cache:', request.url, `${arrayBuffer.byteLength} bytes`);
                return response;
            }
        }
        
        return response;
    } catch (error) {
        console.error('Failed to fetch image:', request.url, error);
        
        // Return a placeholder or cached version if available
        return cachedResponse || new Response('Image not available', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Handle static asset requests with cache-first strategy
async function handleStaticAssetRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('Serving cached static asset:', request.url);
        return cachedResponse;
    }
    
    try {
        console.log('Fetching static asset from network:', request.url);
        const response = await fetch(request);
        
        if (response.ok) {
            // Add cache headers
            const responseWithHeaders = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...Object.fromEntries(response.headers.entries()),
                    'cache-control': `public, max-age=${CACHE_DURATION / 1000}`,
                    'sw-cached-date': new Date().toISOString()
                }
            });
            
            await cache.put(request, responseWithHeaders.clone());
            console.log('Static asset cached successfully:', request.url);
            return responseWithHeaders;
        }
        
        return response;
    } catch (error) {
        console.error('Failed to fetch static asset:', request.url, error);
        return new Response('Asset not available', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Handle other requests with network-first strategy
async function handleNetworkFirstRequest(request) {
    try {
        console.log('Fetching from network:', request.url);
        const response = await fetch(request);
        return response;
    } catch (error) {
        console.error('Network request failed:', request.url, error);
        
        // Try to serve from cache as fallback
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('Serving cached fallback:', request.url);
            return cachedResponse;
        }
        
        return new Response('Content not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Clean up image cache to prevent it from growing too large
async function cleanupImageCache() {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const requests = await cache.keys();
    
    // Calculate total cache size
    let totalSize = 0;
    const cacheEntries = [];
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const arrayBuffer = await response.clone().arrayBuffer();
            const size = arrayBuffer.byteLength;
            const cachedDate = new Date(response.headers.get('sw-cached-date') || 0);
            
            cacheEntries.push({
                request,
                size,
                cachedDate
            });
            
            totalSize += size;
        }
    }
    
    // If cache is too large, remove oldest entries
    if (totalSize > MAX_CACHE_SIZE) {
        console.log('Image cache too large, cleaning up...', `${totalSize} bytes`);
        
        // Sort by date (oldest first)
        cacheEntries.sort((a, b) => a.cachedDate - b.cachedDate);
        
        let removedSize = 0;
        for (const entry of cacheEntries) {
            if (totalSize - removedSize <= MAX_CACHE_SIZE * 0.8) { // Keep cache at 80% of max
                break;
            }
            
            await cache.delete(entry.request);
            removedSize += entry.size;
            console.log('Removed cached image:', entry.request.url);
        }
        
        console.log('Cache cleanup completed, removed:', `${removedSize} bytes`);
    }
}

// Utility function to check if request is for an image
function isImageRequest(url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const urlLower = url.toLowerCase();
    
    return imageExtensions.some(ext => urlLower.includes(ext)) || 
           urlLower.includes('images.pexels.com') ||
           urlLower.includes('image') ||
           urlLower.includes('photo');
}

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        getCacheInfo().then(info => {
            event.ports[0].postMessage(info);
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Get cache information
async function getCacheInfo() {
    const staticCache = await caches.open(CACHE_NAME);
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    
    const staticKeys = await staticCache.keys();
    const imageKeys = await imageCache.keys();
    
    let imageCacheSize = 0;
    for (const request of imageKeys) {
        const response = await imageCache.match(request);
        if (response) {
            const arrayBuffer = await response.clone().arrayBuffer();
            imageCacheSize += arrayBuffer.byteLength;
        }
    }
    
    return {
        staticAssets: staticKeys.length,
        cachedImages: imageKeys.length,
        imageCacheSize: imageCacheSize,
        maxImageSize: MAX_IMAGE_SIZE,
        maxCacheSize: MAX_CACHE_SIZE
    };
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
}

// Periodic cache cleanup (every hour when service worker is active)
setInterval(() => {
    cleanupImageCache();
}, 60 * 60 * 1000);

console.log('Service Worker loaded successfully');