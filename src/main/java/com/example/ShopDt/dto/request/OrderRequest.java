package com.example.ShopDt.dto.request;

import lombok.Data;

@Data
public class OrderRequest {
    private String note;
    private Long shipmentDetailId;
}
