package com.example.ShopDt.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long categoryId;
    private String categoryName;
}
