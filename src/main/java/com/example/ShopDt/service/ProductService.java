package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.ProductRequest;
import com.example.ShopDt.dto.request.ProductSearchRequest;
import com.example.ShopDt.dto.response.PaginatedResponse;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.entity.Category;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.entity.ProductCategory;
import com.example.ShopDt.mapper.product.ProductMapper;
import com.example.ShopDt.repository.CategoryRepository;
import com.example.ShopDt.repository.ProductCategoryRepository;
import com.example.ShopDt.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductCategoryRepository productCategoryRepository;
    private final CategoryRepository categoryRepository;

    public List<ProductResponse> findAll() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    public PaginatedResponse<ProductResponse> searchProducts(ProductSearchRequest searchRequest, int page, int size) {
        page = Math.max(page, 0);
        size = (size <= 0) ? 10 : size;

        Sort sort = buildSort(searchRequest);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.searchProducts(
                searchRequest.getKeyword(),
                searchRequest.getListCategoryId(),
                searchRequest.getMinPrice(),
                searchRequest.getMaxPrice(),
                pageable
        );

        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return buildPaginatedResponse(productPage, productResponses);
    }

    private Sort buildSort(ProductSearchRequest searchRequest) {
        String sortBy = "id";
        String sortDir = "asc";

        if (searchRequest.getSort() != null && !searchRequest.getSort().isEmpty()) {
            String[] sortParams = searchRequest.getSort().split(",");
            sortBy = sortParams[0];
            if (sortParams.length > 1) {
                sortDir = sortParams[1];
            }
        }

        List<String> allowedFields = Arrays.asList("id", "name", "price", "quantity");
        if (!allowedFields.contains(sortBy)) {
            sortBy = "id";
        }

        return sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
    }

    public PaginatedResponse<ProductResponse> findAllPaginated(int page, int size, String sortBy, String sortDir) {
        page = Math.max(page, 0);
        size = (size <= 0) ? 10 : size;
        Sort sort = Sort.by(Sort.Direction.DESC, "id");

        if (sortBy != null && !sortBy.isEmpty()) {
            List<String> allowedFields = Arrays.asList("id", "name", "price", "quantity");
            if (!allowedFields.contains(sortBy)) {
                sortBy = "id";
            }
            sort = sortDir != null && sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return buildPaginatedResponse(productPage, productResponses);
    }

    public ProductResponse findById(long id) {
        Product product = getProductById(id);
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest productRequest) {
        Product product = productMapper.toEntity(productRequest);
        product = productRepository.save(product);

        if (productRequest.getCategoryId() != null) {
            Category category = categoryRepository.findById(productRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            ProductCategory pc = new ProductCategory();
            pc.setProduct(product);
            pc.setCategory(category);
            productCategoryRepository.save(pc);
        }
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProductById(id);

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setDescription(request.getDescription());
        product.setImage(request.getImage());
        product.setStatus(request.getStatus());

        productRepository.save(product);

        if (request.getCategoryId() != null) {
            productCategoryRepository.deleteByProductId(id);

            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

            ProductCategory pc = new ProductCategory();
            pc.setProduct(product);
            pc.setCategory(category);
            productCategoryRepository.save(pc);
        }

        return productMapper.toResponse(product);
    }

    public PaginatedResponse<ProductResponse> findByCategoryIdPaginated(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByCategoryId(categoryId, pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(productMapper::toResponse)
                .toList();

        return buildPaginatedResponse(productPage, content);
    }

    @Transactional
    public void delete(long id) {
        Product product = getProductById(id);
        product.setStatus(0);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse restore(long id) {
        Product product = getProductById(id);
        product.setStatus(1);
        return productMapper.toResponse(productRepository.save(product));
    }

    private Product getProductById(long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private PaginatedResponse<ProductResponse> buildPaginatedResponse(Page<Product> productPage, List<ProductResponse> content) {
        return PaginatedResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }
}
