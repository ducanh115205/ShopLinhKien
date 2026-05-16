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

        const emptyRowId = 'orders-status-filter-empty-row';
        $('#' + emptyRowId).remove();
        if (visibleCount === 0) {
            $('#orders-list-tbody').append(`<tr id="${emptyRowId}"><td colspan="6" class="loading-text">Không có đơn hàng phù hợp với trạng thái đã chọn</td></tr>`);
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
