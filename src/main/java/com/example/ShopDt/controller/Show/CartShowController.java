package com.example.ShopDt.controller.Show;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class CartShowController {

    @GetMapping("/cart")
    public String showCart() {
        return "cart"; 
    }
}