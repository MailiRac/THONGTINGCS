// ======================================================
// 1. ĐĂNG KÝ SERVICE WORKER (PWA)
// Giúp ứng dụng hoạt động offline và cài đặt lên màn hình chính
// ======================================================
(function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker đã đăng ký thành công:', registration.scope);
        })
        .catch(error => {
          console.log('Lỗi đăng ký Service Worker:', error);
        });
    });
  }
})();

// ======================================================
// 2. XỬ LÝ CHUYỂN TAB (NAVIGATION)
// Chuyển đổi giữa các màn hình khi bấm vào menu dưới chân trang
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.footer-nav .nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  // Hàm ẩn tất cả tab và hiện tab được chọn
  function switchTab(targetKey) {
    // 1. Xử lý giao diện nút bấm (Active state)
    navItems.forEach(item => {
      if (item.dataset.key === targetKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. Xử lý ẩn/hiện nội dung
    // Lưu ý: Yêu cầu file HTML phải có các thẻ div id="tab-gcs", id="tab-new"...
    tabContents.forEach(content => {
      if (content.id === `tab-${targetKey}`) {
        content.style.display = 'block'; // Hiện tab chọn
        
        // Cuộn lên đầu trang khi chuyển tab để dễ nhìn
        window.scrollTo(0, 0); 
      } else {
        content.style.display = 'none';  // Ẩn tab khác
      }
    });
  }

  // Gán sự kiện Click cho từng nút menu
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.key; // Lấy giá trị: gcs, new, ttck, me
      
      // Kiểm tra xem tab đó có nội dung không, nếu có thì chuyển
      const targetContent = document.getElementById(`tab-${key}`);
      if (targetContent) {
        switchTab(key);
      } else {
        // Thông báo tạm nếu tính năng chưa phát triển (ví dụ phần Account)
        alert('Chức năng đang được cập nhật!');
      }
    });
  });

  // Mặc định khi mở app: Chọn tab GCS
  switchTab('gcs');
});

// ======================================================
// 3. ĐỒNG HỒ THỜI GIAN THỰC
// Tự động cập nhật ngày giờ trên header
// ======================================================
(function startClock() {
  function updateTime() {
    const now = new Date();
    
    // Lấy các phần tử input
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');

    if (dateInput && timeInput) {
      // Định dạng ngày: DD/MM/YYYY
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      // Định dạng giờ: HH:MM
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      // Gán giá trị
      dateInput.value = `${day}/${month}/${year}`;
      timeInput.value = `${hours}:${minutes}`;
    }
  }

  // Cập nhật ngay lập tức khi load
  updateTime();

  // Cập nhật mỗi giây (1000ms)
  setInterval(updateTime, 1000);
})();