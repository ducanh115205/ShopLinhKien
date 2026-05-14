package com.example.ShopDt.mapper.category;

import com.example.ShopDt.dto.request.CategoryRequest;
import com.example.ShopDt.dto.response.CategoryResponse;
import com.example.ShopDt.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "status", source = "status")
    CategoryResponse toResponse(Category category);

    @Mapping(target = "name", source = "name")
    @Mapping(target = "status", source = "status")
    Category toEntity(CategoryRequest request);

    void updateEntity(@MappingTarget Category category,  CategoryRequest request);
}
