package com.example.ShopDt.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShipmentDetailRequest {
    private Long id;

    @NotNull(message = "UserId không được để trống")
    private Long userId;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiver;
    private int status = 1;
}
