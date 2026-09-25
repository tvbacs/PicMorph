# 📱 PicMorph - Ứng dụng Tạo & Ghép Layout Ảnh Nghệ Thuật (Expo React Native)

Ứng dụng tạo và ghép ảnh nghệ thuật với nhiều layout đa dạng dành cho điện thoại, hỗ trợ kéo thả chữ tự do, căn chỉnh crop ảnh mượt mà, nhiều bảng màu và xuất ảnh HD vào thư viện.

---

## ✨ Tính năng nổi bật

1. **Đa dạng Layout nghệ thuật**:
   - **4 Ô (2x2)**: Chuẩn trend TikTok như trong ảnh mẫu bạn gửi.
   - **2 Ô Dọc / 2 Ô Ngang**: Chia đôi màn hình trên dưới hoặc trái phải.
   - **3 Ô (1 Trên + 2 Dưới / 2 Trên + 1 Dưới)**: Làm nổi bật ảnh nhân vật chính.
   - **3 Dải Ngang / 3 Cột Dọc**: Phong cách điện ảnh cinematic strip.
   - **4 Ô (1 Lớn + 3 Nhỏ)**: Phong cách tạp chí thời trang.
   - **6 Ô & 9 Ô (3x3)**: Ghép nhiều ảnh phong cách Instagram cut.

2. **Cắt, Zoom & Căn chỉnh ảnh từng ô (Crop & Pan)**:
   - Chạm vào từng ô để mở trình cắt ảnh chuyên dụng.
   - Phóng to / thu nhỏ linh hoạt từ 0.8x đến 3.5x.
   - D-Pad 4 hướng (Trái, Phải, Lên, Xuống) để dịch chuyển và chọn góc đẹp nhất.
   - Xoay ảnh 90°, lật ngang (Flip H), lật dọc (Flip V).
   - Chọn ảnh từ Thư viện máy hoặc xóa ảnh ô đã chọn.

3. **Chữ nghệ thuật ở giữa (Center Title Overlay)**:
   - Gõ bất kỳ tên nhân vật / watermark nào (VD: `CAILIN`, `LING'ER`, tên riêng...).
   - Hỗ trợ dòng phụ Subtitle (VD: `✦ MY QUEEN ✦`).
   - Tùy chỉnh kích thước chữ, khoảng cách chữ (Letter Spacing).
   - Hiệu ứng đổ bóng viền sáng nổi bật (Drop Shadow / Stroke).
   - Khung mờ nền sau chữ (Translucent frosted badge) hoặc chữ trần.

4. **Tỉ lệ khung hình linh hoạt**:
   - **9:16**: Chuẩn tỷ lệ màn hình điện thoại, TikTok, Reels, Shorts, Wallpaper.
   - **1:1**: Chuẩn ảnh vuông Instagram / Facebook Feed / Avatar.
   - **4:5**: Ảnh chân dung chuẩn Instagram portrait.
   - **3:4 & 16:9**: Các tỉ lệ tiêu chuẩn khác.

5. **Tùy chỉnh viền & nền**:
   - Độ dày khoảng cách giữa các ảnh (Gap: 0px, 2px, 4px, 8px, 12px, 16px).
   - Bo tròn góc ảnh (Radius: 0px vuông góc đến 26px mềm mại).
   - Bảng màu nền viền: Đen nhung (Black), Đen than, Trắng sứ, Tím neon, Hồng cyber...

6. **Nạp ảnh mẫu nhanh (1-Click Sample)**:
   - Tích hợp sẵn bộ ảnh mẫu chuẩn: **Cailin**, **Linh Nhi (Ling'er)**, **Cyberpunk** để test tức thì ngay khi mở app.

7. **Xuất ảnh chất lượng cao (HD / Full HD)**:
   - Tự động lưu thẳng vào **Thư viện ảnh (Photo Gallery)** trên điện thoại.
   - Nút chia sẻ trực tiếp sang ứng dụng khác (TikTok, Zalo, Messenger, v.v.).

---

## 🚀 Hướng dẫn khởi chạy & Test trên điện thoại

### 1. Di chuyển vào thư mục dự án
```bash
cd C:\Users\Lenovo\Workspace\photo-layout-app
```

### 2. Khởi chạy máy chủ Expo Metro
```bash
npx expo start -c
```

### 3. Test trên điện thoại thực tế:
- **Trên Android**: Tải app **Expo Go** từ Google Play Store, mở app và quét mã QR hiển thị trên màn hình terminal.
- **Trên iPhone (iOS)**: Tải app **Expo Go** từ App Store, mở ứng dụng **Camera** mặc định quét mã QR trên terminal để mở trong Expo Go.

### 4. Test trên trình duyệt Web máy tính:
- Bấm phím `w` trong terminal sau khi chạy `npx expo start`, hoặc gõ:
```bash
npx expo start --web
```
