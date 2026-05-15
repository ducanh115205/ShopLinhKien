package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.CartRequest;
import com.example.ShopDt.dto.request.UpdateCartRequest;
import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.CartResponse;
import com.example.ShopDt.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ApiResponse<List<CartResponse>> getCart() {
        List<CartResponse> cart = cartService.getCurrentUserCart();
        return ApiResponse.<List<CartResponse>>builder()
                .success(true)
                .message("Mở giỏ hàng thành công")
                .data(cart)
                .build();
    }

    @PostMapping("/add")
    public ApiResponse<CartResponse> addCart(@Valid @RequestBody CartRequest cartRequest) {
        CartResponse cart = cartService.addToCart(cartRequest);
        return ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Đã thêm sản phẩm vào giỏ")
                .data(cart)
                .build();
    }

    @PutMapping("/update")
    public ApiResponse<Void> updateQuantity(@Valid @RequestBody UpdateCartRequest request) {
        cartService.updateQuantity(request);
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Cập nhật thành công")
                .build();
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> deleteCart(@PathVariable Long productId) {
        cartService.removeFromCart(productId);
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa thành công")
                .build();
    }
}
