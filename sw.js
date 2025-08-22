const CACHE_NAME = 'product-catalogue-cache-v2';
const IMMUTABLE_CACHE_NAME = 'product-catalogue-immutable-v2';

const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './index.css',
  // Local scripts and components
  './index.tsx',
  './App.tsx',
  './types.ts',
  './swiper.d.ts',
  './data/mockData.ts',
  './components/Icons.tsx',
  './components/Header.tsx',
  './components/Footer.tsx',
  './components/Home.tsx',
  './components/ProductCard.tsx',
  './components/BrandView.tsx',
  './components/ProductDetail.tsx',
  './components/CatalogueLibrary.tsx',
  './components/PamphletCarousel.tsx',
  './components/SearchResults.tsx',
  './components/BrandCatalogueCarousel.tsx',
  './components/LocalMedia.tsx',
  './components/ThemeToggle.tsx',
  './components/InstallPrompt.tsx',
  './components/ConfirmationModal.tsx',
  './components/ImageEnlargeModal.tsx',
  './components/ImageBookletModal.tsx',
  './components/PdfModal.tsx',
  './components/Screensaver.tsx',
  './components/TvBrandsView.tsx',
  './components/TvBrandModelsView.tsx',
  './components/TvContentPlayer.tsx',
  './components/context/AppContext.tsx',
  './components/context/idb.ts',
  './components/Admin/Login.tsx',
  './components/Admin/ProtectedRoute.tsx',
  './components/Admin/AdminDashboard.tsx',
  './components/Admin/ProductEdit.tsx',
  './components/Admin/BrandProducts.tsx',
  './components/Admin/CatalogueEdit.tsx',
  './components/Admin/PamphletEdit.tsx',
  './components/Admin/AdEdit.tsx',
  './components/Admin/BrandEdit.tsx',
  './components/Admin/AdminUserManagement.tsx',
  './components/Admin/AdminUserEdit.tsx',
  './components/Admin/AdminSettings.tsx',
  './components/Admin/AdminScreensaverAds.tsx',
  './components/Admin/AdminBackupRestore.tsx',
  './components/Admin/AdminBulkImport.tsx',
  './components/Admin/AdminZipBulkImport.tsx',
  './components/Admin/AdminStorage.tsx',
  './components/Admin/AdminTrash.tsx',
  './components/Admin/AdminPdfConverter.tsx',
  './components/Admin/AdminAnalytics.tsx',
  './components/Admin/AiDescriptionModal.tsx',
  './components/Admin/TvContentEdit.tsx',
];

const IMMUTABLE_URLS = [
  // CDNs
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.9/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-element-bundle.min.js',
  // esm.sh dependencies from importmap
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react-router-dom@7.7.1?deps=react@18.3.1',
  'https://esm.sh/framer-motion@11.3.19?deps=react@18.3.1',
  'https://esm.sh/idb@8.0.0',
  'https://esm.sh/jszip@3.10.1',
  'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs',
  'https://esm.sh/pdfjs-dist@4.5.136',
  'https://esm.sh/react-pageflip@2.0.3?deps=react@18.3.1,react-dom@18.3.1',
  'https://esm.sh/@google/genai@1.15.0',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700;800;900&display=swap'
];


self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching App Shell');
            const requests = APP_SHELL_URLS.map(url => new Request(url, { cache: 'reload' }));
            return cache.addAll(requests);
        }),
        caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching immutable assets');
            return cache.addAll(IMMUTABLE_URLS);
        })
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME, IMMUTABLE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Only handle http and https requests. This prevents errors from browser extensions.
    if (!url.protocol.startsWith('http')) {
        return; 
    }

    // For immutable assets, serve from cache first.
    if (IMMUTABLE_URLS.includes(url.href) || url.hostname.startsWith('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(IMMUTABLE_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }
    
    // For app shell and local files, use Stale-While-Revalidate
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    // Fetch failed, probably offline. The cached response will be used if available.
                });

                return cachedResponse || fetchPromise;
            });
        })
    );
});
