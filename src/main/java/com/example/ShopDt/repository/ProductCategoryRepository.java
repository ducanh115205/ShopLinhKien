package com.example.ShopDt.repository;
import com.example.ShopDt.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findByCategoryId(Long categoryId);

    void deleteByProductId(Long productId);
}

