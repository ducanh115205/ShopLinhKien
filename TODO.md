# Development Notes

## Mục tiêu demo
Project hiện tập trung vào luồng chính của website bán linh kiện máy tính:

1. Khách hàng đăng ký, đăng nhập.
2. Khách hàng xem, tìm kiếm, lọc sản phẩm.
3. Khách hàng thêm sản phẩm vào giỏ hàng.
4. Khách hàng cập nhật giỏ hàng và đặt hàng.
5. Khách hàng xem lịch sử đơn hàng và hủy đơn khi còn chờ xác nhận.
6. Admin quản lý sản phẩm, danh mục, người dùng và đơn hàng.
7. Admin cập nhật trạng thái đơn hàng và xem thống kê doanh thu.

## Ghi chú kỹ thuật
- Backend dùng Spring Boot, Spring Security JWT, Spring Data JPA và Thymeleaf.
- Frontend dùng Thymeleaf template, JavaScript và jQuery.
- Database mặc định là MySQL với tên `shopdientu`.
- Doanh thu chỉ tính các đơn hàng ở trạng thái hoàn thành.

## Những điểm có thể mở rộng sau demo
- Tách cấu hình môi trường dev/prod bằng Spring profile.
- Bổ sung test cho service quan trọng như giỏ hàng, đặt hàng, cập nhật tồn kho.
- Đổi kiểu dữ liệu tiền từ `float` sang `BigDecimal` để chính xác hơn.
- Tích hợp thanh toán online nếu cần phát triển thành sản phẩm hoàn chỉnh.
