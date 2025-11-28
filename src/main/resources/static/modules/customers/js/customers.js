document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/customers';
    let currentPage = 0;
    let pageSize = 15;
    let sortBy = 'name';
    let sortDir = 'asc';
    let currentSearch = '';
    const selected = new Set();

    // UI Elements
    const tblBody = document.querySelector('#tbl tbody');
    const pagiContainer = document.getElementById('pagi');
    const pageInfo = document.getElementById('pageInfo');
    const sizeSel = document.getElementById('sizeSel');
    const searchInput = document.getElementById('hdrSearch');
    const searchTopInput = document.getElementById('hdrSearchTop');
    const alertBox = document.getElementById('alert');
    // Selection & bulk elements
    const chkAll = document.getElementById('chkAll');
    const hdrBulk = document.getElementById('hdrBulk');
    const selCount = document.getElementById('selCount');
    const btnClearSel = document.getElementById('btnClearSel');
    const btnBulkDelete = document.getElementById('btnBulkDelete');
    // Import/Export
    const btnDownloadCsv = document.getElementById('btnDownloadCsv');
    const btnImport = document.getElementById('btnImport');
    const importModalEl = document.getElementById('importModal');
    const importModal = importModalEl ? new bootstrap.Modal(importModalEl) : null;
    const btnImportUpload = document.getElementById('btnImportUpload');
    const importErr = document.getElementById('importErr');

    // Modal Elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('frm');
    const modalErr = document.getElementById('modalErr');

    // Init
    loadCustomers();

    // Event Listeners
    document.getElementById('btnRefresh').addEventListener('click', loadCustomers);
    document.getElementById('btnAdd').addEventListener('click', () => openModal());
    document.getElementById('btnSave').addEventListener('click', saveCustomer);
    document.getElementById('btnSaveNew').addEventListener('click', () => saveCustomer(true));
    document.getElementById('btnApplyFilters').addEventListener('click', loadCustomers);
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
    document.querySelector('.kv-autocomplete__clear')?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (searchTopInput) searchTopInput.value = '';
        currentSearch = '';
        currentPage = 0;
        loadCustomers();
    });

    // Live filtering like other modules
    const activeSel = document.getElementById('active');
    activeSel?.addEventListener('change', () => { currentPage = 0; loadCustomers(); });
    const fName = document.getElementById('f_name');
    const fPhone = document.getElementById('f_phone');
    fName?.addEventListener('input', debounce(() => { currentPage = 0; loadCustomers(); }, 300));
    fPhone?.addEventListener('input', debounce(() => { currentPage = 0; loadCustomers(); }, 300));
    
    sizeSel.addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 0;
        loadCustomers();
    });

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value.trim();
            currentPage = 0;
            loadCustomers();
        }, 500));
    }

    function toggleExpandRow(tr, c) {
        const next = tr.nextElementSibling;
        if (next && next.classList.contains('expanded-row')) {
            next.remove();
            return;
        }
        // collapse others
        tblBody.querySelectorAll('tr.expanded-row').forEach(n => n.remove());

        const exp = document.createElement('tr');
        exp.className = 'expanded-row';
        const td = document.createElement('td');
        const colCount = tr.children.length; // include checkbox
        td.colSpan = colCount;
        td.innerHTML = `
            <div class="expanded-content">
                <div class="row g-3">
                    <div class="col-md-3"><strong>Gender:</strong> ${c.gender || '-'}</div>
                    
                    <div class="col-md-6"><strong>Address:</strong> ${c.address || '-'}</div>
                    <div class="col-md-3"><strong>Phone:</strong> ${c.phone || '-'}</div>
                    <div class="col-md-3"><strong>Email:</strong> ${c.email || '-'}</div>
                    <div class="col-md-12"><strong>Notes:</strong> ${c.notes || '-'}</div>
                </div>
                <div class="mt-3 d-flex gap-2">
                    <button class="kv-btn kv-btn--primary btn-exp-edit" data-id="${c.id}"><i class="fas fa-pen me-1"></i>Update</button>
                    <button class="kv-btn kv-btn--ghost btn-exp-toggle" data-id="${c.id}" data-active="${c.status === 'ACTIVE'}">
                        ${c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>`;
        exp.appendChild(td);
        tr.parentNode.insertBefore(exp, tr.nextSibling);

        // Wire actions inside expanded row
        const btnEdit = td.querySelector('.btn-exp-edit');
        btnEdit?.addEventListener('click', (e) => {
            e.stopPropagation();
            editCustomer(c.id);
        });

        const btnToggle = td.querySelector('.btn-exp-toggle');
        btnToggle?.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const token =
                    localStorage.getItem('jwtToken') ||
                    sessionStorage.getItem('jwtToken') ||
                    localStorage.getItem('accessToken') ||
                    sessionStorage.getItem('accessToken');
                const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const newStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                const res = await fetch(`${API_URL}/${c.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ status: newStatus })
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(body?.message || 'Failed to update status');

                // Update local copy and UI
                c.status = newStatus;
                const statusTd = tr.querySelector('td[data-col="status"]');
                if (statusTd) statusTd.innerHTML = `<span class="badge bg-${newStatus === 'ACTIVE' ? 'success' : 'secondary'}">${newStatus}</span>`;
                btnToggle.textContent = newStatus === 'ACTIVE' ? 'Deactivate' : 'Activate';
                btnToggle.setAttribute('data-active', String(newStatus === 'ACTIVE'));
                showAlert('success', `Customer ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
            } catch (err) {
                showAlert('danger', String(err));
            }
        });
    }

    // Keep top search (header) in sync if present
    if (searchTopInput) {
        searchTopInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value.trim();
            if (searchInput && searchInput.value.trim() !== currentSearch) {
                searchInput.value = currentSearch;
            }
            currentPage = 0;
            loadCustomers();
        }, 500));
    }

    // Column visibility preferences
    const colPrefsKey = 'customers.columns';
    const colMap = { Code: 'code', Name: 'name', Phone: 'phone', Email: 'email', Address: 'address', Status: 'status' };
    function getColPrefs() { try { return JSON.parse(localStorage.getItem(colPrefsKey)) || {}; } catch { return {}; } }
    function setColPrefs(p) { localStorage.setItem(colPrefsKey, JSON.stringify(p)); }
    function applyColumnVisibility() {
        const prefs = getColPrefs();
        const isShown = (k) => prefs[k] !== false;
        document.querySelectorAll('#tbl thead th[data-col]').forEach(th => {
            const key = th.getAttribute('data-col');
            th.classList.toggle('col-hidden', !isShown(key));
        });
        tblBody.querySelectorAll('tr').forEach(tr => {
            tr.querySelectorAll('td[data-col]').forEach(td => {
                const key = td.getAttribute('data-col');
                td.classList.toggle('col-hidden', !isShown(key));
            });
        });
        Object.entries(colMap).forEach(([label, key]) => {
            const el = document.getElementById('col' + label);
            const prefsNow = getColPrefs();
            if (el && typeof prefsNow[key] === 'boolean') el.checked = prefsNow[key];
        });
    }
    Object.entries(colMap).forEach(([label, key]) => {
        document.getElementById('col' + label)?.addEventListener('change', (e) => {
            const prefs = getColPrefs();
            prefs[key] = e.target.checked;
            setColPrefs(prefs);
            applyColumnVisibility();
        });
    });
    document.getElementById('btnResetColumns')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(colPrefsKey);
        applyColumnVisibility();
    });

    // Sort handlers
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortBy === col) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortBy = col;
                sortDir = 'asc';
            }
            updateSortIcons();
            loadCustomers();
        });
    });

    async function loadCustomers() {
        try {
            // Show loading state in table
            tblBody.innerHTML = '<tr><td colspan="9" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><div class="mt-2 text-muted">Loading customers...</div></td></tr>';

            const activeFilter = document.getElementById('active').value;
            // For now we only use search query param as backend implementation supports it.
            // Ideally backend should support filtering by status, gender etc. 
            // Assuming 'search' covers name/code/phone/email via 'likeSearch'.
            
            let url = `${API_URL}?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
            const nameFilter = document.getElementById('f_name') ? document.getElementById('f_name').value.trim() : '';
            const phoneFilter = document.getElementById('f_phone') ? document.getElementById('f_phone').value.trim() : '';
            const effectiveSearch = phoneFilter || nameFilter || currentSearch;
            if (effectiveSearch) url += '&search=' + encodeURIComponent(effectiveSearch);
            
            // For this MVP frontend update, we will proceed with the existing API.

            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(url, { headers });

            if (!response.ok) throw new Error('Failed to load customers');

            const result = await response.json();

            // Client-side filter by Active until backend supports it
            const af = activeSel ? activeSel.value : '';
            const desired = af === 'true' ? 'ACTIVE' : (af === 'false' ? 'INACTIVE' : '');
            let items = result.data.content || [];
            if (desired) items = items.filter(c => c.status === desired);

            renderTable(items);
            renderPagination(result.data);
            const totalCountEl = document.getElementById('totalCount');
            if (totalCountEl) totalCountEl.textContent = '...';
            // Compute total ACTIVE count across all pages (respecting search)
            countActiveTotal(nameFilter, phoneFilter).then((cnt) => {
                if (totalCountEl) totalCountEl.textContent = String(cnt);
            }).catch(() => {
                if (totalCountEl) totalCountEl.textContent = String(result.data.totalElements ?? items.length ?? 0);
            });
            applyColumnVisibility();
        } catch (error) {
            showAlert('danger', error.message);
            tblBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Error loading data: ${error.message}</td></tr>`;
        }
    }

    function renderTable(customers) {
        tblBody.innerHTML = '';
        if (!customers.length) {
            tblBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-5"><i class="fas fa-inbox fa-3x mb-3"></i><p>No customers found</p></td></tr>';
            return;
        }

        customers.forEach(c => {
            const tr = document.createElement('tr');
            tr.className = 'customer-row';
            tr.setAttribute('data-id', c.id);
            tr.innerHTML = `
                <td><input type="checkbox" class="item-check" value="${c.id}"></td>
                <td data-col="code"><a href="#" class="text-decoration-none fw-medium" onclick="editCustomer(${c.id})">${c.code || '-'}</a></td>
                <td data-col="name" class="fw-medium">${c.name}</td>
                <td data-col="phone">${c.phone || '-'}</td>
                <td data-col="email">${c.email || '-'}</td>
                <td data-col="address" class="text-truncate" style="max-width: 150px;" title="${c.address || ''}">${c.address || '-'}</td>

                <td data-col="status"><span class="badge bg-${c.status === 'ACTIVE' ? 'success' : 'secondary'}">${c.status}</span></td>
                
            `;
            tblBody.appendChild(tr);
            tr.addEventListener('click', () => toggleExpandRow(tr, c));
            const cb = tr.querySelector('input.item-check');
            cb.addEventListener('change', () => {
                const id = Number(cb.value);
                if (cb.checked) selected.add(id); else selected.delete(id);
                updateBulkBar();
            });
        });
        if (chkAll) {
            chkAll.checked = tblBody.querySelectorAll('input.item-check:checked').length === tblBody.querySelectorAll('input.item-check').length;
        }
    }

    function renderPagination(pageData) {
        const p = Math.max(0, pageData.number | 0);
        const t = Math.max(1, pageData.totalPages | 0);
        pageInfo.textContent = `Page ${p + 1} of ${t} (${pageData.totalElements} items)`;
        if (!pagiContainer) return;
        const items = [];
        const disabledPrev = p === 0 ? 'disabled' : '';
        const disabledNext = p >= t - 1 ? 'disabled' : '';
        items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" data-page="0">First</a></li>`);
        items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" data-page="${p - 1}">Prev</a></li>`);
        // Current page as dropdown to select any page
        const pages = Array.from({ length: t }, (_, i) => `<li><a class="dropdown-item" data-page="${i}">${i + 1}</a></li>`).join('');
        items.push(
            `<li class="page-item dropdown active">
                <a class="page-link dropdown-toggle" href="#" id="pgSelect" data-bs-toggle="dropdown" aria-expanded="false">${p + 1}</a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="pgSelect">${pages}</ul>
            </li>`
        );
        items.push(`<li class="page-item ${disabledNext}"><a class="page-link" data-page="${p + 1}">Next</a></li>`);
        items.push(`<li class="page-item ${disabledNext}"><a class="page-link" data-page="${t - 1}">Last</a></li>`);
        pagiContainer.innerHTML = items.join('');
    }

    async function countActiveTotal(nameFilter, phoneFilter) {
        // Derive search term same as in load
        const search = (phoneFilter || nameFilter || currentSearch || '').trim();
        const size = pageSize;
        // Build base URL without page
        let urlBase = `${API_URL}?size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
        if (search) urlBase += `&search=${encodeURIComponent(search)}`;
        const token =
            localStorage.getItem('jwtToken') ||
            sessionStorage.getItem('jwtToken') ||
            localStorage.getItem('accessToken') ||
            sessionStorage.getItem('accessToken');
        const headers = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // First page to learn totalPages
        let res = await fetch(urlBase + `&page=0`, { headers });
        if (!res.ok) throw new Error('Count fetch failed');
        let body = await res.json();
        let totalPages = body.data?.totalPages ?? 1;
        let count = 0;
        let content = body.data?.content || [];
        count += content.filter(c => c.status === 'ACTIVE').length;
        for (let p = 1; p < totalPages; p++) {
            res = await fetch(urlBase + `&page=${p}`, { headers });
            if (!res.ok) break;
            body = await res.json();
            content = body.data?.content || [];
            count += content.filter(c => c.status === 'ACTIVE').length;
        }
        return count;
    }

    // Delegate pagination clicks
    pagiContainer?.addEventListener('click', (e) => {
        const a = e.target.closest('[data-page]');
        if (!a) return;
        const p = parseInt(a.getAttribute('data-page'), 10);
        if (isNaN(p) || p < 0) return;
        currentPage = p;
        loadCustomers();
    });

    // Bulk selection helpers and actions
    function updateBulkBar() {
        if (!hdrBulk) return;
        if (selected.size > 0) {
            hdrBulk.classList.remove('d-none');
            if (selCount) selCount.textContent = String(selected.size);
        } else {
            hdrBulk.classList.add('d-none');
        }
    }
    chkAll?.addEventListener('change', () => {
        const rows = tblBody.querySelectorAll('input.item-check');
        rows.forEach(cb => {
            cb.checked = chkAll.checked;
            const id = Number(cb.value);
            if (chkAll.checked) selected.add(id); else selected.delete(id);
        });
        updateBulkBar();
    });
    btnClearSel?.addEventListener('click', (e) => {
        e.preventDefault();
        selected.clear();
        tblBody.querySelectorAll('input.item-check').forEach(cb => { cb.checked = false; });
        if (chkAll) chkAll.checked = false;
        updateBulkBar();
    });
    btnBulkDelete?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (selected.size === 0) return;
        if (!confirm(`Delete ${selected.size} selected customers?`)) return;
        try {
            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            for (const id of Array.from(selected)) {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers });
            }
            selected.clear();
            await loadCustomers();
            updateBulkBar();
        } catch (err) {
            showAlert('danger', 'Bulk delete failed');
        }
    });

    // Export CSV (current page)
    btnDownloadCsv?.addEventListener('click', (e) => {
        e.preventDefault();
        const header = ['Code','Name','Phone','Email','Address','Status'];
        const rows = Array.from(tblBody.querySelectorAll('tr')).map(tr => {
    const order = ['code','name','phone','email','address','status'];
            const vals = order.map(key => {
                const td = tr.querySelector(`td[data-col="${key}"]`);
                const text = (td ? td.textContent : '') || '';
                return '"' + text.replace(/"/g, '""') + '"';
            });
            return vals.join(',');
        });
        const csv = [header.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_page_${currentPage + 1}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import CSV (basic CSV parsing)
    btnImport?.addEventListener('click', (e) => {
        e.preventDefault();
        importErr?.classList.add('d-none');
        importModal?.show();
    });
    btnImportUpload?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const fileEl = document.getElementById('fileExcel');
            const file = fileEl?.files?.[0];
            if (!file) throw new Error('Please choose a CSV file');
            const text = await file.text();
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) throw new Error('Empty file');
            let startIdx = 0;
            const header = lines[0].toLowerCase();
            if (header.includes('name') || header.includes('phone') || header.includes('email')) startIdx = 1;
            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            let ok = 0, fail = 0;
            for (let i = startIdx; i < lines.length; i++) {
                const cols = lines[i].split(',').map(s => s.trim());
                const payload = {
                    code: cols[0] || null,
                    name: cols[1] || null,
                    phone: cols[2] || null,
                    email: cols[3] || null,
                    address: cols[4] || null,
                    gender: cols[5] || null,
                    notes: cols[6] || null,
                };
                if (!payload.name) { fail++; continue; }
                try {
                    const res = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
                    if (res.ok) ok++; else fail++;
                } catch { fail++; }
            }
            importModal?.hide();
            showAlert('success', `Imported ${ok} customers${fail ? `, ${fail} failed` : ''}`);
            currentPage = 0;
            await loadCustomers();
        } catch (err) {
            if (importErr) {
                importErr.textContent = String(err);
                importErr.classList.remove('d-none');
            } else {
                showAlert('danger', String(err));
            }
        }
    });

    window.openModal = (customer = null) => {
        form.reset();
        modalErr.classList.add('d-none');
        
        if (customer) {
            modalTitle.textContent = 'Edit Customer';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('code').value = customer.code || '';
            document.getElementById('name').value = customer.name;
            document.getElementById('phone').value = customer.phone || '';
            document.getElementById('email').value = customer.email || '';
            document.getElementById('address').value = customer.address || '';
            document.getElementById('gender').value = customer.gender || 'Male';
            document.getElementById('notes').value = customer.notes || '';
            document.getElementById('isActive').checked = customer.status === 'ACTIVE';
            
            // Toggle buttons for edit mode
            document.getElementById('btnSave').classList.remove('d-none');
            document.getElementById('btnSaveNew').classList.add('d-none');
            document.getElementById('btnSave').disabled = false;
        } else {
            modalTitle.textContent = 'New Customer';
            document.getElementById('customerId').value = '';
            document.getElementById('isActive').checked = true;
            
            // Toggle buttons for create mode
            document.getElementById('btnSave').classList.add('d-none');
            document.getElementById('btnSaveNew').classList.remove('d-none');
        }
        editModal.show();
    };

    window.editCustomer = async (id) => {
        try {
            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_URL}/${id}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch customer details');
            const result = await response.json();
            openModal(result.data);
        } catch (error) {
            showAlert('danger', error.message);
        }
    };

    async function saveCustomer(createAnother = false) {
        const id = document.getElementById('customerId').value;
        const data = {
            code: document.getElementById('code').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            gender: document.getElementById('gender').value,
            notes: document.getElementById('notes').value,
            status: document.getElementById('isActive').checked ? 'ACTIVE' : 'INACTIVE'
        };

        // Basic validation
        if (!data.name) {
            showModalError('Name is required');
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;
        const btnId = id ? 'btnSave' : 'btnSaveNew';
        const btn = document.getElementById(btnId);

        try {
            setLoading(btn, true);
            
            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(url, { method, headers, body: JSON.stringify(data) });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save customer');
            }

            showAlert('success', `Customer ${id ? 'updated' : 'created'} successfully`);
            loadCustomers();

            if (createAnother) {
                form.reset();
                document.getElementById('isActive').checked = true;
                document.getElementById('name').focus();
            } else {
                editModal.hide();
            }
        } catch (error) {
            showModalError(error.message);
        } finally {
            setLoading(btn, false);
        }
    }

    window.deleteCustomer = async (id) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        try {
            const token =
                localStorage.getItem('jwtToken') ||
                sessionStorage.getItem('jwtToken') ||
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers });

            if (!response.ok) throw new Error('Failed to delete customer');

            showAlert('success', 'Customer deleted successfully');
            loadCustomers();
        } catch (error) {
            showAlert('danger', error.message);
        }
    };

    function clearFilters() {
        document.getElementById('active').value = '';
        // No-op: removed extra filters from UI
        const fn = document.getElementById('f_name'); if (fn) fn.value = '';
        const fp = document.getElementById('f_phone'); if (fp) fp.value = '';
        if (searchInput) searchInput.value = '';
        if (searchTopInput) searchTopInput.value = '';
        currentSearch = '';
        loadCustomers();
    }

    function updateSortIcons() {
        document.querySelectorAll('.sort-icon').forEach(i => i.className = 'sort-icon');
        const activeTh = document.querySelector(`th[data-sort="${sortBy}"]`);
        if (activeTh) {
            const icon = activeTh.querySelector('.sort-icon');
            icon.className = `sort-icon fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'}`;
        }
    }

    function showAlert(type, message) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
        setTimeout(() => alertBox.classList.add('d-none'), 3000);
    }

    function showModalError(message) {
        modalErr.textContent = message;
        modalErr.classList.remove('d-none');
    }

    function setLoading(btn, isLoading) {
        btn.disabled = isLoading;
        const defaultText = btn.querySelector('.default-text');
        const loadingText = btn.querySelector('.loading-text');
        if (isLoading) {
            defaultText.classList.add('d-none');
            loadingText.classList.remove('d-none');
        } else {
            defaultText.classList.remove('d-none');
            loadingText.classList.add('d-none');
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});







