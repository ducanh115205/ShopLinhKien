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
            headers: {
                'Authorization': 'Bearer ' + token
            },
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
            headers: {
                'Authorization': 'Bearer ' + token
            },
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
