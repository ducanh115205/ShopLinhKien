package com.example.ShopDt.repository;

import com.example.ShopDt.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreateAtDesc(Long userId);

    List<Order> findAllByOrderByCreateAtDesc();

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM OrderEntity o WHERE o.status = 4")
    Double sumTotalPriceByCompletedOrders();

    @Query("SELECT CAST(o.createAt AS date) as date, SUM(o.totalPrice) as total " +
            "FROM OrderEntity o WHERE o.status = 4 " +
            "GROUP BY CAST(o.createAt AS date) ORDER BY date")
    List<Object[]> getRevenueByDay();
}
