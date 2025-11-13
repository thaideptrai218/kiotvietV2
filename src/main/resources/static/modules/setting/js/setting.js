document.addEventListener('DOMContentLoaded', () => {
  const els = {
    tableBody: document.getElementById('userTableBody'),
    modal: document.getElementById('createUserModal'),
    modalTitle: document.getElementById('modalTitle'),
    userForm: document.getElementById('userForm'),
    countryBtn: document.getElementById('countryBtn'),
    countryDropdown: document.getElementById('countryDropdown'),
    createBtn: document.getElementById('createBtn'),
    bulkActions: document.getElementById('bulkActions'),
    selectedInfo: document.getElementById('selectedInfo'),
    selectAll: document.querySelector('.settings-table thead input[type="checkbox"]'),
    detailTemplate: document.getElementById('userDetailTemplate'),
    filterSidebar: document.getElementById('filterSidebar'),
    settingsSidebar: document.getElementById('settingsSidebar'),
    btnFilter: document.querySelector('.btn-filter'),
    btnCloseFilter: document.getElementById('btnCloseFilter'),
    btnResetFilter: document.getElementById('btnReset'),
    filterSearch: document.querySelector('#filterSidebar .search-input input'),
    filterRole: document.querySelector('#filterSidebar select'),
    filterStatusBtns: document.querySelectorAll('#filterSidebar .status-btn'),
    btnExport: document.getElementById('btnExport'),
    bulkInactiveBtn: document.querySelector('[data-bulk="inactive"]'),
    bulkDeleteBtn: document.querySelector('[data-bulk="delete"]'),
    formError: null,
    toast: null
  };

  const state = {
    page: 1,
    size: 10,
    status: 'all',
    role: '',
    search: '',
    users: [],
    totalPages: 1,
    selectedIds: new Set(),
    editingId: null,
    editingStatus: 'Active',
    detailRow: null,
    detailAnchor: null,
    detailData: null
  };

  const api = {
    token() {
      return (
        localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') ||
        localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      );
    },
    headers(withJson = true) {
      const h = { Accept: 'application/json' };
      if (withJson) h['Content-Type'] = 'application/json';
      const token = this.token();
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    },
    async request(url, { method = 'GET', body, raw = false } = {}) {
      const opts = {
        method,
        headers: this.headers(body !== undefined && !raw),
        credentials: 'same-origin'
      };
      if (body !== undefined && !raw) {
        opts.body = JSON.stringify(body);
      } else if (body !== undefined) {
        opts.body = body;
      }
      const resp = await fetch(url, opts);
      if (raw) return resp;
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message = payload?.message || (resp.status === 401 ? 'Unauthorized. Please login again.' : 'Request failed');
        throw new Error(message);
      }
      return payload?.data ?? payload;
    }
  };

  init();

  const defaultDialCode = (() => {
    const fallback = els.countryBtn?.querySelector('.dial')?.textContent?.trim();
    return fallback || '+84';
  })();

  function init() {
    buildToast();
    buildFormError();
    initModal();
    initCountryDropdown();
    initCollapsibles();
    initSelectionHandlers();
    initTableHandlers();
    initFilterSidebar();
    initBulkActions();
    initExportButton();
    loadRoles();
    loadUsers();
  }

  function getDialCode() {
    return els.countryBtn?.querySelector('.dial')?.textContent?.trim() || defaultDialCode;
  }

  function setDialCode(code) {
    if (!els.countryBtn) return;
    const dial = code || defaultDialCode;
    let imgHtml = els.countryBtn.querySelector('img')?.outerHTML || '';
    if (els.countryDropdown) {
      let matched = false;
      els.countryDropdown.querySelectorAll('div').forEach((item) => {
        const isMatch = item.dataset.code === dial;
        item.classList.toggle('active', isMatch);
        if (isMatch) {
          matched = true;
          imgHtml = item.querySelector('img')?.outerHTML || imgHtml;
        }
      });
      if (!matched) {
        els.countryDropdown.querySelectorAll('div').forEach((item) => item.classList.remove('active'));
      }
    }
    els.countryBtn.innerHTML = `${imgHtml || ''} <span class="dial">${dial}</span> <i class="fa-solid fa-caret-down"></i>`;
  }

  function splitPhoneValue(fullValue) {
    if (!fullValue) {
      return { dial: getDialCode(), number: '' };
    }
    const match = fullValue.trim().match(/^(\+\d+)\s*(.*)$/);
    if (match) {
      return { dial: match[1], number: match[2].trim() };
    }
    return { dial: getDialCode(), number: fullValue.trim() };
  }

  function buildToast() {
    const toast = document.createElement('div');
    toast.className = 'settings-toast';
    document.body.appendChild(toast);
    els.toast = toast;
  }

  function buildFormError() {
    const err = document.createElement('div');
    err.className = 'form-error';
    els.userForm.prepend(err);
    els.formError = err;
  }

  function showToast(message, type = 'success') {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.remove('success', 'error', 'show');
    els.toast.classList.add(type);
    requestAnimationFrame(() => {
      els.toast.classList.add('show');
      setTimeout(() => els.toast.classList.remove('show'), 3200);
    });
  }

  function showFormError(message) {
    if (!els.formError) return;
    if (message) {
      els.formError.textContent = message;
      els.formError.style.display = 'block';
    } else {
      els.formError.textContent = '';
      els.formError.style.display = 'none';
    }
  }

  function initModal() {
    if (els.createBtn) {
      els.createBtn.addEventListener('click', () => openUserModal());
    }
    els.userForm.addEventListener('submit', handleFormSubmit);
    window.closeCreateModal = closeUserModal;
  }

  function initCountryDropdown() {
    if (!els.countryBtn || !els.countryDropdown) return;
    els.countryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = els.countryDropdown.style.display === 'block';
      els.countryDropdown.style.display = visible ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!els.countryDropdown.contains(e.target) && !els.countryBtn.contains(e.target)) {
        els.countryDropdown.style.display = 'none';
      }
    });
    els.countryDropdown.querySelectorAll('div').forEach((item) => {
      item.addEventListener('click', () => {
        els.countryDropdown.querySelectorAll('div').forEach((d) => d.classList.remove('active'));
        item.classList.add('active');
        const img = item.querySelector('img')?.outerHTML || '';
        const code = item.dataset.code || '';
        els.countryBtn.innerHTML = `${img} <span class="dial">${code}</span> <i class="fa-solid fa-caret-down"></i>`;
        els.countryDropdown.style.display = 'none';
      });
    });
  }

  function initCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach((header) => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('active');
      });
    });
    document.querySelectorAll('.toggle-pass').forEach((icon) => {
      icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye-slash');
      });
    });
  }

  async function loadUsers() {
    try {
      closeDetail();
      const params = new URLSearchParams({
        page: state.page,
        size: state.size,
        status: state.status || 'all'
      });
      if (state.role) params.set('role', state.role);
      if (state.search) params.set('search', state.search);
      const data = await api.request(`/api/users?${params.toString()}`);
      state.users = data.content || [];
      state.totalPages = data.totalPages || 1;
      renderUsers();
    } catch (err) {
      renderUsers([]);
      showToast(err.message, 'error');
    }
  }

  function renderUsers() {
    if (!state.users.length) {
      els.tableBody.innerHTML = `<tr class="empty-row"><td colspan="6" class="text-center">No users found</td></tr>`;
      updateSelection();
      return;
    }

    els.tableBody.innerHTML = state.users
      .map((u) => `
        <tr data-id="${u.id}">
          <td><input type="checkbox" data-id="${u.id}"></td>
          <td>${escapeHtml(u.displayName || u.username || '—')}</td>
          <td>${escapeHtml(u.username || '—')}</td>
          <td>${escapeHtml(u.phone || '—')}</td>
          <td>${escapeHtml(u.role || '—')}</td>
          <td><span class="status ${u.status === 'Active' ? 'active' : 'inactive'}">${u.status || 'Unknown'}</span></td>
        </tr>
      `)
      .join('');

    updateSelection();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
  }

  function initSelectionHandlers() {
    if (els.selectAll) {
      els.selectAll.addEventListener('change', (e) => {
        const checked = e.target.checked;
        els.tableBody
          .querySelectorAll('tr[data-id] input[type="checkbox"]')
          .forEach((cb) => {
            cb.checked = checked;
          });
        updateSelection();
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.id === 'clearSelection') {
        els.selectAll.checked = false;
        els.tableBody.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
        updateSelection();
      }
    });
  }

  function updateSelection() {
    state.selectedIds.clear();
    els.tableBody.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
      state.selectedIds.add(Number(cb.dataset.id));
    });
    const selectedCount = state.selectedIds.size;
    const totalBoxes = els.tableBody.querySelectorAll('tr[data-id] input[type="checkbox"]').length;
    if (els.selectAll) {
      els.selectAll.checked = selectedCount > 0 && selectedCount === totalBoxes;
    }
    if (selectedCount > 0) {
      els.selectedInfo.style.display = 'inline-block';
      els.selectedInfo.innerHTML = `Selected ${selectedCount} <i class="fa-solid fa-xmark" id="clearSelection"></i>`;
      els.bulkActions.style.display = 'flex';
      els.createBtn.style.display = 'none';
    } else {
      els.selectedInfo.style.display = 'none';
      els.bulkActions.style.display = 'none';
      els.createBtn.style.display = 'inline-flex';
    }
  }

  function initTableHandlers() {
    els.tableBody.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        e.stopPropagation();
        updateSelection();
      }
    });

    els.tableBody.addEventListener('click', (e) => {
      if (e.target.closest('.user-detail-row') || e.target.closest('.detail-box')) {
        return;
      }
      if (e.target.matches('input[type="checkbox"]')) return;
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      if (state.detailAnchor === row) {
        closeDetail();
        return;
      }
      openDetail(row);
    });
  }

  async function openDetail(row) {
    closeDetail();
    state.detailAnchor = row;
    const clone = els.detailTemplate.cloneNode(true);
    clone.style.display = 'table-row';
    clone.id = '';
    row.insertAdjacentElement('afterend', clone);
    state.detailRow = clone;
    try {
      const id = Number(row.dataset.id);
      const detail = await api.request(`/api/users/${id}`);
      state.detailData = detail;
      fillDetail(clone, detail);
      bindDetailActions(clone);
    } catch (err) {
      showToast(err.message, 'error');
      closeDetail();
    }
  }

  function fillDetail(container, detail) {
    container.querySelector('[data-field="displayName"]').textContent = detail.displayName || '—';
    container.querySelector('[data-field="username"]').textContent = detail.username || '—';
    container.querySelector('[data-field="email"]').textContent = detail.email || '—';
    container.querySelector('[data-field="phone"]').textContent = detail.phone || '—';
    container.querySelector('[data-field="status"]').textContent = detail.status || '—';
    container.querySelector('[data-field="birthday"]').textContent = detail.birthday || '—';
    container.querySelector('[data-field="address"]').textContent = detail.address || '—';
    const noteWrapper = container.querySelector('[data-field="note"] span');
    if (noteWrapper) {
      noteWrapper.textContent = detail.note || 'No note';
    }
    const toggleBtn = container.querySelector('[data-action="toggle-status"]');
    if (toggleBtn) {
      toggleBtn.innerHTML = `<i class="fa-solid fa-lock"></i> ${detail.status === 'Active' ? 'Inactive' : 'Active'}`;
    }
    setPasswordFeedback('', null);
  }

  function bindDetailActions(container) {
    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (!state.detailData) return;
        switch (action) {
          case 'edit':
            openUserModal(state.detailData);
            break;
          case 'delete':
            deleteUser(state.detailData.id);
            break;
          case 'copy':
            copyToClipboard(`${state.detailData.displayName || ''} (${state.detailData.username || ''})`);
            break;
          case 'password':
            changePassword(state.detailData.id);
            break;
          case 'toggle-status':
            toggleStatus(state.detailData);
            break;
          default:
            break;
        }
      });
    });
  }

  function closeDetail() {
    if (state.detailRow) {
      state.detailRow.remove();
    }
    state.detailRow = null;
    state.detailAnchor = null;
    state.detailData = null;
  }

  function openUserModal(detail) {
    state.editingId = detail?.id || null;
    state.editingStatus = detail?.status || 'Active';
    els.modalTitle.textContent = detail ? 'Edit user account' : 'Create user account';
    els.userForm.reset();
    showFormError('');
    els.userForm.elements.status.value = state.editingStatus || 'Active';
    setPasswordRequired(!detail);
    if (detail) {
      els.userForm.elements.displayName.value = detail.displayName || '';
      els.userForm.elements.username.value = detail.username || '';
      els.userForm.elements.email.value = detail.email || '';
      const phoneParts = splitPhoneValue(detail.phone);
      setDialCode(phoneParts.dial);
      els.userForm.elements.phone.value = phoneParts.number;
      els.userForm.elements.role.value = detail.role || '';
      if (detail.birthday) els.userForm.elements.birthday.value = detail.birthday;
      els.userForm.elements.address.value = detail.address || '';
      els.userForm.elements.note.value = detail.note || '';
    } else {
      setDialCode(defaultDialCode);
      els.userForm.elements.phone.value = '';
    }
    els.modal.style.display = 'flex';
  }

  function closeUserModal() {
    els.modal.style.display = 'none';
    state.editingId = null;
    state.editingStatus = 'Active';
    showFormError('');
  }

  function setPasswordRequired(required) {
    const passwordInput = els.userForm.querySelector('input[name="password"]');
    const rePasswordInput = els.userForm.querySelector('input[name="rePassword"]');
    passwordInput.required = required;
    rePasswordInput.required = required;
    if (!required) {
      passwordInput.value = '';
      rePasswordInput.value = '';
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const payload = buildPayload();
    if (!payload.displayName || !payload.username || !payload.email) {
      showFormError('Display name, username and email are required.');
      return;
    }
    if (!state.editingId && !payload.password) {
      showFormError('Password is required for new users.');
      return;
    }
    if (payload.password && payload.password !== payload.rePassword) {
      showFormError('Passwords do not match.');
      return;
    }
    if (!payload.password) {
      delete payload.password;
    }
    delete payload.rePassword;
    showFormError('');
    toggleFormSaving(true);
    try {
      if (state.editingId) {
        await api.request(`/api/users/${state.editingId}`, { method: 'PUT', body: payload });
        showToast('User updated successfully');
      } else {
        await api.request('/api/users', { method: 'POST', body: payload });
        showToast('User created successfully');
      }
      closeUserModal();
      loadUsers();
    } catch (err) {
      showFormError(err.message);
    } finally {
      toggleFormSaving(false);
    }
  }

  function buildPayload() {
    const form = els.userForm;
    const dialCode = getDialCode();
    const phoneInput = form.phone.value.trim();
    let phone = phoneInput;
    if (phoneInput && !phoneInput.startsWith('+') && dialCode) {
      phone = `${dialCode} ${phoneInput}`.trim();
    }
    return {
      displayName: form.displayName.value.trim(),
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      phone: phone || '',
      role: form.role.value || '',
      status: form.status.value || 'Active',
      password: form.password.value.trim(),
      rePassword: form.rePassword.value.trim(),
      birthday: form.birthday.value || null,
      address: form.address.value.trim() || null,
      note: form.note.value.trim() || null
    };
  }

  function toggleFormSaving(saving) {
    const saveBtn = els.userForm.querySelector('.btn-save');
    saveBtn.disabled = saving;
    saveBtn.textContent = saving ? 'Saving...' : 'Save';
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.request(`/api/users/${id}`, { method: 'DELETE' });
      showToast('User deleted', 'success');
      closeDetail();
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function changePassword(id) {
    const password = prompt('Enter new password');
    if (!password) return;
    try {
      const response = await api.request(`/api/users/${id}/password`, { method: 'PUT', body: { password } });
      const message = response?.message || 'Password updated successfully';
      setPasswordFeedback(message, 'success');
      showToast(message, 'success');
    } catch (err) {
      const msg = err.message || 'Change password failed';
      setPasswordFeedback(msg, 'error');
      showToast(msg, 'error');
    }
  }

  async function toggleStatus(detail) {
    const nextStatus = detail.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.request('/api/users/status', {
        method: 'PUT',
        body: { ids: [detail.id], status: nextStatus }
      });
      showToast(`User marked as ${nextStatus}`, 'success');
      closeDetail();
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard', 'success'));
    } else {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('Copied to clipboard', 'success');
    }
  }

  function initFilterSidebar() {
    if (els.btnFilter) {
      els.btnFilter.addEventListener('click', () => {
        if (els.settingsSidebar) els.settingsSidebar.style.display = 'none';
        if (els.filterSidebar) els.filterSidebar.style.display = 'flex';
      });
    }
    if (els.btnCloseFilter) {
      els.btnCloseFilter.addEventListener('click', () => {
        if (els.filterSidebar) els.filterSidebar.style.display = 'none';
        if (els.settingsSidebar) els.settingsSidebar.style.display = '';
      });
    }
    if (els.btnResetFilter) {
      els.btnResetFilter.addEventListener('click', () => {
        state.search = '';
        state.role = '';
        state.status = 'all';
        state.page = 1;
        if (els.filterSearch) els.filterSearch.value = '';
        if (els.filterRole) els.filterRole.selectedIndex = 0;
        els.filterStatusBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.status === 'all'));
        loadUsers();
      });
    }
    if (els.filterSearch) {
      let timer;
      els.filterSearch.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.search = els.filterSearch.value.trim();
          state.page = 1;
          loadUsers();
        }, 400);
      });
    }
    if (els.filterRole) {
      els.filterRole.addEventListener('change', () => {
        state.role = els.filterRole.value;
        state.page = 1;
        loadUsers();
      });
    }
    els.filterStatusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        els.filterStatusBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.status = btn.dataset.status || 'all';
        state.page = 1;
        loadUsers();
      });
    });
  }

  function initBulkActions() {
    if (els.bulkDeleteBtn) {
      els.bulkDeleteBtn.addEventListener('click', async () => {
        if (!state.selectedIds.size) {
          showToast('Select at least one user.', 'error');
          return;
        }
        if (!confirm('Delete selected users?')) return;
        try {
          await api.request('/api/users', { method: 'DELETE', body: Array.from(state.selectedIds) });
          showToast('Users deleted', 'success');
          state.selectedIds.clear();
          loadUsers();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }
    if (els.bulkInactiveBtn) {
      els.bulkInactiveBtn.addEventListener('click', async () => {
        if (!state.selectedIds.size) {
          showToast('Select at least one user.', 'error');
          return;
        }
        try {
          await api.request('/api/users/status', {
            method: 'PUT',
            body: { ids: Array.from(state.selectedIds), status: 'Inactive' }
          });
          showToast('Users marked as inactive', 'success');
          state.selectedIds.clear();
          loadUsers();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }
  }

  function initExportButton() {
    if (els.btnExport) {
      els.btnExport.addEventListener('click', () => exportTable());
    }
  }

  async function loadRoles() {
    try {
      const roles = await api.request('/api/roles');
      applyRoleOptions(roles);
    } catch (err) {
      console.warn('Unable to load roles', err);
    }
  }

  function applyRoleOptions(roles = []) {
    const modalSelect = els.userForm.querySelector('select[name="role"]');
    const filterSelect = els.filterRole;
    if (modalSelect) {
      const current = modalSelect.value;
      modalSelect.innerHTML = '<option value="">Select role</option>' + roles.map((r) => `<option value="${r.name}">${r.name}</option>`).join('');
      modalSelect.value = current;
    }
    if (filterSelect) {
      const current = filterSelect.value;
      filterSelect.innerHTML = '<option value="">Select role</option>' + roles.map((r) => `<option value="${r.name}">${r.name}</option>`).join('');
      filterSelect.value = current;
    }
  }

  function exportTable() {
    const table = document.querySelector('.settings-table');
    if (!table) return;
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.table_to_sheet(table);
    const range = XLSX.utils.decode_range(ws['!ref']);
    ws['!cols'] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      ws['!cols'][C] = { wch: 18 };
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users_export.xlsx');
  }

  function setPasswordFeedback(message, type) {
    if (!state.detailRow) return;
    const el = state.detailRow.querySelector('[data-feedback="password"]');
    if (!el) return;
    el.classList.remove('success', 'error');
    if (!message) {
      el.style.display = 'none';
      el.textContent = '';
      return;
    }
    el.textContent = message;
    el.style.display = 'block';
    el.classList.add(type === 'error' ? 'error' : 'success');
  }
});
