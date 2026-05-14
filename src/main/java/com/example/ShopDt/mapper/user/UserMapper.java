package com.example.ShopDt.mapper.user;

import com.example.ShopDt.dto.request.RegisterRequest;
import com.example.ShopDt.dto.response.UserResponse;
import com.example.ShopDt.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "username", source = "username")
    User toUser(RegisterRequest request);

    @Mapping(target = "username", source = "username")
    @Mapping(target = "email", source = "email")
    @Mapping(source = "role.name", target = "role")
    UserResponse toUserResponse(User user);
}
