package com.example.ShopDt.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DefaultImageController {

    private static final String SVG_MEDIA_TYPE = "image/svg+xml";

    private static final String DEFAULT_PRODUCT_IMAGE_SVG =
            "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>"
                    + "<rect width='600' height='400' fill='#f3f5f7'/>"
                    + "<rect x='170' y='90' width='260' height='190' rx='18' fill='#ffffff' stroke='#d7dde3' stroke-width='6'/>"
                    + "<circle cx='245' cy='155' r='34' fill='#d7dde3'/>"
                    + "<path d='M190 255l70-70 48 48 42-42 80 80H190z' fill='#c3ccd5'/>"
                    + "<text x='300' y='335' text-anchor='middle' font-family='Arial, sans-serif' font-size='28' fill='#6b7280'>Chua co anh</text>"
                    + "</svg>";

    @GetMapping(value = "/images/default-product.png", produces = SVG_MEDIA_TYPE)
    public String getDefaultProductPngFallback() {
        return DEFAULT_PRODUCT_IMAGE_SVG;
    }

    @GetMapping(value = "/images/default-product.svg", produces = SVG_MEDIA_TYPE)
    public String getDefaultProductSvgFallback() {
        return DEFAULT_PRODUCT_IMAGE_SVG;
    }
}
