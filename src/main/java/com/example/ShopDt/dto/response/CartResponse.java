package com.example.ShopDt.dto.response;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private float price;
    private String image;
}

