package com.example.ShopDt.controller;

import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.UserResponse;
import com.example.ShopDt.repository.OrderDetailRepository;
import com.example.ShopDt.repository.OrderRepository;
import com.example.ShopDt.repository.ProductRepository;
import com.example.ShopDt.repository.UserRepository;
import com.example.ShopDt.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final OrderDetailRepository orderDetailRepository;

    @GetMapping
    public String adminDashboard(Model model) {
        // Lấy thông tin username từ SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "Admin";

        // Thống kê tổng quan
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        Double totalRevenue = orderRepository.sumTotalPriceByCompletedOrders();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0D);

        model.addAttribute("stats", stats);
        model.addAttribute("adminName", username);  

        return "admin/admin-dashboard";
    }

    // API endpoint lấy danh sách user cho frontend gọi qua AJAX
    @GetMapping("/users/list")
    @ResponseBody
    public ApiResponse<List<UserResponse>> getAllUsersForAdmin() {
        try {
            List<UserResponse> users = userService.getUsers();
            return ApiResponse.<List<UserResponse>>builder()
                    .success(true)
                    .message("Lấy danh sách người dùng thành công")
                    .data(users)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<List<UserResponse>>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách người dùng")
                    .error(e.getMessage())
                    .build();
        }
    }

    // API Thêm người dùng
    @PostMapping("/users")
    @ResponseBody
    public ApiResponse<UserResponse> addUser(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam Long roleId) {
        try {
            UserResponse user = userService.adminCreateUser(username, email, password, roleId);
            return ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Thêm người dùng thành công")
                    .data(user)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
        }
    }

    // API Sửa người dùng
    @PutMapping("/users/{id}")
    @ResponseBody
    public ApiResponse<UserResponse> editUser(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestParam Long roleId) {
        try {
            UserResponse user = userService.adminUpdateUser(id, email, roleId);
            return ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Cập nhật thành công")
                    .data(user)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
        }
    }

    @GetMapping("/statistics/overview")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getOverviewStats() {
        Map<String, Object> data = new HashMap<>();

        data.put("totalOrders", orderRepository.count());
        data.put("totalUsers", userRepository.count());
        data.put("totalProducts", productRepository.count());
        data.put("totalRevenue", orderRepository.sumTotalPriceByCompletedOrders());

        // Dữ liệu cho biểu đồ doanh thu
        List<Object[]> revenueData = orderRepository.getRevenueByDay();
        data.put("revenueChart", revenueData);

        return ApiResponse.<Map<String, Object>>builder().success(true).data(data).build();
    }

    @GetMapping("/statistics/top-products")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> getTopProducts() {
        
        Pageable pageable = PageRequest.of(0, 10);
        List<Object[]> results = orderDetailRepository.getTopSellingProducts(pageable);

        List<Map<String, Object>> list = results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("productName", row[0]);
            map.put("totalSold", row[1]);
            map.put("totalRevenue", row[2]);
            map.put("image", row[3]);
            return map;
        }).toList();

        return ApiResponse.<List<Map<String, Object>>>builder().success(true).data(list).build();
    }
}