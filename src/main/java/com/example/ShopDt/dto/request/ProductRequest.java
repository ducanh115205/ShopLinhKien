package com.example.ShopDt.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá sản phẩm không được âm")
    private float price;

    @Min(value = 0, message = "Số lượng sản phẩm không được âm")
    private int quantity;

    private String image;
    private String description;
    private int status;

    @NotNull(message = "Danh mục sản phẩm không được để trống")
    private Long categoryId;
}
