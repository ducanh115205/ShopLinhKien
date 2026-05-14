package com.example.ShopDt.repository;

import com.example.ShopDt.entity.ShipmentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ShipmentDetailRepository extends JpaRepository<ShipmentDetail, Long> {
    Optional<ShipmentDetail> findByUser_Id(Long userId);
}
