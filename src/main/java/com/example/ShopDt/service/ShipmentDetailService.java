package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.ShipmentDetailRequest;
import com.example.ShopDt.dto.response.ShipmentDetailResponse;
import com.example.ShopDt.entity.ShipmentDetail;
import com.example.ShopDt.entity.User;
import com.example.ShopDt.mapper.shipment_detail.ShipmentDetailMapper;
import com.example.ShopDt.repository.ShipmentDetailRepository;
import com.example.ShopDt.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShipmentDetailService {

    private final ShipmentDetailRepository shipmentDetailRepository;
    private final ShipmentDetailMapper shipmentDetailMapper;
    private final CurrentUserService currentUserService;

    public ShipmentDetailResponse getShipmentDetailByUser(Long userId) {
        assertCurrentUser(userId);
        ShipmentDetail detail = shipmentDetailRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay dia chi giao hang cua user"));
        return shipmentDetailMapper.toResponse(detail);
    }

    public ShipmentDetailResponse createShipmentDetail(ShipmentDetailRequest request) {
        User user = currentUserService.getCurrentUser();
        assertSameUser(user.getId(), request.getUserId());

        ShipmentDetail detail = shipmentDetailMapper.toEntity(request, user);
        ShipmentDetail saved = shipmentDetailRepository.save(detail);
        return shipmentDetailMapper.toResponse(saved);
    }

    public ShipmentDetailResponse updateShipmentDetail(ShipmentDetailRequest request) {
        ShipmentDetail detail = shipmentDetailRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay shipment detail"));
        User user = currentUserService.getCurrentUser();
        assertSameUser(user.getId(), request.getUserId());
        if (detail.getUser() == null || !detail.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Ban khong co quyen cap nhat thong tin giao hang nay");
        }

        shipmentDetailMapper.updateEntity(detail, request);
        ShipmentDetail updated = shipmentDetailRepository.save(detail);
        return shipmentDetailMapper.toResponse(updated);
    }

    private void assertCurrentUser(Long requestedUserId) {
        User currentUser = currentUserService.getCurrentUser();
        assertSameUser(currentUser.getId(), requestedUserId);
    }

    private void assertSameUser(Long currentUserId, Long requestedUserId) {
        if (requestedUserId == null || !currentUserId.equals(requestedUserId)) {
            throw new RuntimeException("Ban khong co quyen thao tac thong tin giao hang nay");
        }
    }
}
