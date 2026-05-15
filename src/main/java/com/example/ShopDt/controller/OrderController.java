package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.OrderRequest;
import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.OrderResponse;
import com.example.ShopDt.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse order = orderService.createOrder(request);
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Đặt hàng thành công")
                .data(order)
                .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getCurrentUserOrderById(orderId);
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Lấy thông tin đơn hàng thành công")
                .data(order)
                .build();
    }

    @GetMapping("/my-orders")
    public ApiResponse<List<OrderResponse>> getCurrentUserOrders() {
        List<OrderResponse> orders = orderService.getCurrentUserOrders();
        return ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Lấy lịch sử đơn hàng thành công")
                .data(orders)
                .build();
    }

    @PutMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrderByUser(@PathVariable Long orderId) {
        OrderResponse order = orderService.cancelCurrentUserOrder(orderId);
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Hủy đơn hàng thành công")
                .data(order)
                .build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orders)
                .build();
    }

    @GetMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OrderResponse> getOrderByIdForAdmin(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderByIdForAdmin(orderId);
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Lấy thông tin chi tiết đơn hàng thành công")
                .data(order)
                .build();
    }

    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable Long orderId, @RequestParam int status) {
        OrderResponse order = orderService.updateOrderStatus(orderId, status);
        return ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Cập nhật trạng thái đơn hàng thành công")
                .data(order)
                .build();
    }
}
