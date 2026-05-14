# TODO: Hoàn thiện chức năng thanh toán

## Plan

### 1. Tạo trang thanh toán (checkout.html)
- Hiển thị thông tin giỏ hàng (tên SP, số lượng, đơn giá, tổng tiền)
- Form nhập thông tin giao hàng (tên người nhận, số điện thoại, địa chỉ)
- Nút "Xác nhận đặt hàng"

### 2. Tạo logic frontend (checkout.js)
- Kiểm tra đăng nhập, nếu chưa đăng nhập → chuyển đến `/login?redirect=/checkout`
- Tải giỏ hàng từ API
- Tải hoặc tạo thông tin giao hàng
- Gửi API tạo đơn hàng (`POST /api/orders/create`)
- Xóa giỏ hàng sau khi đặt hàng thành công

### 3. Cập nhật cart.js
- Hàm `checkout()`: Nếu chưa đăng nhập → chuyển sang `/login?redirect=/checkout`
- Nếu đã đăng nhập → chuyển sang `/checkout`

### 4. Cập nhật login.js
- Sau khi đăng nhập thành công, kiểm tra URL parameter `redirect`
- Nếu có `redirect` → chuyển đến trang đó (thay vì mặc định `/home`)

### 5. Cập nhật SecurityConfig.java
- Thêm `/checkout` vào danh sách public endpoints

### 6. Cập nhật OrderService.java
- Tạo shipment detail mặc định nếu user chưa có
- Xử lý id shipment detail đúng cách khi tạo đơn hàng

### 7. Tạo OrderShowController.java
- Controller để hiển thị trang checkout

## Progress
- [x] Step 1: Create checkout.html
- [x] Step 2: Create checkout.js
- [x] Step 3: Update cart.js checkout function
- [x] Step 4: Update login.js redirect handling
- [x] Step 5: Update SecurityConfig.java
- [x] Step 6: Update ShipmentDetailRequest.java & ShipmentDetailService.java
- [x] Step 7: Create OrderShowController.java
- [x] Step 8: Fix ProductMapper to map categories
- [x] Step 9: Fix admin-dashboard.js to use product.categories

