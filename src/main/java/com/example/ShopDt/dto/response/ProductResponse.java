package com.example.ShopDt.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private float price;
    private int quantity;
    private String image;
    private String description;
    private int status;
    private List<CategoryResponse> categories;
}
