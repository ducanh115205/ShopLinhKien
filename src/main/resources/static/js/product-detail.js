$(document).ready(function () {
    const productId = $('#hidden-product-id').text();
    if (productId) {
        loadProductDetail(productId);
    } else {
        $('#product-detail-content').html('<h2>Sản phẩm không tồn tại!</h2>');
    }

    // Sự kiện nút giỏ hàng góc trên
    ensureOrdersButton();

    $('#cart-btn').click(function() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để xem giỏ hàng!");
            window.location.href = "/login";
        } else {
            window.location.href = "/cart";
        }
    });

    $('#orders-btn').click(function() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để xem đơn hàng!");
            window.location.href = "/login?redirect=/orders";
        } else {
            window.location.href = "/orders";
        }
    });
});

function ensureOrdersButton() {
    const cartBtn = document.getElementById("cart-btn");
    if (!cartBtn || document.getElementById("orders-btn")) {
        return;
    }

    const ordersBtn = document.createElement("button");
    ordersBtn.id = "orders-btn";
    ordersBtn.className = "icon-btn";
    ordersBtn.type = "button";
    ordersBtn.title = "Đơn hàng của tôi";
    ordersBtn.textContent = "Đơn hàng";
    cartBtn.insertAdjacentElement("afterend", ordersBtn);
}

function loadProductDetail(id) {
    // Gọi API lấy 1 sản phẩm. (Đảm bảo Backend của bạn có API /api/products/{id})
    $.ajax({
        url: `/api/products/${id}`,
        method: "GET",
        success: function (response) {
            if (response.success && response.data) {
                renderProductDetail(response.data);
            } else {
                $('#product-detail-content').html('<h2>Không tìm thấy sản phẩm!</h2>');
            }
        },
        error: function () {
            $('#product-detail-content').html('<h2>Lỗi kết nối đến máy chủ!</h2>');
        }
    });
}

function renderProductDetail(product) {
    const hasStock = (product.quantity || 0) > 0;
    const stockText = hasStock ? `Còn hàng (${product.quantity} sản phẩm)` : "Hết hàng";
    const stockColor = hasStock ? "#2ecc71" : "#e74c3c";

    const html = `
        <div class="detail-image">
            <img src="${getProductImageUrl(product.image)}" alt="${escapeHtml(product.name)}" onerror="this.src='/images/default-product.png'">
        </div>
        <div class="detail-info">
            <h2 class="detail-title">${escapeHtml(product.name)}</h2>
            <p style="color: #7f8c8d; font-size: 14px;">Mã SP: PRD-${product.id} | Tình trạng: <span style="color: ${stockColor}; font-weight: bold;">${stockText}</span></p>
            <div class="detail-price">${formatPrice(product.price)}</div>
            
            <div class="detail-desc">
                <strong>Mô tả sản phẩm:</strong><br><br>
                ${escapeHtml(product.description || "Chưa có mô tả chi tiết cho sản phẩm này.")}
            </div>

            <div class="action-group">
                <input type="number" id="buy-qty" class="qty-input" value="1" min="1" max="${product.quantity || 1}" ${!hasStock ? 'disabled' : ''}>
                <button class="btn-add-cart" onclick="addToCartDetail(${product.id})" ${!hasStock ? 'disabled style="background:#95a5a6;"' : ''}>
                    ${hasStock ? 'Thêm Vào Giỏ Hàng' : 'Tạm Hết Hàng'}
                </button>
            </div>
        </div>
    `;

    $('#product-detail-content').html(html);
}

// Hàm thêm vào giỏ hàng (Tương tự như ở index.js)
async function addToCartDetail(productId) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const quantity = $('#buy-qty').val();

    if (!userId || !token) {
        alert("Bạn cần đăng nhập để mua hàng!");
        window.location.href = "/login";
        return;
    }

    if (quantity < 1) {
        alert("Số lượng không hợp lệ!"); return;
    }

    const payload = {
        userId: parseInt(userId, 10),
        productId: parseInt(productId, 10),
        quantity: parseInt(quantity, 10)
    };

    try {
        const res = await fetch("/api/carts/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            alert("✅ Đã thêm " + quantity + " sản phẩm vào giỏ hàng!");
        } else {
            alert("Thêm thất bại: " + data.message);
        }
    } catch (err) {
        alert("Lỗi khi thêm sản phẩm vào giỏ hàng");
    }
}

// Tiện ích
function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " VND";
}
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
