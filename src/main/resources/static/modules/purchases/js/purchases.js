(() => {
  const api = {
    base: '/api/purchases',
    headers() {
      const token =
        localStorage.getItem('jwtToken') ||
        sessionStorage.getItem('jwtToken') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
      const h = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    },
  };

  const state = {
    page: 0,
    size: 15,
    sortBy: 'billDate',
    sortDir: 'desc',
  };

  const selected = new Set();

  const els = {
    // filters                                                                                                                                
    status: document.getElementById('status'),
    // filter supplier autocomplete (left panel)
    f_supplierId: document.getElementById('f_supplierId'),
    f_supplierSearch: document.getElementById('f_supplierSearch'),
    f_supplierDropdown: document.getElementById('f_supplierDropdown'),
    f_supplierClear: document.getElementById('f_supplierClear'),
    from: document.getElementById('from'),
    to: document.getElementById('to'),
    hdrSearch: document.getElementById('hdrSearch'),
    hdrSearchTop: document.getElementById('hdrSearchTop'),

    // header + footer controls
    btnApplyFilters: document.getElementById('btnApplyFilters'),
    btnClearFilters: document.getElementById('btnClearFilters'),
    btnRefresh: document.getElementById('btnRefresh'),
    tblBody: document.querySelector('#tbl tbody'),
    pageInfo: document.getElementById('pageInfo'),
    pagi: document.getElementById('pagi'),
    sizeSel: document.getElementById('sizeSel'),

    // create modal                                                                                                                           
    btnNew: document.getElementById('btnNew'),
    createModal: null,
    p_supplierId: document.getElementById('p_supplierId'),
    p_supplierSearch: document.getElementById('p_supplierSearch'),
    p_supplierDropdown: document.getElementById('p_supplierDropdown'),
    p_billDate: document.getElementById('p_billDate'),
    p_reference: document.getElementById('p_reference'),
    p_lines: document.getElementById('p_lines'),
    btnAddLine: document.getElementById('btnAddLine'),
    btnCreatePurchase: document.getElementById('btnCreatePurchase'),
    createErr: document.getElementById('createErr'),

    // import modal                                                                                                                           
    importModal: null,
    im_supplierId: document.getElementById('im_supplierId'),
    im_billDate: document.getElementById('im_billDate'),
    im_file: document.getElementById('im_file'),
    btnImportUpload: document.getElementById('btnImportUpload'),
    importErr: document.getElementById('importErr'),

    // edit modal                                                                                                                             
    e_productId: document.getElementById('e_productId'),
    e_productSearch: document.getElementById('e_productSearch'),
    e_productDropdown: document.getElementById('e_productDropdown'),

    // CSV Export                                                                                                                             
    btnDownloadCsv: document.getElementById('btnDownloadCsv'),
  };

  function fmtMoney(n) {
    try {
      const v = Number(n ?? 0);
      return v.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
    } catch (e) {
      return '0,00 $';
    }
  }

  function fmtDate(s) {
    if (!s) return '';
    return new Date(s).toLocaleDateString('vi-VN');
  }

  function displayStatus(raw) {
    switch (raw) {
      case 'DRAFT': return 'Draft';
      case 'CONFIRMED':
      case 'PARTIALLY_RECEIVED':
        return 'Confirmed';
      case 'RECEIVED':
        return 'Completed';
      case 'CANCELLED': return 'Canceled';
      default: return raw || '';
    }
  }

  function statusBadgeClass(raw) {
    switch (raw) {
      case 'DRAFT': return 'status-badge status-draft';
      case 'CONFIRMED':
      case 'PARTIALLY_RECEIVED':
        return 'status-badge status-confirmed';
      case 'RECEIVED':
        return 'status-badge status-received';
      case 'CANCELLED': return 'status-badge status-inactive';
      default: return 'status-badge';
    }
  }

  async function list() {
    const q = new URLSearchParams();
    if (els.status && els.status.value) {
      q.append('status', els.status.value);
    }
    if (els.f_supplierId && els.f_supplierId.value) q.append('supplierId', els.f_supplierId.value);
    if (els.from && els.from.value) q.append('from', els.from.value);
    if (els.to && els.to.value) q.append('to', els.to.value);
    const searchVal = (els.hdrSearch && els.hdrSearch.value) || (els.hdrSearchTop && els.hdrSearchTop.value) || '';
    if (searchVal) q.append('search', searchVal);
    q.append('page', state.page);
    q.append('size', state.size);
    q.append('sortBy', state.sortBy);
    q.append('sortDir', state.sortDir);

    try {
      const res = await fetch(`${api.base}?${q.toString()}`, { headers: api.headers() });
      if (!res.ok) {
        els.tblBody.innerHTML = `<tr><td colspan="8" class="text-danger">Failed to load purchases (${res.status})</td></tr>`;
        return;
      }
      const body = await res.json();
      const page = body.data; // SuccessResponse<Page<PurchaseDto>>                                                                           
      render(page);
    } catch (e) {
      els.tblBody.innerHTML = `<tr><td colspan="8" class="text-danger">Error loading data</td></tr>`;
    }
  }

  function render(page) {
    const rows = (page.content || [])
      .map(
        (p) => `                                                                                                                              
        <tr class="purchase-row" data-id="${p.id}">                                                                                             
          <td data-col="id">${p.id}</td>                                                                                                        
          <td data-col="supplier">${p.supplierName || p.supplierId || ''}</td>                                                                  
          <td data-col="date">${fmtDate(p.billDate)}</td>                                                                                       
          <td data-col="total" class="text-end">${fmtMoney(p.grandTotal)}</td>                                                                  
          <td data-col="paid" class="text-end">${fmtMoney(p.amountPaid)}</td>                                                                   
          <td data-col="due" class="text-end">${fmtMoney(p.amountDue)}</td>                                                                     
          <td data-col="status"><span class="${statusBadgeClass(p.status)}">${displayStatus(p.status)}</span></td>                              
        </tr>`
      )
      .join('');
    els.tblBody.innerHTML = rows || '<tr><td colspan="8" class="text-center text-muted">No data</td></tr>';
    const total = page.totalElements ?? 0;
    const from = total === 0 ? 0 : (page.number * state.size + 1);
    const to = Math.min((page.number + 1) * state.size, total);
    els.pageInfo.textContent = `${from}-${to} of ${total}`;
    renderPagination(page.number, page.totalPages || 1);

    applyColumnVisibility();

    // No multi-select

    // Row click expand                                                                                                                       
    els.tblBody.querySelectorAll('tr.purchase-row').forEach((tr) => {
      tr.addEventListener('click', async () => {
        const id = tr.getAttribute('data-id');
        const next = tr.nextElementSibling;
        if (next && next.classList.contains('expanded-row')) {
          next.remove();
          return;
        }
        // collapse others                                                                                                                    
        els.tblBody.querySelectorAll('tr.expanded-row').forEach((n) => n.remove());
        const exp = document.createElement('tr');
        exp.className = 'expanded-row';
        const td = document.createElement('td');
        td.colSpan = 7;
        td.innerHTML = '<div class="expanded-content">Loading details...</div>';
        exp.appendChild(td);
        tr.after(exp);

        try {
          const res = await fetch(`${api.base}/${id}`, { headers: api.headers() });
          if (!res.ok) {
            td.innerHTML = `<div class="expanded-content text-danger">Failed to load details (${res.status})</div>`;
            return;
          }
          const body = await res.json();
          const p = body.data;
          const linesHtml = (p.lines || [])
            .map(
              (l) => `
            <tr>
              <td>${l.productName || l.productId}</td>
              <td class="text-end">${(l.qtyReceived ?? 0)}/${(l.qtyOrdered ?? 0)}</td>
              <td class="text-end">${fmtMoney(l.unitCost)}</td>
              <td class="text-end">${fmtMoney(l.discountAmount)}</td>
              <td class="text-end">${l.taxPercent || 0}%</td>
              <td class="text-end">${fmtMoney(l.lineTotal)}</td>
            </tr>`
            )
            .join('');
          const paymentsHtml = (p.payments || [])
            .map(
              (pm) => `                                                                                                                       
              <tr>                                                                                                                              
                <td>${new Date(pm.paidAt).toLocaleString('vi-VN')}</td>                                                                         
                <td>${pm.method}</td>                                                                                                           
                <td>${pm.reference || ''}</td>                                                                                                  
                <td class="text-end">${fmtMoney(pm.amount)}</td>                                                                                
                <td>${pm.note || ''}</td>                                                                                                       
              </tr>`
            )
            .join('');
          const canEdit = p.status === 'DRAFT';
          const canComplete = p.status !== 'CANCELLED' && p.status !== 'RECEIVED' && p.status !== 'DRAFT';
          const canConfirm = p.status === 'DRAFT';
          const canCancel = (p.status === 'DRAFT' || p.status === 'CONFIRMED');
          td.innerHTML = `
              <div class="expanded-content">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="small text-muted">Details</div>
                  <div class="d-flex gap-2">
                    ${canEdit ? `<button class="kv-btn kv-btn--ghost kv-btn--sm btn-edit-purchase" data-id="${p.id}"><i class="fas fa-pen"></i> Edit</button>` : ''}
                    ${canConfirm ? `<button class="kv-btn kv-btn--primary kv-btn--sm btn-confirm-purchase" data-id="${p.id}"><i class="fas fa-check"></i> Confirm</button>` : ''}
                    ${canComplete ? `<button class="kv-btn kv-btn--primary kv-btn--sm btn-complete-purchase" data-id="${p.id}"><i class="fas fa-check-double"></i> Complete</button>` : ''}
                    ${canCancel ? `<button class="kv-btn kv-btn--danger kv-btn--sm btn-cancel-purchase" data-id="${p.id}"><i class="fas fa-ban"></i> Cancel</button>` : ''}
                  </div>
                </div>
                <div class="row g-3">                                                                                                           
                  <div class="col-md-6">                                                                                                        
                    <div class="small text-muted">Reference</div>                                                                               
                    <div>${p.referenceNo || ''}</div>                                                                                           
                  </div>                                                                                                                        
                  <div class="col-md-6">                                                                                                        
                    <div class="small text-muted">Notes</div>                                                                                   
                    <div>${p.notes || ''}</div>                                                                                                 
                  </div>                                                                                                                        
                </div>                                                                                                                          
                <hr/>                                                                                                                           
                <div class="table-responsive">                                                                                                  
                  <table class="table table-sm">                                                                                                
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th class="text-end">Qty (R/O)</th>
                      <th class="text-end">Unit Cost</th>
                      <th class="text-end">Discount</th>
                      <th class="text-end">Tax %</th>
                      <th class="text-end">Line Total</th>
                    </tr>
                  </thead>
                    <tbody>${linesHtml || '<tr><td colspan="7" class="text-muted">No lines</td></tr>'}</tbody>                                  
                  </table>                                                                                                                      
                </div>                                                                                                                          
                <div class="table-responsive">                                                                                                  
                  <table class="table table-sm">                                                                                                
                    <thead>                                                                                                                     
                      <tr>                                                                                                                      
                        <th>Paid At</th>                                                                                                        
                        <th>Method</th>                                                                                                         
                        <th>Reference</th>                                                                                                      
                        <th class="text-end">Amount</th>                                                                                        
                        <th>Note</th>                                                                                                           
                      </tr>                                                                                                                     
                    </thead>                                                                                                                    
                    <tbody>${paymentsHtml || '<tr><td colspan="5" class="text-muted">No payments</td></tr>'}</tbody>                            
                  </table>                                                                                                                      
                </div>                                                                                                                          
              </div>`;
        } catch (err) {
          td.innerHTML = `<div class="expanded-content text-danger">Error: ${err}</div>`;
        }
      });
    });
  }

  function refreshBulkBar() {
    const bulkBar = document.getElementById('bulkBar');
    const sel = document.getElementById('selCount');
    const n = selected.size;
    if (bulkBar) {
      if (n > 0) {
        bulkBar.classList.remove('d-none');
        if (sel) sel.textContent = String(n);
      } else {
        bulkBar.classList.add('d-none');
      }
    }
  }

  function renderPagination(page, totalPages) {
    if (!els.pagi) return;
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

  function bind() {
    els.btnRefresh?.addEventListener('click', () => {
      state.page = 0;
      list();
    });
    els.pagi?.addEventListener('click', (e) => {
      const a = e.target.closest('a.page-link');
      if (!a) return;
      const p = parseInt(a.dataset.page, 10);
      if (isNaN(p) || p < 0) return;
      state.page = p;
      list();
    });
    els.status?.addEventListener('change', () => {
      state.page = 0;
      list();
    });
    els.btnApplyFilters?.addEventListener('click', () => {
      state.page = 0;
      list();
    });
    // Trigger search from both top and sidebar inputs (sync values)
    const setSearchValue = (val) => {
      if (els.hdrSearch) els.hdrSearch.value = val;
      if (els.hdrSearchTop) els.hdrSearchTop.value = val;
    };
    const wireSearch = (el) => {
      if (!el) return;
      let t;
      el.addEventListener('input', () => {
        clearTimeout(t);
        const val = el.value;
        setSearchValue(val);
        t = setTimeout(() => {
          state.page = 0;
          list();
        }, 300);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setSearchValue(el.value);
          state.page = 0;
          list();
        }
      });
    };
    wireSearch(els.hdrSearch);
    wireSearch(els.hdrSearchTop);
    els.btnClearFilters?.addEventListener('click', () => {
      if (els.hdrSearch) els.hdrSearch.value = '';
      if (els.hdrSearchTop) els.hdrSearchTop.value = '';
      if (els.status) els.status.value = '';
      if (els.f_supplierId) els.f_supplierId.value = '';
      if (els.f_supplierSearch) els.f_supplierSearch.value = '';
      if (els.from) els.from.value = '';
      if (els.to) els.to.value = '';
      state.page = 0;
      list();
    });

    // Select all    // No multi-select header checkbox\n

    // Page size selector                                                                                                                     
    if (els.sizeSel) {
      els.sizeSel.value = String(state.size);
      els.sizeSel.addEventListener('change', () => {
        state.size = Number(els.sizeSel.value) || 15;
        state.page = 0;
        list();
      });
    }

    // Sorting tri-state (asc -> desc -> default billDate desc)                                                                               
    document.querySelectorAll('#tbl thead th.sortable').forEach((th) => {
      const key = th.getAttribute('data-sort');
      th.addEventListener('click', () => {
        if (!key || key === 'supplier') return; // supplier sort not supported server-side                                                    
        if (state.sortBy === key && state.sortDir === 'asc') {
          state.sortDir = 'desc';
        } else if (state.sortBy === key && state.sortDir === 'desc') {
          state.sortBy = 'billDate';
          state.sortDir = 'desc';
        } else {
          state.sortBy = key;
          state.sortDir = 'asc';
        }
        document
          .querySelectorAll('#tbl thead th.sortable')
          .forEach((h) => h.classList.remove('active', 'asc', 'desc'));
        if (state.sortBy === key) th.classList.add('active', state.sortDir);
        state.page = 0;
        list();
      });
    });

    // Create/Import modals                                                                                                                   
    const modalEl = document.getElementById('createPurchaseModal');
    const importEl = document.getElementById('importPurchaseModal');
    if (modalEl) els.createModal = new bootstrap.Modal(modalEl);
    if (importEl) els.importModal = new bootstrap.Modal(importEl);

    els.btnNew?.addEventListener('click', (e) => {
      e.preventDefault();
      if (els.p_billDate && !els.p_billDate.value) els.p_billDate.valueAsDate = new Date();
      els.createErr?.classList.add('d-none');
      els.createModal?.show();
    });

    els.btnCreatePurchase?.addEventListener('click', async (e) => {
      e.preventDefault();
      const toggle = (on) => {
        els.btnCreatePurchase.querySelector('.default-text').classList.toggle('d-none', on);
        els.btnCreatePurchase.querySelector('.loading-text').classList.toggle('d-none', !on);
        els.btnCreatePurchase.disabled = on;
      };
      try {
        toggle(true);
        // collect lines                                                                                                                      
        const lines = Array.from(els.p_lines.querySelectorAll('.p-line'))
          .map((row) => ({
            productId: Number(row.querySelector('.prodId').value),
            qtyOrdered: Number(row.querySelector('.qty').value || 1),
            unitCost: Number(row.querySelector('.unitCost').value || 0),
            discountAmount: Number(row.querySelector('.discount').value || 0),
            taxPercent: 0,
          }))
          .filter((l) => l.productId && l.unitCost > 0);

        // prevent duplicates                                                                                                                 
        const ids = lines.map((l) => l.productId).filter(Boolean);
        const unique = new Set(ids);
        if (unique.size !== ids.length) {
          throw new Error('Duplicate products are not allowed in a single entry');
        }

        const payload = {
          supplierId: Number(els.p_supplierId.value),
          billDate: els.p_billDate.value,
          referenceNo: els.p_reference.value || undefined,
          lines,
        };
        if (!payload.supplierId || payload.lines.length === 0) {
          throw new Error('Please select supplier and product from the list');
        }
        const res = await fetch(api.base, {
          method: 'POST',
          headers: api.headers(),
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || res.statusText);
        els.createModal?.hide();
        state.page = 0;
        await list();
      } catch (err) {
        if (els.createErr) {
          els.createErr.textContent = `Failed to create purchase: ${err}`;
          els.createErr.classList.remove('d-none');
        }
      } finally {
        toggle(false);
      }
    });

    const btnImport = document.getElementById('btnImport');
    btnImport?.addEventListener('click', (e) => {
      e.preventDefault();
      els.importErr?.classList.add('d-none');
      els.importModal?.show();
    });

    els.btnImportUpload?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const file = els.im_file?.files?.[0];
        if (!file) throw new Error('Please choose a CSV file');
        const supplierId = Number(els.im_supplierId.value);
        const billDate = els.im_billDate.value || new Date().toISOString().slice(0, 10);
        const text = await file.text();
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => l.split(',').map((s) => s.trim()));
        const payload = {
          supplierId,
          billDate,
          lines: lines.map((cols) => ({
            productId: Number(cols[0]),
            qtyOrdered: Number(cols[1] || 1),
            unitCost: Number(cols[2] || 0),
            discountAmount: Number(cols[3] || 0),
            taxPercent: Number(cols[4] || 0),
          })),
        };
        const res = await fetch(api.base, {
          method: 'POST',
          headers: api.headers(),
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || res.statusText);
        els.importModal?.hide();
        state.page = 0;
        await list();
      } catch (err) {
        if (els.importErr) {
          els.importErr.textContent = `Import failed: ${err}`;
          els.importErr.classList.remove('d-none');
        }
      }
    });

    // Export CSV                                                                                                                             
    els.btnDownloadCsv?.addEventListener('click', async (e) => {
      e.preventDefault();
      const rows = Array.from(els.tblBody.querySelectorAll('tr.purchase-row')).map((tr) =>
        Array.from(tr.children).map((td) => `"${(td.textContent || '').replace(/"/g, '""')}"`)
      );
      const header = ['ID', 'Supplier', 'Date', 'Total', 'Paid', 'Due', 'Status'];

      const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchases_page_${state.page + 1}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Bulk actions                                                                                                                           
    const btnBulkConfirm = document.getElementById('btnBulkConfirm');
    const btnBulkCancel = document.getElementById('btnBulkCancel');
    btnBulkConfirm?.addEventListener('click', async () => {
      for (const id of selected) {
        await fetch(`${api.base}/${id}/confirm`, {
          method: 'POST',
          headers: api.headers(),
          body: JSON.stringify({ amountPaid: 0 }),
        });
      }
      selected.clear();
      // no multi-select
      list();
    });
    btnBulkCancel?.addEventListener('click', async () => {
      for (const id of selected) {
        await fetch(`${api.base}/${id}/cancel`, { method: 'POST', headers: api.headers() });
      }
      selected.clear();
      // no multi-select
      list();
    });

    // Edit / Complete / Confirm actions in expanded rows                                                                                     
    const editModalEl = document.getElementById('editPurchaseModal');
    let editModal = null;
    if (editModalEl) editModal = new bootstrap.Modal(editModalEl);

    document.addEventListener('click', async (e) => {
      const t = e.target;

      if (t?.matches?.('.btn-edit-purchase')) {
        e.preventDefault();
        const id = t.getAttribute('data-id');
        document.getElementById('e_id').value = id;
        document.getElementById('e_notes').value = '';
        document.getElementById('editErr').classList.add('d-none');
        try {
          const res = await fetch(`${api.base}/${id}`, { headers: api.headers() });
          const body = await res.json();
          if (res.ok) {
            const p = body.data;
            // set current edit supplier for autocomplete filtering
            window.currentEditSupplierId = p.supplierId;
            const tbody = document.getElementById('e_lines');
            if (tbody) {
              tbody.innerHTML = (p.lines || [])
                .map(
                  (l) => `                                                                                                                    
                  <tr data-id="${l.id}">                                                                                                        
                    <td>${l.productName || l.productId}</td>                                                                                    
                    <td class="text-end"><input type="number" min="1" class="form-control form-control-sm e_qty" value="${l.qtyOrdered || 1
                    }" /></td>                                                                                                                  
                    <td class="text-end"><input type="number" step="0.01" min="0.01" class="form-control form-control-sm e_cost" value="${l.unitCost || 0
                    }" /></td>                                                                                                                  
                    <td class="text-end"><input type="number" step="0.01" min="0" class="form-control form-control-sm e_disc" value="${l.discountAmount || 0
                    }" /></td>                                                                                                                  
                  </tr>`
                )
                .join('');
            }
          }
        } catch (err) {
          /* ignore */
        }
        editModal?.show();
      }

      if (t?.matches?.('.btn-complete-purchase')) {
        e.preventDefault();
        const id = t.getAttribute('data-id');
        try {
          // fetch details                                                                                                                    
          const res = await fetch(`${api.base}/${id}`, { headers: api.headers() });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.message || res.statusText);
          const p = body.data;
          // if draft -> confirm first
          if (p.status === 'DRAFT') {
            const r1 = await fetch(`${api.base}/${id}/confirm`, {
              method: 'POST',
              headers: api.headers(),
              body: JSON.stringify({ amountPaid: 0 }),
            });
            if (!r1.ok) {
              const b = await r1.json();
              throw new Error(b?.message || r1.statusText);
            }
          }
          // reload to get line ids + remaining                                                                                               
          const detailsRes = await fetch(`${api.base}/${id}`, { headers: api.headers() });
          const detailsBody = await detailsRes.json();
          const pd = detailsBody.data;
          const lines = (pd.lines || [])
            .map((l) => ({
              id: l.id,
              qtyReceived: Math.max(0, (l.qtyOrdered || 0) - (l.qtyReceived || 0)),
            }))
            .filter((x) => x.qtyReceived > 0);
          if (lines.length > 0) {
            const r2 = await fetch(`${api.base}/${id}/receive`, {
              method: 'POST',
              headers: api.headers(),
              body: JSON.stringify({ lines }),
            });
            if (!r2.ok) {
              const b2 = await r2.json();
              throw new Error(b2?.message || r2.statusText);
            }
          }
          list();
        } catch (err) {
          alert(`Complete failed: ${err}`);
        }
      }

      if (t?.matches?.('.btn-confirm-purchase')) {
        e.preventDefault();
        const id = t.getAttribute('data-id');
        document.getElementById('c_id').value = id;
        document.getElementById('c_method').value = '';
        document.getElementById('c_amount').value = '';
        document.getElementById('c_reference').value = '';
        document.getElementById('confirmErr').classList.add('d-none');
        const confirmEl = document.getElementById('confirmPurchaseModal');
        const cm = new bootstrap.Modal(confirmEl);
        cm.show();
      }

      if (t?.matches?.('.btn-cancel-purchase')) {
        e.preventDefault();
        const id = t.getAttribute('data-id');
        const modalEl = document.getElementById('cancelPurchaseModal');
        if (modalEl) {
          const idsInput = document.getElementById('x_ids');
          if (idsInput) idsInput.value = id;
          document.getElementById('cancelErr')?.classList.add('d-none');
          const cm = new bootstrap.Modal(modalEl);
          cm.show();
        }
      }
    });

    // Edit save                                                                                                                              
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    btnSaveEdit?.addEventListener('click', async () => {
      const id = document.getElementById('e_id').value;
      const notes = document.getElementById('e_notes').value;
      const payload = { notes };
      // existing lines edits                                                                                                                 
      const existing = Array.from(document.querySelectorAll('#e_lines tr')).map((tr) => ({
        id: Number(tr.getAttribute('data-id')),
        qtyOrdered: Number(tr.querySelector('.e_qty').value || 1),
        unitCost: Number(tr.querySelector('.e_cost').value || 0),
        discountAmount: Number(tr.querySelector('.e_disc').value || 0),
      }));
      const newProdId = document.getElementById('e_productId')?.value;
      const newQty = document.getElementById('e_qty')?.value;
      const newCost = document.getElementById('e_unitCost')?.value;
      const newDisc = document.getElementById('e_discount')?.value;
      const lines = [];
      existing.forEach((l) => lines.push(l));
      if (newProdId && newCost) {
        lines.push({
          productId: Number(newProdId),
          qtyOrdered: Number(newQty || 1),
          unitCost: Number(newCost),
          discountAmount: Number(newDisc || 0),
        });
      }
      if (lines.length > 0) payload.lines = lines;

      const btn = btnSaveEdit;
      const errBox = document.getElementById('editErr');
      const toggle = (on) => {
        btn.querySelector('.default-text').classList.toggle('d-none', on);
        btn.querySelector('.loading-text').classList.toggle('d-none', !on);
        btn.disabled = on;
      };
      try {
        toggle(true);
        const res = await fetch(`${api.base}/${id}`, {
          method: 'PUT',
          headers: api.headers(),
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || res.statusText);
        bootstrap.Modal.getInstance(document.getElementById('editPurchaseModal'))?.hide();
        list();
      } catch (err) {
        errBox.textContent = `Save failed: ${err}`;
        errBox.classList.remove('d-none');
      } finally {
        toggle(false);
      }
    });

    // Confirm submit                                                                                                                         
    const btnDoConfirm = document.getElementById('btnDoConfirm');
    btnDoConfirm?.addEventListener('click', async () => {
      const id = document.getElementById('c_id').value;
      const method = document.getElementById('c_method').value;
      const amount = Number(document.getElementById('c_amount').value || 0);
      const reference = document.getElementById('c_reference').value || undefined;
      const btn = btnDoConfirm;
      const errBox = document.getElementById('confirmErr');
      const toggle = (on) => {
        btn.querySelector('.default-text').classList.toggle('d-none', on);
        btn.querySelector('.loading-text').classList.toggle('d-none', !on);
        btn.disabled = on;
      };
      try {
        if (!method) throw new Error('Please choose a payment method');
        if (amount < 0) throw new Error('Amount must be zero or more');
        toggle(true);
        const payload = { amountPaid: amount, paymentMethod: method, reference };
        const res = await fetch(`${api.base}/${id}/confirm`, {
          method: 'POST',
          headers: api.headers(),
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || res.statusText);
        bootstrap.Modal.getInstance(document.getElementById('confirmPurchaseModal'))?.hide();
        list();
      } catch (err) {
        errBox.textContent = err;
        errBox.classList.remove('d-none');
      } finally {
        toggle(false);
      }
    });

    // Cancel submit (single/bulk via modal)
    const btnDoCancel = document.getElementById('btnDoCancel');
    btnDoCancel?.addEventListener('click', async () => {
      const idsRaw = (document.getElementById('x_ids')?.value || '').trim();
      const ids = idsRaw ? idsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const errBox = document.getElementById('cancelErr');
      try {
        for (const id of ids) {
          const res = await fetch(`${api.base}/${id}/cancel`, { method: 'POST', headers: api.headers() });
          if (!res.ok) {
            const b = await res.json().catch(() => ({}));
            throw new Error(b?.message || `Cancel failed (${res.status})`);
          }
        }
        bootstrap.Modal.getInstance(document.getElementById('cancelPurchaseModal'))?.hide();
        list();
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message || String(err);
          errBox.classList.remove('d-none');
        } else {
          alert(String(err));
        }
      }
    });
  }

  // ---------- Columns visibility ----------                                                                                                 
  const colPrefsKey = 'purchases.columns';
  const colIds = ['Id', 'Supplier', 'Date', 'Total', 'Paid', 'Due', 'Status'];
  const mapKey = {
    Id: 'id',
    Supplier: 'supplier',
    Date: 'date',
    Total: 'total',
    Paid: 'paid',
    Due: 'due',
    Status: 'status',
  };
  const getPrefs = () => {
    try {
      return JSON.parse(localStorage.getItem(colPrefsKey)) || {};
    } catch {
      return {};
    }
  };
  const setPrefs = (prefs) => localStorage.setItem(colPrefsKey, JSON.stringify(prefs));
  const syncFromPrefs = () => {
    const prefs = getPrefs();
    colIds.forEach((lbl) => {
      const id = 'col' + lbl;
      const key = mapKey[lbl];
      const el = document.getElementById(id);
      if (el && typeof prefs[key] === 'boolean') el.checked = prefs[key];
    });
    applyColumnVisibility();
  };
  window.applyColumnVisibility = () => {
    const prefs = getPrefs();
    const isShown = (key) => prefs[key] !== false;
    document.querySelectorAll('#tbl thead th[data-col]').forEach((th) => {
      const key = th.getAttribute('data-col');
      th.classList.toggle('col-hidden', !isShown(key));
    });
    els.tblBody.querySelectorAll('tr').forEach((tr) => {
      tr.querySelectorAll('td[data-col]').forEach((td) => {
        const key = td.getAttribute('data-col');
        td.classList.toggle('col-hidden', !isShown(key));
      });
    });
  };

  // ---------- Autocomplete ----------                                                                                                       
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  async function supplierAutocomplete(query) {
    const url = `/api/suppliers/autocomplete?query=${encodeURIComponent(query || '')}&limit=10`;
    const res = await fetch(url, { headers: api.headers() });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  }

  async function productAutocomplete(query, supplierId) {
    if (!supplierId) return [];
    const url = `/api/products/autocomplete?query=${encodeURIComponent(query || '')}&limit=10&supplierId=${encodeURIComponent(supplierId)}`;
    const res = await fetch(url, { headers: api.headers() });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  }

  function wireAutocomplete(inputEl, dropdownEl, onChoose, fetcher, displayFn, opts = {}) {
    if (!inputEl || !dropdownEl) return;
    const supplierIdProvider = opts.supplierIdProvider;
    const show = (items) => {
      if (!items || items.length === 0) {
        dropdownEl.innerHTML = '';
        dropdownEl.style.display = 'none';
        return;
      }
      dropdownEl.innerHTML = items
        .map((it) => `<div class="kv-autocomplete__item" data-id="${it.id}">${displayFn(it)}</div>`)
        .join('');
      dropdownEl.style.display = 'block';
      dropdownEl.querySelectorAll('.kv-autocomplete__item').forEach((div) => {
        div.addEventListener('click', () => {
          onChoose(div.getAttribute('data-id'), div.textContent);
          dropdownEl.style.display = 'none';
        });
      });
    };
    inputEl.addEventListener(
      'input',
      debounce(async () => {
        const q = inputEl.value.trim();
        const sid = typeof supplierIdProvider === 'function' ? supplierIdProvider() : undefined;
        const items = await fetcher(q, sid);
        show(items);
      }, 200)
    );
    async function fetchAndShowOnFocus() {
      const q = (opts && opts.focusAll) ? '' : inputEl.value.trim();
      const sid = typeof supplierIdProvider === 'function' ? supplierIdProvider() : undefined;
      const items = await fetcher(q, sid);
      show(items);
    }
    inputEl.addEventListener('focus', fetchAndShowOnFocus);
    inputEl.addEventListener('click', fetchAndShowOnFocus);
    document.addEventListener('click', (e) => {
      if (!dropdownEl.contains(e.target) && e.target !== inputEl) dropdownEl.style.display = 'none';
    });
  }

  function addCreateLine() {
    const row = document.createElement('div');
    row.className = 'p-line row g-2 align-items-end';
    row.innerHTML = `                                                                                                                         
        <div class="col-md-6">                                                                                                                  
          <div class="kv-autocomplete">                                                                                                         
            <input type="text" class="form-control prodSearch" placeholder="Search product..." autocomplete="off" />                            
            <input type="hidden" class="prodId" />                                                                                              
            <div class="kv-autocomplete__dropdown prodDropdown"></div>                                                                          
          </div>                                                                                                                                
        </div>                                                                                                                                  
        <div class="col-md-2">                                                                                                                  
          <input type="number" min="1" value="1" class="form-control qty" placeholder="Qty" />                                                  
        </div>                                                                                                                                  
        <div class="col-md-3">                                                                                                                  
          <input type="number" step="0.01" min="0.01" class="form-control unitCost" placeholder="Unit Cost" />                                  
        </div>                                                                                                                                  
        <div class="col-md-1 d-flex gap-2">                                                                                                     
          <input type="number" step="0.01" min="0" value="0" class="form-control discount" placeholder="Disc" />                                
        </div>                                                                                                                                  
        <div class="col-auto">                                                                                                                  
          <button class="kv-btn kv-btn--ghost kv-btn--sm btnRemoveLine" title="Remove"><i class="fas fa-times"></i></button>                    
        </div>`;
    els.p_lines.appendChild(row);
    // Autocomplete for this row                                                                                                              
    const prodSearch = row.querySelector('.prodSearch');
    const prodDropdown = row.querySelector('.prodDropdown');
    const prodId = row.querySelector('.prodId');
    const unitCostInput = row.querySelector('.unitCost');
    const validateCost = () => {
      const sp = parseFloat(row.getAttribute('data-selling-price') || '0');
      const uc = parseFloat(unitCostInput.value || '0');
      if (sp && uc > sp) unitCostInput.classList.add('warn-high-cost');
      else unitCostInput.classList.remove('warn-high-cost');
    };
    unitCostInput.addEventListener('input', validateCost);
    wireAutocomplete(
      prodSearch,
      prodDropdown,
      (id, label, meta) => {
        prodId.value = id;
        prodSearch.value = label;
        if (meta && typeof meta.price === 'number' && !Number.isNaN(meta.price)) {
          row.setAttribute('data-selling-price', String(meta.price));
          if (!unitCostInput.value) unitCostInput.placeholder = `<= ${fmtMoney(meta.price)}`;
          validateCost();
        }
      },
      productAutocomplete,
      (it) => `${it.displayName || it.name || it.sku || ''}`,
      { supplierIdProvider: () => (els.p_supplierId ? els.p_supplierId.value : undefined) }
    );
    row.querySelector('.btnRemoveLine').addEventListener('click', (e) => {
      e.preventDefault();
      row.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();

    // Init create modal: add first line                                                                                                      
    if (els.p_lines) addCreateLine();
    // Initially disable product inputs if supplier not chosen
    els.p_lines?.querySelectorAll('.prodSearch')?.forEach((input) => {
      input.disabled = !(els.p_supplierId && els.p_supplierId.value);
      if (input.disabled) input.placeholder = 'Select supplier first';
    });
    els.btnAddLine?.addEventListener('click', (e) => {
      e.preventDefault();
      addCreateLine();
    });

    // Supplier autocomplete (create modal)
    wireAutocomplete(
      els.p_supplierSearch,
      els.p_supplierDropdown,
      (id, label) => {
        els.p_supplierId.value = id;
        els.p_supplierSearch.value = label;
        // enable product inputs after choosing supplier
        els.p_lines?.querySelectorAll('.prodSearch')?.forEach((input) => {
          input.disabled = false;
          if (input.placeholder === 'Select supplier first') input.placeholder = 'Search product...';
        });
        // clear existing product lines when supplier changes
        if (els.p_lines) {
          els.p_lines.innerHTML = '';
          addCreateLine();
        }
      },
      supplierAutocomplete,
      (it) => `${it.displayName || it.name || ''}`,
      { focusAll: true }
    );

    // Supplier autocomplete (left filter)
    wireAutocomplete(
      els.f_supplierSearch,
      els.f_supplierDropdown,
      (id, label) => {
        els.f_supplierId.value = id;
        els.f_supplierSearch.value = label;
        state.page = 0;
        list();
      },
      supplierAutocomplete,
      (it) => `${it.displayName || it.name || ''}`,
      { focusAll: true }
    );
    els.f_supplierClear?.addEventListener('click', (e) => {
      e.preventDefault();
      if (els.f_supplierId) els.f_supplierId.value = '';
      if (els.f_supplierSearch) els.f_supplierSearch.value = '';
      state.page = 0;
      list();
    });

    // Edit modal product autocomplete                                                                                                        
    wireAutocomplete(
      els.e_productSearch,
      els.e_productDropdown,
      (id, label) => {
        els.e_productId.value = id;
        els.e_productSearch.value = label;
      },
      productAutocomplete,
      (it) => `${it.displayName || it.name || it.sku || ''}`,
      { supplierIdProvider: () => window.currentEditSupplierId }
    );

    // Columns dropdown wiring                                                                                                                
    const colIds = ['Id', 'Supplier', 'Date', 'Total', 'Paid', 'Due', 'Status'];
    colIds.forEach((lbl) => {
      const id = 'col' + lbl;
      const key = lbl.toLowerCase();
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          const prefs = getPrefs();
          prefs[key] = el.checked;
          setPrefs(prefs);
          applyColumnVisibility();
        });
      }
    });
    const btnResetColumns = document.getElementById('btnResetColumns');
    btnResetColumns?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(colPrefsKey);
      syncFromPrefs();
    });
    syncFromPrefs();

    list();
  });
})();                                                          
