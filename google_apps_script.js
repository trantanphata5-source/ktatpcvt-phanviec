/**
 * GOOGLE APPS SCRIPT - ĐỒNG BỘ CÔNG VIỆC & TÀI KHOẢN PHÒNG KỸ THUẬT VÀ AN TOÀN (PC VT)
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1l8QqyhTdX9ci-s5qwzy-sLhAXfO7yDfhwbZhqQJohK0/edit
 * 
 * ==============================================================================
 * CÁC TAB TRÊN GOOGLE SHEET:
 * 1. "Phân công trực tuyến" : Lưu trữ toàn bộ danh sách công việc, phân công, tiến độ
 * 2. "Tài khoản"            : Quản lý danh sách tài khoản, mật khẩu (kể cả sau khi đổi)
 * ==============================================================================
 * HƯỚNG DẪN CẬP NHẬT TRÊN GOOGLE SHEET:
 * 1. Mở Google Sheet → Tiện ích mở rộng (Extensions) → Apps Script
 * 2. Xóa toàn bộ nội dung trong Code.gs, dán toàn bộ mã này vào, bấm Ctrl+S để lưu
 * 3. Bấm "Triển khai" (Deploy) → "Quản lý bản triển khai" (Manage deployments):
 *    - Bấm biểu tượng cây bút (Chỉnh sửa / Edit)
 *    - Chọn Phiên bản (Version): "Phiên bản mới" (New version)
 *    - Bấm "Triển khai" (Deploy)
 * 4. (Tùy chọn) Chọn hàm "initSheetAndAccounts" từ thanh công cụ và bấm "Chạy" (Run)
 *    để tạo ngay tab "Tài khoản" trên Google Sheet mà không cần chờ web gửi dữ liệu!
 * ==============================================================================
 */

const STORAGE_PROP_KEY = 'KTAT_BOARD_DATA';
const PASSWORDS_PROP_KEY = 'KTAT_CUSTOM_PASSWORDS';
const SHEET_ID = '1l8QqyhTdX9ci-s5qwzy-sLhAXfO7yDfhwbZhqQJohK0';

const TASKS_SHEET_NAME = 'Phân công trực tuyến';
const ACCOUNTS_SHEET_NAME = 'Tài khoản';

// Danh sách 18 tài khoản mặc định Phòng KTAT
const DEFAULT_ACCOUNTS = [
  { stt: 1, empId: "emp_012054", name: "Nguyễn Đức Minh", username: "nguyễn đức minh", password: "123", role: "Lãnh đạo phòng", team: "Ban Lãnh đạo", position: "Trưởng phòng" },
  { stt: 2, empId: "emp_012170", name: "Phan Thế Vinh", username: "phan thế vinh", password: "123", role: "Lãnh đạo phòng", team: "Ban Lãnh đạo", position: "Phó Trưởng phòng" },
  { stt: 3, empId: "emp_010333", name: "Nguyễn Huy", username: "nguyễn huy", password: "123", role: "Lãnh đạo phòng", team: "Ban Lãnh đạo", position: "Phó Trưởng phòng" },
  { stt: 4, empId: "emp_012554", name: "Nguyễn Đình Hanh", username: "nguyễn đình hanh", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Tổ trưởng Kỹ thuật" },
  { stt: 5, empId: "emp_012528", name: "Đặng Thiện Hiếu", username: "đặng thiện hiếu", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Tổ phó Tổ Kỹ thuật" },
  { stt: 6, empId: "emp_012688", name: "Vũ Đại Dương", username: "vũ đại dương", password: "123", role: "Nhân viên", team: "Tổ CNTT", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 7, empId: "emp_012500", name: "Nguyễn Anh Hoàng", username: "nguyễn anh hoàng", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư An toàn" },
  { stt: 8, empId: "emp_012697", name: "Nguyễn Ngọc Hùng", username: "nguyễn ngọc hùng", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 9, empId: "emp_012665", name: "Nguyễn Văn Huy", username: "nguyễn văn huy", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 10, empId: "emp_012350", name: "Lê Ngọc Tuấn Nhật", username: "lê ngọc tuấn nhật", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 11, empId: "emp_012139", name: "Võ Hùng Phi", username: "võ hùng phi", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 12, empId: "emp_012209", name: "Hồ Hữu Minh Tâm", username: "hồ hữu minh tâm", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 13, empId: "emp_012323", name: "Đỗ Xuân Vinh", username: "đỗ xuân vinh", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 14, empId: "emp_010622", name: "Trần Tấn Phát", username: "trần tấn phát", password: "123", role: "Nhân viên", team: "Tổ CNTT", position: "Kỹ sư CNTT" },
  { stt: 15, empId: "emp_010113", name: "Hồ Đức Phương", username: "hồ đức phương", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Kỹ thuật điện" },
  { stt: 16, empId: "emp_006110", name: "Võ Minh Tâm", username: "võ minh tâm", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Chuyên viên Kỹ thuật" },
  { stt: 17, empId: "emp_012763", name: "Vũ Thị Linh Chi", username: "vũ thị linh chi", password: "123", role: "Nhân viên", team: "Tổ CNTT", position: "Chuyên viên CNTT" },
  { stt: 18, empId: "emp_012317", name: "Nguyễn Hồng Ngân", username: "nguyễn hồng ngân", password: "123", role: "Nhân viên", team: "Tổ CNTT", position: "Chuyên viên CNTT" },
  // 3 nhân sự tăng cường từ Đội Vận hành lưới điện vào Tổ Kỹ thuật
  { stt: 19, empId: "emp_012106", name: "Phạm Chí Trung", username: "phạm chí trung", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Phương thức (Tăng cường Đội VHLĐ)" },
  { stt: 20, empId: "emp_012521", name: "Lê Thanh Tùng", username: "lê thanh tùng", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Phương thức (Tăng cường Đội VHLĐ)" },
  { stt: 21, empId: "emp_012384", name: "Trần Quốc Khương", username: "trần quốc khương", password: "123", role: "Nhân viên", team: "Tổ Kỹ thuật", position: "Kỹ sư Phương thức (Tăng cường Đội VHLĐ)" }
];

function getSpreadsheet() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch(e) { ss = null; }
  if (!ss) {
    try { ss = SpreadsheetApp.openById(SHEET_ID); } catch(e) { return null; }
  }
  return ss;
}

// ==============================================================================
// BẢNG ÁNH XẠ CHUẨN HÓA NHÓM CÔNG TÁC CŨ (LA MÃ) SANG 26 NHÓM RACI MỚI
// ==============================================================================
var LEGACY_CATEGORY_MAP = [
  { match: /^(X\.\s*|cat_cntt|.*CNTT\s*chung)/i, replacement: '5.3. Hạ tầng CNTT, máy chủ, mạng, an toàn thông tin' },
  { match: /^(XI\.\s*|.*Mua\s*sắm\s*TSCĐ)/i, replacement: '5.3. Hạ tầng CNTT, máy chủ, mạng, an toàn thông tin' },
  { match: /^(XII\.\s*|.*Sáng\s*kiến)/i, replacement: '5.4. Chuyển đổi số, AI, phân tích dữ liệu, sáng kiến – ĐMST' },
  { match: /^(I\.\s*|.*vận\s*hành\s*lưới)/i, replacement: '1.1. Quản lý vận hành lưới điện trung, hạ thế' },
  { match: /^(II\.\s*|.*DAS|.*SCADA)/i, replacement: '1.2. Tự động hóa lưới điện (DAS), mini-SCADA, lưới điện thông minh' },
  { match: /^(III\.\s*|.*ĐTXD)/i, replacement: '2.1. ĐTXD: danh mục, thiết kế, giám sát, nghiệm thu, quyết toán' },
  { match: /^(IV\.\s*|.*SCL|.*Sửa\s*chữa\s*lớn)/i, replacement: '2.2. Sửa chữa lớn (SCL)' },
  { match: /^(V\.\s*|.*SCTX|.*Sửa\s*chữa\s*thường)/i, replacement: '2.3. Sửa chữa thường xuyên (SCTX), bảo trì lưới điện' },
  { match: /^(VI\.\s*|.*ATVSLĐ|.*An\s*toàn)/i, replacement: '4.1. ATVSLĐ, điều tra TNLĐ, kiểm tra an toàn hiện trường' },
  { match: /^(VII\.\s*|.*PCCC)/i, replacement: '4.2. PCCC, PCTT&TKCN, bảo vệ môi trường' },
  { match: /^(VIII\.\s*|.*Hành\s*lang)/i, replacement: '4.3. Hành lang an toàn lưới điện cao áp' },
  { match: /^(IX\.\s*|.*GIS)/i, replacement: '5.1. GIS lưới điện trung thế, hạ thế' },
  { match: /^(6\.1|.*Phối\s*hợp\s*Phòng\s*Ban)/i, replacement: '6.1. Phối hợp Phòng Ban khác' }
];

function normalizeCategory(catStr) {
  if (!catStr) return '1.1. Quản lý vận hành lưới điện trung, hạ thế';
  var s = String(catStr).trim();
  // NẾU ĐÃ Ở ĐỊNH DẠNG MỚI (bắt đầu bằng "số.số") → trả về ngay, KHÔNG chạy qua bảng ánh xạ legacy
  // Ví dụ: "5.3. Hạ tầng CNTT..." đã đúng rồi, không cần normalize
  if (/^\d+\.\d+\.?\s/.test(s)) {
    return s;
  }
  for (var i = 0; i < LEGACY_CATEGORY_MAP.length; i++) {
    if (LEGACY_CATEGORY_MAP[i].match.test(s)) {
      return LEGACY_CATEGORY_MAP[i].replacement;
    }
  }
  return s;
}

// ==============================================================================
// GET REQUEST: Trả về dữ liệu công việc và danh sách mật khẩu tài khoản
// ==============================================================================
function doGet(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(5000);
  try {
    var ss = getSpreadsheet();

    // 1. Hỗ trợ đổi mật khẩu qua GET / JSONP / Beacon (tránh hoàn toàn chặn CORS)
    if (e && e.parameter && (e.parameter.action === 'change_password' || e.parameter.action === 'changePassword')) {
      var empId = e.parameter.empId || e.parameter.username;
      var newPassword = e.parameter.newPassword || e.parameter.password;
      if (ss && empId && newPassword) {
        updatePasswordInSheet(ss, empId, newPassword);
      }
      return createOutput({
        status: 'success',
        message: 'Đã cập nhật mật khẩu vào Google Sheet thành công!',
        empId: empId
      }, e);
    }

    // 2. Lấy dữ liệu công việc và danh sách mật khẩu
    var props = PropertiesService.getScriptProperties();
    var savedJson = props.getProperty(STORAGE_PROP_KEY);
    var data = savedJson ? JSON.parse(savedJson) : null;

    var customPasswords = ss ? readPasswordsFromSheet(ss) : {};

    // 3. ĐỌC VÀ ĐỒNG BỘ TRỰC TIẾP TỪ TAB "PHÂN CÔNG TRỰC TUYẾN" CỦA GOOGLE SHEET
    if (ss) {
      data = syncTasksFromSheet(ss, data);
    }

    var response = {
      status: 'success',
      hasData: !!(data && data.tasks && data.tasks.length > 0),
      data: data,
      customPasswords: customPasswords,
      timestamp: (data && data.lastModified) ? data.lastModified : new Date().toISOString()
    };
    return createOutput(response, e);
  } catch (error) {
    return createOutput({ status: 'error', message: error.toString() }, e);
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch(lErr) {}
    }
  }
}

// ==============================================================================
// POST REQUEST: Nhận dữ liệu công việc hoặc cập nhật đổi mật khẩu
// ==============================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(15000); // Chờ tối đa 15s để xếp hàng ghi tuần tự
  if (!hasLock) {
    return createOutput({ status: 'error', message: 'Hệ thống đang bận ghi dữ liệu từ người dùng khác, vui lòng thử lại sau vài giây!' }, e);
  }

  try {
    var payloadStr = '';
    if (e && e.postData && e.postData.contents) {
      payloadStr = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      payloadStr = e.parameter.data;
    }
    if (!payloadStr) {
      return createOutput({ status: 'error', message: 'Không có dữ liệu gửi đến' }, e);
    }

    var parsed = JSON.parse(payloadStr);
    var ss = getSpreadsheet();
    var props = PropertiesService.getScriptProperties();

    // 1. Trường hợp đổi mật khẩu riêng lẻ
    if (parsed.action === 'change_password') {
      if (ss && parsed.empId && parsed.newPassword) {
        updatePasswordInSheet(ss, parsed.empId, parsed.newPassword);
      }
      return createOutput({
        status: 'success',
        message: 'Đã cập nhật mật khẩu vào Google Sheet thành công!',
        empId: parsed.empId
      }, e);
    }

    // 2. THÊM MỘT CÔNG VIỆC MỚI (Single Add Task - CỰC KỲ AN TOÀN, KHÔNG THỂ LÀM MẤT VIỆC CỦA NGƯỜI KHÁC!)
    if (parsed.action === 'add_task') {
      var newTask = parsed.task;
      if (!newTask || !newTask.title) {
        return createOutput({ status: 'error', message: 'Thiếu thông tin công việc' }, e);
      }
      var savedJson = props.getProperty(STORAGE_PROP_KEY);
      var currentData = savedJson ? JSON.parse(savedJson) : { tasks: [] };
      if (!currentData.tasks || !Array.isArray(currentData.tasks)) currentData.tasks = [];

      // Kiểm tra trùng lặp theo ID hoặc tên (phòng double click)
      var exists = currentData.tasks.some(function(t) { return t.id === newTask.id; });
      if (!exists) {
        newTask.category = normalizeCategory(newTask.category);
        currentData.tasks.push(newTask);
      }
      // Đánh lại số STT tuần tự 1..N
      currentData.tasks.forEach(function(t, idx) { t.stt = idx + 1; });
      currentData.lastModified = new Date().toISOString();
      props.setProperty(STORAGE_PROP_KEY, JSON.stringify(currentData));

      if (ss) {
        try { syncToSpreadsheet(currentData); } catch (sheetErr) { console.warn('Lỗi ghi sheet:', sheetErr); }
      }
      return createOutput({
        status: 'success',
        message: 'Đã thêm công việc vào Google Sheet thành công!',
        data: currentData,
        lastModified: currentData.lastModified
      }, e);
    }

    // 3. CẬP NHẬT MỘT CÔNG VIỆC (Single Update Task)
    if (parsed.action === 'update_task') {
      var updatedTask = parsed.task;
      if (!updatedTask || !updatedTask.id) {
        return createOutput({ status: 'error', message: 'Thiếu mã công việc cần cập nhật' }, e);
      }
      var savedJson = props.getProperty(STORAGE_PROP_KEY);
      var currentData = savedJson ? JSON.parse(savedJson) : { tasks: [] };
      if (!currentData.tasks || !Array.isArray(currentData.tasks)) currentData.tasks = [];

      var found = false;
      for (var i = 0; i < currentData.tasks.length; i++) {
        if (currentData.tasks[i].id === updatedTask.id) {
          if (updatedTask.category) updatedTask.category = normalizeCategory(updatedTask.category);
          currentData.tasks[i] = Object.assign(currentData.tasks[i], updatedTask);
          found = true;
          break;
        }
      }
      if (!found) {
        updatedTask.category = normalizeCategory(updatedTask.category);
        currentData.tasks.push(updatedTask);
      }
      currentData.tasks.forEach(function(t, idx) { t.stt = idx + 1; });
      currentData.lastModified = new Date().toISOString();
      props.setProperty(STORAGE_PROP_KEY, JSON.stringify(currentData));

      if (ss) {
        try { syncToSpreadsheet(currentData); } catch (sheetErr) { console.warn('Lỗi ghi sheet:', sheetErr); }
      }
      return createOutput({
        status: 'success',
        message: 'Đã cập nhật công việc thành công!',
        data: currentData,
        lastModified: currentData.lastModified
      }, e);
    }

    // 4. XÓA MỘT CÔNG VIỆC CỤ THỂ (Explicit Delete Task)
    if (parsed.action === 'delete_task') {
      var delId = parsed.taskId;
      if (!delId) {
        return createOutput({ status: 'error', message: 'Thiếu mã công việc cần xóa' }, e);
      }
      var savedJson = props.getProperty(STORAGE_PROP_KEY);
      var currentData = savedJson ? JSON.parse(savedJson) : { tasks: [] };
      if (!currentData.tasks || !Array.isArray(currentData.tasks)) currentData.tasks = [];

      currentData.tasks = currentData.tasks.filter(function(t) { return t.id !== delId; });
      currentData.tasks.forEach(function(t, idx) { t.stt = idx + 1; });
      currentData.lastModified = new Date().toISOString();
      props.setProperty(STORAGE_PROP_KEY, JSON.stringify(currentData));

      if (ss) {
        try { syncToSpreadsheet(currentData); } catch (sheetErr) { console.warn('Lỗi ghi sheet:', sheetErr); }
      }
      return createOutput({
        status: 'success',
        message: 'Đã xóa công việc khỏi Google Sheet thành công!',
        data: currentData,
        lastModified: currentData.lastModified
      }, e);
    }

    // 5. TRƯỜNG HỢP ĐỒNG BỘ TOÀN BỘ VỚI SMART MERGE (BẢO VỆ TUYỆT ĐỐI CHỐNG MẤT DỮ LIỆU)
    if (!parsed || !parsed.tasks || !Array.isArray(parsed.tasks)) {
      return createOutput({ status: 'error', message: 'Dữ liệu công việc không hợp lệ' }, e);
    }

    var savedJson = props.getProperty(STORAGE_PROP_KEY);
    var existingData = savedJson ? JSON.parse(savedJson) : null;
    var existingTasks = (existingData && Array.isArray(existingData.tasks)) ? existingData.tasks : [];

    // SMART MERGE: Nếu mảng gửi lên có ít task hơn mảng trên server (do máy client có cache cũ),
    // GIỮ LẠI các task hiện hữu trên server, chỉ cập nhật hoặc bổ sung các task từ client!
    var mergedTasks = [];
    var incomingMap = {};
    parsed.tasks.forEach(function(t) {
      if (t.id) incomingMap[t.id] = t;
      if (t.title) incomingMap[t.title.trim().toLowerCase()] = t;
    });

    // 5.1. Quét các việc đang có trên server: nếu client có gửi thì cập nhật, nếu client không có thì VẪN GIỮ LẠI
    existingTasks.forEach(function(oldTask) {
      var keyId = oldTask.id;
      var keyTitle = oldTask.title ? oldTask.title.trim().toLowerCase() : '';
      var incoming = (keyId && incomingMap[keyId]) || (keyTitle && incomingMap[keyTitle]);
      if (incoming) {
        var merged = Object.assign({}, oldTask, incoming);
        merged.category = normalizeCategory(merged.category);
        mergedTasks.push(merged);
        if (keyId) delete incomingMap[keyId];
        if (keyTitle) delete incomingMap[keyTitle];
      } else {
        oldTask.category = normalizeCategory(oldTask.category);
        mergedTasks.push(oldTask);
      }
    });

    // 5.2. Thêm các việc mới hoàn toàn từ client chưa có trên server
    for (var k in incomingMap) {
      var incomingTask = incomingMap[k];
      if (incomingTask && !mergedTasks.some(function(m) { return m.id === incomingTask.id || (m.title && incomingTask.title && m.title.trim().toLowerCase() === incomingTask.title.trim().toLowerCase()); })) {
        incomingTask.category = normalizeCategory(incomingTask.category);
        mergedTasks.push(incomingTask);
      }
    }

    // 5.3. Đánh lại số STT tuần tự 1..N từ trên xuống dưới
    mergedTasks.forEach(function(t, idx) {
      t.stt = idx + 1;
    });

    parsed.tasks = mergedTasks;
    parsed.lastModified = new Date().toISOString();
    props.setProperty(STORAGE_PROP_KEY, JSON.stringify(parsed));

    if (ss) {
      try { syncToSpreadsheet(parsed); } catch (sheetErr) { console.warn('Lỗi ghi sheet công việc:', sheetErr); }
      try {
        if (parsed.customPasswords) {
          for (var id in parsed.customPasswords) {
            updatePasswordInSheet(ss, id, parsed.customPasswords[id]);
          }
        } else {
          getOrCreateAccountsSheet(ss);
        }
      } catch (accErr) { console.warn('Lỗi ghi sheet tài khoản:', accErr); }
    }

    return createOutput({
      status: 'success',
      message: 'Đã đồng bộ công việc an toàn (Smart Merge) thành công!',
      lastModified: parsed.lastModified
    }, e);
  } catch (error) {
    return createOutput({ status: 'error', message: error.toString() }, e);
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch(lErr) {}
    }
  }
}

// ==============================================================================
// ĐỒNG BỘ TAB "PHÂN CÔNG TRỰC TUYẾN" (KHÔNG DÙNG clearContents TRÁNH GIẬT/MẤT ROW)
// ==============================================================================
function syncToSpreadsheet(data) {
  if (!data || !data.tasks) return;
  var ss = getSpreadsheet();
  if (!ss) return;

  var sheet = ss.getSheetByName(TASKS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(TASKS_SHEET_NAME);

  var headers = ['STT', 'Tên công việc', 'Nội dung chi tiết', 'Nhóm công tác', 'Phụ trách', 'Theo dõi', 'Thời hạn', 'Trạng thái', 'Ưu tiên', 'Cập nhật', 'Mã ID'];
  var rows = [];
  var lastMod = data.lastModified ? Utilities.formatDate(new Date(data.lastModified), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss") : Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

  data.tasks.forEach(function(t, idx) {
    var cat = normalizeCategory(t.category);
    rows.push([
      idx + 1,
      t.title || '',
      t.detail || '',
      cat,
      t.in_staging ? 'Chưa phân công' : (t.assignee_text || ''),
      t.follower_text || '',
      t.deadline || '',
      t.status === 'completed' ? '✓ Đã hoàn tất' : '● Đang thực hiện',
      t.priority === 'urgent' ? '🔥 Khẩn cấp' : 'Bình thường',
      lastMod,
      t.id || ('task_' + (idx + 1))
    ]);
  });

  var lastRow = sheet.getLastRow();

  // Thiết lập tiêu đề dòng 1 (An toàn tuyệt đối, không gọi clearContents làm trống sheet)
  var hr = sheet.getRange(1, 1, 1, headers.length);
  hr.setValues([headers]);
  hr.setBackground('#003399');
  hr.setFontColor('#ffffff');
  hr.setFontWeight('bold');
  hr.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (rows.length > 0) {
    var dataRange = sheet.getRange(2, 1, rows.length, headers.length);
    dataRange.setValues(rows);
    dataRange.setVerticalAlignment('middle').setWrap(true);
    // Căn giữa STT
    sheet.getRange(2, 1, rows.length, 1).setHorizontalAlignment('center');
    // Căn giữa Thời hạn, Trạng thái, Ưu tiên, Cập nhật, Mã ID
    sheet.getRange(2, 7, rows.length, 5).setHorizontalAlignment('center');
    // Mã ID hiển thị chữ xám nhỏ kín đáo
    sheet.getRange(2, 11, rows.length, 1).setFontColor('#94a3b8').setFontSize(9);
  }

  // Nếu số dòng mới ít hơn số dòng cũ trước đó, chỉ xóa sạch các dòng thừa bên dưới
  if (lastRow > rows.length + 1) {
    var excessRows = lastRow - (rows.length + 1);
    sheet.getRange(rows.length + 2, 1, excessRows, headers.length).clearContent().clearFormat();
  }

  sheet.setColumnWidth(1, 60);  // STT
  sheet.setColumnWidth(2, 300); // Tên công việc
  sheet.setColumnWidth(3, 380); // Chi tiết
  sheet.setColumnWidth(4, 250); // Nhóm công tác (rộng hơn để hiển thị 26 nhóm RACI)
  sheet.setColumnWidth(5, 200); // Phụ trách
  sheet.setColumnWidth(6, 180); // Theo dõi
  sheet.setColumnWidth(7, 120); // Thời hạn
  sheet.setColumnWidth(8, 130); // Trạng thái
  sheet.setColumnWidth(9, 110); // Ưu tiên
  sheet.setColumnWidth(10, 160); // Cập nhật
  sheet.setColumnWidth(11, 150); // Mã ID (Cột 11)
}

// ==============================================================================
// ĐỒNG BỘ TAB "TÀI KHOẢN" (QUẢN TRỊ XEM MẬT KHẨU & TÀI KHOẢN)
// ==============================================================================
function getOrCreateAccountsSheet(ss) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) return null;
  var sheet = ss.getSheetByName(ACCOUNTS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ACCOUNTS_SHEET_NAME);
    initAccountsSheet(sheet);
  } else {
    ensureAllAccountsInSheet(sheet);
  }
  return sheet;
}

function ensureAllAccountsInSheet(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      initAccountsSheet(sheet);
      return;
    }
    var existingEmpIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().map(function(r) { return String(r[0]).trim(); });
    var missingAccounts = DEFAULT_ACCOUNTS.filter(function(acc) {
      return existingEmpIds.indexOf(acc.empId) === -1;
    });

    if (missingAccounts.length > 0) {
      var nextStt = lastRow;
      var newRows = missingAccounts.map(function(acc, idx) {
        return [
          nextStt + idx,
          acc.empId,
          acc.name,
          acc.username,
          acc.password,
          acc.role,
          acc.team,
          acc.position,
          'Mặc định ban đầu'
        ];
      });
      var startRow = lastRow + 1;
      sheet.getRange(startRow, 1, newRows.length, 9).setValues(newRows);
      sheet.getRange(startRow, 1, newRows.length, 2).setHorizontalAlignment('center');
      sheet.getRange(startRow, 5, newRows.length, 2).setHorizontalAlignment('center');
      sheet.getRange(startRow, 9, newRows.length, 1).setHorizontalAlignment('center');
      sheet.getRange(startRow, 5, newRows.length, 1).setBackground('#fef9c3').setFontWeight('bold');
    }
  } catch(e) {
    console.warn('ensureAllAccounts error:', e);
  }
}

function initAccountsSheet(sheet) {
  // Tự động tìm hoặc tạo sheet nếu người dùng bấm Chạy trực tiếp hàm này trong Apps Script
  if (!sheet) {
    var ss = getSpreadsheet();
    if (!ss) throw new Error('Không thể mở Google Sheet với ID: ' + SHEET_ID);
    sheet = ss.getSheetByName(ACCOUNTS_SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(ACCOUNTS_SHEET_NAME);
  }

  var headers = ['STT', 'Mã nhân viên', 'Họ và tên', 'Tên đăng nhập', 'Mật khẩu', 'Vai trò', 'Tổ công tác', 'Chức danh', 'Thời gian cập nhật'];
  var rows = DEFAULT_ACCOUNTS.map(function(acc) {
    return [
      acc.stt,
      acc.empId,
      acc.name,
      acc.username,
      acc.password,
      acc.role,
      acc.team,
      acc.position,
      'Mặc định ban đầu'
    ];
  });

  sheet.clearContents();
  var hr = sheet.getRange(1, 1, 1, headers.length);
  hr.setValues([headers]);
  hr.setBackground('#003399');
  hr.setFontColor('#ffffff');
  hr.setFontWeight('bold');
  hr.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (rows.length > 0) {
    var range = sheet.getRange(2, 1, rows.length, headers.length);
    range.setValues(rows);
    range.setVerticalAlignment('middle');
    // Căn giữa các cột STT, Mã NV, Mật khẩu, Vai trò, Cập nhật
    sheet.getRange(2, 1, rows.length, 2).setHorizontalAlignment('center');
    sheet.getRange(2, 5, rows.length, 2).setHorizontalAlignment('center');
    sheet.getRange(2, 9, rows.length, 1).setHorizontalAlignment('center');
    // Đánh dấu nổi bật cột Mật khẩu để người quản trị dễ xem
    sheet.getRange(2, 5, rows.length, 1).setBackground('#fef9c3').setFontWeight('bold');
  }

  sheet.setColumnWidth(1, 50);  // STT
  sheet.setColumnWidth(2, 110); // Mã NV
  sheet.setColumnWidth(3, 200); // Họ và tên
  sheet.setColumnWidth(4, 180); // Tên đăng nhập
  sheet.setColumnWidth(5, 140); // Mật khẩu
  sheet.setColumnWidth(6, 140); // Vai trò
  sheet.setColumnWidth(7, 160); // Tổ công tác
  sheet.setColumnWidth(8, 180); // Chức danh
  sheet.setColumnWidth(9, 170); // Thời gian cập nhật
}

function updatePasswordInSheet(ss, empId, newPassword) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) return;
  var sheet = getOrCreateAccountsSheet(ss);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var values = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
  var targetId = String(empId || '').trim().toLowerCase();

  for (var i = 0; i < values.length; i++) {
    var rowEmpId = String(values[i][1]).trim().toLowerCase();   // Cột 2: Mã NV
    var rowName = String(values[i][2]).trim().toLowerCase();    // Cột 3: Họ tên
    var rowUsername = String(values[i][3]).trim().toLowerCase(); // Cột 4: Tên đăng nhập

    if (rowEmpId === targetId || rowUsername === targetId || rowName === targetId) {
      sheet.getRange(i + 2, 5).setValue(String(newPassword));    // Cột 5 là Mật khẩu
      sheet.getRange(i + 2, 5).setBackground('#bbf7d0');        // Màu xanh lá nhạt báo hiệu đã đổi mật khẩu
      sheet.getRange(i + 2, 9).setValue(nowStr);                 // Cột 9 là Thời gian cập nhật
      break;
    }
  }

  // Cập nhật bộ nhớ đệm ScriptProperties
  try {
    var props = PropertiesService.getScriptProperties();
    var savedPw = props.getProperty(PASSWORDS_PROP_KEY);
    var pwMap = savedPw ? JSON.parse(savedPw) : {};
    pwMap[empId] = String(newPassword);
    props.setProperty(PASSWORDS_PROP_KEY, JSON.stringify(pwMap));
  } catch (e) {}
}

function readPasswordsFromSheet(ss) {
  var pwMap = {};
  try {
    var sheet = ss.getSheetByName(ACCOUNTS_SHEET_NAME);
    if (!sheet) {
      sheet = getOrCreateAccountsSheet(ss);
    }
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      // Đọc cột Mã NV (2) đến Mật khẩu (5)
      var data = sheet.getRange(2, 2, lastRow - 1, 4).getValues();
      for (var i = 0; i < data.length; i++) {
        var empId = String(data[i][0]).trim();
        var pw = String(data[i][3]).trim();
        if (empId && pw) {
          pwMap[empId] = pw;
        }
      }
    }
  } catch (e) {
    console.warn('readPasswords error:', e);
  }

  // Kết hợp với bộ nhớ đệm nếu có
  try {
    var props = PropertiesService.getScriptProperties();
    var savedPw = props.getProperty(PASSWORDS_PROP_KEY);
    if (savedPw) {
      var cached = JSON.parse(savedPw);
      for (var k in cached) {
        if (!pwMap[k]) pwMap[k] = cached[k];
      }
    }
  } catch (e) {}

  return pwMap;
}

// ==============================================================================
// ĐỒNG BỘ HAI CHIỀU: ĐỌC DANH SÁCH CÔNG VIỆC TRỰC TIẾP TỪ GOOGLE SHEET
// ==============================================================================
function syncTasksFromSheet(ss, data) {
  var sheet = ss.getSheetByName(TASKS_SHEET_NAME);
  if (!sheet) return data;

  var lastRow = sheet.getLastRow();
  var existingTasks = (data && data.tasks && Array.isArray(data.tasks)) ? data.tasks : [];

  // BẢO VỆ: Nếu sheet chỉ có dòng tiêu đề hoặc tạm trống, KHÔNG xóa data.tasks nếu data đang có công việc
  if (lastRow < 2) {
    return data;
  }

  // Đọc đến cột 11 (bao gồm Cột K: Mã ID)
  var numCols = Math.max(sheet.getLastColumn(), 11);
  var values = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  var existingTaskMap = {};
  existingTasks.forEach(function(t) {
    if (t.id) existingTaskMap[t.id] = t;
    if (t.title) existingTaskMap[t.title.trim().toLowerCase()] = t;
  });

  var syncedTasks = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var stt = i + 1; // Luôn đảm bảo STT tuần tự 1..N từ trên xuống dưới
    var title = String(row[1] || '').trim();
    var detail = String(row[2] || '').trim();
    var category = normalizeCategory(row[3]); // Tự động chuẩn hóa nhóm La Mã sang 26 nhóm RACI
    var assigneeText = String(row[4] || '').trim();
    var followerText = String(row[5] || '').trim();
    var deadlineVal = row[6];
    var deadline = '';
    if (deadlineVal) {
      if (deadlineVal instanceof Date) {
        deadline = Utilities.formatDate(deadlineVal, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
      } else {
        deadline = String(deadlineVal).trim();
      }
    }
    var statusText = String(row[7] || '').trim();
    var priorityText = String(row[8] || '').trim();
    var rowId = (numCols >= 11 && row[10]) ? String(row[10]).trim() : '';

    if (!title) continue; // Bỏ qua dòng trống không có tên

    var matchKey = title.toLowerCase();
    var existing = (rowId && existingTaskMap[rowId]) || existingTaskMap[matchKey];

    var taskId = rowId || (existing ? existing.id : ('task_sheet_' + (i + 1) + '_' + Date.now()));
    var isCompleted = statusText.indexOf('Đã hoàn tất') !== -1 || statusText.indexOf('completed') !== -1 || statusText.indexOf('Xong') !== -1;
    var isUrgent = priorityText.indexOf('Khẩn') !== -1 || priorityText.indexOf('urgent') !== -1;
    var inStaging = (assigneeText === 'Chưa phân công' || !assigneeText);

    // Map tên nhân viên sang assignee_ids
    var assigneeIds = [];
    if (!inStaging && assigneeText) {
      DEFAULT_ACCOUNTS.forEach(function(acc) {
        if (assigneeText.toLowerCase().indexOf(acc.name.toLowerCase()) !== -1 || acc.name.toLowerCase().indexOf(assigneeText.toLowerCase()) !== -1) {
          if (assigneeIds.indexOf(acc.empId) === -1) assigneeIds.push(acc.empId);
        }
      });
      if (assigneeIds.length === 0 && existing && existing.assignee_ids) {
        assigneeIds = existing.assignee_ids;
      }
    }

    var followerIds = [];
    if (followerText) {
      DEFAULT_ACCOUNTS.forEach(function(acc) {
        if (followerText.toLowerCase().indexOf(acc.name.toLowerCase()) !== -1 || acc.name.toLowerCase().indexOf(followerText.toLowerCase()) !== -1) {
          if (followerIds.indexOf(acc.empId) === -1) followerIds.push(acc.empId);
        }
      });
      if (followerIds.length === 0 && existing && existing.follower_ids) {
        followerIds = existing.follower_ids;
      }
    }

    var taskObj = {
      id: taskId,
      stt: stt,
      title: title,
      detail: detail,
      category: category,
      category_id: existing ? existing.category_id : '',
      section: existing ? existing.section : '',
      assignee_ids: assigneeIds,
      assignee_text: inStaging ? '' : assigneeText,
      follower_ids: followerIds,
      follower_text: followerText,
      deadline: deadline,
      status: isCompleted ? 'completed' : 'in_progress',
      priority: isUrgent ? 'urgent' : 'normal',
      in_staging: inStaging,
      sub_assignments: (existing && existing.sub_assignments) ? existing.sub_assignments : {},
      created_by: (existing && existing.created_by) ? existing.created_by : (assigneeIds[0] || 'leader'),
      completed_at: isCompleted ? ((existing && existing.completed_at) ? existing.completed_at : new Date().toISOString()) : null
    };

    syncedTasks.push(taskObj);
  }

  if (!data) {
    data = {
      categories: [],
      employees: [],
      tasks: syncedTasks,
      lastModified: new Date().toISOString()
    };
  } else {
    data.tasks = syncedTasks;
    data.lastModified = new Date().toISOString();
  }

  try {
    PropertiesService.getScriptProperties().setProperty(STORAGE_PROP_KEY, JSON.stringify(data));
  } catch (e) {}

  return data;
}

// ==============================================================================
// TIỆN ÍCH TRẢ VỀ JSON / JSONP
// ==============================================================================
function createOutput(dataObj, e) {
  var jsonStr = JSON.stringify(dataObj);
  var callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonStr + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonStr).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==============================================================================
// HÀM CHẠY THỬ NGHIỆM TRÊN GOOGLE APPS SCRIPT
// ==============================================================================
function initSheetAndAccounts() {
  var ss = getSpreadsheet();
  if (!ss) {
    Logger.log('Không mở được Google Spreadsheet: ' + SHEET_ID);
    return;
  }
  var sheet = getOrCreateAccountsSheet(ss);
  Logger.log('✅ Đã tạo/kiểm tra xong tab "' + ACCOUNTS_SHEET_NAME + '" với ' + (sheet.getLastRow() - 1) + ' tài khoản!');
}

function syncNowFromSheet() {
  var ss = getSpreadsheet();
  if (!ss) {
    Logger.log('Không mở được Google Spreadsheet: ' + SHEET_ID);
    return;
  }
  var props = PropertiesService.getScriptProperties();
  var savedJson = props.getProperty(STORAGE_PROP_KEY);
  var data = savedJson ? JSON.parse(savedJson) : null;
  var synced = syncTasksFromSheet(ss, data);
  Logger.log('✅ Đã đồng bộ thành công! Hiện tại có ' + synced.tasks.length + ' công việc khớp từ Google Sheet.');
}
