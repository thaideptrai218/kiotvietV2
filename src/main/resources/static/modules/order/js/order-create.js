(() => {
  const els = {
    productSearch: document.getElementById('productSearch'),
    searchDropdown: document.getElementById('searchDropdown'),
    nowTs: document.getElementById('nowTs'),
    btnComplete: document.getElementById('btnComplete'),
    items: document.getElementById('items'),
    sumSubtotal: document.getElementById('sumSubtotal'),
    sumDiscount: document.getElementById('sumDiscount'),
    sumTotal: document.getElementById('sumTotal'),
    customerPay: document.getElementById('customerPay'),
    orderDiscount: document.getElementById('orderDiscount'),
    sumChange: document.getElementById('sumChange'),
    sumChangeLabel: document.getElementById('sumChangeLabel'),
    addPayContainer: document.getElementById('addPayContainer'),
    additionalPay: document.getElementById('additionalPay')
  };

  // Populate current user name from token if available
  (function setCurrentUserName(){
    try {
      const el = document.getElementById('currentUserName');
      if (!el) return;
      const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!t) return;
      const payload = JSON.parse(atob((t.split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/')) || '{}');
      const name = payload.fullName || payload.name || payload.username || payload.sub || '';
      if (name) el.textContent = name;
    } catch {}
  })();

  // Default customer to 'Guest' if empty
  (function setDefaultCustomer(){
    try {
      const el = document.getElementById('customerSearch');
      if (el && (!el.value || el.value.trim() === '')) {
        el.value = 'Guest';
      }
    } catch {}
  })();

  function fmt(n) {
    try {
      return Number(n || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
    } catch { return n; }
  }
  function parseNumber(n) { const v = Number(n); return Number.isFinite(v) ? v : 0; }
  function toMoney(n) { const v = Number(n); return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0; }
  function parseCurrencyText(text) {
    // Robustly parse strings like "2,18", "1.234,56", "1,234.56", or plain digits
    let s = (text ?? '').toString().trim();
    if (!s) return 0;
    let sign = 1;
    if (s.startsWith('-')) { sign = -1; s = s.slice(1); }
    s = s.replace(/[^0-9,\.]/g, '');
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    let decSep = null;
    if (hasComma && hasDot) {
      decSep = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
    } else if (hasComma) {
      decSep = ',';
    } else if (hasDot) {
      decSep = '.';
    }
    if (decSep) {
      const i = s.lastIndexOf(decSep);
      const intPart = s.slice(0, i).replace(/[^0-9]/g, '');
      const fracPart = s.slice(i + 1).replace(/[^0-9]/g, '');
      const num = parseFloat((intPart || '0') + '.' + (fracPart || '0'));
      return sign * (Number.isFinite(num) ? num : 0);
    } else {
      const intPart = s.replace(/[^0-9]/g, '');
      const num = parseFloat(intPart || '0');
      return sign * (Number.isFinite(num) ? num : 0);
    }
  }

  // Toast/notification utilities
  function ensureToastContainer() {
    let el = document.getElementById('posToastContainer');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'posToastContainer';
    el.className = 'pos-toast-container';
    document.body.appendChild(el);
    return el;
  }

  function showToast(message, type = 'info', timeoutMs = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    const cls = type === 'success' ? 'pos-toast--success' : type === 'error' ? 'pos-toast--error' : 'pos-toast--info';
    toast.className = `pos-toast ${cls}`;
    toast.innerHTML = `<span class="pos-toast__msg">${message}</span><button class="pos-toast__close" aria-label="Close">×</button>`;
    container.appendChild(toast);
    const remove = () => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); };
    toast.querySelector('.pos-toast__close')?.addEventListener('click', remove);
    setTimeout(remove, timeoutMs);
  }

  // Update confirm modal (shown only in update mode)
  function confirmUpdateProceed() {
    return new Promise((resolve) => {
      // Build modal lazily
      let overlay = document.getElementById('posConfirmOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'posConfirmOverlay';
        overlay.className = 'pos-modal-backdrop';
        overlay.innerHTML = `
          <div class="pos-modal" role="dialog" aria-modal="true" aria-labelledby="posConfirmTitle">
            <div class="pos-modal__content">
              <div class="pos-modal__body">
                <div id="posConfirmTitle" class="fw-semibold mb-2">Promotion programs</div>
                <div class="pos-modal__msg">
                  <div>When changing information on the invoice, the system will:</div>
                  <ul class="mb-2">
                    <li>Cancel old invoice and create new invoice</li>
                    <li>If you change product quantity, please make sure there are enough products in stock. The system will not check again.</li>
                  </ul>
                  <div>Do you want to continue?</div>
                </div>
              </div>
              <div class="pos-modal__actions">
                <button type="button" class="btn btn-secondary" id="posConfirmCancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="posConfirmOk">Continue</button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(overlay);
      }
      const close = () => { overlay.classList.remove('show'); };
      const okBtn = overlay.querySelector('#posConfirmOk');
      const cancelBtn = overlay.querySelector('#posConfirmCancel');
      const onKey = (e) => { if (e.key === 'Escape') { cleanup(false); } };
      const cleanup = (val) => {
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        document.removeEventListener('keydown', onKey);
        close();
        resolve(val);
      };
      const onOk = () => cleanup(true);
      const onCancel = () => cleanup(false);
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false); });
      document.addEventListener('keydown', onKey);
      requestAnimationFrame(() => overlay.classList.add('show'));
    });
  }

  function getTotals() {
    let subtotal = 0;
    els.items?.querySelectorAll('.pos-itemcard').forEach(card => {
      const unit = parseNumber(card.dataset.unitPrice || '0');
      const qty = parseInt(card.querySelector('.qty input')?.value || '1', 10) || 1;
      subtotal += (unit * qty);
    });
    subtotal = toMoney(subtotal);
    const dpRaw = parseFloat(els.orderDiscount?.value || '0');
    const dp = isNaN(dpRaw) ? 0 : Math.min(Math.max(dpRaw, 0), 100);
    const discount = toMoney(subtotal * (dp / 100));
    const total = toMoney(Math.max(0, subtotal - discount));
    const paid = parseCurrencyText(els.customerPay?.value || '0');
    return { subtotal, discount, total, paid, discountPercent: dp };
  }

  function tickClock() {
    if (!els.nowTs) return;
    const d = new Date();
    const dd = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    const tt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(d);
    els.nowTs.textContent = `${dd} ${tt}`;
  }

  function calcTotals() {
    // Compute from numeric card data, not formatted text
    const { subtotal, discount, total } = getTotals();
    if (els.sumSubtotal) els.sumSubtotal.textContent = fmt(subtotal);
    if (els.sumDiscount) els.sumDiscount.textContent = fmt(discount);
    if (els.sumTotal) els.sumTotal.textContent = fmt(total);
    // Determine mode and show Remaining/Change appropriately
    const params = new URLSearchParams(window.location.search || '');
    const isUpdate = !!params.get('orderId');
    const basePaid = parseCurrencyText(els.customerPay?.value || '0');
    const addPaid = parseCurrencyText(els.additionalPay?.value || '0');
    const effectivePaid = isUpdate ? (basePaid + addPaid) : basePaid;
    const delta = toMoney(effectivePaid - total);
    if (els.sumChangeLabel && els.sumChange) {
      if (isUpdate) {
        if (delta >= 0) {
          els.sumChangeLabel.textContent = 'Change';
          els.sumChange.textContent = fmt(delta);
          els.sumChange.classList.toggle('text-danger', false);
          els.sumChange.classList.toggle('text-success', true);
        } else {
          els.sumChangeLabel.textContent = 'Remaining';
          els.sumChange.textContent = fmt(toMoney(-delta));
          els.sumChange.classList.toggle('text-danger', true);
          els.sumChange.classList.toggle('text-success', false);
        }
      } else {
        els.sumChangeLabel.textContent = 'Change';
        els.sumChange.textContent = fmt(delta);
        els.sumChange.classList.toggle('text-danger', delta < 0);
        els.sumChange.classList.toggle('text-success', delta >= 0);
      }
    }
  }

  function addItemCard(prod) {
    if (!els.items) return;
    const id = prod.id ?? '';
    const sku = prod.sku ?? '';
    const name = prod.name ?? prod.displayName ?? '';
    const price = parseCurrencyText(prod.sellingPrice ?? '');

    const row = document.createElement('div');
    row.className = 'pos-itemcard d-flex align-items-center';
    row.dataset.productId = id;
    row.dataset.unitPrice = String(price); // effective sale unit price
    row.dataset.originalUnitPrice = String(price); // original unit price
    row.innerHTML = `
      <div class="stt"></div>
      <button class="icon-btn text-danger" title="Remove"><i class="fa fa-trash-can"></i></button>
      <div class="sku text-muted small">${sku}</div>
      <div class="name flex-grow-1 fw-semibold">${name}</div>
      <div class="qty d-flex align-items-center">
        <button class="btn btn-light btn-sm btn-qty-minus">-</button>
        <input type="number" class="form-control form-control-sm text-center" value="1" min="1">
        <button class="btn btn-light btn-sm btn-qty-plus">+</button>
      </div>
      <div class="discount d-flex align-items-center">
        <input type="number" class="form-control form-control-sm text-end item-discount" value="" min="0" max="100" step="1" placeholder="discount">
      </div>
      <div class="price text-muted small">${fmt(price)}</div>
      <div class="line-total fw-bold">${fmt(price)}</div>
      <button class="icon-btn" title="More"><i class="fa fa-ellipsis"></i></button>
    `;
    els.items.appendChild(row);
    calcTotals();
    renumberItems();
  }

  // ===== Update mode helpers =====
  function authHeaders() {
    const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const h = { 'Accept': 'application/json' };
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }

  function upsertUpdateBanner(orderCode) {
    const container = document.querySelector('.pos-rightpanel .pos-panel') || document.querySelector('.pos-rightpanel');
    if (!container) return;
    let b = document.getElementById('updateBanner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'updateBanner';
      b.className = 'pos-update-banner';
      container.prepend(b);
    }
    b.textContent = orderCode ? `Update from ${orderCode}` : 'Update';
  }

  function addExistingItem(it) {
    if (!els.items) return;
    const sku = it.productCode || '';
    const name = it.productName || '';
    const original = parseNumber(it.unitPrice || 0);
    const perItemDisc = parseNumber(it.discount || 0);
    const percent = original > 0 ? Math.min(100, Math.max(0, Math.round((perItemDisc * 10000) / original) / 100)) : 0; // to 2 decimals
    const unit = Math.max(0, toMoney(original * (1 - (percent / 100)))); // effective sale unit price
    const qty = Number(it.quantity || 1);
    const row = document.createElement('div');
    row.className = 'pos-itemcard d-flex align-items-center';
    row.dataset.unitPrice = String(unit);
    row.dataset.originalUnitPrice = String(original);
    row.innerHTML = `
      <div class="stt"></div>
      <button class="icon-btn text-danger" title="Remove"><i class="fa fa-trash-can"></i></button>
      <div class="sku text-muted small">${sku}</div>
      <div class="name flex-grow-1 fw-semibold">${name}</div>
      <div class="qty d-flex align-items-center">
        <button class="btn btn-light btn-sm btn-qty-minus">-</button>
        <input type="number" class="form-control form-control-sm text-center" value="${qty}" min="1">
        <button class="btn btn-light btn-sm btn-qty-plus">+</button>
      </div>
      <div class="discount d-flex align-items-center">
        <input type="number" class="form-control form-control-sm text-end item-discount" value="${percent}" min="0" max="100" step="1" placeholder="discount">
      </div>
      <div class="price text-muted small">${fmt(original)}</div>
      <div class="line-total fw-bold">${fmt(toMoney(unit * qty))}</div>
      <button class="icon-btn" title="More"><i class="fa fa-ellipsis"></i></button>
    `;
    els.items.appendChild(row);
  }

  function prefillFromData(d) {
    try {
      if (document.getElementById('customerSearch')) {
        document.getElementById('customerSearch').value = d.customerName || 'Guest';
      }
      if (els.orderDiscount) {
        const dp = d.discountPercent;
        els.orderDiscount.value = (dp != null && !Number.isNaN(Number(dp))) ? String(dp) : '';
      }
      if (els.customerPay) {
        const pa = d.paidAmount;
        els.customerPay.value = (pa != null && !Number.isNaN(Number(pa))) ? String(pa) : '';
      }
      if (els.items) {
        els.items.innerHTML = '';
        (d.items || []).forEach(addExistingItem);
        renumberItems();
        calcTotals();
      }
      upsertUpdateBanner(d.orderCode || '');
      if (els.addPayContainer) els.addPayContainer.style.display = '';
      if (els.additionalPay) els.additionalPay.value = '';
    } catch (e) { console.error(e); }
  }

  async function loadExistingOrder(orderId) {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/detail`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load order ${orderId}`);
      const body = await res.json();
      const d = body?.data || {};
      // Prefill header info
      if (document.getElementById('customerSearch')) {
        document.getElementById('customerSearch').value = d.customerName || 'Guest';
      }
      if (els.orderDiscount) {
        // discountPercent comes from API as number (0-100)
        els.orderDiscount.value = d.discountPercent != null ? String(d.discountPercent) : '';
      }
      if (els.customerPay) {
        els.customerPay.value = d.paidAmount != null ? String(d.paidAmount) : '';
      }
      if (els.items) {
        els.items.innerHTML = '';
        (d.items || []).forEach(addExistingItem);
        renumberItems();
        calcTotals();
      }
      upsertUpdateBanner(d.orderCode || '');
      // Show additional payment field in update mode
      if (els.addPayContainer) els.addPayContainer.style.display = '';
      if (els.additionalPay) els.additionalPay.value = '';
    } catch (e) {
      console.error(e);
      alert('Failed to load order for update.');
    }
  }

  function renumberItems() {
    if (!els.items) return;
    const cards = els.items.querySelectorAll('.pos-itemcard');
    let i = 1;
    cards.forEach(card => {
      const el = card.querySelector('.stt');
      if (el) el.textContent = String(i++);
    });
  }

  function hideDropdown() {
    if (els.searchDropdown) {
      els.searchDropdown.classList.add('d-none');
      els.searchDropdown.innerHTML = '';
    }
  }

  let searchTimer = null;
  let activeIndex = -1;
  let lastResults = [];

  function renderDropdown(items) {
    if (!els.searchDropdown) return;
    lastResults = items || [];
    activeIndex = items.length ? 0 : -1;
    function asQty(p){
      const keys = ['qty','quantity','stock','stockQuantity','onHand','availableQty','currentStock','inventory'];
      for (const k of keys) { if (p[k] != null && p[k] !== '') { const n = Number(p[k]); if (Number.isFinite(n)) return n; } }
      if (p.isAvailable === true) return null; // unknown qty
      return null;
    }
    els.searchDropdown.innerHTML = items.map((p, idx) => {
      const sku = p.sku || '';
      const name = p.displayName || p.name || '';
      const price = p.sellingPrice || '';
      const qty = asQty(p);
      let stockBadge = '';
      if (qty == null) {
        stockBadge = '<span class="badge bg-secondary stock">Qty: --</span>';
      } else if (qty > 0) {
        stockBadge = `<span class="badge bg-success stock">Qty: ${qty}</span>`;
      } else {
        stockBadge = '<span class="badge bg-danger stock">Qty: 0</span>';
      }
      const cls = idx === 0 ? 'item active' : 'item';
      return `
        <div class="${cls}" role="option" data-idx="${idx}" data-id="${p.id}" data-sku="${sku}" data-name="${p.name||''}" data-price="${price}" data-qty="${qty ?? ''}">
          <span class="sku">${sku}</span>
          <span class="name">${name}</span>
          <span class="barcode">${p.barcode ? 'Barcode: ' + p.barcode : ''}</span>
          <span class="ms-auto meta">
            ${stockBadge}
            <span class="price">${fmt(price)}</span>
          </span>
        </div>`;
    }).join('');
    els.searchDropdown.classList.remove('d-none');
  }

  function setActive(idx) {
    if (!els.searchDropdown) return;
    const items = Array.from(els.searchDropdown.querySelectorAll('.item'));
    if (!items.length) return;
    if (idx < 0) idx = 0; if (idx >= items.length) idx = items.length - 1;
    items.forEach(el => el.classList.remove('active'));
    items[idx].classList.add('active');
    activeIndex = idx;
    items[idx].scrollIntoView({ block: 'nearest' });
  }
  async function runSearch(q) {
    if (!q || q.length < 2) { hideDropdown(); return; }
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`/api/products/autocomplete?query=${encodeURIComponent(q)}&limit=10`, { headers });
      if (!res.ok) throw new Error('search failed');
      const body = await res.json();
      const items = body?.data || [];
      if (!els.searchDropdown) return;
      if (!items.length) { hideDropdown(); return; }
      renderDropdown(items);
    } catch (e) {
      hideDropdown();
    }
  }

  async function runSearchFallbackSingle(q) {
    // Use main products listing to fetch a single best match
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&page=0&size=1`, { headers });
    if (!res.ok) return null;
    const body = await res.json();
    const content = body?.data?.content || [];
    if (!content.length) return null;
    const p = content[0];
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      sellingPrice: (p.sellingPrice || 0).toString(),
      isAvailable: p.isAvailable
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    tickClock();
    setInterval(tickClock, 30_000);
    calcTotals();

    // Search typing
    els.productSearch?.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runSearch(q), 200);
    });
    // Keyboard navigation + add via Enter
    els.productSearch?.addEventListener('keydown', async (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Escape') {
        hideDropdown();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const items = Array.from(els.searchDropdown?.querySelectorAll('.item') || []);
        if (items.length === 1) { items[0].click(); return; }
        const active = els.searchDropdown?.querySelector('.item.active');
        if (active) { active.click(); return; }
        const q = (els.productSearch?.value || '').trim();
        if (!q) return;
        // Try exact lookup by SKU/barcode first
        try {
          const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          const headers = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`/api/products/lookup?code=${encodeURIComponent(q)}`, { headers });
          if (res.ok) {
            const body = await res.json();
            if (body?.data) {
              addItemCard(body.data);
              if (els.productSearch) els.productSearch.value = '';
              hideDropdown();
              els.productSearch?.focus();
              return;
            }
          }
        } catch {}
        // Fallback to best single match via search
        const single = await runSearchFallbackSingle(q);
        if (single) {
          addItemCard(single);
          if (els.productSearch) els.productSearch.value = '';
          hideDropdown();
          els.productSearch?.focus();
        }
      }
    });
    // Select product from dropdown
    els.searchDropdown?.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const prod = {
        id: item.getAttribute('data-id'),
        sku: item.getAttribute('data-sku'),
        name: item.getAttribute('data-name'),
        sellingPrice: item.getAttribute('data-price')
      };
      addItemCard(prod);
      if (els.productSearch) els.productSearch.value = '';
      hideDropdown();
      els.productSearch?.focus();
    });
    // Mouse hover to update active
    els.searchDropdown?.addEventListener('mousemove', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const idx = Number(item.getAttribute('data-idx'));
      if (Number.isFinite(idx)) setActive(idx);
    });
    document.addEventListener('click', (e) => {
      if (!els.searchDropdown) return;
      if (!e.target.closest('.pos-search')) hideDropdown();
    });

    // Item interactions via delegation
    els.items?.addEventListener('click', (e) => {
      const card = e.target.closest('.pos-itemcard');
      if (!card) return;
      if (e.target.closest('.text-danger')) { // delete
        card.remove();
        calcTotals();
        renumberItems();
        return;
      }
      if (e.target.closest('.btn-qty-minus')) {
        const input = card.querySelector('.qty input');
        const price = parseNumber(card.dataset.unitPrice || '0');
        let q = Math.max(1, parseInt(input.value || '1', 10) - 1);
        input.value = String(q);
        card.querySelector('.line-total').textContent = fmt(toMoney(price * q));
        calcTotals();
      }
      if (e.target.closest('.btn-qty-plus')) {
        const input = card.querySelector('.qty input');
        const price = parseNumber(card.dataset.unitPrice || '0');
        let q = Math.max(1, parseInt(input.value || '1', 10) + 1);
        input.value = String(q);
        card.querySelector('.line-total').textContent = fmt(toMoney(price * q));
        calcTotals();
      }
    });
    // Live update while typing per-item discount
    els.items?.addEventListener('input', (e) => {
      const card = e.target.closest('.pos-itemcard');
      if (!card) return;
      const discInput = e.target.closest('.item-discount');
      if (discInput) {
        const original = parseNumber(card.dataset.originalUnitPrice || card.dataset.unitPrice || '0');
        // Do not force the input value while typing; just compute within 0-100 bounds
        let d = parseNumber(discInput.value || '0');
        if (!Number.isFinite(d)) d = 0;
        if (d < 0) d = 0;
        if (d > 100) d = 100;
        const sale = Math.max(0, toMoney(original * (1 - d/100)));
        card.dataset.unitPrice = String(sale);
        // Keep displayed price as original; only update line total
        const q = Math.max(1, parseInt(card.querySelector('.qty input')?.value || '1', 10));
        card.querySelector('.line-total').textContent = fmt(toMoney(sale * q));
        calcTotals();
      }
    });

    els.items?.addEventListener('change', (e) => {
      const card = e.target.closest('.pos-itemcard');
      if (!card) return;
      // Quantity change
      const qtyInput = e.target.closest('.qty input');
      if (qtyInput) {
        const price = parseNumber(card.dataset.unitPrice || '0');
        let q = Math.max(1, parseInt(qtyInput.value || '1', 10));
        qtyInput.value = String(q);
        card.querySelector('.line-total').textContent = fmt(toMoney(price * q));
        calcTotals();
        return;
      }
      // Per-item discount change (percent)
      const discInput = e.target.closest('.item-discount');
      if (discInput) {
        const original = parseNumber(card.dataset.originalUnitPrice || card.dataset.unitPrice || '0');
        let d = parseNumber(discInput.value || '0'); // %
        if (d < 0) d = 0;
        if (d > 100) d = 100;
        discInput.value = String(d);
        const sale = Math.max(0, toMoney(original * (1 - d/100)));
        card.dataset.unitPrice = String(sale);
        // Keep displayed price as original; only update line total
        const q = Math.max(1, parseInt(card.querySelector('.qty input')?.value || '1', 10));
        card.querySelector('.line-total').textContent = fmt(toMoney(sale * q));
        calcTotals();
      }
    });

    // Discount and customer pay auto-calculation
    els.orderDiscount?.addEventListener('input', () => { calcTotals(); });
    els.customerPay?.addEventListener('input', () => { calcTotals(); });
    els.additionalPay?.addEventListener('input', () => { calcTotals(); });

    els.btnComplete?.addEventListener('click', async (e) => {
      e.preventDefault();

      // Build items from DOM
      const items = [];
      document.querySelectorAll('.pos-itemcard').forEach(card => {
        const sku = (card.querySelector('.sku')?.textContent || '').trim();
        const name = (card.querySelector('.name')?.textContent || '').trim();
        const qty = Number(card.querySelector('.qty input')?.value || '1') || 1;
        const originalUnitPrice = parseNumber(card.dataset.originalUnitPrice || card.dataset.unitPrice || '0');
        const percent = parseNumber(card.querySelector('.item-discount')?.value || '0');
        const unitPrice = Math.max(0, toMoney(originalUnitPrice * (1 - percent/100)));
        const productId = card.dataset.productId ? Number(card.dataset.productId) : null;
        // Send effective unit price and set discount to 0 to keep backend totals consistent
        items.push({ productId, sku, name, quantity: qty, unitPrice, discount: 0 });
      });
      if (!items.length) {
        alert('Please add at least one product.');
        return;
      }

      const params = new URLSearchParams(window.location.search || '');
      const orderId = params.get('orderId');
      const basePaidAmount = parseCurrencyText(els.customerPay?.value || '0');
      const addPaidAmount = parseCurrencyText(els.additionalPay?.value || '0');
      const paidAmount = orderId ? (basePaidAmount + addPaidAmount) : basePaidAmount;
      const orderDiscountPercent = (function(){
        const v = parseFloat(els.orderDiscount?.value || '0');
        if (isNaN(v)) return 0;
        return Math.min(Math.max(v, 0), 100);
      })();
      const payload = {
        customerName: (function(){ const v = document.getElementById('customerSearch')?.value || ''; return v.trim() ? v : 'Guest'; })(),
        phoneNumber: null,
        paymentMethod: 'CASH',
        paidAmount,
        orderDiscountPercent,
        items
      };

      try {
        // Determine mode: update when orderId is present
        // orderId already computed above
        if (orderId) {
          const ok = await confirmUpdateProceed();
          if (!ok) { return; }
        }
        const { total } = getTotals();
        const effectivePaidCheck = paidAmount; // already includes additional in update
        if (effectivePaidCheck < total) {
          showToast('Customer pays less than total. Order will be saved as DRAFT.', 'error');
        }
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const url = orderId ? `/api/orders/${encodeURIComponent(orderId)}` : '/api/orders';
        const method = orderId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`${method==='PUT'?'Update':'Create'} failed: ${res.status} ${t}`);
        }
        const body = await res.json();
        const code = body?.data?.orderCode || 'Order';
        if (orderId) {
          // Update flow: store a flash and go to clean create page
          try { sessionStorage.setItem('kv.order.flash', JSON.stringify({ message: `Updated ${code} successfully.`, type: 'success' })); } catch {}
          window.location.href = '/order/create';
          return;
        } else {
          // Create flow: stay on page, reset draft
          showToast(`Created ${code} successfully.`, 'success');
          if (els.items) els.items.innerHTML = '';
          if (els.customerPay) els.customerPay.value = '';
          calcTotals();
          els.productSearch?.focus();
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to save order.', 'error', 5000);
      }
    });

    // If landing with orderId param, switch to update mode and prefill
    try {
      const params = new URLSearchParams(window.location.search || '');
      const orderId = params.get('orderId');
      // Prefer stashed data from the expanded panel to avoid extra fetch
      const stashRaw = sessionStorage.getItem('kv.order.update');
      if (stashRaw) {
        try { const stash = JSON.parse(stashRaw); if (stash && typeof stash === 'object') prefillFromData(stash); } catch {}
        // clear after use
        sessionStorage.removeItem('kv.order.update');
      } else if (orderId) {
        loadExistingOrder(orderId);
      }
      // Adjust button label in update mode
      if (orderId && els.btnComplete) {
        els.btnComplete.textContent = 'UPDATE';
      }
      // Flash notification (from update success redirect)
      try {
        const f = sessionStorage.getItem('kv.order.flash');
        if (f) {
          const { message, type } = JSON.parse(f);
          if (message) showToast(message, type || 'info');
          sessionStorage.removeItem('kv.order.flash');
        }
      } catch {}
    } catch {}
  });
})();
