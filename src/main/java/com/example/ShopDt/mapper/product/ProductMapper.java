package com.example.ShopDt.mapper.product;

import com.example.ShopDt.dto.response.CategoryResponse;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.dto.request.ProductRequest;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.entity.ProductCategory;
import com.example.ShopDt.mapper.category.CategoryMapper;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class ProductMapper {

    @Autowired
    protected CategoryMapper categoryMapper;

    public abstract Product toEntity(ProductRequest request);

    public abstract ProductResponse toResponse(Product product);

    // Dùng để update entity có sẵn từ request
    public abstract void updateEntity(@MappingTarget Product product, ProductRequest request);

    @AfterMapping
    protected void mapCategories(Product product, @MappingTarget ProductResponse response) {
        if (product.getProductCategories() != null) {
            List<CategoryResponse> categories = product.getProductCategories().stream()
                    .map(ProductCategory::getCategory)
                    .filter(category -> category != null)
                    .map(categoryMapper::toResponse)
                    .collect(Collectors.toList());
            response.setCategories(categories);
        }
    }
}
