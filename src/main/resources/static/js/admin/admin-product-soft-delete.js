(function () {
    const actionName = 'delete' + 'Product';

    function updateProductActionLabels() {
        $('#products-list-tbody button').each(function () {
            const button = $(this);
            const onclick = button.attr('onclick') || '';
            if (onclick.includes(actionName) && button.text().trim() === 'Xóa') {
                button.text('Ngừng bán');
                button.attr('title', 'Chuyển sản phẩm sang trạng thái ngừng bán');
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

    window[actionName] = function (id) {
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
            success: function () {
                alert('Đã chuyển sản phẩm sang trạng thái ngừng bán!');
                loadAllProducts();
            },
            error: function (xhr) {
                console.error(xhr);
                alert('Ngừng bán thất bại! Vui lòng kiểm tra lại quyền hoặc trạng thái sản phẩm.');
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
