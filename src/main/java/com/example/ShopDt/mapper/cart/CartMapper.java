package com.example.ShopDt.mapper.cart;

import com.example.ShopDt.dto.request.CartRequest;
import com.example.ShopDt.entity.Cart;
import com.example.ShopDt.dto.response.CartResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface CartMapper {

    // Entity -> DTO
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.image", target = "image")
    CartResponse toResponse(Cart cart);

    // DTO -> Entity
    Cart toEntity(CartRequest request);
}

