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
    final CartService cartService;

    @GetMapping("/{userId}")
    public ApiResponse<List<CartResponse>> getCart(@PathVariable long userId) {
        List<CartResponse> cart = cartService.getCartByUserId(userId);
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
        cartService.updateQuantity(java.util.List.of(request));
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Cập nhật thành công")
                .build();
    }

    @DeleteMapping("/{userId}/{productId}")
    public ApiResponse<Void> deleteCart(@PathVariable Long userId, @PathVariable Long productId) {
        cartService.removeFromCart(userId, productId);
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa thành công")
                .build();
    }
}
