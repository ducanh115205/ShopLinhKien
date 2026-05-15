const token = localStorage.getItem("token");
let currentOrders = [];

$(document).ready(function () {
    if (!token) {
        alert("Bạn cần đăng nhập để xem đơn hàng");
        window.location.href = "/login?redirect=/orders";
        return;
    }
    loadMyOrders();
});

function loadMyOrders() {
    $.ajax({
        url: `/api/orders/my-orders`,
        method: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function (response) {
            if (response.success) {
                currentOrders = response.data || [];
                renderOrders(currentOrders);
            } else {
                $("#orders-content").html(`<div class="empty-orders">${response.error || response.message}</div>`);
            }
        },
        error: function (xhr) {
            $("#orders-content").html(`<div class="empty-orders">${xhr.responseJSON?.error || 'Không thể tải đơn hàng'}</div>`);
        }
    });
}

function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        $("#orders-content").html("<div class='empty-orders'>Bạn chưa có đơn hàng nào.</div>");
        return;
    }

    let html = `
        <table class="orders-table">
            <thead>
            <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
            </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        html += `
            <tr>
                <td>#${order.id}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatMoney(order.totalPrice)}</td>
                <td>${getStatusText(order.status)}</td>
                <td>
                    <button class="btn-small btn-detail" onclick="showOrderDetail(${order.id})">Chi tiết</button>
                    ${order.status === 1 ? `<button class="btn-small btn-cancel" onclick="cancelOrder(${order.id})">Hủy đơn</button>` : ""}
                </td>
            </tr>`;
    });

    html += "</tbody></table>";
    $("#orders-content").html(html);
}

function showOrderDetail(orderId) {
    const order = currentOrders.find(o => o.id === orderId);
    if (!order) return;

    let itemsHtml = "";
    if (order.orderDetails && order.orderDetails.length > 0) {
        order.orderDetails.forEach(item => {
            const unitPrice = item.quantity ? item.price / item.quantity : item.price;
            itemsHtml += `
                <tr>
                    <td>${escapeHtml(item.productName || 'Sản phẩm ' + item.productId)}</td>
                    <td>${item.quantity}</td>
                    <td>${formatMoney(unitPrice)}</td>
                    <td>${formatMoney(item.price)}</td>
                </tr>`;
        });
    }

    const ship = order.shipmentDetails;
    const shipHtml = ship ? `
        <p><b>Người nhận:</b> ${escapeHtml(ship.receiver)}</p>
        <p><b>SĐT:</b> ${escapeHtml(ship.phoneNumber)}</p>
        <p><b>Địa chỉ:</b> ${escapeHtml(ship.address)}</p>` : "<p>Chưa có thông tin giao hàng</p>";

    $("#order-detail-box").html(`
        <h3>Chi tiết đơn #${order.id}</h3>
        <p><b>Trạng thái:</b> ${getStatusText(order.status)}</p>
        <p><b>Ghi chú:</b> ${escapeHtml(order.note || 'Không có')}</p>
        <h4>Thông tin giao hàng</h4>
        ${shipHtml}
        <h4>Sản phẩm</h4>
        <table class="orders-table">
            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
            <tbody>${itemsHtml || '<tr><td colspan="4">Không có chi tiết sản phẩm</td></tr>'}</tbody>
        </table>
        <h3 style="text-align:right;">Tổng: ${formatMoney(order.totalPrice)}</h3>
    `).show();
}

function cancelOrder(orderId) {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

    $.ajax({
        url: `/api/orders/${orderId}/cancel`,
        method: "PUT",
        headers: { "Authorization": "Bearer " + token },
        success: function (response) {
            alert(response.message || "Hủy đơn thành công");
            loadMyOrders();
            $("#order-detail-box").hide();
        },
        error: function (xhr) {
            alert(xhr.responseJSON?.error || "Hủy đơn thất bại");
        }
    });
}

function getStatusText(status) {
    switch (status) {
        case 1: return "Chờ xác nhận";
        case 2: return "Đã xác nhận";
        case 3: return "Đang giao";
        case 4: return "Hoàn thành";
        case 5: return "Đã hủy";
        default: return "Không xác định";
    }
}
function formatMoney(value) { return Number(value || 0).toLocaleString("vi-VN") + " ₫"; }
function formatDate(value) { return value ? new Date(value).toLocaleString("vi-VN") : ""; }
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
