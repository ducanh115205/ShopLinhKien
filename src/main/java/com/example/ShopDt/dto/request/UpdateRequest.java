package com.example.ShopDt.dto.request;

import lombok.Data;

import java.util.Date;

@Data

public class UpdateRequest {
    private String username;
    private String password;
    private Date dob;
}
