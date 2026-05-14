const khung = document.querySelector(".khung");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");

if (khung && tabLogin && tabRegister) {
    khung.classList.add("login-mode");

    tabLogin.addEventListener("click", () => {
        khung.classList.remove("register-mode");
        khung.classList.add("login-mode");
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
    });

    tabRegister.addEventListener("click", () => {
        khung.classList.remove("login-mode");
        khung.classList.add("register-mode");
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
    });
}

const kiemTraEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function xoaCookieTokenCu() {
    const clearCommands = [
        "token=; path=/; max-age=0",
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "token=; path=/api; max-age=0",
        "token=; path=/; max-age=0; samesite=lax"
    ];

    clearCommands.forEach((cookieStr) => {
        document.cookie = cookieStr;
    });

    const hostname = window.location.hostname;
    if (hostname) {
        document.cookie = `token=; path=/; max-age=0; domain=${hostname}`;
    }
}

function luuCookieTokenMoi(token) {
    xoaCookieTokenCu();
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=3600; samesite=lax`;
}

if (window.location.pathname === "/login") {
    xoaCookieTokenCu();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
}

async function xacnhandangky(event) {
    event.preventDefault();

    const email = document.getElementById("emaildangky").value.trim();
    const username = document.getElementById("tendangky").value.trim();
    const password = document.getElementById("matkhaudangky").value.trim();
    const password2 = document.getElementById("matkhaudangkynhaplai").value.trim();

    let hasError = false;

    if (!email) {
        loidangky("loi_emaildangky", "Email không được bỏ trống");
        hasError = true;
    } else if (!kiemTraEmail(email)) {
        loidangky("loi_emaildangky", "Email sai định dạng");
        hasError = true;
    } else {
        loidangky("loi_emaildangky", "");
    }

    if (!username) {
        loidangky("loi_tendangky", "Tên đăng nhập không được bỏ trống");
        hasError = true;
    } else {
        loidangky("loi_tendangky", "");
    }

    if (!password) {
        loidangky("loi_mat_khaudangky", "Mật khẩu không được bỏ trống");
        hasError = true;
    } else if (password.length < 8) {
        loidangky("loi_mat_khaudangky", "Mật khẩu phải từ 8 ký tự");
        hasError = true;
    } else {
        loidangky("loi_mat_khaudangky", "");
    }

    if (!password2) {
        loidangky("loi_mat_khaudangkynhaplai", "Vui lòng nhập lại mật khẩu");
        hasError = true;
    } else if (password2 !== password) {
        loidangky("loi_mat_khaudangkynhaplai", "Mật khẩu nhập lại không trùng khớp");
        hasError = true;
    } else {
        loidangky("loi_mat_khaudangkynhaplai", "");
    }

    if (hasError) {
        return;
    }

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password })
        });

        const data = await res.json();

        if (data.success) {
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            tabLogin.click();
            document.querySelector(".bieumau.dangky form").reset();
        } else {
            alert("Đăng ký thất bại: " + (data.error || data.message));
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi kết nối server!");
    }
}

function loidangky(id, msg) {
    const target = document.getElementById(id);
    if (target) {
        target.innerText = msg;
    }
}

async function dangnhap(event) {
    event.preventDefault();

    const username = document.getElementById("email").value.trim();
    const password = document.getElementById("matkhau").value.trim();

    document.getElementById("loi_email").innerText = "";
    document.getElementById("loi_mat_khau").innerText = "";

    if (!username || !password) {
        if (!username) {
            document.getElementById("loi_email").innerText = "Tên đăng nhập không được bỏ trống";
        }
        if (!password) {
            document.getElementById("loi_mat_khau").innerText = "Mật khẩu không được bỏ trống";
        }
        return;
    }

    // Hiển thị loading state
    const loginButton = event.target.querySelector('button[type="submit"]') || event.target;
    const originalText = loginButton.textContent;
    loginButton.textContent = "Đang xử lý...";
    loginButton.disabled = true;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            const token = data.data.token;
            const userId = data.data.userId;
            const role = data.data.role;
            const usernameLogin = data.data.username;

            // Lưu thông tin vào localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("username", usernameLogin);
            localStorage.setItem("role", role);

            // Lưu cookie
            luuCookieTokenMoi(token);

            // ========== PHẦN CHỈNH SỬA (giữ nguyên core, chỉ thêm điều kiện) ==========
            // Kiểm tra URL parameter redirect
            const urlParams = new URLSearchParams(window.location.search);
            const redirectParam = urlParams.get("redirect");

            let redirectUrl;
            if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
                redirectUrl = redirectParam;
            } else if (role === "ADMIN") {
                redirectUrl = "/admin";
            } else {
                redirectUrl = "/home";
            }

            if (role === "ADMIN") {
                alert("Đăng nhập thành công! Chào mừng Quản trị viên.");
            } else {
                alert("Đăng nhập thành công!");
            }

            window.location.href = redirectUrl;
            // ========== KẾT THÚC PHẦN CHỈNH SỬA ==========

        } else {
            alert("Đăng nhập thất bại: " + (data.error || data.message));
            // Reset form
            document.getElementById("matkhau").value = "";
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Có lỗi xảy ra khi kết nối server! Vui lòng kiểm tra kết nối mạng.");
    } finally {
        // Reset button state
        loginButton.textContent = originalText;
        loginButton.disabled = false;
    }
}

// Thêm hàm kiểm tra trạng thái đăng nhập khi vào trang login
function checkAlreadyLoggedIn() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "ADMIN") {
        window.location.href = "/admin";
    } else if (token && role === "CUSTOMER") {
        window.location.href = "/home";
    }
}

// Gọi hàm kiểm tra khi trang login được tải
if (window.location.pathname === "/login") {
    checkAlreadyLoggedIn();
}
