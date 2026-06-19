// assets/js/main.js

// LẮNG NGHE SỰ KIỆN KHI TRANG WEB LOAD XONG
document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra nếu đang ở trang Đăng ký (register.html)
    if (document.getElementById("registration-form")) {
        initTrangDangKy();
    }
    // 2. Kiểm tra nếu đang ở trang Danh sách (registrations.html)
    if (document.getElementById("registration-table-body")) {
        initTrangDanhSach();
    }
    // 3. Kiểm tra nếu đang ở trang Chủ (index.html)
    if (document.getElementById("featured-workshop-list")) {
        initTrangChu();
    }
    // 4. Kiểm tra nếu đang ở trang Tổng hợp Workshop (courses.html)
    if (document.getElementById("all-workshops-grid")) {
        initTrangWorkshop();
    }
});

// =========================================================================
// XỬ LÝ LƯU TRỮ VÀ VALIDATION CHO TRANG ĐĂNG KÝ (register.html)
// =========================================================================
function initTrangDangKy() {
    const form = document.getElementById("registration-form");
    const courseSelect = document.getElementById("course-select");

    // Tự động nạp danh sách khóa học từ data.js vào ô Chọn Workshop
    if (courseSelect && typeof courses !== 'undefined') {
        courseSelect.innerHTML = '<option value="">-- Chọn một workshop trong danh sách --</option>';
        courses.forEach(w => {
            courseSelect.innerHTML += `<option value="${w.title}">${w.title}</option>`;
        });

        // Tự động chọn Workshop nếu bấm đăng ký trực tiếp từ trang chủ/chi tiết sang
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        if (courseId) {
            const matched = courses.find(c => c.id == courseId);
            if (matched) courseSelect.value = matched.title;
        }
    }

    // Lắng nghe sự kiện gửi form đăng ký
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn trình duyệt reload trang làm mất dữ liệu

        // Xóa sạch các câu thông báo lỗi cũ
        document.querySelectorAll(".error-msg").forEach(el => el.innerText = "");

        // Lấy dữ liệu từ các ô nhập liệu (Khớp chính xác ID trong HTML của bạn)
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const studentClass = document.getElementById("student-class").value.trim();
        const course = courseSelect.value;
        const notes = document.getElementById("notes").value.trim();

        let isValid = true;

        // --- KIỂM TRA BẮT LỖI (VALIDATION) ---
        if (!fullname) {
            document.getElementById("fullname-error").innerText = "Vui lòng nhập họ và tên.";
            isValid = false;
        }
        if (!email) {
            document.getElementById("email-error").innerText = "Vui lòng nhập email sinh viên.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById("email-error").innerText = "Định dạng email không hợp lệ.";
            isValid = false;
        }
        if (!phone) {
            document.getElementById("phone-error").innerText = "Vui lòng nhập số điện thoại.";
            isValid = false;
        } else if (!/^[0-9]{10}$/.test(phone)) {
            document.getElementById("phone-error").innerText = "Số điện thoại phải chứa đúng 10 chữ số.";
            isValid = false;
        }
        if (!studentClass) {
            document.getElementById("student-class-error").innerText = "Vui lòng nhập lớp sinh hoạt.";
            isValid = false;
        }
        if (!course) {
            document.getElementById("course-select-error").innerText = "Vui lòng chọn một Workshop muốn tham gia.";
            isValid = false;
        }

        // Nếu có lỗi, dừng việc lưu trữ
        if (!isValid) return;

        // --- TIẾN HÀNH LƯU VÀO LOCALSTORAGE ---
        const database = JSON.parse(localStorage.getItem("registrations")) || [];

        const newStudent = {
            id: Date.now(),
            name: fullname,
            email: email,
            phone: phone,
            class: studentClass,
            course: course,
            notes: notes
        };

        database.push(newStudent);
        localStorage.setItem("registrations", JSON.stringify(database));

        alert("🎉 Chúc mừng bạn đã đăng ký tham gia thành công!");
        form.reset();
        window.location.href = "registrations.html"; // Chuyển hướng sang trang danh sách
    });
}

// =========================================================================
// ĐỌC VÀ HIỂN THỊ DỮ LIỆU LÊN BẢNG (registrations.html)
// =========================================================================
function initTrangDanhSach() {
    const tableBody = document.getElementById("registration-table-body");
    if (!tableBody) return;

    // Đính kèm hàm load vào đối tượng window để có thể gọi lại sau khi xóa dữ liệu
    window.loadTableData = function() {
        const database = JSON.parse(localStorage.getItem("registrations")) || [];

        // Đặt colspan="6" để co giãn chuẩn xác với cấu trúc 6 cột trong bảng HTML của bạn
        if (database.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Hệ thống chưa ghi nhận dữ liệu đăng ký nào.</td></tr>`;
            return;
        }

        let html = "";
        database.forEach((student, index) => {
            html += `
                <tr>
                    <th scope="row" class="text-center text-white">${index + 1}</th>
                    <td class="text-white fw-semibold">${student.name}</td>
                    <td class="text-info">${student.class}</td>
                    <td style="color: var(--cyan-neon);">${student.course}</td>
                    <td class="text-muted small">${student.email} <br> ${student.phone}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm py-0 px-2 small" onclick="deleteSingleStudent(${student.id})">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    }

    window.loadTableData();
}

// Xử lý xóa đơn lẻ 1 học viên
window.deleteSingleStudent = function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa học viên này khỏi danh sách không?")) {
        let database = JSON.parse(localStorage.getItem("registrations")) || [];
        database = database.filter(student => student.id != id);
        localStorage.setItem("registrations", JSON.stringify(database));
        if (window.loadTableData) window.loadTableData();
    }
}

// Xử lý xóa toàn bộ danh sách (Nút đỏ góc phải màn hình)
window.clearAllRegistrations = function() {
    if (confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ danh sách học viên đăng ký không? Hành động này không thể hoàn tác!")) {
        localStorage.removeItem("registrations");
        if (window.loadTableData) window.loadTableData();
    }
}

// =========================================================================
// ĐỔ DỮ LIỆU ĐỘNG CHO TRANG CHỦ VÀ TRANG TỔNG HỢP WORKSHOP
// =========================================================================
function initTrangChu() {
    const container = document.getElementById("featured-workshop-list");
    if (!container || typeof courses === 'undefined') return;
    
    const featured = courses.slice(0, 3); // Lấy 3 sự kiện đầu tiên làm tiêu biểu
    let htmlContent = "";
    featured.forEach(w => {
        htmlContent += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 bg-dark text-white border-secondary">
                    <img src="${w.image}" class="card-img-top" alt="${w.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-info text-dark mb-2 align-self-start">${w.category}</span>
                        <h5 class="card-title fw-bold" style="color: var(--cyan-neon);">${w.title}</h5>
                        <p class="card-text text-muted small flex-grow-1">${w.description}</p>
                        <p class="card-text small mb-3">📅 Ngày: ${w.date}</p>
                        <button class="btn btn-cyber-outline w-100" onclick="handleDetailClick(${w.id})">Xem chi tiết</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = htmlContent;
}

function initTrangWorkshop() {
    const grid = document.getElementById("all-workshops-grid");
    if (!grid || typeof courses === 'undefined') return;
    
    let html = "";
    courses.forEach(w => {
        html += `
            <div class="col-md-3 mb-4">
                <div class="card h-100 bg-dark text-white border-secondary">
                    <img src="${w.image}" class="card-img-top" alt="${w.title}" style="height: 160px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="badge bg-secondary text-info">${w.category}</span>
                            <span class="badge bg-dark border border-info text-info small">${w.level || "Cơ bản"}</span>
                        </div>
                        <h6 class="card-title fw-bold" style="color: var(--cyan-neon); height: 40px; overflow: hidden;">${w.title}</h6>
                        <p class="card-text text-muted small flex-grow-1" style="overflow: hidden;">${w.description}</p>
                        <p class="card-text small mb-2 text-secondary">📅 Ngày: ${w.date}</p>
                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-cyber-outline btn-sm w-100" onclick="handleDetailClick(${w.id})">Chi tiết</button>
                            <a href="register.html?id=${w.id}" class="btn btn-cyber-primary btn-sm w-100">Đăng ký</a>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    grid.innerHTML = html;
}

// HÀM HIỂN THỊ POPUP MODAL CHI TIẾT SỰ KIỆN KHI BẤM "XEM CHI TIẾT"
window.handleDetailClick = function(id) {
    if (typeof courses === 'undefined') return;
    const workshop = courses.find(w => w.id == id);
    
    if (!workshop) {
        console.error("Không tìm thấy dữ liệu của Workshop với ID:", id);
        return;
    }

    // Gán dữ liệu tìm được vào các thành phần tương ứng của khung Modal trong HTML
    if (document.getElementById('modal-title')) document.getElementById('modal-title').innerText = workshop.title;
    if (document.getElementById('modal-image')) document.getElementById('modal-image').src = workshop.image || '';
    if (document.getElementById('modal-date')) document.getElementById('modal-date').innerText = workshop.date;
    if (document.getElementById('modal-category')) document.getElementById('modal-category').innerText = workshop.category;
    if (document.getElementById('modal-level')) document.getElementById('modal-level').innerText = workshop.level || "Cơ bản";
    
    if (document.getElementById('modal-detail')) {
        document.getElementById('modal-detail').innerText = workshop.detail || workshop.description || "Chưa có nội dung mô tả chi tiết cho sự kiện này.";
    }
    
    if (document.getElementById('modal-reg-btn')) {
        document.getElementById('modal-reg-btn').href = `register.html?id=${workshop.id}`;
    }

    // Kích hoạt hiển thị Modal Bootstrap lên màn hình
    const modalElement = document.getElementById('detailModal');
    if (modalElement) {
        const detailModal = new bootstrap.Modal(modalElement);
        detailModal.show();
    }
}