package com.example.ShopDt.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;         // BẮT BUỘC THÊM ĐỂ FRONTEND GỌI API SỬA/XOÁ
    private String username;
    private String email;
    private String role;
    private int status;      // Thêm để hiển thị trạng thái
}