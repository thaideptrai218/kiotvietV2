(() => {
  const api = {
    base: '/api/suppliers',
    headers() {
      const token =
        localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') ||
        localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    }
  };

  const els = {
    q: document.getElementById('q'),
    active: document.getElementById('active'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnAdd: document.getElementById('btnAdd'),
    tblBody: document.querySelector('#tbl tbody'),
    pagi: document.getElementById('pagi'),
    pageInfo: document.getElementById('pageInfo'),
    alert: document.getElementById('alert'),
    // modal
    modal: new bootstrap.Modal(document.getElementById('editModal')),
    modalTitle: document.getElementById('modalTitle'),
    modalErr: document.getElementById('modalErr'),
    supplierId: document.getElementById('supplierId'),
    name: document.getElementById('name'),
    contactPerson: document.getElementById('contactPerson'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    address: document.getElementById('address'),
    btnSave: document.getElementById('btnSave')
  };

  const state = { page: 0, size: 10, sortBy: 'name', sortDir: 'asc', loading: false };

  function showAlert(msg, type = 'success') {
    els.alert.className = `alert alert-${type}`;
    els.alert.textContent = msg;
    els.alert.classList.remove('d-none');
    setTimeout(() => els.alert.classList.add('d-none'), 2500);
  }

  function fmt(val) { return val ?? ''; }

  function authGuard(resp) {
    if (resp.status === 401) throw new Error('Unauthorized. Please login again.');
    return resp;
  }

  async function fetchList() {
    state.loading = true;
    const params = new URLSearchParams();
    if (els.q.value.trim()) params.set('search', els.q.value.trim());
    if (els.active.value !== '') params.set('active', els.active.value);
    params.set('page', state.page);
    params.set('size', state.size);
    params.set('sortBy', state.sortBy);
    params.set('sortDir', state.sortDir);

    const resp = await fetch(`${api.base}?${params.toString()}`, { headers: api.headers() }).then(authGuard);
    const body = await resp.json();
    const data = body.data || body; // SuccessResponse wrapper or raw

    renderTable(data.items || data.content || []);
    renderPagination(data.currentPage ?? data.page ?? state.page, data.totalPages ?? Math.ceil((data.totalElements || 0) / state.size));
    els.pageInfo.textContent = `${(data.totalElements ?? 0)} suppliers total`;
    state.loading = false;
  }

  function renderTable(items) {
    if (!items.length) {
      els.tblBody.innerHTML = `<tr><td colspan="7" class="table-empty"><i class="far fa-box-open me-2"></i> No suppliers found</td></tr>`;
      return;
    }
    els.tblBody.innerHTML = items.map(s => `
      <tr data-id="${s.id}">
        <td><i class="fas fa-truck text-secondary"></i></td>
        <td class="fw-semibold">${fmt(s.name)}</td>
        <td>${fmt(s.contactPerson)}</td>
        <td>${fmt(s.phone)}</td>
        <td>${fmt(s.email)}</td>
        <td>
          <span class="badge badge-status ${s.isActive ? 'active' : 'inactive'}">${s.isActive ? 'Active' : 'Inactive'}</span>
        </td>
        <td>
          <button class="action-btn me-2" data-act="edit" title="Edit"><i class="far fa-pen-to-square"></i></button>
          <button class="action-btn" data-act="delete" title="Delete"><i class="far fa-trash-can"></i></button>
        </td>
      </tr>`).join('');
  }

  function renderPagination(page, totalPages) {
    const p = Math.max(0, page | 0);
    const t = Math.max(1, totalPages | 0);
    const items = [];
    const disabledPrev = p === 0 ? 'disabled' : '';
    const disabledNext = p >= t - 1 ? 'disabled' : '';
    items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" data-page="${p - 1}">Prev</a></li>`);
    const start = Math.max(0, p - 2), end = Math.min(t - 1, p + 2);
    for (let i = start; i <= end; i++) {
      items.push(`<li class="page-item ${i === p ? 'active' : ''}"><a class="page-link" data-page="${i}">${i + 1}</a></li>`);
    }
    items.push(`<li class="page-item ${disabledNext}"><a class="page-link" data-page="${p + 1}">Next</a></li>`);
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
    els.modalErr.classList.add('d-none');
    els.modal.show();
  }

  function setSaving(saving) {
    els.btnSave.disabled = saving;
    els.btnSave.querySelector('.default-text').classList.toggle('d-none', saving);
    els.btnSave.querySelector('.loading-text').classList.toggle('d-none', !saving);
  }

  async function save() {
    const id = els.supplierId.value;
    const payload = {
      name: els.name.value.trim(),
      contactPerson: els.contactPerson.value.trim() || null,
      phone: els.phone.value.trim() || null,
      email: els.email.value.trim() || null,
      address: els.address.value.trim() || null
    };
    if (!payload.name) {
      els.modalErr.textContent = 'Name is required';
      els.modalErr.classList.remove('d-none');
      return;
    }
    setSaving(true);
    try {
      const url = id ? `${api.base}/${id}` : api.base;
      const method = id ? 'PUT' : 'POST';
      const resp = await fetch(url, { method, headers: api.headers(), body: JSON.stringify(payload) }).then(authGuard);
      const body = await resp.json();
      if (resp.ok) {
        els.modal.hide();
        showAlert(id ? 'Supplier updated' : 'Supplier created', 'success');
        fetchList();
      } else {
        throw new Error(body?.message || 'Save failed');
      }
    } catch (e) {
      els.modalErr.textContent = e.message || 'Error';
      els.modalErr.classList.remove('d-none');
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id) {
    if (!confirm('Delete this supplier?')) return;
    const resp = await fetch(`${api.base}/${id}`, { method: 'DELETE', headers: api.headers() }).then(authGuard);
    if (resp.ok) {
      showAlert('Supplier deleted', 'success');
      fetchList();
    } else {
      const body = await resp.json().catch(() => ({}));
      showAlert(body?.message || 'Delete failed', 'danger');
    }
  }

  // Events
  els.btnAdd.addEventListener('click', () => openModal());
  els.btnRefresh.addEventListener('click', () => fetchList());
  els.q.addEventListener('input', debounce(() => { state.page = 0; fetchList(); }, 300));
  els.active.addEventListener('change', () => { state.page = 0; fetchList(); });
  els.pagi.addEventListener('click', (e) => {
    const a = e.target.closest('a.page-link');
    if (!a) return;
    const p = parseInt(a.dataset.page, 10);
    if (isNaN(p) || p < 0) return;
    state.page = p;
    fetchList();
  });
  els.tblBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr?.dataset.id;
    if (!id) return;
    if (btn.dataset.act === 'edit') {
      // quick fetch item then open modal
      fetch(`${api.base}/${id}`, { headers: api.headers() }).then(authGuard).then(r => r.json()).then(body => {
        openModal(body.data || body);
      }).catch(err => showAlert(err.message, 'danger'));
    } else if (btn.dataset.act === 'delete') {
      doDelete(id);
    }
  });
  els.btnSave.addEventListener('click', save);

  function debounce(fn, ms) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); };
  }

  // Init
  // redirect to login if no token to avoid 401 loops
  const token =
    localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') ||
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!token) {
    // Optional UX: still try; backend will 401 and we show message
  }
  fetchList().catch(e => showAlert(e.message, 'danger'));
})();
