package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.CartRequest;
import com.example.ShopDt.dto.request.UpdateCartRequest;
import com.example.ShopDt.dto.response.CartResponse;
import com.example.ShopDt.entity.Cart;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.entity.User;
import com.example.ShopDt.mapper.cart.CartMapper;
import com.example.ShopDt.repository.CartRepository;
import com.example.ShopDt.repository.ProductRepository;
import com.example.ShopDt.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;
    private final CurrentUserService currentUserService;

    public List<CartResponse> getCurrentUserCart() {
        User user = currentUserService.getCurrentUser();
        return cartRepository.findByUserId(user.getId())
                .stream()
                .map(cartMapper::toResponse)
                .collect(Collectors.toList());
    }

    public CartResponse addToCart(CartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        User user = currentUserService.getCurrentUser();
        Product product = getActiveProduct(request.getProductId());

        int currentQuantityInCart = cartRepository.findByUserAndProduct(user, product)
                .map(Cart::getQuantity)
                .orElse(0);
        int totalRequested = currentQuantityInCart + request.getQuantity();

        if (totalRequested > product.getQuantity()) {
            throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ số lượng! Còn lại: " + product.getQuantity());
        }

        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + request.getQuantity());
                    return existing;
                })
                .orElseGet(() -> new Cart(null, user, product, request.getQuantity()));

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    public void updateQuantity(UpdateCartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        User user = currentUserService.getCurrentUser();
        Product product = getActiveProduct(request.getProductId());

        if (request.getQuantity() > product.getQuantity()) {
            throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ số lượng! Còn lại: " + product.getQuantity());
        }

        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.setQuantity(request.getQuantity());
        cartRepository.save(cart);
    }

    public void removeFromCart(Long productId) {
        User user = currentUserService.getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartRepository.delete(cart);
    }

    private Product getActiveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStatus() != 1) {
            throw new RuntimeException("Sản phẩm " + product.getName() + " hiện đã ngừng bán");
        }
        return product;
    }
}
