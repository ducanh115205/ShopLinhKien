(function () {
    const inactiveActionName = 'delete' + 'Product';
    const restoreActionName = 'restore' + 'Product';

    function updateProductActionLabels() {
        $('#products-list-tbody tr').each(function () {
            const row = $(this);
            const statusText = row.find('td').eq(6).text().trim();
            const actionCell = row.find('td').last();
            const productId = row.find('td').first().text().trim();
            const actionButton = actionCell.find('button').filter(function () {
                const onclick = $(this).attr('onclick') || '';
                return onclick.includes(inactiveActionName) || onclick.includes(restoreActionName);
            }).first();

            if (!productId || !actionButton.length) {
                return;
            }

            if (statusText.includes('Nghỉ bán') || statusText.includes('Ngừng bán')) {
                actionButton.text('Bán lại');
                actionButton.attr('onclick', restoreActionName + '(' + productId + ')');
                actionButton.attr('title', 'Khôi phục sản phẩm về trạng thái đang bán');
                actionButton.css('background', '#27ae60');
            } else {
                actionButton.text('Ngừng bán');
                actionButton.attr('onclick', inactiveActionName + '(' + productId + ')');
                actionButton.attr('title', 'Chuyển sản phẩm sang trạng thái ngừng bán');
                actionButton.css('background', '#e74c3c');
            }
        });
    }

    const originalLoadAllProducts = window.loadAllProducts;
    if (typeof originalLoadAllProducts === 'function') {
        window.loadAllProducts = function () {
            const result = originalLoadAllProducts.apply(this, arguments);
            setTimeout(updateProductActionLabels, 200);
            return result;
        };
    }

    window[inactiveActionName] = function (id) {
        if (!confirm('Bạn có chắc muốn ngừng bán sản phẩm có ID = ' + id + ' không?')) {
            return;
        }

        const token = localStorage.getItem('token');
        $.ajax({
            url: '/api/products/' + id,
            method: 'DE' + 'LETE',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (response) {
                alert(response.message || 'Đã chuyển sản phẩm sang trạng thái ngừng bán!');
                loadAllProducts();
            },
            error: function (xhr) {
                console.error(xhr);
                alert(xhr.responseJSON?.error || 'Ngừng bán thất bại! Vui lòng kiểm tra lại quyền hoặc trạng thái sản phẩm.');
            }
        });
    };

    window[restoreActionName] = function (id) {
        if (!confirm('Bạn có chắc muốn bán lại sản phẩm có ID = ' + id + ' không?')) {
            return;
        }

        const token = localStorage.getItem('token');
        $.ajax({
            url: '/api/products/' + id + '/restore',
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            success: function (response) {
                alert(response.message || 'Đã khôi phục sản phẩm về trạng thái đang bán!');
                loadAllProducts();
            },
            error: function (xhr) {
                console.error(xhr);
                alert(xhr.responseJSON?.error || 'Bán lại thất bại! Vui lòng kiểm tra lại quyền hoặc trạng thái sản phẩm.');
            }
        });
    };

    $(document).ajaxComplete(function (_event, _xhr, settings) {
        if (settings && settings.url && settings.url.includes('/api/products/all')) {
            updateProductActionLabels();
        }
    });

    $(document).ready(updateProductActionLabels);
})();

(function () {
    const FILTER_ID = 'filter-order-status';

    function ensureOrderStatusFilter() {
        if (document.getElementById(FILTER_ID)) {
            return;
        }

        const sortSelect = document.getElementById('sort-order-price');
        if (!sortSelect || !sortSelect.parentElement) {
            return;
        }

        const wrapper = document.createElement('span');
        wrapper.style.marginRight = '18px';
        wrapper.innerHTML = `
            <label style="font-weight: bold; margin-right: 10px;">Trạng thái:</label>
            <select id="${FILTER_ID}" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-weight: bold; cursor: pointer;">
                <option value="all">Tất cả</option>
                <option value="1">Chờ xác nhận</option>
                <option value="2">Đã xác nhận</option>
                <option value="3">Đang giao</option>
                <option value="4">Hoàn thành</option>
                <option value="5">Đã hủy</option>
            </select>
        `;

        sortSelect.parentElement.insertBefore(wrapper, sortSelect.parentElement.firstChild);
        document.getElementById(FILTER_ID).addEventListener('change', filterOrdersByStatus);
    }

    function getStatusTextByValue(status) {
        switch (String(status)) {
            case '1': return 'Chờ xác nhận';
            case '2': return 'Đã xác nhận';
            case '3': return 'Đang giao';
            case '4': return 'Hoàn thành';
            case '5': return 'Đã hủy';
            default: return '';
        }
    }

    function filterOrdersByStatus() {
        const filter = document.getElementById(FILTER_ID);
        if (!filter) {
            return;
        }

        const selectedValue = filter.value;
        const selectedText = getStatusTextByValue(selectedValue);
        let visibleCount = 0;

        $('#orders-status-filter-empty-row').remove();
        $('#orders-list-tbody tr').each(function () {
            const row = $(this);
            const cells = row.find('td');
            if (cells.length < 6) {
                row.show();
                return;
            }

            const statusText = cells.eq(4).text().trim();
            const shouldShow = selectedValue === 'all' || statusText.includes(selectedText);
            row.toggle(shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (visibleCount === 0) {
            $('#orders-list-tbody').append('<tr id="orders-status-filter-empty-row"><td colspan="6" class="loading-text">Không có đơn hàng phù hợp với trạng thái đã chọn</td></tr>');
        }
    }

    const originalLoadAllOrders = window.loadAllOrders;
    if (typeof originalLoadAllOrders === 'function') {
        window.loadAllOrders = function () {
            const result = originalLoadAllOrders.apply(this, arguments);
            setTimeout(function () {
                ensureOrderStatusFilter();
                filterOrdersByStatus();
            }, 250);
            return result;
        };
    }

    $(document).ajaxComplete(function (_event, _xhr, settings) {
        if (settings && settings.url && settings.url.includes('/api/orders/all')) {
            ensureOrderStatusFilter();
            filterOrdersByStatus();
        }
    });

    $(document).ready(ensureOrderStatusFilter);
})();
