(() => {
  const api = {
    base: '/api/suppliers',
    headers() {
      const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    }
  };

  const els = {
    active: document.getElementById('active'),
    debtMin: document.getElementById('debtMin'),
    debtMax: document.getElementById('debtMax'),
    createdFrom: document.getElementById('createdFrom'),
    createdTo: document.getElementById('createdTo'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnAdd: document.getElementById('btnAdd'),
    hdrSearch: document.getElementById('hdrSearch'),
    btnResetColumns: document.getElementById('btnResetColumns'),
    colCode: document.getElementById('colCode'),
    colName: document.getElementById('colName'),
    colPhone: document.getElementById('colPhone'),
    colGroup: document.getElementById('colGroup'),
    colEmail: document.getElementById('colEmail'),
    colAddress: document.getElementById('colAddress'),
    colCity: document.getElementById('colCity'),
    colWard: document.getElementById('colWard'),
    colStatus: document.getElementById('colStatus'),
    btnApplyFilters: document.getElementById('btnApplyFilters'),
    btnClearFilters: document.getElementById('btnClearFilters'),
    btnToggleFilter: document.getElementById('btnToggleFilter'),
    btnCollapseFilter: document.getElementById('btnCollapseFilter'),
    filterPanel: document.getElementById('filterPanel'),
    tblBody: document.querySelector('#tbl tbody'),
    tblHead: document.querySelector('#tbl thead'),
    pagi: document.getElementById('pagi'),
    pageInfo: document.getElementById('pageInfo'),
    sizeSel: document.getElementById('sizeSel'),
    alert: document.getElementById('alert'),
    chips: document.getElementById('chips'),
    hdrNormal: document.getElementById('hdrNormal'),
    hdrBulk: document.getElementById('hdrBulk'),
    selCount: document.getElementById('selCount'),
    chkAll: document.getElementById('chkAll'),

    // Edit modal
    modal: new bootstrap.Modal(document.getElementById('editModal')),
    modalTitle: document.getElementById('modalTitle'),
    modalErr: document.getElementById('modalErr'),
    supplierId: document.getElementById('supplierId'),
    name: document.getElementById('name'),
    contactPerson: document.getElementById('contactPerson'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    address: document.getElementById('address'),
    btnSave: document.getElementById('btnSave'),
    btnSaveNew: document.getElementById('btnSaveNew'),
    // Import modal
    importModal: document.getElementById('importModal') ? new bootstrap.Modal(document.getElementById('importModal')) : null,
    btnImport: document.getElementById('btnImport'),
    fileExcel: document.getElementById('fileExcel'),
    btnImportUpload: document.getElementById('btnImportUpload'),
    btnDownloadTemplate: document.getElementById('btnDownloadTemplate'),
    btnDownloadCsv: document.getElementById('btnDownloadCsv'),
    importErr: document.getElementById('importErr')
  };

  const state = { page: 0, size: 15, sortBy: 'name', sortDir: 'asc', loading: false, selected: new Set(), expanded: new Set(), columns: { code: false, name: true, phone: true, group: false, email: true, address: true, city: false, ward: false, status: true } };
  let currentAbort = null;

  const storageKey = () => {
    try {
      const token = api.headers().Authorization?.split(' ')[1];
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return `suppliers.columns.v1.${payload.companyId || 'default'}`;
      }
    } catch { }
    return 'suppliers.columns.v1.default';
  };

  function loadColumns() {
    try { const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}'); if (saved && typeof saved === 'object') state.columns = { ...state.columns, ...saved }; } catch { }
    els.colCode.checked = !!state.columns.code;
    els.colName.checked = !!state.columns.name;
    els.colPhone.checked = !!state.columns.phone;
    els.colGroup.checked = !!state.columns.group;
    els.colEmail.checked = !!state.columns.email;
    els.colAddress.checked = !!state.columns.address;
    els.colCity.checked = !!state.columns.city;
    els.colWard.checked = !!state.columns.ward;
    els.colStatus.checked = !!state.columns.status;
    applyColumnVisibility();
  }

  function saveColumns() { localStorage.setItem(storageKey(), JSON.stringify(state.columns)); }

  function applyColumnVisibility() {
    const map = state.columns;
    document.querySelectorAll('th[data-col], td[data-col]').forEach(el => {
      const key = el.getAttribute('data-col');
      el.classList.toggle('col-hidden', map[key] === false);
    });
  }

  function showAlert(msg, type = 'success') {
    els.alert.className = `alert alert-${type}`;
    els.alert.textContent = msg;
    els.alert.classList.remove('d-none');
    setTimeout(() => els.alert.classList.add('d-none'), 2500);
  }

  function fmt(val) { return val ?? ''; }

  function authGuard(resp) { if (resp.status === 401) throw new Error('Unauthorized. Please login again.'); return resp; }

  function loadFromUrl() {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q') || '';
    const sortBy = p.get('sortBy') || state.sortBy;
    const sortDir = p.get('sortDir') || state.sortDir;
    const page1 = parseInt(p.get('page') || '1', 10);
    const size = parseInt(p.get('size') || state.size, 10);
    const debtMin = p.get('debtMin') || '';
    const debtMax = p.get('debtMax') || '';
    const createdFrom = p.get('createdFrom') || '';
    const createdTo = p.get('createdTo') || '';
    const active = p.get('active');
    if (els.hdrSearch) els.hdrSearch.value = q;
    if (els.debtMin) els.debtMin.value = debtMin;
    if (els.debtMax) els.debtMax.value = debtMax;
    if (els.createdFrom) els.createdFrom.value = createdFrom;
    if (els.createdTo) els.createdTo.value = createdTo;
    if (active !== null) els.active.value = active;
    state.sortBy = sortBy || null;
    state.sortDir = sortDir || 'asc';
    state.page = isNaN(page1) ? 0 : Math.max(page1 - 1, 0);
    state.size = isNaN(size) ? state.size : size;
    if (els.sizeSel) els.sizeSel.value = String(state.size);
  }

  function updateUrl() {
    const p = new URLSearchParams();
    if (els.hdrSearch && els.hdrSearch.value.trim()) p.set('q', els.hdrSearch.value.trim());
    if (state.sortBy) { p.set('sortBy', state.sortBy); p.set('sortDir', state.sortDir); }
    p.set('page', String(state.page + 1));
    p.set('size', String(state.size));
    if (els.debtMin && els.debtMin.value.trim()) p.set('debtMin', els.debtMin.value.trim());
    if (els.debtMax && els.debtMax.value.trim()) p.set('debtMax', els.debtMax.value.trim());
    if (els.createdFrom && els.createdFrom.value) p.set('createdFrom', els.createdFrom.value);
    if (els.createdTo && els.createdTo.value) p.set('createdTo', els.createdTo.value);
    if (els.active.value !== '') p.set('active', els.active.value);
    const url = `${location.pathname}?${p.toString()}`;
    history.replaceState(null, '', url);
  }

  async function fetchList() {
    state.loading = true;
    const params = new URLSearchParams();
    if (els.hdrSearch && els.hdrSearch.value.trim()) params.set('search', els.hdrSearch.value.trim());
    if (els.active.value !== '') params.set('active', els.active.value);
    if (els.debtMin && els.debtMin.value.trim()) params.set('minDebt', els.debtMin.value.trim());
    if (els.debtMax && els.debtMax.value.trim()) params.set('maxDebt', els.debtMax.value.trim());
    if (els.createdFrom && els.createdFrom.value) params.set('createdFrom', els.createdFrom.value);
    if (els.createdTo && els.createdTo.value) params.set('createdTo', els.createdTo.value);
    params.set('page', state.page);
    params.set('size', state.size);
    if (state.sortBy) { params.set('sortBy', state.sortBy); params.set('sortDir', state.sortDir); }
    updateUrl();
    if (currentAbort) currentAbort.abort();
    currentAbort = new AbortController();
    const resp = await fetch(`${api.base}?${params.toString()}`, { headers: api.headers(), signal: currentAbort.signal }).then(authGuard);
    const body = await resp.json();
    const data = body.data || body;
    renderChips();
    const items = data.items || data.content || [];
    if (items.length === 0 && state.page > 0 && (data.totalElements ?? 0) > 0) { state.page = state.page - 1; return fetchList(); }
    renderTable(items);
    renderPagination(data.currentPage ?? data.page ?? state.page, data.totalPages ?? Math.ceil((data.totalElements || 0) / state.size));
    const total = data.totalElements ?? 0;
    const from = total === 0 ? 0 : (state.page * state.size + 1);
    const to = Math.min((state.page + 1) * state.size, total);
    els.pageInfo.textContent = `${from}-${to} of ${total}`;
    state.loading = false;
  }

  function renderTable(items) {
    if (!items.length) { els.tblBody.innerHTML = `<tr><td colspan="7" class="table-empty"><i class="far fa-box-open me-2"></i> No suppliers found</td></tr>`; return; }
    const rows = [];
    for (const s of items) {
      const checked = state.selected.has(String(s.id)) ? 'checked' : '';
      const isExpanded = state.expanded.has(String(s.id));
      rows.push(`
        <tr data-id="${s.id}" tabindex="0" aria-expanded="${isExpanded}">
          <td><input type="checkbox" class="row-check" ${checked}></td>
          <td data-col="code" title="${fmt(s.taxCode)}">${fmt(s.taxCode)}</td>
          <td class="fw-semibold" data-col="name" title="${fmt(s.name)}">${fmt(s.name)}</td>
          <td data-col="phone" title="${fmt(s.phone)}">${fmt(s.phone)}</td>
          <td data-col="group"></td>
          <td data-col="email" title="${fmt(s.email)}">${fmt(s.email)}</td>
          <td data-col="address" title="${fmt(s.address)}">${fmt(s.address)}</td>
          <td data-col="city"></td>
          <td data-col="ward"></td>
          <td data-col="status"><span class="badge badge-status ${s.isActive ? 'active' : 'inactive'}">${s.isActive ? 'Active' : 'Inactive'}</span></td>
        </tr>
        ${isExpanded ? expandedRow(s) : ''}
      `);
    }
    els.tblBody.innerHTML = rows.join('');
    applyColumnVisibility();
    syncHeaderCheckbox();
  }

  function expandedRow(s) {
    const isActive = !!s.isActive;
    const toggleLabel = isActive ? 'Deactivate' : 'Activate';
    const toggleClass = isActive ? 'btn btn-warning btn-sm' : 'btn btn-success btn-sm';
    const toggleIcon = isActive ? '<i class="fas fa-pause me-1"></i>' : '<i class="fas fa-play me-1"></i>';
    return `
      <tr class="expanded-row" data-id="${s.id}-exp">
        <td></td>
        <td colspan="9">
          <div class="expanded-content">
            <div class="row g-3 align-items-start">
              <div class="col-md-8 text-muted small">
                <div><span class="fw-semibold">Tax code:</span> ${fmt(s.taxCode)}</div>
                <div><span class="fw-semibold">Website:</span> ${fmt(s.website)}</div>
                <div><span class="fw-semibold">Notes:</span> ${fmt(s.notes)}</div>
                <div><span class="fw-semibold">Credit limit:</span> ${fmt(s.creditLimit)}</div>
                <div><span class="fw-semibold">Outstanding:</span> ${fmt(s.outstandingBalance)}</div>
              </div>
              <div class="col-md-4 d-flex justify-content-end gap-2">
                <button class="btn btn-primary btn-sm" data-act="edit"><i class="far fa-pen-to-square me-1"></i>Update</button>
                <button class="${toggleClass}" data-act="toggleActive">${toggleIcon}${toggleLabel}</button>
              </div>
            </div>
          </div>
        </td>
      </tr>`;
  }

  function renderPagination(page, totalPages) {
    const p = Math.max(0, page | 0);
    const t = Math.max(1, totalPages | 0);
    const items = [];
    const disabledPrev = p === 0 ? 'disabled' : '';
    const disabledNext = p >= t - 1 ? 'disabled' : '';
    items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" data-page="0">First</a></li>`);
    items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" data-page="${p - 1}">Prev</a></li>`);
    const start = Math.max(0, p - 2), end = Math.min(t - 1, p + 2);
    for (let i = start; i <= end; i++) { items.push(`<li class="page-item ${i === p ? 'active' : ''}"><a class="page-link" data-page="${i}">${i + 1}</a></li>`); }
    items.push(`<li class="page-item ${disabledNext}"><a class="page-link" data-page="${p + 1}">Next</a></li>`);
    items.push(`<li class="page-item ${disabledNext}"><a class="page-link" data-page="${t - 1}">Last</a></li>`);
    els.pagi.innerHTML = items.join('');
  }

  function openModal(data) {
    els.modalTitle.textContent = data?.id ? 'Edit Supplier' : 'New Supplier';
    els.supplierId.value = data?.id || '';
    els.name.value = data?.name || '';
    els.contactPerson.value = data?.contactPerson || '';
    els.phone.value = data?.phone || '';
    els.email.value = data?.email || '';
    els.address.value = data?.address || '';
    const taxInput = document.getElementById('modalTaxCode');
    const websiteInput = document.getElementById('website');
    const notesInput = document.getElementById('notes');
    const creditInput = document.getElementById('creditLimit');
    const isActive = document.getElementById('isActive');
    if (taxInput) taxInput.value = data?.taxCode || '';
    if (websiteInput) websiteInput.value = data?.website || '';
    if (notesInput) notesInput.value = data?.notes || '';
    if (isActive) isActive.checked = (data?.isActive ?? true) === true;
    if (creditInput) creditInput.value = (data?.creditLimit ?? '') || '';
    if (els.btnSaveNew) els.btnSaveNew.classList.toggle('d-none', !!data?.id); 
    if (els.btnSave) els.btnSave.classList.toggle('d-none', !data?.id);
    els.modalErr.classList.add('d-none');
    els.modal.show();
  }

  function setSaving(saving) { els.btnSave.disabled = saving; els.btnSave.querySelector('.default-text').classList.toggle('d-none', saving); els.btnSave.querySelector('.loading-text').classList.toggle('d-none', !saving); }

  async function save() {
    const id = els.supplierId.value;
    const payload = {
      name: els.name.value.trim(),
      contactPerson: els.contactPerson.value.trim() || null,
      phone: els.phone.value.trim() || null,
      email: els.email.value.trim() || null,
      address: els.address.value.trim() || null,
      taxCode: (document.getElementById('modalTaxCode')?.value || '').trim() || null,
      website: (document.getElementById('website')?.value || '').trim() || null,
      notes: (document.getElementById('notes')?.value || '').trim() || null,
      isActive: document.getElementById('isActive')?.checked ?? true
    };
    // Attach credit limit if provided (validated non-negative number)
    const clRaw = (document.getElementById('creditLimit')?.value ?? '').toString().trim();
    if (clRaw !== '') {
      const clNum = Number(clRaw);
      if (Number.isNaN(clNum) || clNum < 0) {
        els.modalErr.textContent = 'Credit limit must be a number >= 0';
        els.modalErr.classList.remove('d-none');
        return;
      }
      payload.creditLimit = clNum;
    }
    if (!payload.name) { els.modalErr.textContent = 'Name is required'; els.modalErr.classList.remove('d-none'); return; }
    setSaving(true);
    try {
      const url = id ? `${api.base}/${id}` : api.base;
      const method = id ? 'PUT' : 'POST';
      const resp = await fetch(url, { method, headers: api.headers(), body: JSON.stringify(payload) }).then(authGuard);
      const body = await resp.json();
      if (resp.ok) { els.modal.hide(); showAlert(id ? 'Supplier updated' : 'Supplier created', 'success'); fetchList(); }
      else { throw new Error(body?.message || 'Save failed'); }
    } catch (e) { els.modalErr.textContent = e.message || 'Error'; els.modalErr.classList.remove('d-none'); }
    finally { setSaving(false); }
  }

  async function doDelete(id) {
    if (!confirm('Delete this supplier?')) return;
    const resp = await fetch(`${api.base}/${id}`, { method: 'DELETE', headers: api.headers() }).then(authGuard);
    if (resp.ok) { showAlert('Supplier deleted', 'success'); fetchList(); }
    else { const body = await resp.json().catch(() => ({})); showAlert(body?.message || 'Delete failed', 'danger'); }
  }

  function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); }; }

  function updateSortHeaders() {
    document.querySelectorAll('th.sortable').forEach(th => { th.classList.remove('active', 'asc', 'desc'); th.setAttribute('aria-sort', 'none'); if (th.dataset.sort === state.sortBy) { th.classList.add('active', state.sortDir); th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending'); } });
  }

  function syncHeaderCheckbox() {
    const checks = els.tblBody.querySelectorAll('input.row-check');
    if (!checks.length) { els.chkAll.checked = false; els.chkAll.indeterminate = false; return; }
    const checked = [...checks].filter(c => c.checked).length;
    els.chkAll.checked = checked === checks.length;
    els.chkAll.indeterminate = checked > 0 && checked < checks.length;
  }

  function updateHeaderMode() { const count = state.selected.size; els.selCount.textContent = count; els.hdrBulk.classList.toggle('d-none', count === 0); els.hdrNormal.classList.toggle('d-none', count > 0); }

  function renderChips() {
    const chips = [];
    if (els.hdrSearch && els.hdrSearch.value.trim()) chips.push(chip('Search', els.hdrSearch.value.trim(), () => { els.hdrSearch.value = ''; fetchList(); }));
    if (els.active.value !== '') chips.push(chip('Status', els.active.value === 'true' ? 'Active' : 'Inactive', () => { els.active.value = ''; fetchList(); }));
    if (els.debtMin && els.debtMin.value.trim()) chips.push(chip('Debt ≥', els.debtMin.value.trim(), () => { els.debtMin.value = ''; fetchList(); }));
    if (els.debtMax && els.debtMax.value.trim()) chips.push(chip('Debt ≤', els.debtMax.value.trim(), () => { els.debtMax.value = ''; fetchList(); }));
    if (els.createdFrom && els.createdFrom.value) chips.push(chip('Created from', els.createdFrom.value, () => { els.createdFrom.value = ''; fetchList(); }));
    if (els.createdTo && els.createdTo.value) chips.push(chip('Created to', els.createdTo.value, () => { els.createdTo.value = ''; fetchList(); }));
    els.chips.innerHTML = chips.join('');
  }

  function chip(label, value, onRemove) { const id = `chip_${Math.random().toString(36).slice(2)}`; setTimeout(() => { const btn = document.getElementById(id); if (btn) btn.addEventListener('click', onRemove); }, 0); return `<span class="chip"><span class="text-muted">${label}:</span> ${value} <button id="${id}" aria-label="Remove"><i class="fas fa-times"></i></button></span>`; }
  // Ensure modal exists before binding
  if (els.btnAdd && els.modal) {
    els.btnAdd.addEventListener('click', () => openModal());
  }

  // Events
  els.btnRefresh?.addEventListener('click', () => fetchList());
  // removed sidebar search input
  els.active?.addEventListener('change', () => { state.page = 0; fetchList(); });
  els.contact?.addEventListener('input', debounce(() => { state.page = 0; fetchList(); }, 300));
  els.taxCode?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); state.page = 0; fetchList(); } });
  els.btnApplyFilters?.addEventListener('click', () => { state.page = 0; fetchList(); });
  els.btnClearFilters?.addEventListener('click', () => {
    if (els.hdrSearch) els.hdrSearch.value = '';
    if (els.active) els.active.value = '';
    if (els.debtMin) els.debtMin.value = '';
    if (els.debtMax) els.debtMax.value = '';
    if (els.createdFrom) els.createdFrom.value = '';
    if (els.createdTo) els.createdTo.value = '';
    state.page = 0;
    fetchList();
  });
  els.btnToggleFilter?.addEventListener('click', () => els.filterPanel.classList.toggle('collapsed'));
  els.btnCollapseFilter?.addEventListener('click', () => els.filterPanel.classList.toggle('collapsed'));
  els.pagi?.addEventListener('click', (e) => { const a = e.target.closest('a.page-link'); if (!a) return; const p = parseInt(a.dataset.page, 10); if (isNaN(p) || p < 0) return; state.page = p; state.selected.clear(); state.expanded.clear(); fetchList(); });
  els.sizeSel?.addEventListener('change', () => { state.size = parseInt(els.sizeSel.value, 10) || 15; state.page = 0; fetchList(); });
  els.tblBody?.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const rawId = tr.dataset.id; const id = String(rawId).includes('-exp') ? String(rawId).split('-')[0] : String(rawId);
    if (e.target.matches('input.row-check')) { if (e.target.checked) state.selected.add(id); else state.selected.delete(id); syncHeaderCheckbox(); updateHeaderMode(); return; }
    const btn = e.target.closest('button[data-act]');
    if (btn) {
      const act = btn.dataset.act; if (act === 'edit') { fetch(`${api.base}/${id}`, { headers: api.headers() }).then(authGuard).then(r => r.json()).then(body => openModal(body.data || body)).catch(err => showAlert(err.message, 'danger')); return; }
      if (act === 'delete') { doDelete(id); return; }
      if (act === 'toggleActive') { const badge = document.querySelector(`tr[data-id="${id}"] [data-col="status"] .badge-status`); const isActive = badge?.classList.contains('active'); fetch(`${api.base}/${id}`, { method: 'PUT', headers: api.headers(), body: JSON.stringify({ isActive: !isActive }) }).then(authGuard).then(r => r.ok ? r.json() : r.json().then(b => Promise.reject(new Error(b?.message || 'Toggle failed')))).then(() => { showAlert('Status updated', 'success'); fetchList(); }).catch(e2 => showAlert(e2.message, 'danger')); return; }
    }
    // toggle expand/collapse on row click
    if (state.expanded.has(id)) { state.expanded.clear(); }
    else { state.expanded.clear(); state.expanded.add(id); }
    fetchList();
  });
  els.tblHead?.addEventListener('click', (e) => { const th = e.target.closest('th.sortable'); if (!th) return; const key = th.dataset.sort; if (!key) return; if (state.sortBy === key) { if (state.sortDir === 'asc') state.sortDir = 'desc'; else { state.sortBy = null; state.sortDir = 'asc'; } } else { state.sortBy = key; state.sortDir = 'asc'; } updateSortHeaders(); state.expanded.clear(); fetchList(); });
  els.chkAll?.addEventListener('change', (e) => { const checks = els.tblBody.querySelectorAll('input.row-check'); if (e.target.checked) { checks.forEach(c => state.selected.add(String(c.closest('tr')?.dataset.id))); } else { checks.forEach(c => state.selected.delete(String(c.closest('tr')?.dataset.id))); } checks.forEach(c => c.checked = e.target.checked); updateHeaderMode(); });
  document.getElementById('btnClearSel')?.addEventListener('click', () => { state.selected.clear(); syncHeaderCheckbox(); updateHeaderMode(); fetchList(); });
  document.getElementById('btnBulkDelete')?.addEventListener('click', async () => { const ids = [...state.selected]; if (!ids.length) return; if (!confirm(`Delete ${ids.length} suppliers?`)) return; try { for (const id of ids) { const resp = await fetch(`${api.base}/${id}`, { method: 'DELETE', headers: api.headers() }); if (!resp.ok) throw new Error('Delete failed'); } showAlert('Deleted selected suppliers', 'success'); state.selected.clear(); updateHeaderMode(); fetchList(); } catch (e2) { showAlert(e2.message || 'Bulk delete failed', 'danger'); } });
  els.hdrSearch?.addEventListener('input', debounce(() => { state.page = 0; fetchList(); }, 300));
  els.hdrSearch?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); state.page = 0; fetchList(); } });
  els.btnSave?.addEventListener('click', save);
  els.btnSaveNew?.addEventListener('click', async () => { els.supplierId.value = ''; await save(); els.modal.show(); document.getElementById('frm').reset(); document.getElementById('isActive').checked = true; });
  els.btnImport?.addEventListener('click', () => { els.importErr?.classList.add('d-none'); if (els.fileExcel) els.fileExcel.value = ''; els.importModal?.show(); });
  els.btnImportUpload?.addEventListener('click', async () => {
    const f = els.fileExcel?.files?.[0];
    const txt = document.getElementById('importText')?.value?.trim();
    let fileToSend = f;
    if (!fileToSend && txt) {
      const blob = new Blob([txt], { type: 'text/csv' });
      fileToSend = new File([blob], 'suppliers.csv', { type: 'text/csv' });
    }
    if (!fileToSend) { if (els.importErr) { els.importErr.textContent = 'Please choose a file or paste CSV'; els.importErr.classList.remove('d-none'); } return; }
    const fd = new FormData(); fd.append('file', fileToSend);
    try {
      const resp = await fetch(`${api.base}/bulk`, { method: 'POST', headers: { 'Authorization': api.headers().Authorization }, body: fd }).then(authGuard);
      if (!resp.ok) { const body = await resp.json().catch(() => ({})); throw new Error(body?.message || 'Upload failed'); }
      els.importModal?.hide(); showAlert('Import started', 'success'); fetchList();
    } catch (e2) { if (els.importErr) { els.importErr.textContent = e2.message || 'Upload failed'; els.importErr.classList.remove('d-none'); } }
  });

  function bindColToggle(input, key) { input?.addEventListener('change', () => { state.columns[key] = input.checked; if (!input.checked && state.sortBy === key) { state.sortBy = null; updateSortHeaders(); } saveColumns(); applyColumnVisibility(); fetchList(); }); }
  bindColToggle(els.colCode, 'code');
  bindColToggle(els.colName, 'name');
  bindColToggle(els.colPhone, 'phone');
  bindColToggle(els.colGroup, 'group');
  bindColToggle(els.colEmail, 'email');
  bindColToggle(els.colAddress, 'address');
  bindColToggle(els.colCity, 'city');
  bindColToggle(els.colWard, 'ward');
  bindColToggle(els.colStatus, 'status');
  els.btnResetColumns?.addEventListener('click', () => { state.columns = { code: false, name: true, phone: true, group: false, email: true, address: true, city: false, ward: false, status: true }; saveColumns(); loadColumns(); });

  els.btnDownloadCsv?.addEventListener('click', () => {
    try {
      const headers = [];
      const rows = [];

      document.querySelectorAll('#tbl thead th[data-col]').forEach(th => {
        const key = th.getAttribute('data-col');
        if (!th.classList.contains('col-hidden')) headers.push(th.textContent.trim());
      });
      rows.push(headers.join(','));

      document.querySelectorAll('#tbl tbody tr[data-id]').forEach(tr => {
        if (tr.classList.contains('expanded-row')) return;

        const cols = [];
        tr.querySelectorAll('td[data-col]').forEach(td => {
          const colName = td.getAttribute('data-col');
          const th = document.querySelector(`#tbl thead th[data-col="${colName}"]`);
          if (th && !th.classList.contains('col-hidden')) {
            cols.push(`"${(td.innerText || '').replace(/"/g, '""')}"`);
          }
        });
        if (cols.length > 0) rows.push(cols.join(','));
      });

      if (rows.length <= 1) {
        showAlert('No supplier data to export', 'warning');
        return;
      }

      // Tạo và tải file CSV
      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showAlert('Download started', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to export CSV', 'danger');
    }
  });



  // Init
  loadFromUrl();
  updateSortHeaders();
  loadColumns();
  fetchList().catch(e => showAlert(e.message, 'danger'));
})();
