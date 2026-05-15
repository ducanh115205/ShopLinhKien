const DEFAULT_PRODUCT_IMAGE = "/images/default-product.svg";

let currentPage = 0;
let pageSize = 12;
let totalPages = 0;
let totalElements = 0;
let currentSortBy = 'id';
let currentSortDir = 'desc';
let currentKeyword = '';
let currentCategoryId = '';
let currentMinPrice = '';
let currentMaxPrice = '';

$(document).ready(function () {
    bindTopActions();
    bindSearchEvents();
    bindPriceFilterEvents();
    loadCategories();
    loadProducts();
    updateUIByAuthStatus();
});

function bindSearchEvents() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById("searchInput");
    currentKeyword = searchInput ? searchInput.value.trim() : '';

    if (currentKeyword !== '') {
        currentCategoryId = '';
        currentPage = 0;
        $('#category-title').text(`Kết quả tìm kiếm cho: "${currentKeyword}"`);
        $('.btn-danh-muc').removeClass('active');
        $('.btn-danh-muc').first().addClass('active');
        loadProducts();
    }
}

function loadProducts() {
    $("#ds-san-pham").html('<div class="loading">Đang tải sản phẩm...</div>');

    let url = `/api/products/search?page=${currentPage}&size=${pageSize}`;

    if (currentKeyword !== '') {
        url += `&keyword=${encodeURIComponent(currentKeyword)}`;
    }
    if (currentCategoryId !== '') {
        url += `&listCategoryId=${currentCategoryId}`;
    }
    if (currentMinPrice !== '' && currentMinPrice !== null) {
        url += `&minPrice=${currentMinPrice}`;
    }
    if (currentMaxPrice !== '' && currentMaxPrice !== null) {
        url += `&maxPrice=${currentMaxPrice}`;
    }
    if (currentSortBy && currentSortDir) {
        url += `&sort=${currentSortBy},${currentSortDir}`;
    }

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (response) {
            if (response.success && response.data && response.data.content) {
                totalPages = response.data.totalPages;
                totalElements = response.data.totalElements;
                renderProducts(response.data.content);
                renderPagination();
                updateTotalItems();
            } else {
                $("#ds-san-pham").html('<div class="empty-state">Không tìm thấy sản phẩm phù hợp.</div>');
                $("#total-items").text("(0 sản phẩm)");
                $("#phan-trang").empty();
            }
        },
        error: function (xhr, status, error) {
            console.log("Load products error:", error);
            renderProducts([]);
        }
    });
}

function sortProducts(sortBy, sortDir) {
    currentSortBy = sortBy;
    currentSortDir = sortDir;
    currentPage = 0;
    loadProducts();
}

function loadCategories() {
    $.ajax({
        url: "/api/category",
        method: "GET",
        dataType: "json",
        success: function (response) {
            renderCategories(response.success ? response.data || [] : []);
        },
        error: function (xhr, status, error) {
            console.log("Load categories error:", error);
            renderCategories([]);
        }
    });
}

function renderCategories(categories) {
    const container = $("#phan-trang-1");
    container.empty();

    let html = '<div class="danh-muc">';
    const allActive = (currentCategoryId === '') ? 'active' : '';
    html += `<button class="btn-danh-muc ${allActive}" onclick="loadProductsByCategory('', 'Tất cả sản phẩm')">Tất cả sản phẩm</button>`;

    categories.forEach(c => {
        if (c.status === 1) {
            const isActive = (currentCategoryId == c.id) ? 'active' : '';
            html += `<button class="btn-danh-muc ${isActive}" onclick="loadProductsByCategory(${c.id}, '${escapeJs(c.name)}')">${escapeHtml(c.name)}</button>`;
        }
    });

    html += "</div>";
    container.html(html);
}

function loadProductsByCategory(categoryId, categoryName) {
    currentCategoryId = categoryId;
    currentKeyword = '';
    $('#searchInput').val('');
    currentPage = 0;

    if (categoryName) {
        $('#category-title').text(categoryName);
    } else if (categoryId === '') {
        $('#category-title').text('Tất cả sản phẩm');
    }

    $('.btn-danh-muc').removeClass('active');
    if (categoryId === '') {
        $('.btn-danh-muc').first().addClass('active');
    } else {
        $(`.btn-danh-muc[onclick*="loadProductsByCategory(${categoryId}"]`).addClass('active');
    }

    loadProducts();
}

function loadAllProducts() {
    loadProductsByCategory('', 'Tất cả sản phẩm');
}

function renderProducts(products) {
    const container = $("#ds-san-pham");
    container.empty();

    if (!products || products.length === 0) {
        container.html('<div class="empty-state">Không có sản phẩm nào.</div>');
        return;
    }

    products.forEach(p => {
        const hasStock = (p.quantity || 0) > 0;
        const stockText = hasStock ? "Còn hàng" : "Hết hàng";
        const stockClass = hasStock ? "in-stock" : "out-stock";
        const token = localStorage.getItem("token");
        const isLoggedIn = token && token !== "null" && token !== "undefined";

        let buttonHtml = '';
        if (isLoggedIn) {
            buttonHtml = `<button class="btn-them ${hasStock ? "" : "out"}" ${hasStock ? `onclick="addToCart(${p.id}, 1, event)"` : "disabled"}>${hasStock ? "Thêm vào giỏ hàng" : "Hết hàng"}</button>`;
        } else {
            buttonHtml = `<button class="btn-them" onclick="redirectToLogin(event)">Đăng nhập để mua hàng</button>`;
        }

        const productHTML = `
            <div class="san-pham" onclick="goToProductDetail(${p.id})">
                <div class="thumbnail-wrap">
                    <span class="stock-badge ${stockClass}">${stockText}</span>
                    <img src="${getProductImageUrl(p.image)}" alt="${escapeHtml(p.name)}" class="anh-san-pham" onerror="handleProductImageError(this)">
                </div>
                <div class="product-body">
                    <h3 class="ten-san-pham">${escapeHtml(p.name)}</h3>
                    <p class="sku">SKU: PRD-${p.id}</p>
                    <p class="mo-ta">${escapeHtml(p.description || "Không có mô tả.")}</p>
                    <p class="gia-san-pham">${formatPrice(p.price)}</p>
                    ${buttonHtml}
                </div>
            </div>`;

        container.append(productHTML);
    });
}

function goToProductDetail(productId) {
    window.location.href = `/product/${productId}`;
}

function renderPagination() {
    const container = $("#phan-trang");
    container.empty();

    if (totalPages <= 1) {
        return;
    }

    let html = '<div class="pagination-container">';
    html += `<div class="pagination-info">Trang ${currentPage + 1} / ${totalPages} - Tổng ${totalElements} sản phẩm</div>`;
    html += '<div class="pagination-buttons">';

    if (currentPage > 0) {
        html += `<button class="btn-pagination" onclick="goToPage(0)">&laquo;</button>`;
        html += `<button class="btn-pagination" onclick="goToPage(${currentPage - 1})">&lsaquo;</button>`;
    } else {
        html += `<button class="btn-pagination disabled" disabled>&laquo;</button>`;
        html += `<button class="btn-pagination disabled" disabled>&lsaquo;</button>`;
    }

    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 0) {
        html += `<button class="btn-pagination" onclick="goToPage(0)">1</button>`;
        if (startPage > 1) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += i === currentPage
            ? `<button class="btn-pagination active" disabled>${i + 1}</button>`
            : `<button class="btn-pagination" onclick="goToPage(${i})">${i + 1}</button>`;
    }

    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
        html += `<button class="btn-pagination" onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
    }

    if (currentPage < totalPages - 1) {
        html += `<button class="btn-pagination" onclick="goToPage(${currentPage + 1})">&rsaquo;</button>`;
        html += `<button class="btn-pagination" onclick="goToPage(${totalPages - 1})">&raquo;</button>`;
    } else {
        html += `<button class="btn-pagination disabled" disabled>&rsaquo;</button>`;
        html += `<button class="btn-pagination disabled" disabled>&raquo;</button>`;
    }

    html += "</div></div>";
    container.html(html);
}

function goToPage(page) {
    if (page >= 0 && page < totalPages) {
        currentPage = page;
        loadProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function updateTotalItems() {
    $("#total-items").text(`(${totalElements} sản phẩm)`);
}

function redirectToLogin(event) {
    if (event) {
        event.stopPropagation();
    }
    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    window.location.href = "/login";
}

async function addToCart(productId, quantity = 1, event) {
    if (event) {
        event.stopPropagation();
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "/login";
        return;
    }

    const payload = {
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
            alert("Đã thêm sản phẩm vào giỏ hàng!");
        } else {
            alert("Thêm sản phẩm thất bại: " + (data.error || data.message));
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi thêm sản phẩm vào giỏ hàng");
    }
}

function bindTopActions() {
    const logoutBtn = document.getElementById("logout-btn");
    const cartBtn = document.getElementById("cart-btn");
    const loginBtn = document.getElementById("login-btn");
    ensureOrdersButton(cartBtn);
    const ordersBtn = document.getElementById("orders-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (cartBtn) {
        cartBtn.addEventListener("click", function () {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vui lòng đăng nhập để xem giỏ hàng!");
                window.location.href = "/login";
                return;
            }
            window.location.href = "/cart";
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            window.location.href = "/login";
        });
    }

    if (ordersBtn) {
        ordersBtn.addEventListener("click", function () {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vui lòng đăng nhập để xem đơn hàng!");
                window.location.href = "/login?redirect=/orders";
                return;
            }
            window.location.href = "/orders";
        });
    }
}

function ensureOrdersButton(cartBtn) {
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

function updateUIByAuthStatus() {
    const token = localStorage.getItem("token");
    const isLoggedIn = token && token !== "null" && token !== "undefined";

    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");

    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
    }
    if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
    }
}

function handleSortChange() {
    const sortValue = document.getElementById("sortPrice").value;
    const [sortBy, sortDir] = sortValue.split("-");
    sortProducts(sortBy, sortDir);
}

function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
}

function bindPriceFilterEvents() {
    const applyBtn = document.getElementById("applyPriceFilter");
    const clearBtn = document.getElementById("clearFilter");
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");

    if (applyBtn) {
        applyBtn.addEventListener("click", applyPriceFilter);
    }
    if (clearBtn) {
        clearBtn.addEventListener("click", clearFilters);
    }
    if (minPriceInput) {
        minPriceInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") applyPriceFilter();
        });
    }
    if (maxPriceInput) {
        maxPriceInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") applyPriceFilter();
        });
    }
}

function applyPriceFilter() {
    const minInput = document.getElementById("minPrice");
    const maxInput = document.getElementById("maxPrice");

    const minVal = minInput ? minInput.value.trim() : '';
    const maxVal = maxInput ? maxInput.value.trim() : '';

    if (minVal !== '' && maxVal !== '' && parseFloat(minVal) > parseFloat(maxVal)) {
        alert("Giá từ không được lớn hơn giá đến!");
        return;
    }

    currentMinPrice = minVal !== '' ? parseFloat(minVal) : '';
    currentMaxPrice = maxVal !== '' ? parseFloat(maxVal) : '';
    currentPage = 0;

    let filterText = 'Tất cả sản phẩm';
    if (currentKeyword !== '') {
        filterText = `Kết quả tìm kiếm: "${currentKeyword}"`;
    } else if (currentCategoryId !== '') {
        const activeBtn = $('.btn-danh-muc.active');
        filterText = activeBtn.length ? activeBtn.text() : 'Tất cả sản phẩm';
    }

    if (currentMinPrice !== '' || currentMaxPrice !== '') {
        const minStr = currentMinPrice !== '' ? formatPrice(currentMinPrice) : '0 VND';
        const maxStr = currentMaxPrice !== '' ? formatPrice(currentMaxPrice) : '∞';
        filterText += ` (Giá: ${minStr} - ${maxStr})`;
    }

    $('#category-title').text(filterText);
    loadProducts();
}

function clearFilters() {
    const minInput = document.getElementById("minPrice");
    const maxInput = document.getElementById("maxPrice");

    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';

    currentMinPrice = '';
    currentMaxPrice = '';
    currentKeyword = '';
    currentCategoryId = '';
    currentPage = 0;
    currentSortBy = 'id';
    currentSortDir = 'desc';

    $('#searchInput').val('');
    $('#sortPrice').val('id-desc');
    $('#category-title').text('Tất cả sản phẩm');

    $('.btn-danh-muc').removeClass('active');
    $('.btn-danh-muc').first().addClass('active');

    loadProducts();
}

function getProductImageUrl(image) {
    if (!image || !image.trim()) {
        return DEFAULT_PRODUCT_IMAGE;
    }

    const value = image.trim();
    if (/^(https?:)?\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    return value.startsWith("images/") ? `/${value}` : `/images/${value}`;
}

function handleProductImageError(img) {
    img.onerror = null;
    img.src = DEFAULT_PRODUCT_IMAGE;
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " VND";
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeJs(text) {
    return String(text || '').replace(/'/g, "\\'");
}
