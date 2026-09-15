/**
 * PHÒNG KỸ THUẬT VÀ AN TOÀN - PC VŨNG TÀU
 * HỆ THỐNG QUẢN LÝ & PHÂN CÔNG CÔNG VIỆC
 * Application Logic (Auth + Kanban + Employee Self-input)
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'PCVT_KTAT_TASKS_DATA_V1';
  const SYNC_URL_KEY = 'PCVT_KTAT_SYNC_URL';
  const SESSION_KEY = 'KTAT_USER_SESSION';
  const DEFAULT_CLOUD_API = 'https://script.google.com/macros/s/AKfycbwBk3G9iV75PzxgWYEz5mZyFVqbWFwqUjdTSYOOtEN8x4SazmeR7EJCZmxPdmSETs-Y4w/exec';

  // =========================================================================
  // AUTH & SESSION
  // =========================================================================
  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }

  const currentSession = getSession();
  if (!currentSession || !currentSession.empId) {
    window.location.href = 'index.html';
    // stop execution
    return;
  }

  const isLeader = currentSession.role === 'leader';
  const currentEmpId = currentSession.empId;

  // =========================================================================
  // GLOBAL STATE
  // =========================================================================
  const state = {
    categories: [],
    employees: [],
    tasks: [],
    activeView: isLeader ? 'staff' : 'personal',
    searchQuery: '',
    draggedTaskId: null,
    editingTaskId: null,
    cloudApiUrl: DEFAULT_CLOUD_API,
    syncStatus: 'synced',
    lastSavedAt: null,
    syncDebounceTimer: null,
    hasUnsavedLocalChanges: false,
    initialCloudSyncDone: false,
    // Weekly report state
    reportWeekOffset: 0,
    reportMode: 'week', // 'week' or 'all'
    reportTeamFilter: 'ALL',
    reportStaffSearch: '',
    reportExpandedStaff: {},
    // Preserved form state for personal view self-input
    _savedFormState: null,
    // Category view state
    categoryGroupFilter: 'ALL',
    expandedCategories: {}
  };

  // Check if user is actively editing a form field (typing in input/textarea/select)
  function isUserEditingForm() {
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tag = activeEl.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (activeEl.isContentEditable) return true;
    return false;
  }

  // Save personal view self-input form values before render destroys them
  function savePersonalFormState() {
    const titleEl = document.getElementById('selfTaskTitle');
    const detailEl = document.getElementById('selfTaskDetail');
    const catEl = document.getElementById('selfTaskCategory');
    const deadlineEl = document.getElementById('selfTaskDeadline');
    if (!titleEl) return null;
    return {
      title: titleEl.value || '',
      detail: detailEl ? detailEl.value || '' : '',
      category: catEl ? catEl.value || '' : '',
      deadline: deadlineEl ? deadlineEl.value || '' : '',
      focusedId: document.activeElement ? document.activeElement.id : null,
      selectionStart: document.activeElement ? document.activeElement.selectionStart : null,
      selectionEnd: document.activeElement ? document.activeElement.selectionEnd : null
    };
  }

  // Restore personal view self-input form values after render rebuilt DOM
  function restorePersonalFormState(saved) {
    if (!saved) return;
    const titleEl = document.getElementById('selfTaskTitle');
    const detailEl = document.getElementById('selfTaskDetail');
    const catEl = document.getElementById('selfTaskCategory');
    const deadlineEl = document.getElementById('selfTaskDeadline');
    if (titleEl && saved.title) titleEl.value = saved.title;
    if (detailEl && saved.detail) detailEl.value = saved.detail;
    if (catEl && saved.category) {
      // Only restore if the option still exists
      const opt = Array.from(catEl.options).find(o => o.value === saved.category);
      if (opt) catEl.value = saved.category;
    }
    if (deadlineEl && saved.deadline) deadlineEl.value = saved.deadline;
    // Restore focus and cursor position
    if (saved.focusedId) {
      const focusEl = document.getElementById(saved.focusedId);
      if (focusEl) {
        focusEl.focus();
        if (typeof saved.selectionStart === 'number' && focusEl.setSelectionRange) {
          try { focusEl.setSelectionRange(saved.selectionStart, saved.selectionEnd); } catch(e) {}
        }
      }
    }
  }

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================
  const el = {
    mainContent: document.getElementById('mainContent'),
    stagingSidebar: document.getElementById('stagingSidebar'),
    stagingDropzone: document.getElementById('stagingDropzone'),
    stagingCounter: document.getElementById('stagingCounter'),
    toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    searchBoxWrap: document.getElementById('searchBoxWrap'),
    tabPersonal: document.getElementById('tabPersonal'),
    tabStaff: document.getElementById('tabStaff'),
    tabCategory: document.getElementById('tabCategory'),
    tabDashboard: document.getElementById('tabDashboard'),
    tabReport: document.getElementById('tabReport'),
    tabTechStats: document.getElementById('tabTechStats'),
    headerNav: document.getElementById('headerNav'),
    viewTabs: document.getElementById('viewTabs'),
    quickTotal: document.getElementById('quickTotal'),
    quickAssigned: document.getElementById('quickAssigned'),
    quickCompleted: document.getElementById('quickCompleted'),
    quickPending: document.getElementById('quickPending'),
    saveBtn: document.getElementById('saveBtn'),
    exportBtn: document.getElementById('exportBtn'),
    resetBtn: document.getElementById('resetBtn'),
    createTaskBtn: document.getElementById('createTaskBtn'),
    sidebarCreateBtn: document.getElementById('sidebarCreateBtn'),
    syncConfigBtn: document.getElementById('syncConfigBtn'),
    syncStatusDot: document.getElementById('syncStatusDot'),
    syncStatusLabel: document.getElementById('syncStatusLabel'),
    syncModal: document.getElementById('syncModal'),
    syncModalClose: document.getElementById('syncModalClose'),
    syncStatusCard: document.getElementById('syncStatusCard'),
    syncStatusIcon: document.getElementById('syncStatusIcon'),
    syncStatusTitle: document.getElementById('syncStatusTitle'),
    syncStatusDesc: document.getElementById('syncStatusDesc'),
    syncLastTime: document.getElementById('syncLastTime'),
    fieldSyncUrl: document.getElementById('fieldSyncUrl'),
    btnSyncNow: document.getElementById('btnSyncNow'),
    btnSaveSyncConfig: document.getElementById('btnSaveSyncConfig'),
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskForm: document.getElementById('taskForm'),
    taskModalClose: document.getElementById('taskModalClose'),
    taskModalCancel: document.getElementById('taskModalCancel'),
    deleteTaskBtn: document.getElementById('deleteTaskBtn'),
    fieldTaskId: document.getElementById('fieldTaskId'),
    fieldTitle: document.getElementById('fieldTitle'),
    fieldDetail: document.getElementById('fieldDetail'),
    fieldCategory: document.getElementById('fieldCategory'),
    fieldAssignee: document.getElementById('fieldAssignee'),
    fieldFollower: document.getElementById('fieldFollower'),
    fieldDeadline: document.getElementById('fieldDeadline'),
    fieldStatus: document.getElementById('fieldStatus'),
    fieldPriority: document.getElementById('fieldPriority'),
    toastContainer: document.getElementById('toastContainer'),
    userNameLabel: document.getElementById('userNameLabel'),
    userRoleLabel: document.getElementById('userRoleLabel'),
    userAvatarSlot: document.getElementById('userAvatarSlot'),
    logoutBtn: document.getElementById('logoutBtn'),
    changePasswordBtn: document.getElementById('changePasswordBtn'),
    passwordModal: document.getElementById('passwordModal'),
    passwordModalClose: document.getElementById('passwordModalClose'),
    passwordModalCancel: document.getElementById('passwordModalCancel'),
    passwordForm: document.getElementById('passwordForm'),
    passwordError: document.getElementById('passwordError')
  };

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function init() {
    state.cloudApiUrl = localStorage.getItem(SYNC_URL_KEY) || DEFAULT_CLOUD_API;

    loadData();
    setupUI();
    setupEventListeners();
    if (isLeader) populateFormSelects();
    render();
    updateQuickStats();
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    if (state.cloudApiUrl) {
      updateSyncUI('syncing', 'Đang kết nối...');
      pullFromCloud(false);
      setInterval(() => {
        if (state.cloudApiUrl && !document.hidden && !state.hasUnsavedLocalChanges && !state.draggedTaskId && !state.editingTaskId && !isUserEditingForm()) {
          pullFromCloud(false);
        }
      }, 15000);
    }
  }

  function setupUI() {
    // Set user info in header
    const emp = state.employees.find(e => e.id === currentEmpId);
    if (emp) {
      el.userNameLabel.textContent = emp.name;
      el.userRoleLabel.textContent = isLeader ? '🔑 ' + emp.position : emp.position;
      const photoUrl = emp.photo;
      if (photoUrl) {
        el.userAvatarSlot.innerHTML = `<img class="user-avatar-small" src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="user-avatar-fallback-small" style="display:none;">${getInitials(emp.name)}</div>`;
      } else {
        el.userAvatarSlot.innerHTML = `<div class="user-avatar-fallback-small">${getInitials(emp.name)}</div>`;
      }
    }

    if (isLeader) {
      // Show leader-only UI
      el.createTaskBtn.style.display = '';
      el.saveBtn.style.display = '';
      el.exportBtn.style.display = '';
      el.resetBtn.style.display = '';
      el.toggleSidebarBtn.style.display = '';
      el.stagingSidebar.classList.remove('collapsed');
      if (el.tabPersonal) el.tabPersonal.style.display = 'none';
      if (el.tabStaff) el.tabStaff.style.display = '';
      if (el.tabCategory) el.tabCategory.style.display = '';
      if (el.tabDashboard) el.tabDashboard.style.display = '';
      if (el.tabReport) el.tabReport.style.display = '';
      if (el.tabTechStats) el.tabTechStats.style.display = '';
      if (el.headerNav) el.headerNav.style.display = '';
    } else {
      // Staff: show headerNav with personal tab, report tab, and tech stats tab!
      if (el.headerNav) el.headerNav.style.display = '';
      if (el.tabPersonal) el.tabPersonal.style.display = '';
      if (el.tabStaff) el.tabStaff.style.display = 'none';
      if (el.tabCategory) el.tabCategory.style.display = 'none';
      if (el.tabDashboard) el.tabDashboard.style.display = 'none';
      if (el.tabReport) el.tabReport.style.display = '';
      if (el.tabTechStats) el.tabTechStats.style.display = '';
      el.stagingSidebar.classList.add('collapsed');
      el.toggleSidebarBtn.style.display = 'none';
      el.searchBoxWrap.style.display = 'none';
      const quickPendingPill = document.getElementById('quickPending')?.closest('.stat-pill');
      if (quickPendingPill) quickPendingPill.style.display = 'none';
    }
  }

  function updateHeaderHeight() {
    const header = document.querySelector('.app-header');
    if (header) {
      const h = header.getBoundingClientRect().height;
      if (h > 0) document.documentElement.style.setProperty('--header-height', `${Math.round(h)}px`);
    }
  }

  // =========================================================================
  // DATA PERSISTENCE
  // =========================================================================
  function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.categories = parsed.categories || window.INITIAL_APP_DATA.categories;
        // Đảm bảo categories mới trong INITIAL_APP_DATA luôn được cập nhật
        if (window.INITIAL_APP_DATA && window.INITIAL_APP_DATA.categories) {
          const initCats = window.INITIAL_APP_DATA.categories;
          // Nếu số lượng categories trong code mới khác cache cũ → dùng bản mới
          if (initCats.length !== state.categories.length || 
              initCats.some(ic => !state.categories.find(sc => sc.id === ic.id))) {
            state.categories = JSON.parse(JSON.stringify(initCats));
          } else {
            // Merge follower_ids, section_code từ INITIAL_APP_DATA vào cached data
            const catMap = {};
            state.categories.forEach(c => { catMap[c.id] = c; });
            initCats.forEach(ic => {
              if (catMap[ic.id]) {
                if (ic.follower_ids) catMap[ic.id].follower_ids = ic.follower_ids;
                if (ic.follower_text) catMap[ic.id].follower_text = ic.follower_text;
                if (ic.section_code) catMap[ic.id].section_code = ic.section_code;
              }
            });
          }
        }
        state.employees = parsed.employees || window.INITIAL_APP_DATA.employees;
        // Đảm bảo nhân sự mới trong INITIAL_APP_DATA (như 3 nhân sự tăng cường) luôn được bổ sung
        if (window.INITIAL_APP_DATA && window.INITIAL_APP_DATA.employees) {
          const empMap = {};
          state.employees.forEach(e => { empMap[e.id] = e; });
          window.INITIAL_APP_DATA.employees.forEach(e => {
            if (!empMap[e.id]) {
              state.employees.push(e);
            } else {
              if (e.is_reinforced) {
                empMap[e.id].is_reinforced = e.is_reinforced;
                empMap[e.id].reinforce_note = e.reinforce_note;
                empMap[e.id].position = e.position;
              }
              if (!empMap[e.id].photo && e.photo) empMap[e.id].photo = e.photo;
            }
          });
        }
        state.tasks = parsed.tasks || window.INITIAL_APP_DATA.tasks;
        state.lastSavedAt = parsed.savedAt || 0;
        state.hasUnsavedLocalChanges = false;
        return;
      } catch(e) { console.error('Parse error:', e); }
    }
    if (window.INITIAL_APP_DATA) {
      state.categories = JSON.parse(JSON.stringify(window.INITIAL_APP_DATA.categories));
      state.employees = JSON.parse(JSON.stringify(window.INITIAL_APP_DATA.employees));
      state.tasks = JSON.parse(JSON.stringify(window.INITIAL_APP_DATA.tasks));
      state.tasks.forEach(t => { if (t.deadline) t.deadline = formatFullDate(t.deadline); });
      state.lastSavedAt = 0;
      state.hasUnsavedLocalChanges = false;
    }
  }

  function saveData(showToast = true, skipCloud = false) {
    const timestamp = new Date().toISOString();
    state.lastSavedAt = timestamp;
    const payload = {
      categories: state.categories,
      employees: state.employees,
      tasks: state.tasks,
      customPasswords: getCustomPasswords(),
      savedAt: timestamp,
      lastModified: timestamp
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (showToast) notify('success', 'Đã lưu dữ liệu!');
    if (state.cloudApiUrl && !skipCloud) {
      state.hasUnsavedLocalChanges = true;
      updateSyncUI('syncing', 'Đang lưu máy chủ...');
      clearTimeout(state.syncDebounceTimer);
      state.syncDebounceTimer = setTimeout(() => pushToCloud(payload), 400);
    }
  }

  // =========================================================================
  // CLOUD SYNC
  // =========================================================================
  function pushToCloud(payload) {
    if (!state.cloudApiUrl) return;
    const payloadStr = JSON.stringify(payload);
    fetch(state.cloudApiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: payloadStr })
      .then(() => { state.hasUnsavedLocalChanges = false; updateSyncUI('synced', 'Đã đồng bộ máy chủ'); })
      .catch(() => {
        fetch(state.cloudApiUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: payloadStr })
          .then(() => { state.hasUnsavedLocalChanges = false; updateSyncUI('synced', 'Đã đồng bộ'); })
          .catch(() => updateSyncUI('local', 'Đã lưu máy'));
      });
  }

  let jsonpCounter = 0;
  function pullFromCloud(manual) {
    if (!state.cloudApiUrl) { if (manual) notify('info', 'Chưa cấu hình máy chủ'); return; }
    if (manual) updateSyncUI('syncing', 'Đang tải...');
    fetch(`${state.cloudApiUrl}?_t=${Date.now()}`).then(r => r.json()).then(res => handleCloudResponse(res, manual))
      .catch(() => pullViaJsonp(manual));
  }

  function pullViaJsonp(manual) {
    const cb = 'ktat_cb_' + (++jsonpCounter) + '_' + Date.now();
    const s = document.createElement('script');
    const sep = state.cloudApiUrl.includes('?') ? '&' : '?';
    s.src = `${state.cloudApiUrl}${sep}callback=${cb}&_t=${Date.now()}`;
    let to = setTimeout(() => { cleanup(); if (manual) updateSyncUI('synced'); }, 12000);
    function cleanup() { clearTimeout(to); delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s); }
    window[cb] = function(res) { cleanup(); handleCloudResponse(res, manual); };
    s.onerror = function() { cleanup(); if (manual) notify('error', 'Lỗi kết nối'); };
    document.head.appendChild(s);
  }

  function handleCloudResponse(response, manual) {
    // Sync passwords from Google Sheet
    if (response && response.customPasswords && typeof response.customPasswords === 'object') {
      try {
        const localPw = getCustomPasswords();
        const merged = Object.assign({}, localPw, response.customPasswords);
        localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(merged));
      } catch(e) {}
    }

    if (!response || response.status !== 'success' || !response.hasData || !response.data) {
      state.initialCloudSyncDone = true;
      if (manual) notify('info', 'Dữ liệu máy đã mới nhất');
      updateSyncUI('synced'); return;
    }
    const rd = response.data;
    if (!rd.tasks || !Array.isArray(rd.tasks)) { state.initialCloudSyncDone = true; return; }
    
    // So khớp thời gian và số lượng công việc: nếu dữ liệu remote mới hơn hoặc số công việc khác biệt (ví dụ người dùng xóa bớt trên Sheet)
    const remoteTime = new Date(rd.lastModified || rd.savedAt || 0).getTime();
    const localTime = state.lastSavedAt ? new Date(state.lastSavedAt).getTime() : 0;
    const shouldApply = manual || !state.initialCloudSyncDone || !state.lastSavedAt || state.lastSavedAt === 0 || 
                        (remoteTime > localTime && !state.hasUnsavedLocalChanges) || 
                        (rd.tasks.length !== state.tasks.length && !state.hasUnsavedLocalChanges);
    
    state.initialCloudSyncDone = true;
    if (shouldApply) {
      // Save personal form state before render destroys it
      const formState = (state.activeView === 'personal') ? savePersonalFormState() : null;

      state.tasks = rd.tasks;
      if (rd.categories && Array.isArray(rd.categories) && rd.categories.length > 0) state.categories = rd.categories;
      if (rd.employees && Array.isArray(rd.employees) && rd.employees.length > 0) {
        state.employees = rd.employees;
        if (window.INITIAL_APP_DATA && window.INITIAL_APP_DATA.employees) {
          const empMap = {};
          state.employees.forEach(e => { empMap[e.id] = e; });
          window.INITIAL_APP_DATA.employees.forEach(e => {
            if (!empMap[e.id]) {
              state.employees.push(e);
            } else if (e.is_reinforced) {
              empMap[e.id].is_reinforced = e.is_reinforced;
              empMap[e.id].reinforce_note = e.reinforce_note;
              empMap[e.id].position = e.position;
            }
          });
        }
      }
      state.lastSavedAt = rd.lastModified || rd.savedAt || new Date().toISOString();
      state.hasUnsavedLocalChanges = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: state.categories, employees: state.employees, tasks: state.tasks, savedAt: state.lastSavedAt }));
      render(); updateQuickStats(); updateSyncUI('synced');

      // Restore personal form state after render rebuilt DOM
      if (formState) restorePersonalFormState(formState);

      if (manual) notify('success', 'Đã cập nhật từ Google Sheet!');
    } else { updateSyncUI('synced'); }
  }

  function updateSyncUI(status, label) {
    state.syncStatus = status;
    const dot = el.syncStatusDot, lbl = el.syncStatusLabel;
    if (!dot || !lbl) return;
    dot.className = 'sync-status-dot';
    if (status === 'synced') { dot.classList.add('dot-synced'); lbl.textContent = label || 'Đã đồng bộ'; }
    else if (status === 'syncing') { dot.classList.add('dot-syncing'); lbl.textContent = label || 'Đang đồng bộ...'; }
    else if (status === 'local') { dot.classList.add('dot-local'); lbl.textContent = label || 'Lưu cục bộ'; }
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================
  function setupEventListeners() {
    // Logout
    el.logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'index.html';
    });

    // Change Password
    el.changePasswordBtn.addEventListener('click', () => {
      el.passwordModal.classList.add('active');
      el.passwordError.style.display = 'none';
      el.passwordForm.reset();
    });
    el.passwordModalClose.addEventListener('click', () => el.passwordModal.classList.remove('active'));
    el.passwordModalCancel.addEventListener('click', () => el.passwordModal.classList.remove('active'));
    el.passwordModal.addEventListener('click', (e) => { if (e.target === el.passwordModal) el.passwordModal.classList.remove('active'); });
    el.passwordForm.addEventListener('submit', handleChangePassword);

    // Search
    el.searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      el.searchClear.style.display = state.searchQuery ? 'block' : 'none';
      render();
    });
    el.searchClear.addEventListener('click', () => {
      el.searchInput.value = ''; state.searchQuery = ''; el.searchClear.style.display = 'none'; render();
    });

    // Navigation Tabs (leader & staff)
    if (el.tabPersonal) el.tabPersonal.addEventListener('click', () => switchView('personal'));
    if (el.tabStaff) el.tabStaff.addEventListener('click', () => switchView('staff'));
    if (el.tabCategory) el.tabCategory.addEventListener('click', () => switchView('category'));
    if (el.tabDashboard) el.tabDashboard.addEventListener('click', () => switchView('dashboard'));
    if (el.tabReport) el.tabReport.addEventListener('click', () => switchView('report'));

    if (isLeader) {
      el.toggleSidebarBtn.addEventListener('click', () => el.stagingSidebar.classList.toggle('collapsed'));
      el.saveBtn.addEventListener('click', () => saveData(true));
      el.resetBtn.addEventListener('click', resetToDefault);
      el.exportBtn.addEventListener('click', exportToCSV);
      el.createTaskBtn.addEventListener('click', () => openTaskModal());
      el.sidebarCreateBtn.addEventListener('click', () => openTaskModal(null, true));
      el.taskModalClose.addEventListener('click', closeTaskModal);
      el.taskModalCancel.addEventListener('click', closeTaskModal);
      el.taskForm.addEventListener('submit', handleTaskFormSubmit);
      el.deleteTaskBtn.addEventListener('click', handleDeleteTask);
      setupDropzone(el.stagingDropzone, taskId => moveToStaging(taskId));
    }

    // Sync modal
    el.syncConfigBtn.addEventListener('click', openSyncModal);
    el.syncModalClose.addEventListener('click', closeSyncModal);
    el.syncModal.addEventListener('click', e => { if (e.target === el.syncModal) closeSyncModal(); });
    el.btnSyncNow.addEventListener('click', () => pullFromCloud(true));
    el.btnSaveSyncConfig.addEventListener('click', () => {
      const url = (el.fieldSyncUrl ? el.fieldSyncUrl.value.trim() : '') || DEFAULT_CLOUD_API;
      state.cloudApiUrl = url;
      localStorage.setItem(SYNC_URL_KEY, url);
      notify('success', 'Đã lưu cấu hình!');
      if (url) saveData(false);
      closeSyncModal();
    });

    // Cross-tab sync
    window.addEventListener('storage', e => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const p = JSON.parse(e.newValue);
          if (p.tasks) state.tasks = p.tasks;
          if (p.categories) state.categories = p.categories;
          if (p.employees) state.employees = p.employees;
          state.lastSavedAt = p.savedAt || new Date().toISOString();
          const formState = (state.activeView === 'personal') ? savePersonalFormState() : null;
          render(); updateQuickStats();
          if (formState) restorePersonalFormState(formState);
        } catch(err) {}
      }
    });

    window.addEventListener('focus', () => { if (state.cloudApiUrl && !isUserEditingForm()) pullFromCloud(false); });
  }

  // =========================================================================
  // CHANGE PASSWORD
  // =========================================================================
  const CUSTOM_PASSWORDS_KEY = 'KTAT_CUSTOM_PASSWORDS';

  function getCustomPasswords() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PASSWORDS_KEY) || '{}'); } catch(e) { return {}; }
  }

  function handleChangePassword(e) {
    e.preventDefault();
    const currentPw = document.getElementById('currentPassword').value;
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;
    const errorBox = el.passwordError;

    // Get current valid password for this user
    const customPasswords = getCustomPasswords();
    const defaultAccount = window.KTAT_AUTH_DATA.accounts.find(a => a.empId === currentSession.empId);
    const validPassword = customPasswords[currentSession.empId] || (defaultAccount ? defaultAccount.password : '');

    if (currentPw !== validPassword) {
      errorBox.textContent = '⚠️ Mật khẩu hiện tại không đúng!';
      errorBox.style.display = 'block';
      return;
    }

    if (newPw.length < 4) {
      errorBox.textContent = '⚠️ Mật khẩu mới phải có tối thiểu 4 ký tự!';
      errorBox.style.display = 'block';
      return;
    }

    if (newPw !== confirmPw) {
      errorBox.textContent = '⚠️ Mật khẩu xác nhận không khớp!';
      errorBox.style.display = 'block';
      return;
    }

    if (newPw === currentPw) {
      errorBox.textContent = '⚠️ Mật khẩu mới phải khác mật khẩu hiện tại!';
      errorBox.style.display = 'block';
      return;
    }

    // Save new password locally
    customPasswords[currentSession.empId] = newPw;
    localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(customPasswords));

    // Push new password directly to Google Sheet tab "Tài khoản"
    if (state.cloudApiUrl) {
      const pwPayload = JSON.stringify({
        action: 'change_password',
        empId: currentSession.empId,
        username: currentSession.username,
        newPassword: newPw,
        timestamp: new Date().toISOString()
      });
      // 1. POST request
      fetch(state.cloudApiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: pwPayload })
        .catch(() => {
          fetch(state.cloudApiUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: pwPayload }).catch(() => {});
        });
      // 2. GET Beacon để hoàn toàn không bị CORS và gọi thực thi ngay lập tức trên Apps Script
      try {
        const sep = state.cloudApiUrl.includes('?') ? '&' : '?';
        const beaconUrl = `${state.cloudApiUrl}${sep}action=change_password&empId=${encodeURIComponent(currentSession.empId)}&username=${encodeURIComponent(currentSession.username || '')}&newPassword=${encodeURIComponent(newPw)}&_t=${Date.now()}`;
        const img = new Image();
        img.src = beaconUrl;
      } catch(e) {}
    }

    el.passwordModal.classList.remove('active');
    el.passwordForm.reset();
    notify('success', '🔒 Đã đổi mật khẩu & đồng bộ lên Google Sheet!');
  }

  function switchView(viewName) {
    state.activeView = viewName;
    if (el.tabPersonal) el.tabPersonal.classList.toggle('active', viewName === 'personal');
    if (el.tabStaff) el.tabStaff.classList.toggle('active', viewName === 'staff');
    if (el.tabCategory) el.tabCategory.classList.toggle('active', viewName === 'category');
    if (el.tabDashboard) el.tabDashboard.classList.toggle('active', viewName === 'dashboard');
    if (el.tabReport) el.tabReport.classList.toggle('active', viewName === 'report');
    render();
    updateHeaderHeight();
  }

  function resetToDefault() {
    if (confirm('Khôi phục toàn bộ dữ liệu về mặc định?')) {
      localStorage.removeItem(STORAGE_KEY);
      loadData(); render(); updateQuickStats(); saveData(false);
      notify('info', 'Đã khôi phục dữ liệu gốc!');
    }
  }

  // =========================================================================
  // TOAST
  // =========================================================================
  function notify(type, msg) {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span><strong>${type === 'success' ? '✓' : 'ℹ'}</strong> ${msg}</span>`;
    el.toastContainer.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
  }

  // =========================================================================
  // DRAG AND DROP
  // =========================================================================
  function makeTaskCardDraggable(card, task) {
    if (!isLeader) { card.classList.add('no-drag'); return; }
    card.setAttribute('draggable', 'true');
    card.dataset.taskId = task.id;
    card.addEventListener('dragstart', e => {
      state.draggedTaskId = task.id; card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); state.draggedTaskId = null;
      document.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over'));
    });
    card.addEventListener('click', e => { if (e.target.closest('.no-click-modal')) return; openTaskModal(task.id); });
  }

  function setupDropzone(dz, onDrop) {
    dz.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', e => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('drag-over'); });
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); const id = e.dataTransfer.getData('text/plain') || state.draggedTaskId; if (id) onDrop(id); });
  }

  function assignTaskToEmployee(taskId, empId) {
    const task = state.tasks.find(t => t.id === taskId);
    const emp = state.employees.find(e => e.id === empId);
    if (!task || !emp) return;
    task.in_staging = false; task.assignee_ids = [empId]; task.assignee_text = emp.name;
    saveData(false); render(); updateQuickStats();
    notify('success', `Đã phân công cho <strong>${emp.name}</strong>`);
  }

  function assignTaskToCategory(taskId, catId) {
    const task = state.tasks.find(t => t.id === taskId);
    const cat = state.categories.find(c => c.id === catId);
    if (!task || !cat) return;
    task.category_id = catId; task.category = cat.title;
    saveData(false); render(); updateQuickStats();
  }

  function moveToStaging(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.in_staging = true; task.assignee_ids = []; task.assignee_text = 'Chưa phân công';
    saveData(false); render(); updateQuickStats();
    notify('info', 'Đã chuyển vào Danh sách chờ');
  }

  // =========================================================================
  // RENDER CONTROLLER
  // =========================================================================
  function render() {
    if (isLeader) renderStagingSidebar();
    if (state.activeView === 'staff') renderStaffView();
    else if (state.activeView === 'category') renderCategoryView();
    else if (state.activeView === 'dashboard') renderDashboardView();
    else if (state.activeView === 'personal') renderPersonalView();
    else if (state.activeView === 'report') renderReportView();
  }

  function updateQuickStats() {
    if (!isLeader) {
      const myTasks = state.tasks.filter(t => !t.in_staging && t.assignee_ids && t.assignee_ids.includes(currentEmpId));
      const completed = myTasks.filter(t => t.status === 'completed').length;
      const inProgress = myTasks.filter(t => t.status !== 'completed').length;
      if (el.quickTotal) el.quickTotal.textContent = myTasks.length;
      if (el.quickAssigned) el.quickAssigned.textContent = inProgress;
      if (el.quickCompleted) el.quickCompleted.textContent = completed;
      if (el.quickPending) el.quickPending.textContent = 0;
    } else {
      const total = state.tasks.length;
      const completed = state.tasks.filter(t => t.status === 'completed').length;
      const pending = state.tasks.filter(t => t.in_staging || !t.assignee_ids || t.assignee_ids.length === 0).length;
      if (el.quickTotal) el.quickTotal.textContent = total;
      if (el.quickAssigned) el.quickAssigned.textContent = total - pending;
      if (el.quickCompleted) el.quickCompleted.textContent = completed;
      if (el.quickPending) el.quickPending.textContent = pending;
    }
  }

  // =========================================================================
  // STAGING SIDEBAR
  // =========================================================================
  function renderStagingSidebar() {
    el.stagingDropzone.innerHTML = '';
    const stagingTasks = state.tasks.filter(t => t.in_staging || !t.assignee_ids || t.assignee_ids.length === 0);
    el.stagingCounter.textContent = stagingTasks.length;
    if (stagingTasks.length === 0) {
      el.stagingDropzone.innerHTML = `<div class="staging-placeholder"><div class="staging-placeholder-icon">📥</div><strong>Kéo công việc vào đây</strong><br>hoặc nhấn "+" để thêm mới.</div>`;
      return;
    }
    stagingTasks.forEach(task => el.stagingDropzone.appendChild(createTaskCard(task, { showAssignees: false })));
  }

  // =========================================================================
  // STAFF VIEW (LEADER)
  // =========================================================================
  function renderStaffView() {
    el.mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'staff-view-container';
    const teams = [
      { id: 'BLĐ', name: 'Ban Lãnh đạo Phòng', icon: '🏛️', cls: 'team-bld' },
      { id: 'TKT', name: 'Tổ Kỹ thuật', icon: '⚡', cls: 'team-tkt' },
      { id: 'TCNTT', name: 'Tổ Công nghệ thông tin', icon: '💻', cls: 'team-tcntt' }
    ];
    teams.forEach(team => {
      const teamEmps = state.employees.filter(e => e.team === team.id);
      if (!teamEmps.length) return;
      let taskCount = 0;
      teamEmps.forEach(emp => { taskCount += state.tasks.filter(t => !t.in_staging && t.assignee_ids && t.assignee_ids.includes(emp.id)).length; });
      const section = document.createElement('div');
      section.className = `team-group-section ${team.cls}`;
      section.innerHTML = `<div class="team-group-header"><div class="team-title-wrap"><div class="team-icon">${team.icon}</div><h3 class="team-name">${team.name}</h3></div><span class="team-stats-badge">${teamEmps.length} nhân sự • ${taskCount} việc</span></div><div class="staff-columns-grid" id="tg_${team.id}"></div>`;
      container.appendChild(section);
      const grid = section.querySelector(`#tg_${team.id}`);
      teamEmps.forEach(emp => grid.appendChild(createEmployeeColumn(emp)));
    });
    el.mainContent.appendChild(container);
  }

  function createEmployeeColumn(emp) {
    const col = document.createElement('div');
    col.className = 'employee-column';
    let empTasks = state.tasks.filter(t => !t.in_staging && t.assignee_ids && t.assignee_ids.includes(emp.id));
    if (state.searchQuery) empTasks = empTasks.filter(t => t.title.toLowerCase().includes(state.searchQuery) || (t.detail || '').toLowerCase().includes(state.searchQuery));
    const initials = getInitials(emp.name);
    const photoUrl = emp.photo;
    col.innerHTML = `
      <div class="employee-header">
        <div class="employee-avatar-wrap">
          ${photoUrl ? `<img class="employee-avatar-img" src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="employee-avatar-fallback" style="display:none;">${initials}</div>` : `<div class="employee-avatar-fallback">${initials}</div>`}
        </div>
        <div class="employee-info">
          <div class="employee-name" title="${emp.name}">
            <span>${emp.name}</span>
            ${emp.is_reinforced ? `<span class="badge-reinforced" title="${emp.reinforce_note || 'Nhân sự tăng cường từ Đội VHLĐ'}">⚡ Tăng cường</span>` : ''}
          </div>
          <div class="employee-role" title="${emp.position}">${emp.position}</div>
        </div>
        <div class="employee-task-count">${empTasks.length} việc</div>
      </div>
      <div class="employee-tasks-dropzone" id="dz_${emp.id}"></div>`;
    const dz = col.querySelector(`#dz_${emp.id}`);
    if (isLeader) setupDropzone(dz, taskId => assignTaskToEmployee(taskId, emp.id));
    if (empTasks.length === 0) {
      dz.innerHTML = `<div class="empty-task-placeholder">Chưa có việc${isLeader ? ' • Thả việc vào đây' : ''}</div>`;
    } else {
      empTasks.forEach(task => dz.appendChild(createTaskCard(task, { showAssignees: false, currentEmpId: emp.id })));
    }
    return col;
  }

  // =========================================================================
  // CATEGORY VIEW (LEADER)
  // =========================================================================
  const CATEGORY_SECTIONS = [
    { code: 'A', label: 'A. Vận hành & KT Lưới điện', icon: '⚡', shortLabel: 'A. Vận hành' },
    { code: 'B', label: 'B. ĐTXD – Sửa chữa – Đấu thầu', icon: '🏗️', shortLabel: 'B. ĐTXD' },
    { code: 'C', label: 'C. Tài sản – Bàn giao – Vật tư', icon: '📦', shortLabel: 'C. Tài sản' },
    { code: 'D', label: 'D. An toàn – Môi trường', icon: '🛡️', shortLabel: 'D. An toàn' },
    { code: 'E', label: 'E. CNTT – Dữ liệu – CĐS', icon: '💻', shortLabel: 'E. CNTT' }
  ];

  const MAX_TASKS_COLLAPSED = 3;

  function renderCategoryView() {
    el.mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'category-view-container';

    // ── Filter Bar ──
    const filterBar = document.createElement('div');
    filterBar.className = 'cat-filter-bar';
    const activeFilter = state.categoryGroupFilter || 'ALL';
    filterBar.innerHTML = `
      <button class="cat-filter-pill ${activeFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">
        📋 Tất cả <span class="cat-filter-count">${state.categories.length}</span>
      </button>
      ${CATEGORY_SECTIONS.map(s => {
        const count = state.categories.filter(c => (c.section_code || '') === s.code).length;
        return `<button class="cat-filter-pill cat-filter-${s.code.toLowerCase()} ${activeFilter === s.code ? 'active' : ''}" data-filter="${s.code}">
          ${s.icon} ${s.shortLabel} <span class="cat-filter-count">${count}</span>
        </button>`;
      }).join('')}
    `;
    container.appendChild(filterBar);

    // ── Group categories by section ──
    const filteredSections = activeFilter === 'ALL' 
      ? CATEGORY_SECTIONS 
      : CATEGORY_SECTIONS.filter(s => s.code === activeFilter);

    filteredSections.forEach(sec => {
      const sectionCats = state.categories.filter(c => (c.section_code || '') === sec.code);
      if (sectionCats.length === 0) return;

      // Count total tasks in this section
      let sectionTaskCount = 0;
      sectionCats.forEach(cat => {
        sectionTaskCount += state.tasks.filter(t => t.category_id === cat.id && !t.in_staging).length;
      });

      const sectionBlock = document.createElement('div');
      sectionBlock.className = 'cat-section-block';
      sectionBlock.innerHTML = `
        <div class="cat-section-header cat-section-${sec.code.toLowerCase()}">
          <div class="cat-section-title-wrap">
            <span class="cat-section-icon">${sec.icon}</span>
            <h3 class="cat-section-title">${sec.label}</h3>
          </div>
          <span class="cat-section-stats">${sectionCats.length} nhóm • ${sectionTaskCount} việc</span>
        </div>
      `;

      const grid = document.createElement('div');
      grid.className = 'category-view-grid';

      sectionCats.forEach(cat => {
        let catTasks = state.tasks.filter(t => t.category_id === cat.id && !t.in_staging);
        if (state.searchQuery) catTasks = catTasks.filter(t => t.title.toLowerCase().includes(state.searchQuery) || (t.detail || '').toLowerCase().includes(state.searchQuery));

        const isExpanded = state.expandedCategories[cat.id] || false;
        const visibleTasks = isExpanded ? catTasks : catTasks.slice(0, MAX_TASKS_COLLAPSED);
        const hiddenCount = catTasks.length - MAX_TASKS_COLLAPSED;

        const card = document.createElement('div');
        card.className = 'category-card';

        // Header with follower info
        const followerHtml = cat.follower_text 
          ? `<div class="cat-follower-row"><span class="cat-follower-icon">👁️</span><span class="cat-follower-text">${cat.follower_text}</span></div>` 
          : '';

        card.innerHTML = `
          <div class="category-header" style="background:${cat.bg_color};border-color:${cat.border_color};">
            <div class="category-header-title" style="color:${cat.color};">
              <span>🏷️</span><span>${cat.title}</span>
            </div>
            <span class="category-badge-count" style="color:${cat.color};">${catTasks.length} việc</span>
          </div>
          ${followerHtml}
          <div class="category-tasks-dropzone" id="cdz_${cat.id}"></div>
        `;

        const dz = card.querySelector(`#cdz_${cat.id}`);
        if (isLeader) setupDropzone(dz, taskId => assignTaskToCategory(taskId, cat.id));

        if (catTasks.length === 0) {
          dz.innerHTML = `<div class="empty-task-placeholder">Chưa có công việc</div>`;
        } else {
          visibleTasks.forEach(task => dz.appendChild(createTaskCard(task, { showAssignees: true })));

          // Expand/Collapse button
          if (catTasks.length > MAX_TASKS_COLLAPSED) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'cat-expand-btn';
            toggleBtn.dataset.catId = cat.id;
            if (isExpanded) {
              toggleBtn.innerHTML = `<span class="cat-expand-icon">▲</span> Thu gọn`;
              toggleBtn.classList.add('expanded');
            } else {
              toggleBtn.innerHTML = `<span class="cat-expand-icon">▼</span> Xem thêm <span class="cat-expand-count">(${hiddenCount})</span>`;
            }
            dz.appendChild(toggleBtn);
          }
        }

        grid.appendChild(card);
      });

      sectionBlock.appendChild(grid);
      container.appendChild(sectionBlock);
    });

    el.mainContent.appendChild(container);

    // ── Bind events ──
    container.querySelectorAll('.cat-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.categoryGroupFilter = btn.dataset.filter;
        render();
      });
    });

    container.querySelectorAll('.cat-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = btn.dataset.catId;
        state.expandedCategories[catId] = !state.expandedCategories[catId];
        render();
      });
    });
  }

  // =========================================================================
  // DASHBOARD VIEW (LEADER)
  // =========================================================================
  function renderDashboardView() {
    el.mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'dashboard-container';
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.status === 'completed').length;
    const inProgress = state.tasks.filter(t => t.status === 'in_progress' && !t.in_staging && t.assignee_ids && t.assignee_ids.length > 0).length;
    const pending = state.tasks.filter(t => t.in_staging || !t.assignee_ids || t.assignee_ids.length === 0).length;

    // KPI
    const kpi = document.createElement('div');
    kpi.className = 'dashboard-kpi-row';
    kpi.innerHTML = `
      <div class="kpi-card kpi-blue"><div class="kpi-info"><span class="kpi-label">Tổng số công việc</span><span class="kpi-value">${total}</span><span class="kpi-subtext">Phòng KTAT</span></div><div class="kpi-icon-wrap">📋</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-info"><span class="kpi-label">Đang thực hiện</span><span class="kpi-value">${inProgress}</span><span class="kpi-subtext">Đã phân công</span></div><div class="kpi-icon-wrap">⏳</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-info"><span class="kpi-label">Đã hoàn thành</span><span class="kpi-value">${completed}</span><span class="kpi-subtext">Hoàn tất</span></div><div class="kpi-icon-wrap">✅</div></div>
      <div class="kpi-card kpi-purple"><div class="kpi-info"><span class="kpi-label">Danh sách chờ</span><span class="kpi-value">${pending}</span><span class="kpi-subtext">Chưa gán</span></div><div class="kpi-icon-wrap">📥</div></div>`;
    container.appendChild(kpi);

    // 2-col: workload + category breakdown
    const grid2 = document.createElement('div');
    grid2.className = 'dashboard-grid-2col';
    const allEmps = state.employees;
    const workloadList = allEmps.map(emp => ({
      emp, count: state.tasks.filter(t => !t.in_staging && t.assignee_ids && t.assignee_ids.includes(emp.id)).length
    })).sort((a, b) => b.count - a.count);
    const maxC = Math.max(...workloadList.map(w => w.count), 1);

    const leftPanel = document.createElement('div');
    leftPanel.className = 'dashboard-panel';
    leftPanel.innerHTML = `<div class="panel-header"><div><h4 class="panel-title">👥 Phân bổ công việc theo Nhân sự</h4><span style="font-size:11.5px;color:var(--text-muted);">${allEmps.length} CBCNV</span></div></div>
      <div class="workload-chart-list">${workloadList.map(item => {
        const photo = item.emp.photo;
        const ini = getInitials(item.emp.name);
        const pct = item.count > 0 ? Math.max(Math.round((item.count / maxC) * 100), 10) : 0;
        return `<div class="workload-bar-item">
          <div class="workload-avatar-wrap">${photo ? `<img class="workload-avatar-img" src="${photo}" alt="${item.emp.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="workload-avatar-fallback" style="display:none;">${ini}</span>` : `<span class="workload-avatar-fallback">${ini}</span>`}</div>
          <div class="workload-staff-info"><span class="workload-staff-name" title="${item.emp.name}">${item.emp.name}</span><div class="workload-sub-row"><span class="workload-role-text">${item.emp.position}</span></div></div>
          <div class="workload-track"><div class="workload-fill" style="width:${pct}%;">${item.count > 0 ? item.count : ''}</div></div>
          <span class="workload-count">${item.count} việc</span>
        </div>`;
      }).join('')}</div>`;
    grid2.appendChild(leftPanel);

    const rightPanel = document.createElement('div');
    rightPanel.className = 'dashboard-panel';
    rightPanel.innerHTML = `<div class="panel-header"><div><h4 class="panel-title">🏷️ Cơ cấu theo Nhóm công tác</h4></div></div>
      <div class="category-stat-list">${state.categories.map(cat => {
        const cnt = state.tasks.filter(t => t.category_id === cat.id).length;
        return `<div class="category-stat-item" style="border-left-color:${cat.color};"><span class="category-stat-name">${cat.title}</span><span class="category-stat-count">${cnt} việc</span></div>`;
      }).join('')}</div>`;
    grid2.appendChild(rightPanel);
    container.appendChild(grid2);
    el.mainContent.appendChild(container);
  }

  // =========================================================================
  // PERSONAL VIEW (EMPLOYEE)
  // =========================================================================
  function renderPersonalView() {
    el.mainContent.innerHTML = '';
    const emp = state.employees.find(e => e.id === currentEmpId);
    if (!emp) { el.mainContent.innerHTML = '<p>Không tìm thấy thông tin nhân viên.</p>'; return; }

    const container = document.createElement('div');
    container.className = 'employee-personal-container';

    // My tasks
    const myAssignedTasks = state.tasks.filter(t => t.assignee_ids && t.assignee_ids.includes(currentEmpId) && t.status === 'in_progress');
    const myCompletedTasks = state.tasks.filter(t => t.assignee_ids && t.assignee_ids.includes(currentEmpId) && t.status === 'completed');
    const mySelfTasks = state.tasks.filter(t => t.created_by === currentEmpId);

    // Welcome card
    const photoUrl = emp.photo;
    const initials = getInitials(emp.name);
    container.innerHTML = `
      <div class="personal-welcome-card">
        ${photoUrl ? `<img class="personal-welcome-avatar" src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="personal-welcome-avatar-fallback" style="display:none;">${initials}</div>` : `<div class="personal-welcome-avatar-fallback">${initials}</div>`}
        <div class="personal-welcome-info">
          <h2>Xin chào, ${emp.short_name || emp.name}!</h2>
          <p>${emp.position} — ${emp.dept_full}${emp.is_reinforced ? ' <span class="badge-reinforced">⚡ Nhân sự tăng cường từ Đội VHLĐ</span>' : ''}</p>
          <div class="personal-stats-row">
            <div class="personal-stat-item"><strong>${myAssignedTasks.length}</strong> Đang làm</div>
            <div class="personal-stat-item"><strong>${myCompletedTasks.length}</strong> Đã xong</div>
            <div class="personal-stat-item"><strong>${mySelfTasks.length}</strong> Tự nhập</div>
          </div>
        </div>
      </div>`;

    // Self-input section
    const selfInput = document.createElement('div');
    selfInput.className = 'self-input-section';
    selfInput.innerHTML = `
      <div class="self-input-header"><span style="font-size:20px;">✏️</span><h3>Nhập công việc đang thực hiện</h3></div>
      <div class="self-input-body">
        <div class="self-input-fields">
          <div class="form-group">
            <label class="form-label" for="selfTaskTitle">Tên công việc <span class="required">*</span></label>
            <input type="text" id="selfTaskTitle" class="form-control" placeholder="VD: Khảo sát tuyến đường dây trung thế khu vực ABC...">
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="selfTaskDetail">Chi tiết</label>
              <textarea id="selfTaskDetail" class="form-control" rows="2" placeholder="Mô tả chi tiết công việc..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="selfTaskCategory">Nhóm công việc</label>
              <select id="selfTaskCategory" class="form-control">
                ${(() => {
                  let html = '';
                  const secMap = {};
                  state.categories.forEach(c => { const s = c.section || 'Khác'; if (!secMap[s]) secMap[s] = []; secMap[s].push(c); });
                  Object.keys(secMap).forEach(s => { html += `<optgroup label="${s}">`; secMap[s].forEach(c => { html += `<option value="${c.id}">${c.title}</option>`; }); html += '</optgroup>'; });
                  return html;
                })()}
                <option value="__NEW__">➕ Tạo nhóm mới...</option>
              </select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="selfTaskDeadline">Thời hạn</label>
              <input type="text" id="selfTaskDeadline" class="form-control" placeholder="VD: 20/09/2026">
            </div>
            <div class="form-group" style="display:flex;align-items:flex-end;">
              <button type="button" class="btn btn-success" id="selfTaskSubmitBtn" style="width:100%;padding:10px;">📝 Ghi nhận công việc</button>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(selfInput);

    // Task panels: 3 columns for assigned / self-added / completed
    const gridDiv = document.createElement('div');
    gridDiv.className = 'personal-tasks-grid';

    // Assigned tasks
    gridDiv.innerHTML += `
      <div class="personal-task-panel">
        <div class="personal-panel-header assigned"><span class="personal-panel-title">📌 Công việc được giao</span><span class="personal-panel-count">${myAssignedTasks.length}</span></div>
        <div class="personal-tasks-list" id="assignedTasksList">
          ${myAssignedTasks.length === 0 ? '<div class="empty-personal-placeholder"><span class="empty-icon">📭</span>Chưa có công việc được giao</div>' :
            myAssignedTasks.map(t => renderPersonalTaskItem(t, 'assigned')).join('')}
        </div>
      </div>`;

    // Completed tasks
    gridDiv.innerHTML += `
      <div class="personal-task-panel">
        <div class="personal-panel-header completed"><span class="personal-panel-title">✅ Đã hoàn thành</span><span class="personal-panel-count">${myCompletedTasks.length}</span></div>
        <div class="personal-tasks-list" id="completedTasksList">
          ${myCompletedTasks.length === 0 ? '<div class="empty-personal-placeholder"><span class="empty-icon">🎯</span>Chưa có công việc hoàn thành</div>' :
            myCompletedTasks.map(t => renderPersonalTaskItem(t, 'completed')).join('')}
        </div>
      </div>`;

    container.appendChild(gridDiv);
    el.mainContent.appendChild(container);

    // Bind self-input button
    const submitBtn = document.getElementById('selfTaskSubmitBtn');
    if (submitBtn) submitBtn.addEventListener('click', handleSelfTaskSubmit);

    // Bind action buttons on personal task items
    container.querySelectorAll('[data-action="complete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'completed';
          task.completed_at = new Date().toISOString();
          saveData(false);
          render();
          updateQuickStats();
          notify('success', 'Đã đánh dấu hoàn thành!');
        }
      });
    });
    container.querySelectorAll('[data-action="reopen"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'in_progress';
          delete task.completed_at;
          saveData(false);
          render();
          updateQuickStats();
          notify('info', 'Đã mở lại công việc');
        }
      });
    });
  }

  function renderPersonalTaskItem(task, mode) {
    const cat = state.categories.find(c => c.id === task.category_id);
    const subAssign = task.sub_assignments && task.sub_assignments[currentEmpId] ? task.sub_assignments[currentEmpId] : '';
    const isSelf = task.created_by === currentEmpId;
    return `
      <div class="personal-task-item">
        <div class="personal-task-title">${escapeHtml(task.title)}</div>
        ${subAssign ? `<div class="task-sub-assigned-box"><strong>🎯 Nhiệm vụ:</strong> ${escapeHtml(subAssign)}</div>` : ''}
        <div class="personal-task-meta">
          ${cat ? `<span class="personal-task-tag tag-category">${cat.title}</span>` : ''}
          ${task.deadline ? `<span class="personal-task-tag tag-deadline">📅 ${formatFullDate(task.deadline)}</span>` : ''}
          ${isSelf ? `<span class="personal-task-tag tag-self">✏️ Tự nhập</span>` : ''}
        </div>
        <div class="personal-task-actions">
          ${mode === 'assigned' ? `<button class="btn btn-success" data-action="complete" data-task-id="${task.id}">✓ Hoàn thành</button>` : ''}
          ${mode === 'completed' ? `<button class="btn btn-outline" data-action="reopen" data-task-id="${task.id}">↩ Mở lại</button>` : ''}
        </div>
      </div>`;
  }

  // =========================================================================
  // WEEKLY PRODUCTIVITY REPORT VIEW
  // =========================================================================
  function parseTaskDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const s = dateStr.trim();
    const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m1) return new Date(parseInt(m1[3], 10), parseInt(m1[2], 10) - 1, parseInt(m1[1], 10));
    const m2 = s.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m2) return new Date(2026, parseInt(m2[2], 10) - 1, parseInt(m2[1], 10));
    const m3 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m3) return new Date(parseInt(m3[1], 10), parseInt(m3[2], 10) - 1, parseInt(m3[3], 10));
    return null;
  }

  function getWeekRange(offsetWeeks = 0) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (offsetWeeks * 7));
    const day = target.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(target.getFullYear(), target.getMonth(), target.getDate() + diffToMon, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

    const d = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    const pad = n => String(n).padStart(2, '0');
    const fmt = dt => `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;

    let relativeTag = '';
    if (offsetWeeks === 0) relativeTag = 'Tuần này';
    else if (offsetWeeks === -1) relativeTag = 'Tuần trước';
    else if (offsetWeeks === 1) relativeTag = 'Tuần tới';
    else if (offsetWeeks < -1) relativeTag = `${Math.abs(offsetWeeks)} tuần trước`;
    else relativeTag = `Sau ${offsetWeeks} tuần`;

    return {
      monday,
      sunday,
      weekNum,
      year: monday.getFullYear(),
      startStr: fmt(monday),
      endStr: fmt(sunday),
      isCurrentWeek: offsetWeeks === 0,
      relativeTag,
      label: `Tuần ${weekNum} (${fmt(monday)} – ${fmt(sunday)})`
    };
  }

  function getEmployeeProductivity(empId, weekInfo, mode) {
    const empTasks = state.tasks.filter(t => !t.in_staging && t.assignee_ids && t.assignee_ids.includes(empId));
    let completed = [];
    let inProgress = [];

    if (mode === 'all') {
      completed = empTasks.filter(t => t.status === 'completed');
      inProgress = empTasks.filter(t => t.status !== 'completed');
    } else {
      empTasks.forEach(t => {
        if (t.status === 'completed') {
          let matches = false;
          if (t.completed_at) {
            const cDate = new Date(t.completed_at);
            matches = cDate >= weekInfo.monday && cDate <= weekInfo.sunday;
          } else if (t.deadline) {
            const dDate = parseTaskDate(t.deadline);
            matches = dDate ? (dDate >= weekInfo.monday && dDate <= weekInfo.sunday) : weekInfo.isCurrentWeek;
          } else {
            matches = weekInfo.isCurrentWeek;
          }
          if (matches) completed.push(t);
        } else {
          // In progress (dang dở)
          if (weekInfo.isCurrentWeek) {
            inProgress.push(t);
          } else {
            if (t.deadline) {
              const dDate = parseTaskDate(t.deadline);
              if (dDate && dDate >= weekInfo.monday && dDate <= weekInfo.sunday) {
                inProgress.push(t);
              }
            }
          }
        }
      });
    }

    const total = completed.length + inProgress.length;
    const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    return { completed, inProgress, total, rate };
  }

  function renderReportView() {
    el.mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'report-view-container';

    const weekInfo = getWeekRange(state.reportWeekOffset || 0);
    const mode = state.reportMode || 'week';

    if (isLeader) {
      renderLeaderReportView(container, weekInfo, mode);
    } else {
      renderStaffReportView(container, weekInfo, mode);
    }

    el.mainContent.appendChild(container);
  }

  function renderStaffReportView(container, weekInfo, mode) {
    const emp = state.employees.find(e => e.id === currentEmpId);
    if (!emp) { container.innerHTML = '<p>Không tìm thấy thông tin nhân viên.</p>'; return; }

    const reportData = getEmployeeProductivity(emp.id, weekInfo, mode);

    let rateColor = '#10b981';
    if (reportData.rate < 40) rateColor = '#ef4444';
    else if (reportData.rate < 70) rateColor = '#f59e0b';

    container.innerHTML = `
      <div class="report-header-bar">
        <div class="report-title-block">
          <div class="report-title-icon">📈</div>
          <div>
            <h2 class="report-main-title">Báo cáo Năng suất Theo tuần</h2>
            <p class="report-subtitle">Cá nhân: <strong>${emp.name}</strong> — ${emp.position} (${emp.dept_full || 'Phòng KTAT'})</p>
          </div>
        </div>

        <div class="report-nav-controls">
          <div class="week-nav-group">
            <button class="btn-week-nav" id="rptPrevWeek" title="Tuần trước">◀</button>
            <div class="week-badge-display">
              <span>📅</span>
              <span>${weekInfo.label}</span>
              <span class="week-badge-tag ${weekInfo.isCurrentWeek ? '' : 'tag-past'}">${weekInfo.relativeTag}</span>
            </div>
            <button class="btn-week-nav" id="rptNextWeek" title="Tuần sau">▶</button>
            <button class="btn btn-outline btn-sm" id="rptCurrentWeek" style="padding:4px 8px;font-size:11.5px;">Hôm nay</button>
          </div>

          <div class="report-scope-toggle">
            <button class="scope-btn ${mode === 'week' ? 'active' : ''}" data-scope="week">Tuần này</button>
            <button class="scope-btn ${mode === 'all' ? 'active' : ''}" data-scope="all">Tất cả việc</button>
          </div>
        </div>
      </div>

      <div class="report-kpi-grid">
        <div class="report-kpi-card kpi-total">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Tổng công việc</span>
            <span class="report-kpi-value">${reportData.total}</span>
            <span class="report-kpi-subtext">Được phân công</span>
          </div>
          <div class="report-kpi-icon">📋</div>
        </div>
        <div class="report-kpi-card kpi-completed">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Đã hoàn thành</span>
            <span class="report-kpi-value" style="color:#059669;">${reportData.completed.length}</span>
            <span class="report-kpi-subtext">${reportData.rate}% hoàn tất</span>
          </div>
          <div class="report-kpi-icon">✅</div>
        </div>
        <div class="report-kpi-card kpi-inprogress">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Công việc dang dở</span>
            <span class="report-kpi-value" style="color:#d97706;">${reportData.inProgress.length}</span>
            <span class="report-kpi-subtext">Đang thực hiện</span>
          </div>
          <div class="report-kpi-icon">⏳</div>
        </div>
        <div class="report-kpi-card kpi-rate">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Hiệu suất tuần</span>
            <span class="report-kpi-value" style="color:${rateColor};">${reportData.rate}%</span>
            <span class="report-kpi-subtext">${reportData.completed.length}/${reportData.total} nhiệm vụ</span>
          </div>
          <div class="report-kpi-icon">🎯</div>
        </div>
      </div>

      <div class="report-sections-grid">
        <div class="report-column report-col-completed">
          <div class="report-col-header">
            <div class="report-col-title-wrap">
              <span style="font-size:18px;">✅</span>
              <h3 class="report-col-title">Công việc Đã Hoàn Thành</h3>
            </div>
            <span class="report-col-badge badge-green">${reportData.completed.length} việc</span>
          </div>
          <div class="report-tasks-list">
            ${reportData.completed.length === 0 ? `
              <div class="report-empty-placeholder">
                <div style="font-size:24px;margin-bottom:6px;">📭</div>
                Chưa có công việc hoàn thành trong ${mode === 'week' ? 'tuần này' : 'danh sách'}
              </div>
            ` : reportData.completed.map(t => renderReportTaskItem(t, 'completed', false)).join('')}
          </div>
        </div>

        <div class="report-column report-col-inprogress">
          <div class="report-col-header">
            <div class="report-col-title-wrap">
              <span style="font-size:18px;">⏳</span>
              <h3 class="report-col-title">Công việc Dang Dở / Đang Thực Hiện</h3>
            </div>
            <span class="report-col-badge badge-amber">${reportData.inProgress.length} việc</span>
          </div>
          <div class="report-tasks-list">
            ${reportData.inProgress.length === 0 ? `
              <div class="report-empty-placeholder">
                <div style="font-size:24px;margin-bottom:6px;">🎉</div>
                Tuyệt vời! Bạn không có công việc dang dở nào.
              </div>
            ` : reportData.inProgress.map(t => renderReportTaskItem(t, 'inprogress', false)).join('')}
          </div>
        </div>
      </div>
    `;

    bindReportEventListeners(container);
  }

  function renderLeaderReportView(container, weekInfo, mode) {
    const allEmps = state.employees;
    const teamFilter = state.reportTeamFilter || 'ALL';
    const searchQuery = (state.reportStaffSearch || '').trim().toLowerCase();

    const staffReports = allEmps.map(emp => {
      const data = getEmployeeProductivity(emp.id, weekInfo, mode);
      return { emp, ...data };
    });

    const deptTotalCompleted = staffReports.reduce((s, r) => s + r.completed.length, 0);
    const deptTotalInProgress = staffReports.reduce((s, r) => s + r.inProgress.length, 0);
    const deptTotalTasks = deptTotalCompleted + deptTotalInProgress;
    const deptRate = deptTotalTasks > 0 ? Math.round((deptTotalCompleted / deptTotalTasks) * 100) : 0;

    let filteredStaff = staffReports;
    if (teamFilter !== 'ALL') {
      filteredStaff = filteredStaff.filter(r => r.emp.team === teamFilter);
    }
    if (searchQuery) {
      filteredStaff = filteredStaff.filter(r => 
        r.emp.name.toLowerCase().includes(searchQuery) ||
        (r.emp.position || '').toLowerCase().includes(searchQuery) ||
        r.completed.some(t => t.title.toLowerCase().includes(searchQuery)) ||
        r.inProgress.some(t => t.title.toLowerCase().includes(searchQuery))
      );
    }

    container.innerHTML = `
      <div class="report-header-bar">
        <div class="report-title-block">
          <div class="report-title-icon">📊</div>
          <div>
            <h2 class="report-main-title">Báo cáo Năng suất Theo tuần Toàn phòng</h2>
            <p class="report-subtitle">Phòng Kỹ thuật và An toàn — PC Vũng Tàu (Xem tất cả ${allEmps.length} nhân sự)</p>
          </div>
        </div>

        <div class="report-nav-controls">
          <div class="week-nav-group">
            <button class="btn-week-nav" id="rptPrevWeek" title="Tuần trước">◀</button>
            <div class="week-badge-display">
              <span>📅</span>
              <span>${weekInfo.label}</span>
              <span class="week-badge-tag ${weekInfo.isCurrentWeek ? '' : 'tag-past'}">${weekInfo.relativeTag}</span>
            </div>
            <button class="btn-week-nav" id="rptNextWeek" title="Tuần sau">▶</button>
            <button class="btn btn-outline btn-sm" id="rptCurrentWeek" style="padding:4px 8px;font-size:11.5px;">Hôm nay</button>
          </div>

          <div class="report-scope-toggle">
            <button class="scope-btn ${mode === 'week' ? 'active' : ''}" data-scope="week">Tuần này</button>
            <button class="scope-btn ${mode === 'all' ? 'active' : ''}" data-scope="all">Tất cả việc</button>
          </div>
        </div>
      </div>

      <div class="report-kpi-grid">
        <div class="report-kpi-card kpi-total">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Tổng việc phòng</span>
            <span class="report-kpi-value">${deptTotalTasks}</span>
            <span class="report-kpi-subtext">${allEmps.length} CBCNV theo dõi</span>
          </div>
          <div class="report-kpi-icon">📋</div>
        </div>
        <div class="report-kpi-card kpi-completed">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Đã hoàn thành</span>
            <span class="report-kpi-value" style="color:#059669;">${deptTotalCompleted}</span>
            <span class="report-kpi-subtext">${deptRate}% toàn phòng</span>
          </div>
          <div class="report-kpi-icon">✅</div>
        </div>
        <div class="report-kpi-card kpi-inprogress">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Công việc dang dở</span>
            <span class="report-kpi-value" style="color:#d97706;">${deptTotalInProgress}</span>
            <span class="report-kpi-subtext">Đang thực hiện</span>
          </div>
          <div class="report-kpi-icon">⏳</div>
        </div>
        <div class="report-kpi-card kpi-rate">
          <div class="report-kpi-info">
            <span class="report-kpi-label">Tỷ lệ hoàn thành</span>
            <span class="report-kpi-value" style="color:#8b5cf6;">${deptRate}%</span>
            <span class="report-kpi-subtext">${deptTotalCompleted}/${deptTotalTasks} công việc</span>
          </div>
          <div class="report-kpi-icon">📈</div>
        </div>
      </div>

      <div class="report-toolbar">
        <div class="report-team-filters">
          <button class="report-team-btn ${teamFilter === 'ALL' ? 'active' : ''}" data-team="ALL">Tất cả các tổ (${allEmps.length})</button>
          <button class="report-team-btn ${teamFilter === 'BLĐ' ? 'active' : ''}" data-team="BLĐ">🏛️ Ban Lãnh đạo (${allEmps.filter(e => e.team === 'BLĐ').length})</button>
          <button class="report-team-btn ${teamFilter === 'TKT' ? 'active' : ''}" data-team="TKT">⚡ Tổ Kỹ thuật (${allEmps.filter(e => e.team === 'TKT').length})</button>
          <button class="report-team-btn ${teamFilter === 'TCNTT' ? 'active' : ''}" data-team="TCNTT">💻 Tổ CNTT (${allEmps.filter(e => e.team === 'TCNTT').length})</button>
        </div>

        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <input type="text" id="rptSearchInput" class="report-search-input" placeholder="🔍 Tìm CBCNV, công việc..." value="${escapeHtml(state.reportStaffSearch || '')}">
          <button class="btn btn-outline btn-sm" id="rptExpandAllBtn" style="padding:6px 12px;font-size:12px;">📂 Mở rộng tất cả</button>
          <button class="btn btn-outline btn-sm" id="rptCollapseAllBtn" style="padding:6px 12px;font-size:12px;">📁 Thu gọn</button>
          <button class="btn btn-outline btn-sm" id="rptPrintBtn" style="padding:6px 12px;font-size:12px;">🖨️ In báo cáo</button>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;" id="reportStaffList">
        ${filteredStaff.length === 0 ? `
          <div class="report-empty-placeholder">
            <div style="font-size:24px;margin-bottom:6px;">🔍</div>
            Không tìm thấy nhân viên hoặc công việc phù hợp với bộ lọc.
          </div>
        ` : filteredStaff.map(item => renderLeaderStaffCard(item, mode)).join('')}
      </div>
    `;

    bindReportEventListeners(container);
  }

  function renderLeaderStaffCard(item, mode) {
    const { emp, completed, inProgress, total, rate } = item;
    const isExpanded = !!state.reportExpandedStaff[emp.id];
    const initials = getInitials(emp.name);
    const photoUrl = emp.photo;

    let fillBg = '#10b981';
    if (rate < 40) fillBg = '#ef4444';
    else if (rate < 70) fillBg = '#f59e0b';

    const teamLabels = { 'BLĐ': 'Ban Lãnh đạo', 'TKT': 'Tổ Kỹ thuật', 'TCNTT': 'Tổ CNTT' };

    return `
      <div class="report-staff-card" data-emp-id="${emp.id}">
        <div class="report-staff-header" data-action="toggle-expand" data-emp-id="${emp.id}">
          <div class="report-staff-profile">
            ${photoUrl ? `<img class="report-staff-avatar" src="${photoUrl}" alt="${emp.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="report-staff-avatar-fallback" style="display:none;">${initials}</div>` : `<div class="report-staff-avatar-fallback">${initials}</div>`}
            <div class="report-staff-meta">
              <span class="report-staff-name">${emp.name}${emp.is_reinforced ? ` <span class="badge-reinforced" title="Nhân sự tăng cường từ Đội VHLĐ">⚡ Tăng cường</span>` : ''}</span>
              <span class="report-staff-role">
                <span>${emp.position}</span>
                <span class="report-badge-team">${teamLabels[emp.team] || emp.team}</span>
              </span>
            </div>
          </div>

          <div class="report-staff-metrics">
            <span class="report-metric-pill metric-pill-green" title="Công việc hoàn thành">
              <span>✅</span><span>${completed.length} hoàn thành</span>
            </span>
            <span class="report-metric-pill metric-pill-amber" title="Công việc dang dở">
              <span>⏳</span><span>${inProgress.length} dang dở</span>
            </span>
            <span class="report-metric-pill metric-pill-blue" title="Tổng công việc">
              <span>📋</span><span>${total} việc</span>
            </span>

            <div class="report-meter-wrap" title="Tỷ lệ hoàn thành: ${rate}%">
              <div class="report-meter-bar">
                <div class="report-meter-fill" style="width:${rate}%;background:${fillBg};"></div>
              </div>
              <span class="report-meter-pct" style="color:${fillBg};">${rate}%</span>
            </div>

            <span class="report-toggle-arrow">${isExpanded ? 'Thu gọn ▴' : 'Chi tiết ▾'}</span>
          </div>
        </div>

        ${isExpanded ? `
          <div class="report-staff-body">
            <div class="report-column report-col-completed">
              <div class="report-col-header">
                <div class="report-col-title-wrap">
                  <span>✅</span>
                  <h4 class="report-col-title">Công việc hoàn thành</h4>
                </div>
                <span class="report-col-badge badge-green">${completed.length} việc</span>
              </div>
              <div class="report-tasks-list">
                ${completed.length === 0 ? '<div class="report-empty-placeholder">Chưa có công việc hoàn thành</div>' :
                  completed.map(t => renderReportTaskItem(t, 'completed', true)).join('')}
              </div>
            </div>

            <div class="report-column report-col-inprogress">
              <div class="report-col-header">
                <div class="report-col-title-wrap">
                  <span>⏳</span>
                  <h4 class="report-col-title">Công việc dang dở</h4>
                </div>
                <span class="report-col-badge badge-amber">${inProgress.length} việc</span>
              </div>
              <div class="report-tasks-list">
                ${inProgress.length === 0 ? '<div class="report-empty-placeholder">🎉 Không có công việc dang dở</div>' :
                  inProgress.map(t => renderReportTaskItem(t, 'inprogress', true)).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderReportTaskItem(task, statusMode, isLeaderView) {
    const cat = state.categories.find(c => c.id === task.category_id);
    const subAssign = task.sub_assignments && task.sub_assignments[currentEmpId] ? task.sub_assignments[currentEmpId] : '';
    const isCompleted = task.status === 'completed';

    let completedDateText = '';
    if (task.completed_at) {
      const d = new Date(task.completed_at);
      completedDateText = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    }

    return `
      <div class="report-task-item ${isCompleted ? 'completed-item' : 'inprogress-item'}" data-task-id="${task.id}">
        <div class="report-task-title" ${isLeaderView ? `style="cursor:pointer;" title="Nhấn để xem/sửa chi tiết"` : ''}>
          ${escapeHtml(task.title)}
        </div>
        ${task.detail && task.detail !== task.title ? `<div class="report-task-detail">${escapeHtml(task.detail)}</div>` : ''}
        ${subAssign ? `<div class="task-sub-assigned-box"><strong>🎯 Nhiệm vụ cụ thể:</strong> ${escapeHtml(subAssign)}</div>` : ''}
        <div class="report-task-meta">
          ${cat ? `<span class="report-task-tag report-tag-cat" style="color:${cat.color};background:${cat.bg_color};border-color:${cat.border_color};">${cat.title}</span>` : ''}
          ${task.deadline ? `<span class="report-task-tag report-tag-deadline">📅 Hạn: ${formatFullDate(task.deadline)}</span>` : ''}
          ${completedDateText ? `<span class="report-task-tag report-tag-completed">✓ Xong: ${completedDateText}</span>` : ''}
          ${task.created_by === currentEmpId ? `<span class="report-task-tag" style="background:#f1f5f9;color:#475569;">✏️ Tự nhập</span>` : ''}
        </div>
        <div class="report-task-actions">
          ${!isLeaderView && !isCompleted ? `<button class="btn-report-action btn-report-complete" data-action="report-complete" data-task-id="${task.id}">✓ Hoàn thành</button>` : ''}
          ${!isLeaderView && isCompleted ? `<button class="btn-report-action btn-report-reopen" data-action="report-reopen" data-task-id="${task.id}">↩ Mở lại</button>` : ''}
          ${isLeaderView ? `<button class="btn-report-action btn-report-reopen" data-action="report-edit" data-task-id="${task.id}">✏️ Chi tiết / Sửa</button>` : ''}
        </div>
      </div>
    `;
  }

  function bindReportEventListeners(container) {
    const prevBtn = container.querySelector('#rptPrevWeek');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      state.reportWeekOffset = (state.reportWeekOffset || 0) - 1;
      render();
    });

    const nextBtn = container.querySelector('#rptNextWeek');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      state.reportWeekOffset = (state.reportWeekOffset || 0) + 1;
      render();
    });

    const currBtn = container.querySelector('#rptCurrentWeek');
    if (currBtn) currBtn.addEventListener('click', () => {
      state.reportWeekOffset = 0;
      render();
    });

    container.querySelectorAll('.scope-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.reportMode = btn.dataset.scope;
        render();
      });
    });

    container.querySelectorAll('[data-action="report-complete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'completed';
          task.completed_at = new Date().toISOString();
          saveData(false);
          render();
          updateQuickStats();
          notify('success', '✓ Đã đánh dấu hoàn thành công việc!');
        }
      });
    });

    container.querySelectorAll('[data-action="report-reopen"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'in_progress';
          delete task.completed_at;
          saveData(false);
          render();
          updateQuickStats();
          notify('info', '↩ Đã mở lại công việc');
        }
      });
    });

    if (isLeader) {
      container.querySelectorAll('[data-action="toggle-expand"]').forEach(hdr => {
        hdr.addEventListener('click', () => {
          const empId = hdr.dataset.empId;
          state.reportExpandedStaff[empId] = !state.reportExpandedStaff[empId];
          render();
        });
      });

      container.querySelectorAll('.report-team-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.reportTeamFilter = btn.dataset.team;
          render();
        });
      });

      const searchInput = container.querySelector('#rptSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          state.reportStaffSearch = e.target.value;
          render();
          const newInp = document.getElementById('rptSearchInput');
          if (newInp) {
            newInp.focus();
            newInp.setSelectionRange(newInp.value.length, newInp.value.length);
          }
        });
      }

      const expAll = container.querySelector('#rptExpandAllBtn');
      if (expAll) expAll.addEventListener('click', () => {
        state.employees.forEach(e => { state.reportExpandedStaff[e.id] = true; });
        render();
      });

      const colAll = container.querySelector('#rptCollapseAllBtn');
      if (colAll) colAll.addEventListener('click', () => {
        state.reportExpandedStaff = {};
        render();
      });

      const printBtn = container.querySelector('#rptPrintBtn');
      if (printBtn) printBtn.addEventListener('click', () => window.print());

      container.querySelectorAll('[data-action="report-edit"]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openTaskModal(btn.dataset.taskId);
        });
      });

      container.querySelectorAll('.report-task-title').forEach(titleEl => {
        titleEl.addEventListener('click', e => {
          const item = titleEl.closest('.report-task-item');
          if (item && item.dataset.taskId) openTaskModal(item.dataset.taskId);
        });
      });
    }
  }


  // Helper: Convert number to Roman numeral
  function toRoman(num) {
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let result = '';
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
    }
    return result;
  }

  // Helper: Get next Roman numeral code based on existing categories
  function getNextRomanCode() {
    let maxNum = 0;
    const romanPattern = /^([IVXLCDM]+)\.\s/;
    state.categories.forEach(c => {
      const match = c.title.match(romanPattern);
      if (match) {
        const roman = match[1];
        const num = fromRoman(roman);
        if (num > maxNum) maxNum = num;
      }
    });
    return toRoman(maxNum + 1);
  }

  function fromRoman(s) {
    const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]] || 0;
      const next = map[s[i+1]] || 0;
      total += cur < next ? -cur : cur;
    }
    return total;
  }

  // Helper: Create a new category dynamically
  function createNewCategory() {
    const name = prompt('Nhập tên nhóm công việc mới:\n(Ví dụ: Công tác An toàn lao động)');
    if (!name || !name.trim()) return null;
    let trimmed = name.trim();

    // Auto-add Roman numeral if not already present
    const romanPrefix = /^[IVXLCDM]+\.\s/;
    if (!romanPrefix.test(trimmed)) {
      const nextCode = getNextRomanCode();
      trimmed = `${nextCode}. ${trimmed}`;
    }

    const colors = ['#2563eb','#059669','#7c3aed','#dc2626','#d97706','#0891b2','#4f46e5','#0d9488','#9333ea','#6d28d9','#ea580c','#be185d'];
    const bgColors = ['#eff6ff','#ecfdf5','#f5f3ff','#fef2f2','#fffbeb','#ecfeff','#eef2ff','#f0fdfa','#faf5ff','#ede9fe','#fff7ed','#fdf2f8'];
    const borderColors = ['#bfdbfe','#a7f3d0','#ddd6fe','#fecaca','#fde68a','#a5f3fc','#c7d2fe','#99f6e4','#f3e8ff','#c4b5fd','#fed7aa','#fbcfe8'];
    const idx = state.categories.length % colors.length;
    const newCat = {
      id: `cat_custom_${Date.now()}`,
      code: getNextRomanCode(),
      title: trimmed,
      section: 'C. Nhóm công việc khác',
      color: colors[idx],
      bg_color: bgColors[idx],
      border_color: borderColors[idx]
    };
    state.categories.push(newCat);
    saveData(false);
    notify('success', `Đã tạo nhóm: ${trimmed}`);
    return newCat;
  }

  function handleSelfTaskSubmit() {
    const titleEl = document.getElementById('selfTaskTitle');
    const detailEl = document.getElementById('selfTaskDetail');
    const catEl = document.getElementById('selfTaskCategory');
    const deadlineEl = document.getElementById('selfTaskDeadline');

    const title = titleEl.value.trim();
    if (!title) { alert('Vui lòng nhập tên công việc!'); titleEl.focus(); return; }

    const emp = state.employees.find(e => e.id === currentEmpId);
    let catId = catEl.value;
    let cat;
    if (catId === '__NEW__') {
      const newCat = createNewCategory();
      if (!newCat) return;
      cat = newCat; catId = newCat.id;
    } else {
      cat = state.categories.find(c => c.id === catId);
    }

    const newTask = {
      id: `task_self_${Date.now()}`,
      stt: `${state.tasks.length + 1}`,
      title: title,
      detail: detailEl.value.trim() || title,
      section: cat ? cat.section : '',
      category: cat ? cat.title : '',
      subcategory: '',
      category_id: catId,
      assignee_ids: [currentEmpId],
      assignee_text: emp ? emp.name : '',
      follower_ids: (cat && cat.follower_ids) ? cat.follower_ids : [],
      follower_text: (cat && cat.follower_text) ? cat.follower_text : '',
      deadline: formatFullDate(deadlineEl.value.trim()),
      status: 'in_progress',
      priority: 'normal',
      in_staging: false,
      sub_assignments: {},
      created_by: currentEmpId
    };

    state.tasks.unshift(newTask);
    saveData(false);
    render();
    updateQuickStats();
    notify('success', 'Đã ghi nhận công việc của bạn!');

    // Reset form
    titleEl.value = '';
    detailEl.value = '';
    deadlineEl.value = '';
  }

  // =========================================================================
  // TASK CARD BUILDER
  // =========================================================================
  function createTaskCard(task, options = {}) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;

    let subAssignmentText = '';
    if (options.currentEmpId && task.sub_assignments && task.sub_assignments[options.currentEmpId]) {
      subAssignmentText = task.sub_assignments[options.currentEmpId];
    }

    let assigneesHtml = '';
    if (options.showAssignees) {
      if (task.assignee_ids && task.assignee_ids.length > 0) {
        const assignedEmps = state.employees.filter(e => task.assignee_ids.includes(e.id));
        assigneesHtml = `<div class="task-assignees-list">${assignedEmps.map(e => {
          const pUrl = e.photo;
          return `<span class="assignee-chip" title="${e.name}">
            ${pUrl ? `<img class="assignee-chip-mini-photo" src="${pUrl}" alt="${e.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';" /><span class="assignee-chip-mini-avatar" style="display:none;">${getInitials(e.name)}</span>` : `<span class="assignee-chip-mini-avatar">${getInitials(e.name)}</span>`}
            <span class="assignee-chip-name">${e.short_name || e.name}</span></span>`;
        }).join('')}</div>`;
      } else {
        assigneesHtml = `<div class="task-assignees-list"><span class="assignee-chip" style="color:#ef4444;background:#fef2f2;border-color:#fecaca;">⚠️ Chưa phân công</span></div>`;
      }
    }

    card.innerHTML = `
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${subAssignmentText ? `<div class="task-sub-assigned-box"><strong>🎯 Phân công:</strong> ${escapeHtml(subAssignmentText)}</div>` : ''}
      ${assigneesHtml}
      <div><button type="button" class="task-detail-toggle-btn no-click-modal" title="Chi tiết"><span>Chi tiết</span> <span class="toggle-arrow">▾</span></button></div>
      <div class="task-detail-expandable no-click-modal" style="display:none;">
        <div style="font-weight:700;margin-bottom:4px;">Nội dung:</div>
        <div>${escapeHtml(task.detail || task.title)}</div>
      </div>
      <div class="task-card-footer">
        <div>
          ${task.deadline ? `<span class="task-deadline">📅 ${formatFullDate(task.deadline)}</span>` : ''}
          ${task.follower_text ? `<span class="task-follower">👁️ ${task.follower_ids && task.follower_ids.length > 0 ? getShortName(task.follower_ids[0]) : escapeHtml(task.follower_text.substring(0, 15))}</span>` : ''}
        </div>
        <span class="task-status-chip ${task.status === 'completed' ? 'task-status-completed' : 'task-status-inprogress'}">${task.status === 'completed' ? '✓ Xong' : '● Đang làm'}</span>
      </div>`;

    // Toggle detail
    const toggleBtn = card.querySelector('.task-detail-toggle-btn');
    const expandBox = card.querySelector('.task-detail-expandable');
    const toggleArrow = card.querySelector('.toggle-arrow');
    const toggleSpan = toggleBtn.querySelector('span');
    if (toggleBtn && expandBox) {
      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        const shown = expandBox.style.display === 'block';
        expandBox.style.display = shown ? 'none' : 'block';
        toggleSpan.textContent = shown ? 'Chi tiết' : 'Thu gọn';
        toggleArrow.textContent = shown ? '▾' : '▴';
      });
    }

    makeTaskCardDraggable(card, task);
    return card;
  }

  // =========================================================================
  // TASK MODAL (LEADER)
  // =========================================================================
  function populateFormSelects() {
    // Group categories by section for optgroup display
    let catHtml = '';
    const sectionMap = {};
    state.categories.forEach(c => {
      const sec = c.section || 'Khác';
      if (!sectionMap[sec]) sectionMap[sec] = [];
      sectionMap[sec].push(c);
    });
    Object.keys(sectionMap).forEach(sec => {
      catHtml += `<optgroup label="${sec}">`;
      sectionMap[sec].forEach(c => {
        catHtml += `<option value="${c.id}">${c.title}</option>`;
      });
      catHtml += `</optgroup>`;
    });
    catHtml += `<option value="__NEW__">➕ Tạo nhóm công việc mới...</option>`;
    el.fieldCategory.innerHTML = catHtml;
    const teams = [
      { id: 'BLĐ', name: 'Ban Lãnh đạo' },
      { id: 'TKT', name: 'Tổ Kỹ thuật' },
      { id: 'TCNTT', name: 'Tổ CNTT' }
    ];
    let assigneeOpts = `<option value="">-- Chưa phân công --</option>`;
    teams.forEach(team => {
      const emps = state.employees.filter(e => e.team === team.id);
      if (emps.length) {
        assigneeOpts += `<optgroup label="${team.name}">`;
        emps.forEach(emp => { assigneeOpts += `<option value="${emp.id}">${emp.name} - ${emp.position}</option>`; });
        assigneeOpts += `</optgroup>`;
      }
    });
    el.fieldAssignee.innerHTML = assigneeOpts;
    el.fieldFollower.innerHTML = `
      <option value="">-- Không --</option>
      <option value="emp_012054">Nguyễn Đức Minh (Trưởng phòng)</option>
      <option value="emp_012170">Phan Thế Vinh (Phó phòng)</option>
      <option value="emp_010333">Nguyễn Huy (Phó phòng)</option>
      <option value="emp_012554">Nguyễn Đình Hanh (Tổ trưởng KT)</option>`;

    // Auto-fill follower when category changes
    el.fieldCategory.addEventListener('change', function() {
      const catId = this.value;
      if (catId === '__NEW__') return;
      const cat = state.categories.find(c => c.id === catId);
      if (cat && cat.follower_ids && cat.follower_ids.length > 0) {
        el.fieldFollower.value = cat.follower_ids[0];
      }
    });
  }

  function openTaskModal(taskId = null, isStagingOnly = false) {
    if (!isLeader) return;
    state.editingTaskId = taskId;
    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;
      el.taskModalTitle.innerHTML = `✏️ Chỉnh sửa: ${escapeHtml(task.title.substring(0, 35))}...`;
      el.fieldTaskId.value = task.id;
      el.fieldTitle.value = task.title;
      el.fieldDetail.value = task.detail || '';
      el.fieldCategory.value = task.category_id || state.categories[0].id;
      el.fieldAssignee.value = (task.assignee_ids && task.assignee_ids[0]) || '';
      el.fieldFollower.value = (task.follower_ids && task.follower_ids[0]) || '';
      el.fieldDeadline.value = formatFullDate(task.deadline) || '';
      el.fieldStatus.value = task.status || 'in_progress';
      el.fieldPriority.value = task.priority || 'normal';
      el.deleteTaskBtn.style.display = 'inline-flex';
    } else {
      el.taskModalTitle.innerHTML = `➕ Thêm mới công việc`;
      el.taskForm.reset();
      el.fieldTaskId.value = '';
      el.fieldCategory.value = state.categories[0].id;
      // Auto-fill follower from first category
      const defaultCat = state.categories[0];
      if (defaultCat && defaultCat.follower_ids && defaultCat.follower_ids.length > 0) {
        el.fieldFollower.value = defaultCat.follower_ids[0];
      }
      el.fieldStatus.value = 'in_progress';
      el.fieldPriority.value = 'normal';
      if (isStagingOnly) el.fieldAssignee.value = '';
      el.deleteTaskBtn.style.display = 'none';
    }
    el.taskModal.classList.add('active');
  }

  function closeTaskModal() { el.taskModal.classList.remove('active'); state.editingTaskId = null; }

  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const title = el.fieldTitle.value.trim();
    if (!title) { alert('Nhập tên công việc!'); return; }
    const detail = el.fieldDetail.value.trim() || title;
    let catId = el.fieldCategory.value;
    let cat;
    if (catId === '__NEW__') {
      const newCat = createNewCategory();
      if (!newCat) return;
      cat = newCat; catId = newCat.id;
      populateFormSelects();
      el.fieldCategory.value = catId;
    } else {
      cat = state.categories.find(c => c.id === catId);
    }
    const assigneeId = el.fieldAssignee.value;
    const followerId = el.fieldFollower.value;
    const deadline = formatFullDate(el.fieldDeadline.value.trim());
    const status = el.fieldStatus.value;
    const priority = el.fieldPriority.value;
    const assigneeEmp = state.employees.find(e => e.id === assigneeId);
    const followerEmp = state.employees.find(e => e.id === followerId);

    if (state.editingTaskId) {
      const task = state.tasks.find(t => t.id === state.editingTaskId);
      if (task) {
        const completed_at = status === 'completed' ? (task.completed_at || new Date().toISOString()) : undefined;
        Object.assign(task, {
          title, detail, category_id: catId, category: cat ? cat.title : '',
          assignee_ids: assigneeId ? [assigneeId] : [], assignee_text: assigneeEmp ? assigneeEmp.name : 'Chưa phân công',
          follower_ids: followerId ? [followerId] : [], follower_text: followerEmp ? followerEmp.name : '',
          deadline, status, priority, in_staging: !assigneeId, completed_at
        });
        saveData(false); notify('success', 'Đã cập nhật!');
      }
    } else {
      state.tasks.unshift({
        id: `task_${Date.now()}`, stt: `${state.tasks.length + 1}`, title, detail,
        section: cat ? cat.section : '', category: cat ? cat.title : '', subcategory: '', category_id: catId,
        assignee_ids: assigneeId ? [assigneeId] : [], assignee_text: assigneeEmp ? assigneeEmp.name : 'Chưa phân công',
        follower_ids: followerId ? [followerId] : [], follower_text: followerEmp ? followerEmp.name : '',
        deadline, status, priority, in_staging: !assigneeId, sub_assignments: {}, created_by: 'leader',
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      });
      saveData(false);
      notify('success', assigneeId ? `Đã tạo và phân công cho ${assigneeEmp.name}!` : 'Đã thêm vào Danh sách chờ!');
    }
    closeTaskModal(); render(); updateQuickStats();
  }

  function handleDeleteTask() {
    if (!state.editingTaskId) return;
    if (confirm('Xóa công việc này?')) {
      state.tasks = state.tasks.filter(t => t.id !== state.editingTaskId);
      saveData(false); closeTaskModal(); render(); updateQuickStats();
      notify('info', 'Đã xóa công việc!');
    }
  }

  // =========================================================================
  // EXPORT CSV
  // =========================================================================
  function exportToCSV() {
    const headers = ['STT', 'Nhóm', 'Tên công việc', 'Chi tiết', 'Phụ trách', 'Theo dõi', 'Thời hạn', 'Trạng thái'];
    const rows = state.tasks.map((t, i) => [
      t.stt || i + 1, t.category || '', `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.detail || '').replace(/"/g, '""')}"`, `"${(t.assignee_text || '').replace(/"/g, '""')}"`,
      `"${(t.follower_text || '').replace(/"/g, '""')}"`, formatFullDate(t.deadline) || '',
      t.status === 'completed' ? 'Đã xong' : 'Đang làm'
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Cong_Viec_KTAT_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('success', 'Đã xuất file CSV!');
  }

  // =========================================================================
  // SYNC MODAL
  // =========================================================================
  function openSyncModal() {
    if (el.fieldSyncUrl) el.fieldSyncUrl.value = state.cloudApiUrl || '';
    if (el.syncLastTime && state.lastSavedAt) {
      const d = new Date(state.lastSavedAt);
      el.syncLastTime.textContent = d.toLocaleTimeString('vi-VN') + ' ' + d.toLocaleDateString('vi-VN');
    }
    const card = el.syncStatusCard;
    if (card) {
      card.className = 'sync-status-card';
      if (state.cloudApiUrl) {
        card.classList.add('status-synced');
        el.syncStatusIcon.textContent = '🟢';
        el.syncStatusTitle.textContent = 'Hệ thống trực tuyến';
        el.syncStatusDesc.textContent = 'Dữ liệu đồng bộ 2 chiều với Google Sheet.';
      } else {
        card.classList.add('status-local');
        el.syncStatusIcon.textContent = '⚡';
        el.syncStatusTitle.textContent = 'Lưu cục bộ (Ngoại tuyến)';
        el.syncStatusDesc.textContent = 'Dữ liệu lưu trên trình duyệt. Cấu hình máy chủ để đồng bộ đám mây.';
      }
    }
    el.syncModal.classList.add('active');
  }

  function closeSyncModal() { el.syncModal.classList.remove('active'); }

  // =========================================================================
  // HELPERS
  // =========================================================================
  function formatFullDate(dateStr) {
    if (!dateStr) return '';
    dateStr = dateStr.trim();
    const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
    if (m) return `${String(m[1]).padStart(2, '0')}/${String(m[2]).padStart(2, '0')}/${m[3] || '2026'}`;
    return dateStr;
  }

  function getInitials(name) {
    if (!name) return 'VT';
    const w = name.trim().split(/\s+/);
    return w.length === 1 ? w[0].substring(0, 2).toUpperCase() : (w[0][0] + w[w.length - 1][0]).toUpperCase();
  }

  function getShortName(empId) {
    const emp = state.employees.find(e => e.id === empId);
    return emp ? (emp.short_name || emp.name.split(' ').pop()) : '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);
})();
