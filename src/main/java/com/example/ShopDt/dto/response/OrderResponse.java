package com.example.ShopDt.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String userName;
    private float totalPrice;
    private String note;
    private int status;
    private LocalDateTime createdAt;
    private List<OrderDetailResponse> orderDetails;
    private ShipmentDetailResponse shipmentDetails;
}
