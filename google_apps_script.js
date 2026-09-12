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
  { stt: 18, empId: "emp_012317", name: "Nguyễn Hồng Ngân", username: "nguyễn hồng ngân", password: "123", role: "Nhân viên", team: "Tổ CNTT", position: "Chuyên viên CNTT" }
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
// GET REQUEST: Trả về dữ liệu công việc và danh sách mật khẩu tài khoản
// ==============================================================================
function doGet(e) {
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
    // Giúp phản ánh chính xác số công việc thực tế trên Sheet (ví dụ khi người dùng xóa bớt trên Sheet)
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
  }
}

// ==============================================================================
// POST REQUEST: Nhận dữ liệu công việc hoặc cập nhật đổi mật khẩu
// ==============================================================================
function doPost(e) {
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

    // 2. Trường hợp đồng bộ toàn bộ dữ liệu bảng công việc
    if (!parsed || !parsed.tasks || !Array.isArray(parsed.tasks)) {
      return createOutput({ status: 'error', message: 'Dữ liệu công việc không hợp lệ' }, e);
    }

    parsed.lastModified = new Date().toISOString();
    var props = PropertiesService.getScriptProperties();
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
      message: 'Đã đồng bộ công việc và tài khoản thành công!',
      lastModified: parsed.lastModified
    }, e);
  } catch (error) {
    return createOutput({ status: 'error', message: error.toString() }, e);
  }
}

// ==============================================================================
// ĐỒNG BỘ TAB "PHÂN CÔNG TRỰC TUYẾN"
// ==============================================================================
function syncToSpreadsheet(data) {
  if (!data || !data.tasks) return;
  var ss = getSpreadsheet();
  if (!ss) return;

  var sheet = ss.getSheetByName(TASKS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(TASKS_SHEET_NAME);

  var headers = ['STT', 'Tên công việc', 'Nội dung chi tiết', 'Nhóm công tác', 'Phụ trách', 'Theo dõi', 'Thời hạn', 'Trạng thái', 'Ưu tiên', 'Cập nhật'];
  var rows = [];
  var lastMod = data.lastModified ? Utilities.formatDate(new Date(data.lastModified), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss") : Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

  data.tasks.forEach(function(t, idx) {
    rows.push([
      t.stt || (idx + 1),
      t.title || '',
      t.detail || '',
      t.category || '',
      t.in_staging ? 'Chưa phân công' : (t.assignee_text || ''),
      t.follower_text || '',
      t.deadline || '',
      t.status === 'completed' ? '✓ Đã hoàn tất' : '● Đang thực hiện',
      t.priority === 'urgent' ? '🔥 Khẩn cấp' : 'Bình thường',
      lastMod
    ]);
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
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(2, 1, rows.length, 1).setHorizontalAlignment('center');
    sheet.getRange(2, 7, rows.length, 4).setHorizontalAlignment('center');
  }

  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 380);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 130);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 160);
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
  }
  return sheet;
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

  // Nếu sheet chỉ có dòng tiêu đề (lastRow <= 1) hoặc trống: người dùng đã xóa hết việc trên Sheet
  if (lastRow < 2) {
    if (data) {
      data.tasks = [];
      data.lastModified = new Date().toISOString();
      try { PropertiesService.getScriptProperties().setProperty(STORAGE_PROP_KEY, JSON.stringify(data)); } catch (e) {}
    }
    return data;
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  var existingTaskMap = {};
  existingTasks.forEach(function(t) {
    if (t.id) existingTaskMap[t.id] = t;
    if (t.title) existingTaskMap[t.title.trim().toLowerCase()] = t;
  });

  var syncedTasks = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var stt = String(row[0] || (i + 1)).trim();
    var title = String(row[1] || '').trim();
    var detail = String(row[2] || '').trim();
    var category = String(row[3] || '').trim();
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

    if (!title) continue; // Bỏ qua dòng trống không có tên

    var matchKey = title.toLowerCase();
    var existing = existingTaskMap[matchKey];

    var taskId = existing ? existing.id : ('task_sheet_' + (i + 1) + '_' + Date.now());
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
    }

    var taskObj = {
      id: taskId,
      stt: stt,
      title: title,
      detail: detail,
      category: category,
      category_id: existing ? existing.category_id : 'cat_cntt',
      section: existing ? existing.section : 'B. Công tác Tổ CNTT',
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
