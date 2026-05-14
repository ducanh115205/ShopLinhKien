package com.example.ShopDt.repository;

import com.example.ShopDt.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN p.productCategories pc " +
            "LEFT JOIN pc.category c " +
            "WHERE 1=1 " + // <--- ĐÃ THÊM DẤU CÁCH Ở ĐÂY ĐỂ KHÔNG BỊ DÍNH CHỮ
            "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:listCategoryId IS NULL OR c.id IN :listCategoryId) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND p.status = 1")
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("listCategoryId") List<Long> listCategoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable);

    // Đã sửa lại cú pháp JOIN để truy cập vào category.id
    @Query("SELECT p FROM Product p JOIN p.productCategories pc WHERE pc.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
}
