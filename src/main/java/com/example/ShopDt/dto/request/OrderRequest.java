package com.example.ShopDt.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {
    @NotNull(message = "UserId không được để trống")
    private Long userId;
    private String note;
    private Long shipmentDetailId;
}
