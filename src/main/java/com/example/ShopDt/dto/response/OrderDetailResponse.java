package com.example.ShopDt.dto.response;

import lombok.Data;

@Data
public class OrderDetailResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private float price;
}
