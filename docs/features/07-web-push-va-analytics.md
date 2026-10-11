# 🔔 Web Push Notification & Thống Kê Truy Cập (Analytics)
> **Trường Kỹ Thuật và Công Nghệ - Đại Học Vinh**  
> Nghiệp vụ: **Push Notifications (VAPID) & Visitor Counter** | Mã nguồn: [`src/features/notification`](../../src/features/notification), [`src/shared/components/layout/footer`](../../src/shared/components/layout/footer)

Tài liệu này mô tả chi tiết cơ chế đăng ký và gửi thông báo đẩy trình duyệt không cần mở tab (Web Push Notification qua giao thức VAPID) và hệ thống thống kê lượt truy cập thời gian thực (Visitor Counter).

---

## 1. Web Push Notification: Kiến Trúc & Quy Trình VAPID

Web Push cho phép trường gửi thông báo tuyển sinh khẩn cấp, tin tức mới hoặc lịch công tác đến sinh viên và phụ huynh ngay trên màn hình máy tính hoặc điện thoại Android/iOS (PWA) kể cả khi trình duyệt đã đóng.

```
                             LUỒNG HOẠT ĐỘNG WEB PUSH NOTIFICATION
                             
 [Trình Duyệt Người Dùng]       [Next.js Frontend]          [FastAPI Backend]      [Push Service (Google FCM/Mozilla)]
           │                            │                           │                              │
           │ 1. Đăng ký Service Worker  │                           │                              │
           │    navigator.serviceWorker.register('/sw.js')          │                              │
           │                            │                           │                              │
           │ 2. Lấy khóa VAPID Public   │                           │                              │
           │    GET /api/v1/portal/notifications/vapid-public-key ─>│                              │
           │ <──────────────── trả về vapid_public_key ─────────────│                              │
           │                            │                           │                              │
           │ 3. Tạo thiết bị đăng ký    │                           │                              │
           │    pushManager.subscribe({ applicationServerKey }) ──────────────────────────────────>│
           │ <──────────────── trả về Subscription Object (Endpoint + p256dh + auth) ───────────────│
           │                            │                           │                              │
           │ 4. Lưu thông tin thuê bao lên Backend                  │                              │
           │    POST /api/v1/portal/notifications/subscribe ───────>│ (Lưu vào Database)           │
           │                            │                           │                              │
           │ ══════════════════════ KHI CÓ TIN TỨC MỚI ĐƯỢC PHÁT HÀNH ════════════════════════════ │
           │                            │                           │                              │
           │                            │                           │ 5. Gửi WebPush payload       │
           │                            │                           │    (Ký bằng VAPID Private) ─>│
           │ 6. Đẩy thông báo xuống     │                           │                              │
           │ <──────────────────────────┴───────────────────────────┴──────────────────────────────│
           │                            │                           │                              │
           │ 7. Service Worker bắt sự kiện 'push', hiển thị Popup   │                              │
           │    self.registration.showNotification(title, options)  │                              │
           ▼                            ▼                           ▼                              ▼
```

---

## 2. Mã Nguồn Triển Khai Web Push

### 2.1. Quản Lý Đăng Ký Phía Client ([`PushNotificationManager.tsx`](../../src/features/notification/components/PushNotificationManager.tsx))

```typescript
export function PushNotificationManager() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Đăng ký Service Worker ngầm
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      if (Notification.permission === "granted") {
        updateSubscription(reg); // Tự động đồng bộ lại nếu đã cấp quyền
      } else if (Notification.permission === "default") {
        // Hiện banner xin quyền sau 3 giây để tránh làm phiền ngay lập tức
        if (!localStorage.getItem("push-notification-dismissed")) {
          setTimeout(() => setShowBanner(true), 3000);
        }
      }
    });
  }, []);

  const updateSubscription = async (registration: ServiceWorkerRegistration) => {
    // 1. Lấy VAPID public key từ Backend FastAPI
    const res = await axiosClient.get("/api/v1/portal/notifications/vapid-public-key");
    const vapidPublicKey = res.data.public_key;

    // 2. Chuyển đổi VAPID base64 sang Uint8Array
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    // 3. Đăng ký thiết bị với dịch vụ Push của trình duyệt
    let subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    // 4. Trích xuất khóa p256dh và auth dạng Base64
    const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)));
    const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)));

    // 5. Gửi thông tin thuê bao lên Backend FastAPI lưu trữ
    await axiosClient.post("/api/v1/portal/notifications/subscribe", {
      endpoint: subscription.endpoint,
      keys: { p256dh, auth },
      user_agent: navigator.userAgent,
    });
  };
}
```

### 2.2. Service Worker Xử Lý Thông Báo ([`public/sw.js`](../../public/sw.js))
Trong tệp `sw.js`:
- Lắng nghe sự kiện `push`: Trích xuất tiêu đề, nội dung tóm tắt, biểu tượng logo trường và URL bài viết.
- Gọi `self.registration.showNotification()` để hiển thị cửa sổ thông báo đẩy của hệ điều hành.
- Lắng nghe sự kiện `notificationclick`: Tự động mở tab trình duyệt dẫn thẳng đến bài viết hoặc chuyển focus về tab đang mở.

---

## 3. Hệ Thống Thống Kê Truy Cập (Visitor Counter)

### 3.1. Điểm Cuối API
| Phương thức | Đường dẫn API | Dữ liệu trả về | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/portal/statistics` | `{ "online_count": 12, "total_visits": 1703054 }` | Lấy số lượng người dùng đang trực tuyến và tổng lượt truy cập tích lũy |

### 3.2. Mã Nguồn Hiển Thị Phía Frontend ([`visitor-statistics.tsx`](../../src/shared/components/layout/footer/visitor-statistics.tsx))

```typescript
export function VisitorStatistics() {
  const t = useTranslations("footer");
  const [stats, setStats] = useState({ online_count: 1, total_visits: 1703054 });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axiosClient.get("/api/v1/portal/statistics");
        if (response.data) setStats(response.data);
      } catch (error) {
        // Ghi nhận cảnh báo nhẹ nhàng, không gây ảnh hưởng đến luồng giao diện chính
        console.warn("Failed to fetch statistics:", error);
      }
    };

    // Chỉ gọi fetch duy nhất 1 lần khi tải trang để tránh quá tải hoặc lỗi 429 Too Many Requests
    fetchStatistics();
  }, []);

  return (
    <div className="site-container flex items-center justify-between py-3 text-sm text-slate-600">
      <span>{t("visitor_statistics")}:</span>
      <div className="flex gap-5">
        <span>Đang online: {stats.online_count}</span>
        <span>Tổng lượt xem: {stats.total_visits}</span>
      </div>
    </div>
  );
}
```

### 3.3. Tối Ưu Hóa Tải Máy Chủ
- **Tránh Polling liên tục**: Thay vì gọi API mỗi vài giây gây tốn băng thông và kích hoạt cơ chế bảo vệ Rate Limit (429) của FastAPI, component chỉ gửi một truy vấn nhẹ khi trang được tải.
- **Giá trị khởi tạo an toàn**: Cung cấp số liệu dự phòng ban đầu để giao diện không bị giật hoặc xô lệch layout (Cumulative Layout Shift - CLS) trước khi dữ liệu API kịp phản hồi.
