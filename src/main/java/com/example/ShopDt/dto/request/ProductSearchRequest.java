package com.example.ShopDt.dto.request;


import lombok.Data;

import java.util.List;

@Data
public class ProductSearchRequest {
    private String keyword;
    private List<Long> listCategoryId;
    private Double minPrice;
    private Double maxPrice;
    private String sort;
}