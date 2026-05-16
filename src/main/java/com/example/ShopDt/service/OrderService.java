package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.OrderRequest;
import com.example.ShopDt.dto.response.OrderResponse;
import com.example.ShopDt.entity.Cart;
import com.example.ShopDt.entity.Order;
import com.example.ShopDt.entity.OrderDetail;
import com.example.ShopDt.entity.Product;
import com.example.ShopDt.entity.ShipmentDetail;
import com.example.ShopDt.entity.User;
import com.example.ShopDt.mapper.order.OrderMapper;
import com.example.ShopDt.repository.CartRepository;
import com.example.ShopDt.repository.OrderDetailRepository;
import com.example.ShopDt.repository.OrderRepository;
import com.example.ShopDt.repository.ProductRepository;
import com.example.ShopDt.repository.ShipmentDetailRepository;
import com.example.ShopDt.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderDetailRepository orderDetailRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final ShipmentDetailRepository shipmentDetailRepository;
    private final CurrentUserService currentUserService;

    public static final int CHO_XAC_NHAN = 1;
    public static final int DA_XAC_NHAN = 2;
    public static final int DANG_GIAO = 3;
    public static final int HOAN_THANH = 4;
    public static final int DA_HUY = 5;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User user = currentUserService.getCurrentUser();
        Long userId = user.getId();

        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Gio hang trong");
        }

        ShipmentDetail shipmentDetail = null;
        if (request.getShipmentDetailId() != null) {
            shipmentDetail = shipmentDetailRepository.findById(request.getShipmentDetailId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay thong tin giao hang"));
            if (shipmentDetail.getUser() == null || !shipmentDetail.getUser().getId().equals(userId)) {
                throw new RuntimeException("Thong tin giao hang khong thuoc ve nguoi dung nay");
            }
        }

        validateCartItemsBeforeOrder(cartItems);

        Order order = new Order();
        order.setUser(user);
        order.setShipmentDetails(shipmentDetail);
        order.setCreateAt(LocalDateTime.now());
        order.setStatus(CHO_XAC_NHAN);
        order.setNote(request.getNote());
        order.setTotalPrice(0f);
        order = orderRepository.save(order);

        float totalPrice = 0f;
        for (Cart cart : cartItems) {
            Product product = cart.getProduct();

            OrderDetail detail = new OrderDetail();
            detail.setOrders(order);
            detail.setProduct(product);
            detail.setQuantity(cart.getQuantity());
            detail.setPrice(product.getPrice() * cart.getQuantity());
            detail.setStatus(1);
            orderDetailRepository.save(detail);

            product.setQuantity(product.getQuantity() - cart.getQuantity());
            productRepository.save(product);

            totalPrice += detail.getPrice();
        }

        order.setTotalPrice(totalPrice);
        order = orderRepository.save(order);
        cartRepository.deleteAll(cartItems);
        return orderMapper.toOrderResponse(order);
    }

    public OrderResponse getCurrentUserOrderById(Long orderId) {
        User user = currentUserService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Ban khong co quyen xem don hang nay");
        }
        return orderMapper.toOrderResponse(order);
    }

    public List<OrderResponse> getCurrentUserOrders() {
        User user = currentUserService.getCurrentUser();
        return orderRepository.findByUserIdOrderByCreateAtDesc(user.getId())
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreateAtDesc()
                .stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    public OrderResponse getOrderByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, int newStatus) {
        validateStatus(newStatus);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));

        if (order.getStatus() == DA_HUY) {
            throw new RuntimeException("Don hang da huy, khong the doi trang thai");
        }
        if (order.getStatus() == HOAN_THANH) {
            throw new RuntimeException("Don hang da hoan thanh, khong nen doi trang thai");
        }
        if (newStatus == DA_HUY) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelCurrentUserOrder(Long orderId) {
        User user = currentUserService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Ban khong co quyen huy don hang nay");
        }
        if (order.getStatus() != CHO_XAC_NHAN) {
            throw new RuntimeException("Chi co the huy don khi don con o trang thai cho xac nhan");
        }

        restoreStock(order);
        order.setStatus(DA_HUY);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    private void validateCartItemsBeforeOrder(List<Cart> cartItems) {
        for (Cart cart : cartItems) {
            Product product = cart.getProduct();
            if (product.getStatus() != 1) {
                throw new RuntimeException("San pham " + product.getName() + " hien da ngung ban. Vui long xoa san pham nay khoi gio hang truoc khi dat hang.");
            }
            if (cart.getQuantity() <= 0) {
                throw new RuntimeException("So luong mua phai lon hon 0");
            }
            if (product.getQuantity() < cart.getQuantity()) {
                throw new RuntimeException("San pham " + product.getName() + " khong du ton kho. Con lai: " + product.getQuantity());
            }
        }
    }

    private void restoreStock(Order order) {
        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getQuantity());
            productRepository.save(product);
        }
    }

    private void validateStatus(int status) {
        if (status < CHO_XAC_NHAN || status > DA_HUY) {
            throw new RuntimeException("Trang thai don hang khong hop le");
        }
    }
}
