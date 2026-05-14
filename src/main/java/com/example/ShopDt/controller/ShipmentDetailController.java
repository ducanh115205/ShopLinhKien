package com.example.ShopDt.controller;

import com.example.ShopDt.dto.request.ShipmentDetailRequest;
import com.example.ShopDt.dto.response.ShipmentDetailResponse;
import com.example.ShopDt.service.ShipmentDetailService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
@Tag(name = "Shipment Detail")
public class ShipmentDetailController {
    private final ShipmentDetailService shipmentDetailService;

    @GetMapping("/{id}")
    public ShipmentDetailResponse get(@PathVariable Long id) {
        return shipmentDetailService.getShipmentDetailByUser(id);
    }

    @PostMapping("/create")
    public ShipmentDetailResponse create(@Valid @RequestBody ShipmentDetailRequest request) {
        return shipmentDetailService.createShipmentDetail(request);
    }

    @PutMapping("/update")
    public ShipmentDetailResponse update(@Valid @RequestBody ShipmentDetailRequest request) {
        return shipmentDetailService.updateShipmentDetail(request);
    }
}
