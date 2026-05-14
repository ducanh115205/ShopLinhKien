# Website bán linh kiện máy tính - TTCS

## Mô tả
Project xây dựng website bán linh kiện máy tính bằng Spring Boot, Thymeleaf, MySQL và Spring Security JWT. Hệ thống có hai nhóm người dùng chính: khách hàng và quản trị viên.

## Công nghệ sử dụng
- Java 17
- Spring Boot 3
- Spring Data JPA
- Spring Security + JWT
- Thymeleaf
- MySQL
- jQuery / JavaScript
- Swagger UI

## Chức năng khách hàng
- Đăng ký, đăng nhập
- Xem danh sách sản phẩm
- Tìm kiếm, lọc và sắp xếp sản phẩm
- Xem chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng / xóa sản phẩm khỏi giỏ hàng
- Thanh toán và tạo đơn hàng
- Xem lịch sử đơn hàng tại `/orders`
- Xem chi tiết đơn hàng
- Hủy đơn khi đơn còn ở trạng thái chờ xác nhận

## Chức năng quản trị viên
- Xem dashboard thống kê
- Quản lý sản phẩm
- Quản lý người dùng
- Xem danh sách đơn hàng
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng
- Thống kê doanh thu theo đơn hàng hoàn thành
- Xem top sản phẩm bán chạy

## Trạng thái đơn hàng
- `1`: Chờ xác nhận
- `2`: Đã xác nhận
- `3`: Đang giao
- `4`: Hoàn thành
- `5`: Đã hủy

Doanh thu chỉ được tính khi đơn hàng ở trạng thái `Hoàn thành`.

## Cách chạy project
1. Tạo database MySQL tên `shopdientu`.
2. Sửa tài khoản MySQL trong `src/main/resources/application.properties` nếu cần.
3. Mở terminal tại thư mục chứa `pom.xml`.
4. Chạy:

```bash
mvn clean install
mvn spring-boot:run
```

5. Truy cập:
- Trang chủ: `http://localhost:8080/`
- Đăng nhập: `http://localhost:8080/login`
- Giỏ hàng: `http://localhost:8080/cart`
- Đơn hàng của tôi: `http://localhost:8080/orders`
- Admin: `http://localhost:8080/admin`
- Swagger: `http://localhost:8080/swagger-ui.html`

## Ghi chú khi demo
Nên demo theo luồng:
1. Đăng nhập user
2. Thêm sản phẩm vào giỏ hàng
3. Cập nhật số lượng trong giỏ
4. Thanh toán và tạo đơn hàng
5. Vào `/orders` để xem đơn vừa đặt
6. Đăng nhập admin
7. Vào quản lý đơn hàng
8. Cập nhật trạng thái đơn: Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành
9. Kiểm tra doanh thu dashboard thay đổi sau khi đơn hoàn thành
