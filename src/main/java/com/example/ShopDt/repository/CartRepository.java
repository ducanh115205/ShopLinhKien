package com.example.ShopDt.repository;

import com.example.ShopDt.entity.Cart;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {
    List<Cart> findByUserId(Long userId);
    Optional<Cart> findByUserAndProduct(User user, Product product);
    List<Cart> findByProduct(Product product);
}
