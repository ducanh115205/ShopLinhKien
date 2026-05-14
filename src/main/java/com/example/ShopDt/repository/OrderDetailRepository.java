package com.example.ShopDt.repository;

import com.example.ShopDt.entity.OrderDetail;
import com.example.ShopDt.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByProduct(Product product);
    boolean existsByProduct(Product product);

    @Query("SELECT p.name, SUM(od.quantity), SUM(od.price), p.image " +
            "FROM OrderDetail od JOIN od.product p JOIN od.orders o " +
            "WHERE o.status = 4 " +
            "GROUP BY p.id, p.name, p.image " +
            "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> getTopSellingProducts(Pageable pageable);
}
