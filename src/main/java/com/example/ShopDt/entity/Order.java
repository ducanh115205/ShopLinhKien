package com.example.ShopDt.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity(name = "OrderEntity")
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "shipment_details_id")
    @EqualsAndHashCode.Exclude
    private ShipmentDetail shipmentDetails;

    private LocalDateTime createAt;
    private float totalPrice;
    private String note;
    private int status;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    private Set<OrderDetail> orderDetails = new HashSet<>();
}