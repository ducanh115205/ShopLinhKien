function checkAuthAndLoad() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    // Check if user is logged in and is ADMIN
    if (!token || !role || role !== 'ADMIN') {
        window.location.href = '/login';
        return;
    }

    // Display welcome message
    $('#welcome-message').text(`Xin chào, ${username || 'Admin'}`);

    // Load dashboard data
    loadStatistics();
    loadTopProducts();
}

function bindEvents() {
    // Sidebar navigation
    $('.nav-item').click(function(e) {
        e.preventDefault();
        const page = $(this).data('page');

        // Update active state
        $('.nav-item').removeClass('active');
        $(this).addClass('active');

        // Hide all content areas
        $('.content-area').hide();

        // Show selected content
        if (page === 'dashboard') {
            $('#dashboard-content').show();
            loadStatistics();
            loadTopProducts();
        } else if (page === 'users') {
            $('#users-content').show();
            loadAllUsers();
        } else if (page === 'products') {
            $('#products-content').show();
            loadAllProducts(); // Gọi hàm load sản phẩm
        } else if (page === 'categories') {
            $('#categories-content').show();
            loadAllCategories();
        } else if (page === 'orders') {
            $('#orders-content').show();
            loadAllOrders(); // Gọi hàm load đơn hàng
        } else if (page === 'revenue') {
            $('#revenue-content').show();
        }
    });

    // Logout button
    $('#logout-btn').click(function() {
        handleLogout();
    });
}

function loadStatistics() {
    const token = localStorage.getItem('token');

    $.ajax({
        url: '/admin/statistics/overview',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                displayStatistics(response.data);
            } else {
                showError('Không thể tải dữ liệu thống kê');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading statistics:', error);
            if (xhr.status === 403 || xhr.status === 401) {
                handleLogout();
            } else {
                showError('Lỗi khi tải dữ liệu thống kê');
            }
        }
    });
}


function loadTopProducts() {
    const token = localStorage.getItem('token');

    $.ajax({
        url: '/admin/statistics/top-products',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                displayTopProducts(response.data);
            } else {
                showError('Không thể tải danh sách sản phẩm bán chạy');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading top products:', error);
            if (xhr.status === 403 || xhr.status === 401) {
                handleLogout();
            } else {
                showError('Lỗi khi tải danh sách sản phẩm bán chạy');
            }
        }
    });
}

function displayTopProducts(products) {
    const tbody = $('#top-products-list');
    tbody.empty();

    if (!products || products.length === 0) {
        tbody.html('<tr><td colspan="5" class="loading-text">Không có dữ liệu</td></tr>');
        return;
    }

    products.forEach((product, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <img src="${getProductImageUrl(product.image)}" 
                         alt="${product.productName}" 
                         class="product-image"
                         onerror="this.src='/images/default-product.png'">
                </td>
                <td><strong>${escapeHtml(product.productName)}</strong></td>
                <td>${formatNumber(product.totalSold)}</td>
                <td>${formatCurrency(product.totalRevenue)}</td>
            </tr>
        `;
        tbody.append(row);
    });
}

function formatCurrency(amount) {
    if (!amount) return '0 VND';
    return amount.toLocaleString('vi-VN') + ' VND';
}

function formatNumber(number) {
    if (!number) return '0';
    return number.toLocaleString('vi-VN');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple error notification
    const errorDiv = $('<div>')
        .addClass('error-notification')
        .text(message)
        .css({
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#e74c3c',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            zIndex: '1000',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        });

    $('body').append(errorDiv);

    setTimeout(() => {
        errorDiv.fadeOut(() => {
            errorDiv.remove();
        });
    }, 3000);
}

let currentAdminUsers = [];

// 1. Tải danh sách người dùng
function loadAllUsers() {
    const token = localStorage.getItem('token');
    const tbody = $('#users-list-tbody');
    tbody.html('<tr><td colspan="7" style="text-align:center;">Đang tải...</td></tr>');

    $.ajax({
        url: '/admin/users/list', // Hãy đảm bảo API này chuẩn
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (response.success && response.data) {
                tbody.empty();
                currentAdminUsers = response.data; // Lưu lại để dùng khi sửa
                currentAdminUsers.forEach((user, index) => {
                    const roleId = user.role === 'ADMIN' ? 1 : 2;
                    tbody.append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${escapeHtml(user.username)}</strong></td>
                            <td>${escapeHtml(user.email || 'N/A')}</td>
                            <td><span class="role-badge">${user.role}</span></td>
                            <td>
                                <button onclick="openEditUserModal(${user.id})" class="logout-btn" style="background:#f39c12; width:auto; padding:5px 10px; margin-right:5px;">Sửa</button>
                            </td>
                        </tr>
                    `);
                });
            }
        }
    });
}

// 2. Mở Modal Thêm Người Dùng
function openAddUserModal() {
    $('#modal-title').text('Thêm Người Dùng Mới');
    $('#edit-user-id').val(''); // Reset ID

    // Mở khoá và hiện trường Username, Password
    $('#edit-user-username').val('').prop('disabled', false);
    $('#group-username').show();
    $('#edit-user-password').val('');
    $('#group-password').show();
    $('#edit-user-email').val('');
    $('#edit-user-role').val('2'); // Mặc định Customer

    $('#editUserModal').css('display', 'flex');
}

// 3. Mở Modal Sửa Người Dùng
function openEditUserModal(id) {
    const user = currentAdminUsers.find(u => u.id === id);
    if (!user) return;

    $('#modal-title').text('Cập Nhật Người Dùng');
    $('#edit-user-id').val(user.id);

    // Ẩn/Khoá trường Username và Password khi sửa
    $('#edit-user-username').val(user.username).prop('disabled', true);
    $('#group-username').show();
    $('#group-password').hide();
    $('#edit-user-email').val(user.email || '');

    const roleId = user.role === 'ADMIN' ? 1 : 2;
    $('#edit-user-role').val(roleId);

    $('#editUserModal').css('display', 'flex');
}

// 4. Đóng Modal
function closeUserModal() {
    $('#editUserModal').hide();
}

// 5. Gửi lệnh Lưu (Cho cả Thêm và Sửa)
function submitUser() {
    const id = $('#edit-user-id').val();
    const token = localStorage.getItem('token');

    // Dữ liệu dùng chung
    let payload = {
        email: $('#edit-user-email').val(),
        roleId: $('#edit-user-role').val()
    };

    if (id) {
        // --- NẾU CÓ ID -> GỌI API SỬA (PUT) ---
        $.ajax({
            url: '/admin/users/' + id, // Đổi từ /api/users/ thành /admin/users/ cho đồng bộ
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token },
            data: payload, // Truyền dạng form data chuẩn thay vì JSON.stringify
            success: function(res) {
                if(res.success !== false) { // Chống lỗi API Response format
                    alert('Cập nhật người dùng thành công!');
                    closeUserModal();
                    loadAllUsers();
                } else alert("Lỗi: " + res.message);
            }
        });
    } else {
        // --- NẾU KHÔNG CÓ ID -> GỌI API THÊM (POST) ---
        payload.username = $('#edit-user-username').val();
        payload.password = $('#edit-user-password').val();

        if(!payload.username || !payload.password) {
            alert("Vui lòng nhập Tên đăng nhập và Mật khẩu!");
            return;
        }

        $.ajax({
            url: '/admin/users',
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: payload,
            success: function(res) {
                if(res.success !== false) {
                    alert('Thêm người dùng thành công!');
                    closeUserModal();
                    loadAllUsers();
                } else alert("Lỗi: " + res.message);
            }
        });
    }
}

function escapeHtml(text) {
    if(!text) return '';
    return text.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

let currentAdminProducts = []; // Mảng này sẽ lưu data sản phẩm để đổ vào Form Sửa
// ================= HÀM TẢI DANH SÁCH SẢN PHẨM =================
function loadAllProducts() {
    const tbody = $('#products-list-tbody');
    tbody.html('<tr><td colspan="7" class="loading-text">Đang tải dữ liệu sản phẩm...</td></tr>');

    $.ajax({
        url: '/api/products/all?size=100',
        method: 'GET',
        success: function(response) {
            if (response.success && response.data && response.data.content) {
                tbody.empty();

                // LƯU DATA VÀO BIẾN TOÀN CỤC Ở ĐÂY
                currentAdminProducts = response.data.content;

                if(currentAdminProducts.length === 0) {
                    tbody.html('<tr><td colspan="7" class="loading-text">Chưa có sản phẩm nào</td></tr>');
                    return;
                }

                currentAdminProducts.forEach(product => {
                    // 1. Xử lý hiển thị danh mục (Nối tên các danh mục nếu có nhiều)
                    let categoryName = 'Chưa phân loại';
                    if (product.categories && product.categories.length > 0) {
                        // Lấy danh sách tên danh mục và nối lại bằng dấu phẩy
                        categoryName = product.categories.map(c => c.name).join(', ');
                    }

                    // 2. Xử lý hiển thị Trạng thái (Dựa trên trường status trong DB)
                    // Giả sử: 1 là Đang bán, 0 là Tạm ẩn
                    const statusHtml = product.status === 1
                        ? '<span class="badge-success" style="color:#27ae60; font-weight:bold;">Đang bán</span>'
                        : '<span class="badge-danger" style="color:#e74c3c; font-weight:bold;">Nghỉ bán</span>';

                    // 3. Render hàng (row) mới
                    tbody.append(`
                        <tr>
                            <td>${product.id}</td>
                            <td>
                                <img src="${getProductImageUrl(product.image)}" 
                                     class="product-image" 
                                     onerror="this.src='/images/default-product.png'">
                            </td>
                            <td><strong>${escapeHtml(product.name)}</strong></td>
                            <td><span class="category-tag">${escapeHtml(categoryName)}</span></td> <td>${formatCurrency(product.price)}</td>
                            <td>${product.quantity}</td>
                            <td>${statusHtml}</td> <td>
                                <button onclick="openEditModal(${product.id})" class="logout-btn" style="background:#f39c12; padding:5px 10px; font-size:12px; width:auto; margin-right:5px;">Sửa</button>
                                <button onclick="deleteProduct(${product.id})" class="logout-btn" style="background:#e74c3c; padding:5px 10px; font-size:12px; width:auto;">Xóa</button>
                            </td>
                        </tr>
                    `);
                });
            }
        },
        error: function() {
            showError('Không thể tải danh sách sản phẩm. Hãy kiểm tra lại kết nối!');
        }
    });
}
// ================= HÀM XÓA SẢN PHẨM =================
function deleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm có ID = ' + id + ' không?')) {
        const token = localStorage.getItem('token');

        $.ajax({
            url: '/api/products/' + id,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function() {
                alert('Xóa sản phẩm thành công!');
                loadAllProducts(); // Tải lại danh sách sau khi xóa
            },
            error: function(xhr) {
                console.error(xhr);
                alert('Xóa thất bại! Vui lòng kiểm tra lại quyền hoặc sản phẩm đang nằm trong đơn hàng.');
            }
        });
    }
}

// Hàm tải danh sách danh mục từ Server
function loadCategoriesForSelect() {
    $.ajax({
        url: '/api/category', // API lấy tất cả danh mục
        method: 'GET',
        success: function(response) {
            if (response.success && response.data) {
                let options = '<option value="">-- Chọn danh mục --</option>';
                response.data.filter(cat => cat.status === 1).forEach(cat => {
                    options += `<option value="${cat.id}">${cat.name}</option>`;
                });
                // Đổ dữ liệu vào cả 2 select ở modal Thêm và Sửa
                $('#add-prod-category, #edit-prod-category').html(options);
            }
        },
        error: function() {
            console.error("Không thể tải danh mục");
        }
    });
}

// Gọi hàm này ngay khi trang load xong
let currentAdminCategories = [];

function loadAllCategories() {
    const token = localStorage.getItem('token');
    const tbody = $('#categories-list-tbody');
    tbody.html('<tr><td colspan="4" style="text-align:center;">Đang tải danh mục...</td></tr>');

    $.ajax({
        url: '/api/category',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (!response.success || !response.data) {
                tbody.html('<tr><td colspan="4" style="text-align:center;">Không thể tải danh mục</td></tr>');
                return;
            }

            currentAdminCategories = response.data;
            if (currentAdminCategories.length === 0) {
                tbody.html('<tr><td colspan="4" style="text-align:center;">Chưa có danh mục nào</td></tr>');
                return;
            }

            tbody.empty();
            currentAdminCategories.forEach(category => {
                const statusHtml = category.status === 1
                    ? '<span style="color:#27ae60; font-weight:bold;">Đang hiển thị</span>'
                    : '<span style="color:#e74c3c; font-weight:bold;">Đã ẩn</span>';

                tbody.append(`
                    <tr>
                        <td>${category.id}</td>
                        <td><strong>${escapeHtml(category.name)}</strong></td>
                        <td>${statusHtml}</td>
                        <td>
                            <button onclick="openEditCategoryModal(${category.id})" class="logout-btn" style="background:#f39c12; padding:5px 10px; font-size:12px; width:auto; margin-right:5px;">Sửa</button>
                            <button onclick="deleteCategory(${category.id})" class="logout-btn" style="background:#e74c3c; padding:5px 10px; font-size:12px; width:auto;">Ẩn</button>
                        </td>
                    </tr>
                `);
            });
        },
        error: function(xhr) {
            tbody.html(`<tr><td colspan="4" style="text-align:center;">${xhr.responseJSON?.error || 'Lỗi tải danh mục'}</td></tr>`);
        }
    });
}

function openAddCategoryModal() {
    $('#category-modal-title').text('Thêm danh mục');
    $('#category-id').val('');
    $('#category-name').val('');
    $('#category-status').val('1');
    $('#categoryModal').css('display', 'flex');
}

function openEditCategoryModal(id) {
    const category = currentAdminCategories.find(item => item.id === id);
    if (!category) return;

    $('#category-modal-title').text('Sửa danh mục');
    $('#category-id').val(category.id);
    $('#category-name').val(category.name || '');
    $('#category-status').val(category.status);
    $('#categoryModal').css('display', 'flex');
}

function closeCategoryModal() {
    $('#categoryModal').hide();
}

function submitCategory() {
    const id = $('#category-id').val();
    const token = localStorage.getItem('token');
    const name = $('#category-name').val().trim();
    const status = parseInt($('#category-status').val(), 10);

    if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
    }

    $.ajax({
        url: id ? `/api/category/${id}` : '/api/category',
        method: id ? 'PUT' : 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ name, status }),
        success: function(response) {
            if (response.success === false) {
                alert(response.error || response.message || 'Lưu danh mục thất bại');
                return;
            }
            alert(id ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
            closeCategoryModal();
            loadAllCategories();
            loadCategoriesForSelect();
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.error || 'Lưu danh mục thất bại');
        }
    });
}

function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn ẩn danh mục này?')) return;

    const token = localStorage.getItem('token');
    $.ajax({
        url: `/api/category/${id}`,
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (response.success === false) {
                alert(response.error || response.message || 'Ẩn danh mục thất bại');
                return;
            }
            alert('Đã ẩn danh mục');
            loadAllCategories();
            loadCategoriesForSelect();
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.error || 'Ẩn danh mục thất bại');
        }
    });
}

$(document).ready(function() {
    checkAuthAndLoad();
    bindEvents();
    initProductImageUploadControls();
    loadCategoriesForSelect(); // Thêm dòng này
});

// ================= HÀM SỬA SẢN PHẨM =================
// ================= HÀM MỞ FORM SỬA SẢN PHẨM =================
function initProductImageUploadControls() {
    addImageUploadControl('add');
    addImageUploadControl('edit');
}

function addImageUploadControl(mode) {
    const imageInput = document.getElementById(`${mode}-prod-image`);
    if (!imageInput || document.getElementById(`${mode}-prod-image-file`)) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.marginTop = '8px';
    wrapper.innerHTML = `
        <input type="file" id="${mode}-prod-image-file" accept="image/*" style="width:100%; margin-top:6px;">
        <small style="display:block; color:#7f8c8d; margin-top:4px;">Chọn file ảnh từ máy tính, hoặc giữ link ảnh ở ô trên.</small>
        <img id="${mode}-prod-image-preview" src="/images/default-product.png" alt="Preview" style="display:none; width:90px; height:90px; object-fit:cover; border-radius:6px; border:1px solid #ddd; margin-top:8px;">
    `;
    imageInput.insertAdjacentElement('afterend', wrapper);

    document.getElementById(`${mode}-prod-image-file`).addEventListener('change', function () {
        previewSelectedImage(mode);
    });
}

function previewSelectedImage(mode) {
    const fileInput = document.getElementById(`${mode}-prod-image-file`);
    const preview = document.getElementById(`${mode}-prod-image-preview`);
    if (!fileInput || !preview || !fileInput.files || fileInput.files.length === 0) {
        return;
    }

    preview.src = URL.createObjectURL(fileInput.files[0]);
    preview.style.display = 'block';
}

async function uploadSelectedProductImage(mode) {
    const fileInput = document.getElementById(`${mode}-prod-image-file`);
    const urlInput = document.getElementById(`${mode}-prod-image`);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return urlInput ? urlInput.value.trim() : '';
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch('/api/products/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Upload ảnh thất bại');
    }

    if (urlInput) {
        urlInput.value = data.data;
    }
    return data.data;
}

function resetProductImageUpload(mode) {
    const fileInput = document.getElementById(`${mode}-prod-image-file`);
    const preview = document.getElementById(`${mode}-prod-image-preview`);
    if (fileInput) {
        fileInput.value = '';
    }
    if (preview) {
        preview.src = '/images/default-product.png';
        preview.style.display = 'none';
    }
}

function openEditModal(id) {
    const product = currentAdminProducts.find(p => p.id === id);
    if (!product) return;

    $('#edit-prod-id').val(product.id);
    $('#edit-prod-name').val(product.name);
    $('#edit-prod-price').val(product.price);
    $('#edit-prod-quantity').val(product.quantity);
    $('#edit-prod-desc').val(product.description || '');
    $('#edit-prod-image').val(product.image || '');
    resetProductImageUpload('edit');
    const editPreview = document.getElementById('edit-prod-image-preview');
    if (editPreview && product.image) {
        editPreview.src = getProductImageUrl(product.image);
        editPreview.style.display = 'block';
    }

    // Gán giá trị Status hiện tại
    $('#edit-prod-status').val(product.status);

    // Tìm và gán CategoryId (Nếu ProductResponse của bạn có chứa list categories)
    if (product.categories && product.categories.length > 0) {
        $('#edit-prod-category').val(product.categories[0].id);
    }

    $('#editProductModal').css('display', 'flex');
}

// ================= HÀM GỬI API CẬP NHẬT =================
async function submitEditProduct() {
    const id = $('#edit-prod-id').val();
    const token = localStorage.getItem('token');
    let uploadedImage;
    try {
        uploadedImage = await uploadSelectedProductImage('edit');
    } catch (err) {
        alert('Upload ảnh thất bại: ' + err.message);
        return;
    }

    const payload = {
        name: $('#edit-prod-name').val(),
        price: parseFloat($('#edit-prod-price').val()),
        quantity: parseInt($('#edit-prod-quantity').val()),
        description: $('#edit-prod-desc').val(),
        image: uploadedImage,
        status: parseInt($('#edit-prod-status').val()), // Quan trọng: Lấy từ select
        categoryId: $('#edit-prod-category').val()    // Quan trọng: Lấy từ select
    };

    $.ajax({
        url: '/api/products/' + id,
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(payload),
        success: function(response) {
            alert('Cập nhật thành công!');
            $('#editProductModal').hide();
            resetProductImageUpload('edit');
            loadAllProducts();
        },
        error: function(xhr) {
            alert('Lỗi: ' + xhr.responseText);
        }
    });
}
// ================= HÀM MỞ FORM THÊM SẢN PHẨM =================
function openAddModal() {
    // Xóa sạch các ô input cũ trước khi mở form mới
    $('#add-prod-name').val('');
    $('#add-prod-price').val('');
    $('#add-prod-quantity').val('');
    $('#add-prod-desc').val('');
    $('#add-prod-image').val('');
    resetProductImageUpload('add');
    // Hiển thị Popup (flex để căn giữa màn hình)
    $('#addProductModal').css('display', 'flex');
}

// ================= HÀM GỬI API THÊM SẢN PHẨM =================
async function submitAddProduct() {
    const name = $('#add-prod-name').val().trim();
    const price = $('#add-prod-price').val();
    const quantity = $('#add-prod-quantity').val();
    const desc = $('#add-prod-desc').val().trim();
    const token = localStorage.getItem('token');
    let uploadedImage;

    // Kiểm tra không cho để trống
    if (!name || !price || !quantity) {
        alert("Vui lòng nhập đầy đủ Tên, Giá và Số lượng!");
        return;
    }

    // Tạo Body theo cấu trúc ProductRequest
    try {
        uploadedImage = await uploadSelectedProductImage('add');
    } catch (err) {
        alert('Upload ảnh thất bại: ' + err.message);
        return;
    }

    const payload = {
        name: $('#add-prod-name').val(),
        price: parseFloat($('#add-prod-price').val()),
        quantity: parseInt($('#add-prod-quantity').val()),
        description: $('#add-prod-desc').val(),
        image: uploadedImage,
        status: parseInt($('#add-prod-status').val()), // Lấy status từ select
        categoryId: $('#add-prod-category').val()    // Lấy categoryId
    };

    // Đổi chữ trên nút để báo hiệu đang xử lý
    const btnThem = $('#addProductModal button:last-child');
    btnThem.text('Đang thêm...').prop('disabled', true);

    $.ajax({
        url: '/api/products',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(payload),
        success: function(response) {
            alert('Thêm sản phẩm thành công!');
            $('#addProductModal').hide();
            resetProductImageUpload('add');
            btnThem.text('Thêm sản phẩm').prop('disabled', false);
            loadAllProducts(); // Load lại bảng để hiển thị sản phẩm vừa thêm
        },
        error: function(xhr) {
            console.error(xhr);
            alert('Lỗi khi thêm sản phẩm! Vui lòng kiểm tra lại.');
            btnThem.text('Thêm sản phẩm').prop('disabled', false);
        }
    });
}

// ================= HÀM TẢI / CẬP NHẬT ĐƠN HÀNG =================
function getOrderStatusText(status) {
    switch (status) {
        case 1: return 'Chờ xác nhận';
        case 2: return 'Đã xác nhận';
        case 3: return 'Đang giao';
        case 4: return 'Hoàn thành';
        case 5: return 'Đã hủy';
        default: return 'Không xác định';
    }
}

function getOrderStatusHtml(status) {
    const text = getOrderStatusText(status);
    if (status === 4) return `<span style="color:#27ae60; font-weight:bold;">${text}</span>`;
    if (status === 5) return `<span style="color:#e74c3c; font-weight:bold;">${text}</span>`;
    return `<span style="color:#f39c12; font-weight:bold;">${text}</span>`;
}

function getOrderActionButtons(order) {
    if (order.status === 4 || order.status === 5) return '';
    return `
        <button onclick="adminUpdateOrderStatus(${order.id}, 2)" class="logout-btn" style="background:#27ae60; padding:5px 10px; font-size:12px; display:inline-block; width:auto;">Xác nhận</button>
        <button onclick="adminUpdateOrderStatus(${order.id}, 3)" class="logout-btn" style="background:#8e44ad; padding:5px 10px; font-size:12px; display:inline-block; width:auto;">Đang giao</button>
        <button onclick="adminUpdateOrderStatus(${order.id}, 4)" class="logout-btn" style="background:#2c3e50; padding:5px 10px; font-size:12px; display:inline-block; width:auto;">Hoàn thành</button>
        <button onclick="adminUpdateOrderStatus(${order.id}, 5)" class="logout-btn" style="background:#e74c3c; padding:5px 10px; font-size:12px; display:inline-block; width:auto;">Hủy</button>
    `;
}

function adminUpdateOrderStatus(orderId, status) {
    const token = localStorage.getItem('token');
    const message = status === 5 ? 'Bạn có chắc muốn hủy đơn này?' : 'Cập nhật trạng thái đơn hàng?';
    if (!confirm(message)) return;

    $.ajax({
        url: `/api/orders/admin/${orderId}/status?status=${status}`,
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            alert(response.message || 'Cập nhật thành công');
            loadAllOrders();
            loadStatistics();
            loadTopProducts();
            closeOrderDetailModal();
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.error || 'Cập nhật trạng thái thất bại');
        }
    });
}

function loadAllOrders() {
    const token = localStorage.getItem('token');
    const tbody = $('#orders-list-tbody');
    tbody.html('<tr><td colspan="6" class="loading-text">Đang tải dữ liệu đơn hàng...</td></tr>');

    $.ajax({
        url: '/api/orders/all',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (response.success && response.data) {
                tbody.empty();
                const orders = response.data;
                const sortType = $('#sort-order-price').val();
                if (sortType === 'asc') orders.sort((a, b) => a.totalPrice - b.totalPrice);
                else if (sortType === 'desc') orders.sort((a, b) => b.totalPrice - a.totalPrice);
                else orders.sort((a, b) => b.id - a.id);

                if (orders.length === 0) {
                    tbody.html('<tr><td colspan="6" class="loading-text">Chưa có đơn hàng nào</td></tr>');
                    return;
                }

                orders.forEach(order => {
                    const dateObj = new Date(order.createdAt);
                    const dateStr = dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN');
                    tbody.append(`
                        <tr>
                            <td>#${order.id}</td>
                            <td><strong>${escapeHtml(order.userName)}</strong></td>
                            <td>${dateStr}</td>
                            <td>${formatCurrency(order.totalPrice)}</td>
                            <td>${getOrderStatusHtml(order.status)}</td>
                            <td>
                                <button onclick="viewOrderDetail(${order.id})" class="logout-btn" style="background:#3498db; padding:5px 10px; font-size:12px; display:inline-block; width:auto; cursor:pointer;">Chi tiết</button>
                                ${getOrderActionButtons(order)}
                            </td>
                        </tr>
                    `);
                });
            }
        },
        error: function(xhr) {
            showError(xhr.responseJSON?.error || 'Không thể tải danh sách đơn hàng. Bạn có quyền Admin chưa?');
        }
    });
}

function viewOrderDetail(orderId) {
    const token = localStorage.getItem('token');
    $('#detail-order-items').html('<tr><td colspan="4" style="text-align:center;">Đang tải dữ liệu...</td></tr>');
    $('#orderDetailModal').css('display', 'flex');

    $.ajax({
        url: '/api/orders/admin/' + orderId,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (response.success && response.data) {
                const order = response.data;
                $('#detail-order-id').text('#' + order.id);
                $('#detail-order-customer').text(order.userName || 'N/A');
                const dateObj = new Date(order.createdAt);
                $('#detail-order-date').text(dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN'));
                $('#detail-order-status').html(getOrderStatusHtml(order.status));
                $('#detail-order-note').text(order.note || 'Không có ghi chú');
                $('#detail-order-total').text(formatCurrency(order.totalPrice));

                const tbody = $('#detail-order-items');
                tbody.empty();
                if (order.orderDetails && order.orderDetails.length > 0) {
                    order.orderDetails.forEach(item => {
                        const unitPrice = item.quantity ? item.price / item.quantity : item.price;
                        tbody.append(`
                            <tr>
                                <td>${escapeHtml(item.productName || 'Sản phẩm ' + item.productId)}</td>
                                <td>${formatCurrency(unitPrice)}</td>
                                <td style="text-align:center;">${item.quantity}</td>
                                <td><strong>${formatCurrency(item.price)}</strong></td>
                            </tr>
                        `);
                    });
                } else {
                    tbody.html('<tr><td colspan="4" style="text-align:center;">Không có chi tiết sản phẩm.</td></tr>');
                }
            } else {
                alert('Lỗi: ' + (response.error || response.message));
                closeOrderDetailModal();
            }
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.error || 'Không thể kết nối đến server để lấy chi tiết');
            closeOrderDetailModal();
        }
    });
}

function closeOrderDetailModal() {
    $('#orderDetailModal').hide();
}
let myChart = null; // Biến toàn cục để lưu instance của biểu đồ

function displayStatistics(data) {
    // Cập nhật các thẻ text
    $('#total-revenue').text(formatCurrency(data.totalRevenue));
    $('#total-orders-val').text(formatNumber(data.totalOrders));
    $('#total-users-val').text(formatNumber(data.totalUsers));
    $('#total-products-val').text(formatNumber(data.totalProducts));

    // Vẽ biểu đồ doanh thu
    if (data.revenueChart) {
        const labels = data.revenueChart.map(item => item[0]); // Ngày
        const values = data.revenueChart.map(item => item[1]); // Tiền

        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (myChart) myChart.destroy(); // Xóa biểu đồ cũ nếu có

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: values,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function handleLogout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    // Clear cookies
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "token=; path=/api; max-age=0";

    // Redirect to login page
    window.location.href = '/login';
}



// Refresh data every 30 seconds (optional)
setInterval(() => {
    const activePage = $('.nav-item.active').data('page');
    if (activePage === 'dashboard') {
        loadStatistics();
        loadTopProducts();
    }
}, 30000);
