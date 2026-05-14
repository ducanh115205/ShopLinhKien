package com.example.ShopDt.controller.Show;

import com.example.ShopDt.dto.request.ProductSearchRequest;
import com.example.ShopDt.dto.response.PaginatedResponse;
import com.example.ShopDt.dto.response.ProductResponse;
import com.example.ShopDt.service.ProductService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class SearchController {
    private final ProductService productService;
    @GetMapping("/search")
    public String searchPage(
            @ModelAttribute ProductSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Model model) {
        try {
            PaginatedResponse<ProductResponse> result = productService.searchProducts(searchRequest, page, size);
            model.addAttribute("listResult", result);
            model.addAttribute("products", result.getContent());
            model.addAttribute("currentPage", result.getPage());
            model.addAttribute("totalPages", result.getTotalPages());
            model.addAttribute("totalElements", result.getTotalElements());

           
            model.addAttribute("keyword", searchRequest.getKeyword());
            model.addAttribute("categoryId", searchRequest.getListCategoryId() != null && !searchRequest.getListCategoryId().isEmpty()
                    ? searchRequest.getListCategoryId().get(0) : null);
            model.addAttribute("minPrice", searchRequest.getMinPrice());
            model.addAttribute("maxPrice", searchRequest.getMaxPrice());
            model.addAttribute("sort", searchRequest.getSort());

        } catch (Exception e) {
            model.addAttribute("products", List.of());
            model.addAttribute("totalElements", 0);
        }
        return "search";
    }
}
