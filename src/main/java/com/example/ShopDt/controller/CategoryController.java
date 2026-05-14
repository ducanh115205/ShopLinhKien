package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.CategoryRequest;
import com.example.ShopDt.dto.request.ProductCategoryRequest;
import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.CategoryResponse;
import com.example.ShopDt.dto.response.ProductCategoryResponse;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
@Tag(name = "Category")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        try {
            List<CategoryResponse> categories = categoryService.getAllCategories();
            return ApiResponse.<List<CategoryResponse>>builder()
                    .success(true)
                    .message("Lấy danh mục thành công")
                    .data(categories)
                    .build();
        } catch (Exception ex) {
            return ApiResponse.<List<CategoryResponse>>builder()
                    .success(false)
                    .message("Lấy danh mục thất bại")
                    .error(ex.getMessage())
                    .build();
        }
    }


    @GetMapping("/{id}/products")
    public ApiResponse<List<ProductResponse>> getProductsByCategory(@PathVariable Long id) {
        try {
            List<ProductResponse> products = categoryService.getProductByCategory(id);
            return ApiResponse.<List<ProductResponse>>builder()
                    .success(true)
                    .message("Lấy sản phẩm thành công")
                    .data(products)
                    .build();
        } catch(Exception ex) {
            return ApiResponse.<List<ProductResponse>>builder()
                    .success(false)
                    .message("Lấy sản phẩm thất bại")
                    .error(ex.getMessage())
                    .build();
        }
    }

    @PostMapping("/add-product")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductCategoryResponse> getProductCategory(@RequestBody ProductCategoryRequest request) {
        try{
            ProductCategoryResponse productToCategory = categoryService.addProductToCategory(request);
            return ApiResponse.<ProductCategoryResponse>builder()
                    .success(true)
                    .message("Thêm sản phẩm thành công")
                    .data(productToCategory)
                    .build();
        } catch(Exception ex) {
            return ApiResponse.<ProductCategoryResponse>builder()
                    .success(false)
                    .message("Thêm sản phẩm thất bại")
                    .error(ex.getMessage())
                    .build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Them danh muc thanh cong")
                .data(category)
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Cap nhat danh muc thanh cong")
                .data(category)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> deleteCategory(@PathVariable Long id) {
        CategoryResponse category = categoryService.softDeleteCategory(id);
        return ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("An danh muc thanh cong")
                .data(category)
                .build();
    }
}
