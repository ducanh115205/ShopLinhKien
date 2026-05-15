package com.example.ShopDt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipmentDetailRequest {
    private Long id;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiver;

    private int status = 1;
}
