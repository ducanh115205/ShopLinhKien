package com.example.ShopDt.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryRequest {
    @NotBlank(message = "Ten danh muc khong duoc de trong")
    private String name;

    @Min(value = 0, message = "Trang thai danh muc chi duoc la 0 hoac 1")
    @Max(value = 1, message = "Trang thai danh muc chi duoc la 0 hoac 1")
    private int status;
}
