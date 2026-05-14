package com.example.ShopDt.mapper.product_category;

import com.example.ShopDt.dto.request.ProductCategoryRequest;
import com.example.ShopDt.dto.response.ProductCategoryResponse;
import com.example.ShopDt.entity.ProductCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductCategoryMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductCategoryResponse toResponse(ProductCategory productCategory);

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "category.id", source = "categoryId")
    ProductCategory toEntity(ProductCategoryRequest request);

    void updateEntity(@MappingTarget ProductCategory productCategory, ProductCategoryRequest request);
}

