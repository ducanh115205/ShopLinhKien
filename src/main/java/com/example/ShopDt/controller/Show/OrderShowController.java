package com.example.ShopDt.controller.Show;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class OrderShowController {

    @GetMapping("/checkout")
    public String showCheckout() {
        return "checkout";
    }

    @GetMapping("/orders")
    public String showMyOrders() {
        return "orders";
    }
}
