// assets/js/main.js

document.addEventListener("DOMContentLoaded", function () {
    // Tự động kiểm tra xem đang ở trang nào để kích hoạt hàm tương ứng
    initTrangChu();
    initTrangDanhSach();
    initTrangFormDangKy();
    initTrangBangHocVien();
});

// =========================================================================
// HÀM DÙNG CHUNG: Tạo chuỗi HTML cấu trúc thẻ Card khóa học
// =========================================================================
function renderCardTemplate(item) {
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100 cyber-card text-white">
                <img src="${item.image}" class="card-img-top" alt="${item.title}" style="height: 170px; object-fit: cover;">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-secondary text-info">${item.category}</span>
                            <span class="badge btn-cyber-primary" style="font-size: 0.75rem;">${item.level}</span>
                        </div>
                        <h5 class="card-title fw-bold text-truncate-2" style="font-size: 1.1rem; height: 50px; overflow: hidden;">${item.title}</h5>
                        <p class="card-text text-muted small mb-1">📅 Ngày tổ chức: ${item.date}</p>
                        <p class="card-text text-secondary small mb-3 text-truncate-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.description}</p>
                    </div>
                    <div class="d-flex gap-2 mt-auto">
                        <button class="btn btn-cyber-outline btn-sm w-100" onclick="xemChiTietModal(${item.id})">Chi tiết</button>
                        <a href="register.html?id=${item.id}" class="btn btn-cyber-primary btn-sm w-100 text-center d-flex align-items-center justify-content-center">Đăng ký</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =========================================================================
// 1. CHỨC NĂNG TRANG CHỦ (index.html): Hiện 3 khóa học nổi bật
// =========================================================================
function initTrangChu() {
    const vungHienThi = document.getElementById("featured-workshop-list");
    if (!vungHienThi) return; // Nếu không ở trang chủ thì dừng hàm

    let htmlCode = "";
    // Dùng hàm .slice(0, 3) lấy đúng 3 phần tử đầu tiên trong mảng courses gốc ở data.js
    courses.slice(0, 3).forEach(item => {
        htmlCode += renderCardTemplate(item);
    });
    vungHienThi.innerHTML = htmlCode;
}

// =========================================================================
// 2. CHỨC NĂNG TRANG DANH SÁCH (courses.html): Tìm kiếm & Lọc nâng cao
// =========================================================================
function initTrangDanhSach() {
    const gridDanhSach = document.getElementById("all-workshops-grid");
    if (!gridDanhSach) return;

    const txtSearch = document.getElementById("search-input");
    const selCategory = document.getElementById("category-filter");
    const selLevel = document.getElementById("level-filter");
    const btnReset = document.getElementById("reset-btn");

    // Hàm thực thi bộ lọc kết hợp đồng thời cả 3 điều kiện (Mục 3.3)
    function locDuLieu() {
        const tuKhoa = txtSearch.value.toLowerCase().trim();
        const dmChon = selCategory.value;
        const cdChon = selLevel.value;

        // Dùng phương thức .filter() duyệt mảng gốc
        const mangKetQua = courses.filter(item => {
            const khopTen = item.title.toLowerCase().includes(tuKhoa);
            const khopDanhMuc = (dmChon === "all" || item.category === dmChon);
            const khopCapDo = (cdChon === "all" || item.level === cdChon);
            return khopTen && khopDanhMuc && khopCapDo;
        });

        // Nếu mảng rỗng thì báo lỗi không tìm thấy
        if (mangKetQua.length === 0) {
            gridDanhSach.innerHTML = `<div class="col-12 text-center text-muted my-5 fs-5">Không tìm thấy khóa học nào phù hợp với bộ lọc của bạn.</div>`;
            return;
        }

        let htmlCode = "";
        mangKetQua.forEach(item => { htmlCode += renderCardTemplate(item); });
        gridDanhSach.innerHTML = htmlCode;
    }

    // Lắng nghe sự kiện người dùng tương tác trực tiếp
    txtSearch.addEventListener("input", locDuLieu);
    selCategory.addEventListener("change", locDuLieu);
    selLevel.addEventListener("change", locDuLieu);

    // Chức năng nút xóa bộ lọc (Reset)
    btnReset.addEventListener("click", function () {
        txtSearch.value = "";
        selCategory.value = "all";
        selLevel.value = "all";
        locDuLieu(); // Render lại toàn bộ 8 khóa ban đầu
    });

    locDuLieu(); // Chạy lần đầu khi mở trang để load đủ 8 khóa
}

// Hàm mở Modal xem thông tin chi tiết (Mục 3.4)
// Phải khai báo tường minh ra đối tượng window để nút bấm onclick ở mã HTML gọi được
window.xemChiTietModal = function (id) {
    const workshop = courses.find(item => item.id === id);
    if (!workshop) return;

    // Đổ dữ liệu vào các thẻ tương ứng trong Bootstrap Modal
    document.getElementById("modal-title").innerText = workshop.title;
    document.getElementById("modal-image").src = workshop.image;
    document.getElementById("modal-date").innerText = workshop.date;
    document.getElementById("modal-category").innerText = workshop.category;
    document.getElementById("modal-level").innerText = workshop.level;
    document.getElementById("modal-detail").innerText = workshop.detail;
    document.getElementById("modal-reg-btn").href = `register.html?id=${workshop.id}`;

    // Lệnh kích hoạt hiển thị Modal của thư viện Bootstrap 5
    const formModal = new bootstrap.Modal(document.getElementById('detailModal'));
    formModal.show();
}

// =========================================================================
// 3. CHỨC NĂNG TRANG FORM (register.html): Tự động điền & Validation nâng cao
// =========================================================================
function initTrangFormDangKy() {
    const formDangKy = document.getElementById("registration-form");
    if (!formDangKy) return;

    const dropDownCourse = document.getElementById("course-select");

    // Đổ tên toàn bộ 8 khóa học tự động vào thẻ select option
    courses.forEach(item => {
        const optionNode = document.createElement("option");
        optionNode.value = item.title;
        optionNode.innerText = item.title;
        dropDownCourse.appendChild(optionNode);
    });

    // Đoạn code xử lý nhận tham số ?id=... truyền từ trang khác sang
    const URLParams = new URLSearchParams(window.location.search);
    const paramId = parseInt(URLParams.get('id'));
    if (paramId) {
        const timKhoaHoc = courses.find(item => item.id === paramId);
        if (timKhoaHoc) dropDownCourse.value = timKhoaHoc.title; // Tự động chọn trên form
    }

    // Bắt sự kiện nộp đơn đăng ký
    formDangKy.addEventListener("submit", function (e) {
        e.preventDefault(); // Chặn hành vi tải lại trang mặc định của form

        // Lấy giá trị thô từ các trường nhập liệu
        const nameVal = document.getElementById("fullname").value.trim();
        const emailVal = document.getElementById("email").value.trim();
        const phoneVal = document.getElementById("phone").value.trim();
        const classVal = document.getElementById("student-class").value.trim();
        const courseVal = dropDownCourse.value;
        const notesVal = document.getElementById("notes").value.trim();

        let hopLe = true;

        // Reset toàn bộ chuỗi thông báo lỗi cũ
        document.getElementById("fullname-error").innerText = "";
        document.getElementById("email-error").innerText = "";
        document.getElementById("phone-error").innerText = "";
        document.getElementById("student-class-error").innerText = "";
        document.getElementById("course-select-error").innerText = "";

        // Kiểm tra Họ và Tên (Không trống và tối thiểu 3 ký tự)
        if (nameVal === "") {
            document.getElementById("fullname-error").innerText = "Họ và tên không được bỏ trống.";
            hopLe = false;
        } else if (nameVal.length < 3) {
            document.getElementById("fullname-error").innerText = "Họ và tên phải có độ dài từ 3 ký tự trở lên.";
            hopLe = false;
        }

        // Kiểm tra Email (Bằng Regex kiểm định định dạng chuẩn)
        const bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailVal === "") {
            document.getElementById("email-error").innerText = "Địa chỉ Email bắt buộc phải điền.";
            hopLe = false;
        } else if (!bieuThucEmail.test(emailVal)) {
            document.getElementById("email-error").innerText = "Định dạng Email sinh viên không đúng quy định (Ví dụ: abc@gmail.com).";
            hopLe = false;
        }

        // Kiểm tra Số điện thoại (Chỉ chứa số, dài từ 9 đến 11 số)
        const bieuThucSdt = /^[0-9]{9,11}$/;
        if (phoneVal === "") {
            document.getElementById("phone-error").innerText = "Số điện thoại không được để trống.";
            hopLe = false;
        } else if (!bieuThucSdt.test(phoneVal)) {
            document.getElementById("phone-error").innerText = "Số điện thoại không hợp lệ (Chỉ điền ký tự số và độ dài từ 9 đến 11 ký tự).";
            hopLe = false;
        }

        // Kiểm tra Lớp học
        if (classVal === "") {
            document.getElementById("student-class-error").innerText = "Vui lòng cung cấp tên lớp sinh hoạt của bạn.";
            hopLe = false;
        }

        // Kiểm tra xem đã chọn Workshop chưa
        if (courseVal === "") {
            document.getElementById("course-select-error").innerText = "Bạn chưa chọn workshop tham gia.";
            hopLe = false;
        }

        // NẾU TẤT CẢ DỮ LIỆU HỢP LỆ -> LƯU VÀO LOCALSTORAGE (Mục 3.7)
        if (hopLe) {
            // Khởi tạo một đối tượng học viên mới, dùng Date.now() tạo ID độc bản không trùng lặp
            const hocVienMoi = {
                id: Date.now(),
                name: nameVal,
                email: emailVal,
                phone: phoneVal,
                studentClass: classVal,
                course: courseVal,
                notes: notesVal
            };

            // Đọc mảng cũ đang có dưới LocalStorage lên, nếu chưa có thì gán mảng rỗng []
            let danhSachHocVien = JSON.parse(localStorage.getItem("db_registrations")) || [];
            
            // Đẩy đối tượng mới vào mảng
            danhSachHocVien.push(hocVienMoi);
            
            // Ép mảng thành chuỗi JSON và ghi đè lưu xuống LocalStorage
            localStorage.setItem("db_registrations", JSON.stringify(danhSachHocVien));

            formDangKy.reset(); // Làm trống sạch các ô nhập liệu trên Form
            alert("Đăng ký thành công! Bạn có thể chuyển sang trang 'Danh sách đã đăng ký' để kiểm tra.");
        }
    });
}

// =========================================================================
// 4. CHỨC NĂNG TRANG BẢNG LƯU TRỮ (registrations.html): Đọc & Xóa dữ liệu
// =========================================================================
function initTrangBangHocVien() {
    const bodyBang = document.getElementById("registration-table-body");
    if (!bodyBang) return;

    const btnClearAll = document.getElementById("clear-all-btn");

    // Hàm đọc dữ liệu LocalStorage rồi loop in ra các dòng <tr> của bảng
    function renderDuLieuBang() {
        const danhSachHocVien = JSON.parse(localStorage.getItem("db_registrations")) || [];

        // Nếu không có ai đăng ký thì hiển thị dòng thông báo bảng rỗng
        if (danhSachHocVien.length === 0) {
            bodyBang.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Hệ thống chưa ghi nhận dữ liệu đăng ký nào.</td></tr>`;
            return;
        }

        let htmlRows = "";
        // Duyệt mảng in dữ liệu, đính kèm chỉ số index để xử lý xóa chính xác
        danhSachHocVien.forEach((student, index) => {
            htmlRows += `
                <tr>
                    <td class="fw-bold text-info">${index + 1}</td>
                    <td class="fw-bold text-white">${student.name}</td>
                    <td>${student.studentClass}</td>
                    <td style="color: var(--cyan-neon); font-weight: 600;">${student.course}</td>
                    <td>
                        <div class="small">📧 ${student.email}</div>
                        <div class="small text-muted">📞 ${student.phone}</div>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm" onclick="xoaMotHocVien(${student.id})">Xóa</button>
                    </td>
                </tr>
            `;
        });
        bodyBang.innerHTML = htmlRows;
    }

    // Chức năng xóa toàn bộ danh sách
    btnClearAll.addEventListener("click", function () {
        if (confirm("CẢNH BÁO: Bạn chắc chắn muốn xóa sạch hoàn toàn danh sách học viên đăng ký khỏi LocalStorage không?")) {
            localStorage.removeItem("db_registrations");
            renderDuLieuBang(); // Cập nhật lại giao diện bảng rỗng
        }
    });

    // Khai báo hàm xóa một dòng ra phạm vi toàn cục để nút bấm onclick gọi được
    window.xoaMotHocVien = function (id) {
        if (confirm("Bạn có chắc chắn muốn xóa học viên này không?")) {
            let danhSachHocVien = JSON.parse(localStorage.getItem("db_registrations")) || [];
            // Dùng .filter() giữ lại những học viên có id khác với id cần xóa
            danhSachHocVien = danhSachHocVien.filter(student => student.id !== id);
            // Ghi đè lại mảng mới cập nhật xuống bộ nhớ trình duyệt
            localStorage.setItem("db_registrations", JSON.stringify(danhSachHocVien));
            renderDuLieuBang(); // Cập nhật lại giao diện bảng ngay lập tức
        }
    }

    renderDuLieuBang(); // Chạy hàm hiển thị dữ liệu ngay khi mở trang
}