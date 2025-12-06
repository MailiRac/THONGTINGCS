// Tên bộ nhớ đệm (Cache) - Cần thay đổi số phiên bản này mỗi khi bạn thay đổi tệp ứng dụng
const CACHE_NAME = 'platt-v2-1-20251023';

// Danh sách các tệp mà Service Worker sẽ tải và lưu vào bộ nhớ đệm
// Đảm bảo tất cả các tệp quan trọng (HTML, CSS, JS, Manifest, Icons) đều có mặt ở đây
const urlsToCache = [
  '/', // Đường dẫn gốc (ví dụ: truy cập qua domain)
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  // Giả định bạn đã tạo thư mục /icons và các tệp biểu tượng
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// 1. Sự kiện INSTALL (Cài đặt) - Lần đầu tiên Service Worker được kích hoạt
self.addEventListener('install', event => {
  console.log('[Service Worker] Install Event - Cài đặt Service Worker');
  // Chờ cho đến khi bộ nhớ đệm được mở và tất cả tệp được thêm vào
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell - Lưu trữ các tệp ứng dụng');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Caching failed - Lưu trữ thất bại:', error);
      })
  );
  // Yêu cầu Service Worker kích hoạt ngay lập tức mà không cần đóng các tab cũ
  self.skipWaiting();
});

// 2. Sự kiện ACTIVATE (Kích hoạt) - Dọn dẹp các bộ nhớ đệm cũ
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate Event - Kích hoạt và dọn dẹp');
  event.waitUntil(
    // Lấy tất cả các tên cache hiện có
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Nếu tên cache không khớp với tên cache hiện tại, hãy xóa nó
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Yêu cầu máy khách (client) nhận quyền kiểm soát ngay lập tức
  return self.clients.claim();
});

// 3. Sự kiện FETCH (Tìm nạp) - Trả về nội dung từ bộ nhớ đệm hoặc mạng
self.addEventListener('fetch', event => {
  // Chỉ xử lý các yêu cầu GET (tìm nạp tài nguyên)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Kiểm tra xem tài nguyên đã có trong bộ nhớ đệm chưa
    caches.match(event.request)
      .then(response => {
        // Nếu có trong cache, trả về phiên bản cache (giúp hoạt động offline)
        if (response) {
          // console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        // Nếu không có trong cache, tìm nạp từ mạng
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request);
      })
      // Xử lý lỗi nếu không tìm thấy trong cache và mạng cũng không có (ví dụ: trả về trang offline)
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // Tùy chọn: trả về một trang thông báo offline nếu yêu cầu là một trang HTML
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html');
        // }
      })
  );
});
