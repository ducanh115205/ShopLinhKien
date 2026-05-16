package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.ProductRequest;
import com.example.ShopDt.dto.request.ProductSearchRequest;
import com.example.ShopDt.dto.response.ApiResponse;
import com.example.ShopDt.dto.response.PaginatedResponse;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product")
public class ProductController {
    private final ProductService productService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/all")
    @Operation(summary = "Lấy danh sách sản phẩm (có phân trang)")
    public ApiResponse<PaginatedResponse<ProductResponse>> getAllProducts(
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng sản phẩm mỗi trang", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp (id, name, price, quantity)", example = "id")
            @RequestParam(required = false) String sortBy,
            @Parameter(description = "Hướng sắp xếp (asc, desc)", example = "asc")
            @RequestParam(required = false) String sortDir) {
        PaginatedResponse<ProductResponse> result = productService.findAllPaginated(page, size, sortBy, sortDir);
        return ApiResponse.<PaginatedResponse<ProductResponse>>builder()
                .success(true)
                .message("Lấy danh sách sản phẩm thành công")
                .data(result)
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết 1 sản phẩm theo ID")
    public ApiResponse<ProductResponse> getProductById(@PathVariable long id) {
        ProductResponse product = productService.findById(id);
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Lấy sản phẩm thành công")
                .data(product)
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> addProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.create(request);
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Thêm sản phẩm thành công")
                .data(product)
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.update(id, request);
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Cập nhật sản phẩm thành công")
                .data(product)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteProduct(@PathVariable long id) {
        productService.delete(id);
        return ApiResponse.<Void>builder()
                .success(true)
                .message("Đã chuyển sản phẩm sang trạng thái ngừng bán")
                .build();
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> restoreProduct(@PathVariable long id) {
        ProductResponse product = productService.restore(id);
        return ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Đã khôi phục sản phẩm về trạng thái đang bán")
                .data(product)
                .build();
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> uploadProductImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File anh khong duoc de trong");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Chi cho phep upload file anh");
        }

        String extension = getExtension(file.getOriginalFilename());
        Set<String> allowedExtensions = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new RuntimeException("Dinh dang anh khong hop le. Chi ho tro jpg, jpeg, png, webp, gif");
        }

        Path productImageDir = Path.of(uploadDir, "products").toAbsolutePath().normalize();
        Files.createDirectories(productImageDir);

        String storedFilename = UUID.randomUUID() + extension.toLowerCase();
        Path target = productImageDir.resolve(storedFilename).normalize();
        file.transferTo(target);

        String imageUrl = "/uploads/products/" + storedFilename;
        return ApiResponse.<String>builder()
                .success(true)
                .message("Upload anh san pham thanh cong")
                .data(imageUrl)
                .build();
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm sản phẩm theo tiêu chí")
    public ApiResponse<PaginatedResponse<ProductResponse>> searchProducts(
            @ModelAttribute ProductSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PaginatedResponse<ProductResponse> result = productService.searchProducts(searchRequest, page, size);
        return ApiResponse.<PaginatedResponse<ProductResponse>>builder()
                .success(true)
                .message("Tìm kiếm sản phẩm thành công")
                .data(result)
                .build();
    }

    private String getExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex);
    }
}
