$(document).ready(function () {
    ensureOrdersShortcut();
    loadCart();
});

let currentCart = []; // Lưu trữ tạm mảng giỏ hàng để tính toán

// 1. Tải dữ liệu giỏ hàng từ API
function ensureOrdersShortcut() {
    const topbar = document.querySelector(".topbar");
    if (!topbar || document.getElementById("orders-btn")) {
        return;
    }

    const ordersBtn = document.createElement("button");
    ordersBtn.id = "orders-btn";
    ordersBtn.className = "icon-btn";
    ordersBtn.type = "button";
    ordersBtn.title = "Đơn hàng của tôi";
    ordersBtn.textContent = "Đơn hàng";
    ordersBtn.style.background = "#2c3e50";
    ordersBtn.style.color = "white";
    ordersBtn.style.padding = "10px 20px";
    ordersBtn.addEventListener("click", function () {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để xem đơn hàng!");
            window.location.href = "/login?redirect=/orders";
            return;
        }
        window.location.href = "/orders";
    });

    topbar.appendChild(ordersBtn);
}

function loadCart() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        $('#cart-content').html('<div class="empty-cart">Bạn chưa đăng nhập. Vui lòng <a href="/login" style="color: #3498db;">đăng nhập</a> để xem giỏ hàng!</div>');
        return;
    }

    $.ajax({
        url: `/api/carts/${userId}`,
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.success && response.data && response.data.length > 0) {
                currentCart = response.data;
                renderCart();
            } else {
                $('#cart-content').html('<div class="empty-cart">Giỏ hàng của bạn hiện đang trống!</div>');
            }
        },
        error: function () {
            $('#cart-content').html('<div class="empty-cart">Lỗi kết nối máy chủ! Vui lòng thử lại.</div>');
        }
    });
}

// 2. Vẽ giao diện bảng giỏ hàng
function renderCart() {
    let totalAmount = 0;
    let tbodyHtml = '';

    currentCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        tbodyHtml += `
            <tr>
                <td><img src="${getProductImageUrl(item.image)}" class="cart-item-img" onerror="this.src='/images/default-product.png'"></td>
                <td style="text-align: left; font-weight: bold; font-size: 16px;">${escapeHtml(item.productName)}</td>
                <td style="color: #2c3e50; font-weight: bold;">${formatCurrency(item.price)}</td>
                <td>
                    <div style="display: inline-flex; align-items: center;">
                        <button class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td style="color: #e74c3c; font-weight: bold;">${formatCurrency(itemTotal)}</td>
                <td>
                    <button class="btn-remove" onclick="removeCartItem(${item.productId})">Xóa</button>
                </td>
            </tr>
        `;
    });

    const html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Hình ảnh</th>
                    <th style="text-align: left;">Tên sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHtml}
            </tbody>
        </table>
        <div class="cart-summary">
            <h3 style="font-size: 22px; color: #2c3e50;">Tổng Thanh Toán: <span style="color: #e74c3c; font-weight: bold;">${formatCurrency(totalAmount)}</span></h3>
            <button class="btn-checkout" onclick="checkout()">Đặt Hàng Ngay</button>
        </div>
    `;

    $('#cart-content').html(html);
}

// 3. API Tăng / Giảm số lượng
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeCartItem(productId);
        return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const payload = {
        userId: parseInt(userId, 10),
        productId: parseInt(productId, 10),
        quantity: parseInt(newQuantity, 10)
    };

    $.ajax({
        url: `/api/carts/update`,
        method: "PUT",
        contentType: "application/json",
        headers: { "Authorization": `Bearer ${token}` },
        data: JSON.stringify(payload),
        success: function (res) {
            if (res.success) loadCart();
            else alert("Cập nhật số lượng thất bại: " + res.message);
        }
    });
}

// 4. API Xóa 1 sản phẩm
function removeCartItem(productId) {
    if (!confirm("Xóa sản phẩm này khỏi giỏ hàng của bạn?")) return;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    $.ajax({
        url: `/api/carts/${userId}/${productId}`,
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (res) {
            if (res.success) loadCart();
            else alert("Lỗi khi xóa: " + res.message);
        }
    });
}

// 5. Nút Đặt hàng
function checkout() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán!");
        window.location.href = "/login?redirect=/checkout";
        return;
    }

    window.location.href = "/checkout";
}

// Helper: Định dạng tiền tệ VND
function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
}

// Helper: Chống lỗi hiển thị HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getProductImageUrl(image) {
    if (!image) {
        return "/images/default-product.png";
    }

    const value = image.trim();
    if (/^(https?:)?\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    return value.startsWith("images/") ? `/${value}` : `/images/${value}`;
}
