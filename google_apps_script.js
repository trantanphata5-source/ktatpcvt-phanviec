/**
 * GOOGLE APPS SCRIPT - ĐỒNG BỘ CÔNG VIỆC PHÒNG KỸ THUẬT VÀ AN TOÀN (PC VT)
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1l8QqyhTdX9ci-s5qwzy-sLhAXfO7yDfhwbZhqQJohK0/edit
 * 
 * ==============================================================================
 * HƯỚNG DẪN TRIỂN KHAI:
 * ==============================================================================
 * 1. Mở Google Sheet trên → Tiện ích mở rộng → Apps Script
 * 2. Xóa nội dung Code.gs, dán toàn bộ mã này vào, Ctrl+S
 * 3. Bấm "Triển khai" → "Triển khai mới":
 *    - Loại: Ứng dụng web (Web app)
 *    - Thực thi: Tôi (Me)
 *    - Quyền truy cập: Bất kỳ ai (Anyone)
 * 4. Cấp quyền → Sao chép URL /exec
 * 5. Dán URL vào nút ☁️ Đồng bộ trên web KTAT
 * ==============================================================================
 */

const STORAGE_PROP_KEY = 'KTAT_BOARD_DATA';
const SHEET_ID = '1l8QqyhTdX9ci-s5qwzy-sLhAXfO7yDfhwbZhqQJohK0';

function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var savedJson = props.getProperty(STORAGE_PROP_KEY);
    var data = savedJson ? JSON.parse(savedJson) : null;
    var response = {
      status: 'success',
      hasData: !!data,
      data: data,
      timestamp: data ? data.lastModified : new Date().toISOString()
    };
    return createOutput(response, e);
  } catch (error) {
    return createOutput({ status: 'error', message: error.toString() }, e);
  }
}

function doPost(e) {
  try {
    var payloadStr = '';
    if (e && e.postData && e.postData.contents) {
      payloadStr = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      payloadStr = e.parameter.data;
    }
    if (!payloadStr) {
      return createOutput({ status: 'error', message: 'Không có dữ liệu' }, e);
    }
    var parsed = JSON.parse(payloadStr);
    if (!parsed || !parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return createOutput({ status: 'error', message: 'Dữ liệu không hợp lệ' }, e);
    }
    parsed.lastModified = new Date().toISOString();
    var props = PropertiesService.getScriptProperties();
    props.setProperty(STORAGE_PROP_KEY, JSON.stringify(parsed));
    try { syncToSpreadsheet(parsed); } catch (sheetErr) { console.warn('Sheet sync error:', sheetErr); }
    return createOutput({
      status: 'success',
      message: 'Đã đồng bộ thành công!',
      lastModified: parsed.lastModified
    }, e);
  } catch (error) {
    return createOutput({ status: 'error', message: error.toString() }, e);
  }
}

function syncToSpreadsheet(data) {
  if (!data || !data.tasks) return;
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch(e) { ss = null; }
  if (!ss) {
    try { ss = SpreadsheetApp.openById(SHEET_ID); } catch(e) { return; }
  }
  var TARGET = 'Phân công trực tuyến';
  var sheet = ss.getSheetByName(TARGET);
  if (!sheet) sheet = ss.insertSheet(TARGET);

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

function createOutput(dataObj, e) {
  var jsonStr = JSON.stringify(dataObj);
  var callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonStr + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonStr).setMimeType(ContentService.MimeType.JSON);
  }
}

function testSync() {
  var props = PropertiesService.getScriptProperties();
  var saved = props.getProperty(STORAGE_PROP_KEY);
  if (saved) {
    syncToSpreadsheet(JSON.parse(saved));
    Logger.log('OK - ' + JSON.parse(saved).tasks.length + ' tasks');
  } else {
    Logger.log('No data');
  }
}
