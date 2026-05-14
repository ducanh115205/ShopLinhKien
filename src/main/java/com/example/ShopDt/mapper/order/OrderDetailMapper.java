package com.example.ShopDt.mapper.order;

import com.example.ShopDt.dto.response.OrderDetailResponse;
import com.example.ShopDt.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "price", target = "price")
    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);
}

