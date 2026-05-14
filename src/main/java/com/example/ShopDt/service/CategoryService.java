package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.ProductCategoryRequest;
import com.example.ShopDt.dto.request.CategoryRequest;
import com.example.ShopDt.dto.response.CategoryResponse;
import com.example.ShopDt.dto.response.ProductCategoryResponse;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.entity.Category;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.entity.ProductCategory;
import com.example.ShopDt.mapper.category.CategoryMapper;
import com.example.ShopDt.mapper.product.ProductMapper;
import com.example.ShopDt.mapper.product_category.ProductCategoryMapper;
import com.example.ShopDt.repository.CategoryRepository;
import com.example.ShopDt.repository.ProductCategoryRepository;
import com.example.ShopDt.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {
    public final ProductCategoryRepository productCategoryRepository;
    public final ProductMapper productMapper;
    public final CategoryMapper categoryMapper;
    public final CategoryRepository categoryRepository;
    public final ProductRepository productRepository;
    private final ProductCategoryMapper mapper;

    public ProductCategoryResponse addProductToCategory(ProductCategoryRequest request){
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm ko tồn tại"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục ko tồn tại"));

        ProductCategory pc = new ProductCategory();
        pc.setProduct(product);
        pc.setCategory(category);
        productCategoryRepository.save(pc);
        return mapper.toResponse(pc);
    }

    public List<ProductResponse> getProductByCategory(Long categoryId){
        List<ProductCategory> productCategory = productCategoryRepository.findByCategoryId(categoryId);
        return productCategory.stream()
                .map(pc -> productMapper.toResponse(pc.getProduct()))
                .distinct()
                .toList();
    }

    public List<CategoryResponse> getAllCategories(){
        List<Category> category = categoryRepository.findAll();
        return category.stream().map(cate -> new CategoryResponse(
                        cate.getId(),
                        cate.getName(),
                        cate.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        categoryRepository.findByNameIgnoreCase(request.getName().trim())
                .ifPresent(category -> {
                    throw new RuntimeException("Ten danh muc da ton tai");
                });

        Category category = categoryMapper.toEntity(request);
        category.setName(request.getName().trim());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay danh muc"));

        categoryRepository.findByNameIgnoreCase(request.getName().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Ten danh muc da ton tai");
                });

        categoryMapper.updateEntity(category, request);
        category.setName(request.getName().trim());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public CategoryResponse softDeleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay danh muc"));
        category.setStatus(0);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }
}
