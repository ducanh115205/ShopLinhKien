package com.example.ShopDt.dto.response;

import lombok.Data;

@Data
public class ShipmentDetailResponse {
    private Long id;
    private String address;
    private String phoneNumber;
    private String receiver;
    private int status;
    private Long userId;
    private String userName;
}
