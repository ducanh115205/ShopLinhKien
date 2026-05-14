package com.example.ShopDt.mapper.order;

import com.example.ShopDt.dto.response.*;
import com.example.ShopDt.entity.Order;
import com.example.ShopDt.mapper.shipment_detail.ShipmentDetailMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ShipmentDetailMapper.class, OrderDetailMapper.class})
public interface OrderMapper {
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "createAt", target = "createdAt")
    @Mapping(source = "orderDetails", target = "orderDetails")
    @Mapping(source = "shipmentDetails", target = "shipmentDetails")
    OrderResponse toOrderResponse(Order order);

}
