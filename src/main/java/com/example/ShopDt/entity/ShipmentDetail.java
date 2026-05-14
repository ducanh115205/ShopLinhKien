package com.example.ShopDt.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "shipment_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address;
    private String phoneNumber;
    private String receiver;
    private int status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "shipmentDetails", cascade = CascadeType.ALL)
    private Set<Order> orders = new HashSet<>();
}
