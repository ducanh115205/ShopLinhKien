package com.example.ShopDt.controller.Show;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AuthShowController {

    @GetMapping("/login")
    public String showLoginForm() {
        return "login"; // Tên file login.html trong templates
    }

}

