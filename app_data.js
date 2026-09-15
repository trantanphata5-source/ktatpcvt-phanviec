/**
 * PHÒNG KỸ THUẬT VÀ AN TOÀN - PC VŨNG TÀU
 * HỆ THỐNG QUẢN LÝ & PHÂN CÔNG CÔNG VIỆC
 * Dữ liệu nhân sự, tài khoản, categories, tasks mẫu
 */

window.KTAT_AUTH_DATA = {
  accounts: [
    // === BAN LÃNH ĐẠO PHÒNG (role: leader) ===
    { username: "nguyễn đức minh", password: "123", empId: "emp_012054", role: "leader" },
    { username: "phan thế vinh", password: "123", empId: "emp_012170", role: "leader" },
    { username: "nguyễn huy", password: "123", empId: "emp_010333", role: "leader" },
    // === TỔ KỸ THUẬT VÀ AN TOÀN (role: staff) ===
    { username: "nguyễn đình hanh", password: "123", empId: "emp_012554", role: "staff" },
    { username: "đặng thiện hiếu", password: "123", empId: "emp_012528", role: "staff" },
    { username: "vũ đại dương", password: "123", empId: "emp_012688", role: "staff" },
    { username: "nguyễn anh hoàng", password: "123", empId: "emp_012500", role: "staff" },
    { username: "nguyễn ngọc hùng", password: "123", empId: "emp_012697", role: "staff" },
    { username: "nguyễn văn huy", password: "123", empId: "emp_012665", role: "staff" },
    { username: "lê ngọc tuấn nhật", password: "123", empId: "emp_012350", role: "staff" },
    { username: "võ hùng phi", password: "123", empId: "emp_012139", role: "staff" },
    { username: "hồ hữu minh tâm", password: "123", empId: "emp_012209", role: "staff" },
    { username: "đỗ xuân vinh", password: "123", empId: "emp_012323", role: "staff" },
    { username: "trần tấn phát", password: "123", empId: "emp_010622", role: "staff" },
    { username: "hồ đức phương", password: "123", empId: "emp_010113", role: "staff" },
    { username: "võ minh tâm", password: "123", empId: "emp_006110", role: "staff" },
    // === NHÂN SỰ TĂNG CƯỜNG TỪ ĐỘI VẬN HÀNH LƯỚI ĐIỆN VÀO TỔ KỸ THUẬT (role: staff) ===
    { username: "phạm chí trung", password: "123", empId: "emp_012106", role: "staff" },
    { username: "lê thanh tùng", password: "123", empId: "emp_012521", role: "staff" },
    { username: "trần quốc khương", password: "123", empId: "emp_012384", role: "staff" },
    // === TỔ CÔNG NGHỆ THÔNG TIN (role: staff) ===
    { username: "vũ thị linh chi", password: "123", empId: "emp_012763", role: "staff" },
    { username: "nguyễn hồng ngân", password: "123", empId: "emp_012317", role: "staff" }
  ]
};

window.INITIAL_APP_DATA = {
  "categories": [
    // ═══ A. QUẢN LÝ VẬN HÀNH & KỸ THUẬT LƯỚI ĐIỆN (1.1 – 1.8) ═══
    {
      "id": "cat_a01", "code": "1.1",
      "title": "1.1. Quản lý vận hành lưới điện trung, hạ thế",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012054", "emp_012170"],
      "follower_text": "TP Nguyễn Đức Minh, PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a02", "code": "1.2",
      "title": "1.2. Tự động hóa lưới điện (DAS), mini-SCADA, lưới điện thông minh",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a03", "code": "1.3",
      "title": "1.3. Quản lý máy biến áp & trạm biến áp chuyên dùng",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a04", "code": "1.4",
      "title": "1.4. Thiết bị đóng cắt, cáp ngầm, sơ đồ đơn tuyến",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a05", "code": "1.5",
      "title": "1.5. Quản lý sự cố, độ tin cậy CCĐN, OMS (SAIDI/SAIFI/MAIFI)",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a06", "code": "1.6",
      "title": "1.6. Công tác CBM (chẩn đoán tình trạng thiết bị)",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a07", "code": "1.7",
      "title": "1.7. Cung cấp điện, tổn thất điện năng, dự báo phụ tải",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    {
      "id": "cat_a08", "code": "1.8",
      "title": "1.8. Nhà máy điện Diesel",
      "section": "A. Quản lý Vận hành & Kỹ thuật Lưới điện",
      "section_code": "A",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#2563eb", "bg_color": "#eff6ff", "border_color": "#bfdbfe"
    },
    // ═══ B. ĐẦU TƯ XÂY DỰNG – SỬA CHỮA – ĐẤU THẦU (2.1 – 2.5) ═══
    {
      "id": "cat_b01", "code": "2.1",
      "title": "2.1. ĐTXD: danh mục, thiết kế, giám sát, nghiệm thu, quyết toán",
      "section": "B. Đầu tư Xây dựng – Sửa chữa – Đấu thầu",
      "section_code": "B",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#7c3aed", "bg_color": "#f5f3ff", "border_color": "#ddd6fe"
    },
    {
      "id": "cat_b02", "code": "2.2",
      "title": "2.2. Sửa chữa lớn (SCL)",
      "section": "B. Đầu tư Xây dựng – Sửa chữa – Đấu thầu",
      "section_code": "B",
      "follower_ids": ["emp_010333"],
      "follower_text": "PP Nguyễn Huy",
      "color": "#7c3aed", "bg_color": "#f5f3ff", "border_color": "#ddd6fe"
    },
    {
      "id": "cat_b03", "code": "2.3",
      "title": "2.3. Sửa chữa thường xuyên (SCTX), bảo trì lưới điện",
      "section": "B. Đầu tư Xây dựng – Sửa chữa – Đấu thầu",
      "section_code": "B",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#7c3aed", "bg_color": "#f5f3ff", "border_color": "#ddd6fe"
    },
    {
      "id": "cat_b04", "code": "2.4",
      "title": "2.4. Công tác đấu thầu (HSMT, Tổ chuyên gia, thẩm định KQLCNT)",
      "section": "B. Đầu tư Xây dựng – Sửa chữa – Đấu thầu",
      "section_code": "B",
      "follower_ids": ["emp_010333", "emp_012170"],
      "follower_text": "PP Nguyễn Huy, PP Phan Thế Vinh",
      "color": "#7c3aed", "bg_color": "#f5f3ff", "border_color": "#ddd6fe"
    },
    {
      "id": "cat_b05", "code": "2.5",
      "title": "2.5. Thẩm tra kỹ thuật & quản lý chất lượng công trình điện",
      "section": "B. Đầu tư Xây dựng – Sửa chữa – Đấu thầu",
      "section_code": "B",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#7c3aed", "bg_color": "#f5f3ff", "border_color": "#ddd6fe"
    },
    // ═══ C. TÀI SẢN – BÀN GIAO CÔNG TRÌNH – VẬT TƯ (3.1 – 3.3) ═══
    {
      "id": "cat_c01", "code": "3.1",
      "title": "3.1. Tiếp nhận, bàn giao công trình điện theo NĐ 02/2024",
      "section": "C. Tài sản – Bàn giao Công trình – Vật tư",
      "section_code": "C",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#0d9488", "bg_color": "#f0fdfa", "border_color": "#99f6e4"
    },
    {
      "id": "cat_c02", "code": "3.2",
      "title": "3.2. Kiểm kê tài sản, kiểm kê & thanh lý VTTB thu hồi",
      "section": "C. Tài sản – Bàn giao Công trình – Vật tư",
      "section_code": "C",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#0d9488", "bg_color": "#f0fdfa", "border_color": "#99f6e4"
    },
    {
      "id": "cat_c03", "code": "3.3",
      "title": "3.3. Xây dựng tiêu chuẩn VTTB, nghiệm thu VTTB mua mới",
      "section": "C. Tài sản – Bàn giao Công trình – Vật tư",
      "section_code": "C",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#0d9488", "bg_color": "#f0fdfa", "border_color": "#99f6e4"
    },
    // ═══ D. AN TOÀN – MÔI TRƯỜNG (4.1 – 4.3) ═══
    {
      "id": "cat_d01", "code": "4.1",
      "title": "4.1. ATVSLĐ, điều tra TNLĐ, kiểm tra an toàn hiện trường",
      "section": "D. An toàn – Môi trường",
      "section_code": "D",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#d97706", "bg_color": "#fffbeb", "border_color": "#fde68a"
    },
    {
      "id": "cat_d02", "code": "4.2",
      "title": "4.2. PCCC, PCTT&TKCN, bảo vệ môi trường",
      "section": "D. An toàn – Môi trường",
      "section_code": "D",
      "follower_ids": ["emp_012054", "emp_012170"],
      "follower_text": "TP Nguyễn Đức Minh, PP Phan Thế Vinh",
      "color": "#d97706", "bg_color": "#fffbeb", "border_color": "#fde68a"
    },
    {
      "id": "cat_d03", "code": "4.3",
      "title": "4.3. Hành lang an toàn lưới điện cao áp",
      "section": "D. An toàn – Môi trường",
      "section_code": "D",
      "follower_ids": ["emp_012054"],
      "follower_text": "TP Nguyễn Đức Minh",
      "color": "#d97706", "bg_color": "#fffbeb", "border_color": "#fde68a"
    },
    // ═══ E. CÔNG NGHỆ THÔNG TIN – DỮ LIỆU – CHUYỂN ĐỔI SỐ (5.1 – 5.6) ═══
    {
      "id": "cat_e01", "code": "5.1",
      "title": "5.1. GIS lưới điện trung thế, hạ thế",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_010333"],
      "follower_text": "PP Nguyễn Huy",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    },
    {
      "id": "cat_e02", "code": "5.2",
      "title": "5.2. PMIS & đối soát dữ liệu quản lý kỹ thuật",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_010333"],
      "follower_text": "PP Nguyễn Huy",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    },
    {
      "id": "cat_e03", "code": "5.3",
      "title": "5.3. Hạ tầng CNTT, máy chủ, mạng, an toàn thông tin",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_010333"],
      "follower_text": "PP Nguyễn Huy",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    },
    {
      "id": "cat_e04", "code": "5.4",
      "title": "5.4. Chuyển đổi số, AI, phân tích dữ liệu, sáng kiến – ĐMST",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_010333"],
      "follower_text": "PP Nguyễn Huy",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    },
    {
      "id": "cat_e05", "code": "5.5",
      "title": "5.5. Hồ sơ QLKT & báo cáo QLKT định kỳ",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    },
    {
      "id": "cat_e06", "code": "5.6",
      "title": "5.6. Công tác ISO",
      "section": "E. Công nghệ Thông tin – Dữ liệu – Chuyển đổi số",
      "section_code": "E",
      "follower_ids": ["emp_012170"],
      "follower_text": "PP Phan Thế Vinh",
      "color": "#4f46e5", "bg_color": "#eef2ff", "border_color": "#c7d2fe"
    }
  ],

  "employees": [
    {
      "name": "Nguyễn Đức Minh",
      "msnv": "012054",
      "position": "Trưởng phòng Kỹ thuật An toàn",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Phòng Kỹ thuật và An toàn",
      "phone": "0962500579",
      "email": "Minh3ND@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1i7kBgVIPGhyO_DDslPE5qsIn_36nlFFm&sz=w500",
      "id": "emp_012054",
      "short_name": "Minh",
      "team": "BLĐ",
      "team_name": "Ban Lãnh đạo Phòng"
    },
    {
      "name": "Phan Thế Vinh",
      "msnv": "012170",
      "position": "Phó trưởng phòng Kỹ thuật An toàn",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Phòng Kỹ thuật và An toàn",
      "phone": "0963635678",
      "email": "Vinh2PT@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1ttX9G-tPTDh-B4J-o2Gx3giZy-ftFB-L&sz=w500",
      "id": "emp_012170",
      "short_name": "Vinh",
      "team": "BLĐ",
      "team_name": "Ban Lãnh đạo Phòng"
    },
    {
      "name": "Nguyễn Huy",
      "msnv": "010333",
      "position": "Phó phòng Kỹ thuật An toàn",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Công nghệ thông tin - Phòng Kỹ thuật và An toàn",
      "phone": "0968922744",
      "email": "HuyN@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1Z3gzvA0-zRnjYKQ_dzrafnNI-TjLGuh3&sz=w500",
      "id": "emp_010333",
      "short_name": "Huy",
      "team": "BLĐ",
      "team_name": "Ban Lãnh đạo Phòng"
    },
    {
      "name": "Nguyễn Đình Hanh",
      "msnv": "012554",
      "position": "Tổ trưởng Tổ Kỹ thuật",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0907567579",
      "email": "HanhND@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1nN1nbIMnkj8TyQx0GzhP3DXZoQm8XNet&sz=w500",
      "id": "emp_012554",
      "short_name": "Hanh",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Đặng Thiện Hiếu",
      "msnv": "012528",
      "position": "Tổ phó Tổ Kỹ thuật",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0908064117",
      "email": "Hieu5DT@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1nEKdJA35YiKRXWpWR2_rK6KbWDEKTRWj&sz=w500",
      "id": "emp_012528",
      "short_name": "Hiếu",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Vũ Đại Dương",
      "msnv": "012688",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Công nghệ thông tin - Phòng Kỹ thuật và An toàn",
      "phone": "0978877031",
      "email": "DuongVD@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=18U77uRVPlnhG67-vQ37jBqbTJDnsiMkH&sz=w500",
      "id": "emp_012688",
      "short_name": "Dương",
      "team": "TCNTT",
      "team_name": "Tổ CNTT"
    },
    {
      "name": "Nguyễn Anh Hoàng",
      "msnv": "012500",
      "position": "Kỹ sư An toàn",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0988932860",
      "email": "HoangNA@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1OlDIDCNE5Iz9dT7FIwF1TcLeJjRXKzI2&sz=w500",
      "id": "emp_012500",
      "short_name": "Hoàng",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Nguyễn Ngọc Hùng",
      "msnv": "012697",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0908736226",
      "email": "Hung4NN@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1erCgwVP67mYaQNLKl7geDPkUiufr9lZV&sz=w500",
      "id": "emp_012697",
      "short_name": "Hùng",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Nguyễn Văn Huy",
      "msnv": "012665",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0911777350",
      "email": "HuyNV@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1Rw5SiP67d8L8I4ZhYfWHx93MI2j2ydML&sz=w500",
      "id": "emp_012665",
      "short_name": "Huy NV",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Lê Ngọc Tuấn Nhật",
      "msnv": "012350",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0966151262",
      "email": "NhatLNT@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1dAHcHBWogII3hqvcSwpqanVnMwmes1IS&sz=w500",
      "id": "emp_012350",
      "short_name": "Nhật",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Võ Hùng Phi",
      "msnv": "012139",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0966672372",
      "email": "PhiVH@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1wHT_pMck2PZqgWSqlP-_ZdvnIipG6FYK&sz=w500",
      "id": "emp_012139",
      "short_name": "Phi",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Hồ Hữu Minh Tâm",
      "msnv": "012209",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0963795079",
      "email": "TamHHM@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1AairKzxC45DyM3rUJ3WDjDabBfN-DhGM&sz=w500",
      "id": "emp_012209",
      "short_name": "Tâm HHM",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Đỗ Xuân Vinh",
      "msnv": "012323",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0903114811",
      "email": "VinhDX@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1ULB7cA15UuY9fC8zDPZC9je9FfhXDPP-&sz=w500",
      "id": "emp_012323",
      "short_name": "Vinh ĐX",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Trần Tấn Phát",
      "msnv": "010622",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Công nghệ thông tin - Phòng Kỹ thuật và An toàn",
      "phone": "0798676231",
      "email": "Phat4TT@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1AGPVdVBD9EcVZXIJK_qxM98fY7XnzcFQ&sz=w500",
      "id": "emp_010622",
      "short_name": "Phát",
      "team": "TCNTT",
      "team_name": "Tổ CNTT"
    },
    {
      "name": "Hồ Đức Phương",
      "msnv": "010113",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0964147434",
      "email": "Phuong2HD@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1gIJlSVlQQeNxCwFfKgUABGIoSPgRxdoM&sz=w500",
      "id": "emp_010113",
      "short_name": "Phương",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Võ Minh Tâm",
      "msnv": "006110",
      "position": "Kỹ sư Kỹ thuật điện",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0908867798",
      "email": "tamvm@hcmpc.com.vn",
      "photo": "",
      "id": "emp_006110",
      "short_name": "Tâm VM",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật"
    },
    {
      "name": "Phạm Chí Trung",
      "msnv": "012106",
      "position": "Kỹ sư Phương thức",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0969010858",
      "email": "Trung2PC@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1bXTNuUA1aZRz4VZMQGXKRkKcE4dpUASu&sz=w500",
      "id": "emp_012106",
      "short_name": "Trung P.C",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật",
      "is_reinforced": true,
      "reinforce_note": "Tăng cường Đội VHLĐ"
    },
    {
      "name": "Lê Thanh Tùng",
      "msnv": "012521",
      "position": "Kỹ sư Phương thức",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0915861046",
      "email": "Tung9LT@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1j25jbJQ7gVmKjqeAs6XjfDgMojKBs0m_&sz=w500",
      "id": "emp_012521",
      "short_name": "Tùng L.T",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật",
      "is_reinforced": true,
      "reinforce_note": "Tăng cường Đội VHLĐ"
    },
    {
      "name": "Trần Quốc Khương",
      "msnv": "012384",
      "position": "Kỹ sư Phương thức",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Kỹ thuật và An toàn - Phòng Kỹ thuật và An toàn",
      "phone": "0909486966",
      "email": "KhuongTQ@hcmpc.com.vn",
      "photo": "",
      "id": "emp_012384",
      "short_name": "Khương T.Q",
      "team": "TKT",
      "team_name": "Tổ Kỹ thuật",
      "is_reinforced": true,
      "reinforce_note": "Tăng cường Đội VHLĐ"
    },
    {
      "name": "Vũ Thị Linh Chi",
      "msnv": "012763",
      "position": "Chuyên viên Công nghệ thông tin",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Công nghệ thông tin - Phòng Kỹ thuật và An toàn",
      "phone": "0818993811",
      "email": "ChiVTL@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1shiv3oP5xWOQ9eczQDb3CqDvYRrjrFPa&sz=w500",
      "id": "emp_012763",
      "short_name": "Chi",
      "team": "TCNTT",
      "team_name": "Tổ CNTT"
    },
    {
      "name": "Nguyễn Hồng Ngân",
      "msnv": "012317",
      "position": "Cán sự Công nghệ Thông tin",
      "dept_short": "KTAT",
      "dept_full": "Phòng Kỹ thuật và An toàn",
      "group": "Tổ Công nghệ thông tin - Phòng Kỹ thuật và An toàn",
      "phone": "0969606051",
      "email": "NganNH@hcmpc.com.vn",
      "photo": "https://drive.google.com/thumbnail?id=1DqTBWM6UhlZa6agB1pyjY4kUxb9XqGvB&sz=w500",
      "id": "emp_012317",
      "short_name": "Ngân",
      "team": "TCNTT",
      "team_name": "Tổ CNTT"
    }
  ],

  "tasks": [
  ]
};
