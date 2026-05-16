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
    const FILTER_BAR_ID = 'admin-product-filter-bar';
    const EMPTY_ROW_ID = 'product-filter-empty-row';

    function ensureProductFilterBar() {
        if (document.getElementById(FILTER_BAR_ID)) {
            return;
        }

        const tableContainer = $('#products-content .table-container').first();
        if (!tableContainer.length) {
            return;
        }

        const filterBar = $(`
            <div id="${FILTER_BAR_ID}" style="background:#f8f9fa; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-bottom:16px; display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
                <div style="display:flex; flex-direction:column; gap:5px; min-width:220px; flex:1;">
                    <label style="font-weight:bold; color:#2c3e50;">Tìm theo tên</label>
                    <input id="product-filter-keyword" type="text" placeholder="Nhập tên sản phẩm..." style="padding:9px; border:1px solid #ccc; border-radius:5px;">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px; min-width:190px;">
                    <label style="font-weight:bold; color:#2c3e50;">Danh mục</label>
                    <select id="product-filter-category" style="padding:9px; border:1px solid #ccc; border-radius:5px;">
                        <option value="all">Tất cả danh mục</option>
                    </select>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px; min-width:150px;">
                    <label style="font-weight:bold; color:#2c3e50;">Trạng thái</label>
                    <select id="product-filter-status" style="padding:9px; border:1px solid #ccc; border-radius:5px;">
                        <option value="all">Tất cả</option>
                        <option value="1">Đang bán</option>
                        <option value="0">Ngừng bán</option>
                    </select>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px; min-width:130px;">
                    <label style="font-weight:bold; color:#2c3e50;">Giá từ</label>
                    <input id="product-filter-min-price" type="number" min="0" placeholder="0" style="padding:9px; border:1px solid #ccc; border-radius:5px;">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px; min-width:130px;">
                    <label style="font-weight:bold; color:#2c3e50;">Giá đến</label>
                    <input id="product-filter-max-price" type="number" min="0" placeholder="Không giới hạn" style="padding:9px; border:1px solid #ccc; border-radius:5px;">
                </div>
                <button id="product-filter-clear" type="button" style="background:#95a5a6; color:white; border:none; padding:10px 14px; border-radius:5px; cursor:pointer; font-weight:bold;">Xóa lọc</button>
                <span id="product-filter-count" style="font-weight:bold; color:#2c3e50; margin-left:auto;">Hiển thị 0 sản phẩm</span>
            </div>
        `);

        tableContainer.before(filterBar);
        $('#product-filter-keyword, #product-filter-category, #product-filter-status, #product-filter-min-price, #product-filter-max-price')
            .on('input change', applyProductFilters);
        $('#product-filter-clear').on('click', clearProductFilters);
    }

    function refreshProductCategoryOptions() {
        const select = $('#product-filter-category');
        if (!select.length) {
            return;
        }

        const currentValue = select.val() || 'all';
        const categories = new Set();

        $('#products-list-tbody tr').each(function () {
            const cells = $(this).find('td');
            if (cells.length < 8) {
                return;
            }
            const categoryText = cells.eq(3).text().trim();
            if (!categoryText || categoryText === 'Chưa phân loại') {
                return;
            }
            categoryText.split(',').forEach(name => {
                const trimmed = name.trim();
                if (trimmed) {
                    categories.add(trimmed);
                }
            });
        });

        select.empty().append('<option value="all">Tất cả danh mục</option>');
        Array.from(categories).sort((a, b) => a.localeCompare(b, 'vi')).forEach(name => {
            select.append(`<option value="${escapeAttribute(name)}">${escapeHtmlForFilter(name)}</option>`);
        });

        if (currentValue !== 'all' && Array.from(categories).includes(currentValue)) {
            select.val(currentValue);
        } else {
            select.val('all');
        }
    }

    function applyProductFilters() {
        ensureProductFilterBar();
        const keyword = ($('#product-filter-keyword').val() || '').trim().toLowerCase();
        const category = $('#product-filter-category').val() || 'all';
        const status = $('#product-filter-status').val() || 'all';
        const minPrice = parseNumber($('#product-filter-min-price').val());
        const maxPrice = parseNumber($('#product-filter-max-price').val());
        let visibleCount = 0;
        let totalCount = 0;

        $('#' + EMPTY_ROW_ID).remove();

        $('#products-list-tbody tr').each(function () {
            const row = $(this);
            const cells = row.find('td');
            if (cells.length < 8) {
                return;
            }

            totalCount += 1;
            const nameText = cells.eq(2).text().trim().toLowerCase();
            const categoryText = cells.eq(3).text().trim();
            const price = parseCurrency(cells.eq(4).text());
            const statusText = cells.eq(6).text().trim();

            const matchesKeyword = !keyword || nameText.includes(keyword);
            const matchesCategory = category === 'all' || categoryText.split(',').map(item => item.trim()).includes(category);
            const matchesStatus = status === 'all'
                || (status === '1' && statusText.includes('Đang bán'))
                || (status === '0' && (statusText.includes('Nghỉ bán') || statusText.includes('Ngừng bán')));
            const matchesMinPrice = minPrice === null || price >= minPrice;
            const matchesMaxPrice = maxPrice === null || price <= maxPrice;
            const shouldShow = matchesKeyword && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;

            row.toggle(shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        $('#product-filter-count').text(`Hiển thị ${visibleCount} / ${totalCount} sản phẩm`);
        if (totalCount > 0 && visibleCount === 0) {
            $('#products-list-tbody').append(`<tr id="${EMPTY_ROW_ID}"><td colspan="8" class="loading-text">Không có sản phẩm phù hợp với bộ lọc</td></tr>`);
        }
    }

    function clearProductFilters() {
        $('#product-filter-keyword').val('');
        $('#product-filter-category').val('all');
        $('#product-filter-status').val('all');
        $('#product-filter-min-price').val('');
        $('#product-filter-max-price').val('');
        applyProductFilters();
    }

    function parseCurrency(text) {
        const digits = String(text || '').replace(/[^0-9]/g, '');
        return digits ? parseInt(digits, 10) : 0;
    }

    function parseNumber(value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return null;
        }
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function escapeHtmlForFilter(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function escapeAttribute(text) {
        return escapeHtmlForFilter(text).replace(/"/g, '&quot;');
    }

    const originalLoadAllProductsForFilter = window.loadAllProducts;
    if (typeof originalLoadAllProductsForFilter === 'function') {
        window.loadAllProducts = function () {
            const result = originalLoadAllProductsForFilter.apply(this, arguments);
            setTimeout(function () {
                ensureProductFilterBar();
                refreshProductCategoryOptions();
                applyProductFilters();
            }, 300);
            return result;
        };
    }

    $(document).ajaxComplete(function (_event, _xhr, settings) {
        if (settings && settings.url && settings.url.includes('/api/products/all')) {
            ensureProductFilterBar();
            refreshProductCategoryOptions();
            applyProductFilters();
        }
    });

    $(document).ready(function () {
        ensureProductFilterBar();
        refreshProductCategoryOptions();
        applyProductFilters();
    });
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
