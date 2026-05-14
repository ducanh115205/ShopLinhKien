package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.LoginRequest;
import com.example.ShopDt.dto.request.RegisterRequest;
import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.LoginResponse;
import com.example.ShopDt.dto.response.UserResponse;
import com.example.ShopDt.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "User")
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Đăng kí")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Tạo người dùng thành công")
                .data(user)
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = userService.login(request.getUsername(), request.getPassword());
        return ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Đăng nhập thành công với user: " + request.getUsername())
                .data(loginResponse)
                .build();
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserResponse user = userService.getProfile(token);
        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Lấy thông tin user thành công")
                .data(user)
                .build();
    }
}
