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

  // Generate a unique-ish customer code when user leaves it blank
  function generateCustomerCode() {
    try {
      const ts = new Date();
      const y = ts.getFullYear().toString().slice(-2);
      const m = String(ts.getMonth() + 1).padStart(2, '0');
      const d = String(ts.getDate()).padStart(2, '0');
      const h = String(ts.getHours()).padStart(2, '0');
      const mi = String(ts.getMinutes()).padStart(2, '0');
      const s = String(ts.getSeconds()).padStart(2, '0');
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      // Example: CUST-2507-142530-ABCD
      return `CUST-${y}${m}${d}-${h}${mi}${s}-${rnd}`;
    } catch {
      return `CUST-${Date.now().toString(36).toUpperCase()}`;
    }
  }

  // Reset the entire order form to initial clean state (Guest + no items)
  function resetOrderForm() {
    try {
      // Clear products/items
      if (els.items) els.items.innerHTML = '';
      // Reset inputs
      const productSearch = document.getElementById('productSearch');
      const customerSearch = document.getElementById('customerSearch');
      const orderDiscount = document.getElementById('orderDiscount');
      const customerPay = document.getElementById('customerPay');
      const additionalPay = document.getElementById('additionalPay');
      const addPayContainer = document.getElementById('addPayContainer');
      const searchDropdown = document.getElementById('searchDropdown');

      if (productSearch) productSearch.value = '';
      if (orderDiscount) orderDiscount.value = '';
      if (customerPay) customerPay.value = '';
      if (additionalPay) additionalPay.value = '';
      if (addPayContainer) addPayContainer.style.display = 'none';
      if (customerSearch) customerSearch.value = 'Guest';
      clearCustomerError();

      // Clear search dropdown
      if (searchDropdown) { searchDropdown.innerHTML = ''; searchDropdown.classList.add('d-none'); }

      // Reset totals
      if (els.sumSubtotal) els.sumSubtotal.textContent = '0';
      if (els.sumDiscount) els.sumDiscount.textContent = '0';
      if (els.sumTotal) els.sumTotal.textContent = '0';
      if (els.sumChange) els.sumChange.textContent = '0';

      // Recalculate to ensure consistency
      calcTotals();

      // Focus product search for fast entry
      productSearch?.focus();
    } catch {}
  }

  // ---- Customer validation helpers ----
  function normName(s){ return (s||'').toString().toLowerCase().replace(/\s+/g,' ').trim(); }
  function isCustomerValueEmptyOrGuest(v) {
    const s = (v || '').trim();
    return !s || s.toLowerCase() === 'guest';
  }

  function isCustomerInDatalist(val) {
    const list = document.getElementById('customerOptions');
    const v = normName(val);
    if (!list || !v) return false;
    const opts = Array.from(list.options || []);
    return opts.some(o => normName(o.value) === v);
  }

  async function resolveCustomerFromServer(val) {
    const name = (val || '').trim();
    if (!name) return { ok: true, name: 'Guest', phone: null };
    try {
      const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/customers/autocomplete?query=${encodeURIComponent(name)}&limit=10`, { headers });
      if (!res.ok) return { ok: false };
      const body = await res.json();
      const items = body?.data || [];
      if (!Array.isArray(items) || !items.length) return { ok: false };
      const n = normName(name);
      const match = items.find(c => normName(c?.name) === n);
      if (!match) return { ok: false };
      return { ok: true, name: match.name || name, phone: match.phone || null };
    } catch {
      return { ok: false };
    }
  }

  function showCustomerError(msg) {
    const err = document.getElementById('customerError');
    const input = document.getElementById('customerSearch');
    // Never show error for Guest/empty
    if (isCustomerValueEmptyOrGuest(input?.value || '')) { clearCustomerError(); return; }
    if (err) {
      err.textContent = msg || 'Customer not found';
      err.style.display = 'block';
    }
    if (input) input.classList.add('is-invalid');
    try { showToastOnce('customer-not-found', msg || 'Customer not found', 'error'); } catch {}
  }

  function clearCustomerError() {
    const err = document.getElementById('customerError');
    if (err) err.style.display = 'none';
    const input = document.getElementById('customerSearch');
    if (input) input.classList.remove('is-invalid');
    try { hideToastByKey('customer-not-found'); } catch {}
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

  function getProdQty(p) {
    const keys = ['stock', 'qty', 'quantity', 'stockQuantity', 'onHand', 'availableQty', 'currentStock', 'inventory'];
    for (const k of keys) {
      if (p[k] != null && p[k] !== '') {
        const n = Number(p[k]);
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  }

  function addItemCard(prod) {
    if (!els.items) return;
    const id = prod.id ?? '';
    const sku = prod.sku ?? '';
    const name = prod.name ?? prod.displayName ?? '';
    const price = parseCurrencyText(prod.sellingPrice ?? '');
    const stock = getProdQty(prod);

    const row = document.createElement('div');
    row.className = 'pos-itemcard d-flex align-items-center';
    row.dataset.productId = id;
    row.dataset.unitPrice = String(price); // effective sale unit price
    row.dataset.originalUnitPrice = String(price); // original unit price
    if (stock !== null) row.dataset.stock = String(stock);

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
        sellingPrice: item.getAttribute('data-price'),
        stock: item.getAttribute('data-qty')
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

    // Customer autocomplete (populate datalist from server)
    (function initCustomerAutocomplete(){
      const input = document.getElementById('customerSearch');
      const list = document.getElementById('customerOptions');
      if (!input || !list) return;
      let timer = null;
      let lastIssued = 0;
      async function run(q){
        const issuedAt = Date.now();
        lastIssued = issuedAt;
        try {
          const query = (q || '').trim();
          // Always seed Guest option; no error on empty
          list.innerHTML = '<option value="Guest"></option>';
          if (!query) { return; }
          const headers = { 'Accept': 'application/json' };
          try {
            const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (t) headers['Authorization'] = `Bearer ${t}`;
          } catch {}
          const res = await fetch(`/api/customers/autocomplete?query=${encodeURIComponent(query)}&limit=10`, { headers });
          if (!res.ok) return;
          const body = await res.json();
          const items = Array.isArray(body?.data) ? body.data : [];
          // Discard out-of-order responses
          if (issuedAt !== lastIssued) return;
          if (!items.length) {
            const cur = (input.value || '').trim();
            if (cur && normName(cur) === normName(query)) {
              showCustomerError('Customer not found');
            }
            return;
          }
          const opts = items.map(c => {
            const name = (c?.name || '').toString();
            const phone = (c?.phone || '').toString();
            const value = name; // enforce selection by name
            const label = phone ? `${name} (${phone})` : name;
            return `<option value="${value}">${label}</option>`;
          }).join('');
          list.insertAdjacentHTML('beforeend', opts);
          // We have results; clear error for current non-empty query
          const cur = (input.value || '').trim();
          if (cur && normName(cur).length) {
            clearCustomerError();
          }
        } catch {}
      }
      input.addEventListener('input', (e) => {
        const q = (e.target.value || '').trim();
        clearTimeout(timer);
        if (!isCustomerValueEmptyOrGuest(q)) {
          // Immediate local check: if datalist has no non-Guest options matching current input, show error now
          const opts = Array.from(list.options || []);
          const qq = normName(q);
          const hasAny = opts.some(o => normName(o.value).includes(qq)) && opts.length > 1; // >1 to exclude only Guest
          if (!hasAny) showCustomerError('Customer not found'); else clearCustomerError();
        } else {
          clearCustomerError();
        }
        timer = setTimeout(() => run(q), 150);
      });
      input.addEventListener('change', () => { clearCustomerError(); });
      // Initial seed
      run('');
    })();

    // Inline customer create modal: load form from customers page and submit via AJAX
    (function initInlineCustomerCreate(){
      const btn = document.getElementById('btnAddCustomer');
      const modalEl = document.getElementById('customerCreateModal');
      const modalContent = document.getElementById('customerCreateModalContent');
      if (!btn || !modalEl || !modalContent) return;
      let loaded = false;
      
      function resetCustomerModalForm() {
        try {
          const frm = modalContent.querySelector('#frm');
          if (!frm) return;
          // Reset all inputs/selects/textareas
          frm.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') {
              if (el.id === 'isActive') el.checked = true; else el.checked = false;
            } else if (el.id === 'gender') {
              el.value = 'Male';
            } else {
              el.value = '';
            }
          });
          const title = modalContent.querySelector('#modalTitle'); if (title) title.textContent = 'New Customer';
          const id = modalContent.querySelector('#customerId'); if (id) id.value = '';
          const active = modalContent.querySelector('#isActive'); if (active) active.checked = true;
          const btnSave = modalContent.querySelector('#btnSave'); if (btnSave) { btnSave.classList.add('d-none'); btnSave.disabled = false; }
          const btnSaveNew = modalContent.querySelector('#btnSaveNew'); if (btnSaveNew) { btnSaveNew.classList.remove('d-none'); btnSaveNew.disabled = false; }
          const modalErr = modalContent.querySelector('#modalErr'); if (modalErr) { modalErr.textContent=''; modalErr.classList.add('d-none'); }
          // Reset button texts/spinners
          [btnSave, btnSaveNew].forEach(b => {
            if (!b) return;
            const def = b.querySelector('.default-text');
            const load = b.querySelector('.loading-text');
            if (def) def.classList.remove('d-none');
            if (load) load.classList.add('d-none');
          });
        } catch {}
      }

      async function loadCustomerForm() {
        if (loaded) return;
        try {
          const headers = { 'Accept': 'text/html' };
          const res = await fetch('/customers', { headers });
          if (!res.ok) throw new Error('Failed to load customer form');
          const html = await res.text();
          const temp = document.createElement('div');
          temp.innerHTML = html;
          const editModal = temp.querySelector('#editModal .modal-content');
          if (!editModal) throw new Error('Customer form not found');
          modalContent.innerHTML = editModal.innerHTML;
          setupCustomerFormHandlers();
          loaded = true;
        } catch (e) {
          modalContent.innerHTML = `<div class="modal-body"><div class="alert alert-danger">${e.message || 'Unable to load customer form'}</div></div>`;
        }
      }

      function setupCustomerFormHandlers() {
        try {
          const title = modalContent.querySelector('#modalTitle'); if (title) title.textContent = 'New Customer';
          const id = modalContent.querySelector('#customerId'); if (id) id.value = '';
          const active = modalContent.querySelector('#isActive'); if (active) active.checked = true;
          const btnSave = modalContent.querySelector('#btnSave'); if (btnSave) btnSave.classList.add('d-none');
          const btnSaveNew = modalContent.querySelector('#btnSaveNew'); if (btnSaveNew) btnSaveNew.classList.remove('d-none');
          const modalErr = modalContent.querySelector('#modalErr'); if (modalErr) { modalErr.textContent=''; modalErr.classList.add('d-none'); }

          // Apply consistent CSS for Cancel/Create buttons
          const btnCancel = modalContent.querySelector('.modal-footer [data-bs-dismiss="modal"]');
          if (btnCancel) { btnCancel.classList.add('btn', 'btn-secondary'); }
          if (btnSaveNew) { btnSaveNew.classList.add('btn', 'btn-primary'); }

          const setLoading = (btn, loading) => {
            if (!btn) return;
            btn.disabled = !!loading;
            const def = btn.querySelector('.default-text');
            const load = btn.querySelector('.loading-text');
            if (def && load) {
              if (loading) { def.classList.add('d-none'); load.classList.remove('d-none'); }
              else { def.classList.remove('d-none'); load.classList.add('d-none'); }
            }
          };

          async function submitNewCustomer() {
            const get = (sel) => modalContent.querySelector(sel);
            // Auto-generate code if empty
            let codeVal = get('#code')?.value || '';
            if (!codeVal || !codeVal.trim()) {
              codeVal = generateCustomerCode();
              const codeInput = get('#code');
              if (codeInput) codeInput.value = codeVal; // reflect to UI
            }
            const data = {
              code: codeVal,
              name: get('#name')?.value?.trim() || '',
              phone: get('#phone')?.value || '',
              email: get('#email')?.value || '',
              address: get('#address')?.value || '',
              // Optional fields supported by backend DTO; include if present
              gender: get('#gender')?.value || undefined,
              notes: get('#notes')?.value || undefined
            };
            if (!data.name) {
              if (modalErr) { modalErr.textContent = 'Name is required'; modalErr.classList.remove('d-none'); }
              return;
            }
            if (!data.phone || data.phone.trim() === '') {
              if (modalErr) { modalErr.textContent = 'Phone number is required'; modalErr.classList.remove('d-none'); }
              return;
            }
            const btn = get('#btnSaveNew');
            try {
              setLoading(btn, true);
              const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
              const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
              if (token) headers['Authorization'] = `Bearer ${token}`;
              const res = await fetch('/api/customers', { method: 'POST', headers, body: JSON.stringify(data) });
              let body = null;
              let text = '';
              try { body = await res.json(); } catch { try { text = await res.text(); } catch {}
              }
              if (!res.ok) {
                const msg = (body && (body.message || body.error || body.details)) || text || `Failed to save customer (${res.status})`;
                throw new Error(msg);
              }
              const c = body?.data || { name: data.name, phone: data.phone };
              // Insert into datalist and set input
              try {
                const list = document.getElementById('customerOptions');
                if (list) {
                  const label = c.phone ? `${c.name} (${c.phone})` : c.name;
                  const opt = document.createElement('option');
                  opt.value = c.name;
                  opt.textContent = label;
                  list.appendChild(opt);
                }
              } catch {}
              const input = document.getElementById('customerSearch');
              if (input && c?.name) { input.value = c.name; clearCustomerError(); }
              // Close modal without reloading
              const inst = bootstrap.Modal.getOrCreateInstance(modalEl);
              inst.hide();
              showToast('Customer created successfully', 'success');
            } catch (err) {
              if (modalErr) { modalErr.textContent = (err && err.message) ? err.message : 'Failed to save customer'; modalErr.classList.remove('d-none'); }
            } finally {
              setLoading(btn, false);
            }
          }

          // Bind create button and form submit (Enter key)
          const btnCreate = modalContent.querySelector('#btnSaveNew');
          btnCreate?.addEventListener('click', (e) => { e.preventDefault(); submitNewCustomer(); });
          const frm = modalContent.querySelector('#frm');
          frm?.addEventListener('submit', (e) => { e.preventDefault(); submitNewCustomer(); });
        } catch {}
      }

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await loadCustomerForm();
        // Always reset fields to empty on every open
        resetCustomerModalForm();
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      });

      // Also reset after the modal is closed/cancelled
      modalEl.addEventListener('hidden.bs.modal', () => { resetCustomerModalForm(); });
    })();

    // Validate/default customer on blur and typing
    try {
      const cInput = document.getElementById('customerSearch');
      cInput?.addEventListener('blur', async () => {
        const vRaw = cInput.value || '';
        const v = vRaw.trim();
        // Empty -> set Guest, no error
        if (!v) { cInput.value = 'Guest'; clearCustomerError(); return; }
        // Guest string -> always valid, no error
        if (isCustomerValueEmptyOrGuest(vRaw)) { clearCustomerError(); return; }
        // If listed in datalist -> valid
        if (isCustomerInDatalist(v)) { clearCustomerError(); return; }
        // Otherwise, verify with server
        const resolved = await resolveCustomerFromServer(v);
        if (resolved.ok) { clearCustomerError(); }
        else { showCustomerError('Customer not found'); }
      });
      cInput?.addEventListener('input', () => { clearCustomerError(); });
    } catch {}

    els.btnComplete?.addEventListener('click', async (e) => {
      e.preventDefault();

      // Build items from DOM
      const items = [];
      let stockGone = false;
      const cards = document.querySelectorAll('.pos-itemcard');
      for (const card of cards) {
        const sku = (card.querySelector('.sku')?.textContent || '').trim();
        const name = (card.querySelector('.name')?.textContent || '').trim();
        const qty = Number(card.querySelector('.qty input')?.value || '1') || 1;
        const originalUnitPrice = parseNumber(card.dataset.originalUnitPrice || card.dataset.unitPrice || '0');
        const percent = parseNumber(card.querySelector('.item-discount')?.value || '0');
        const unitPrice = Math.max(0, toMoney(originalUnitPrice * (1 - percent/100)));
        const productId = card.dataset.productId ? Number(card.dataset.productId) : null;

        // Check stock first
        const stockVal = card.dataset.stock;
        if (stockVal !== undefined && stockVal !== null && stockVal !== '') {
           const s = Number(stockVal);
           if (Number.isFinite(s) && s <= 0) {
              stockGone = true;
           }
        }

        // Send effective unit price and set discount to 0 to keep backend totals consistent
        items.push({ productId, sku, name, quantity: qty, unitPrice, discount: 0 });
      }

      if (stockGone) {
        showToast('Stock is gone.', 'error');
        return;
      }

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
      // Resolve customer per rules: empty -> Guest; else must exist
      const rawCustomer = (document.getElementById('customerSearch')?.value || '').trim();
      let resolvedName = 'Guest';
      let resolvedPhone = null;
      if (!isCustomerValueEmptyOrGuest(rawCustomer)) {
        if (isCustomerInDatalist(rawCustomer)) {
          resolvedName = rawCustomer;
        } else {
          const resolved = await resolveCustomerFromServer(rawCustomer);
          if (!resolved.ok) { showCustomerError('Customer not found'); return; }
          resolvedName = resolved.name || 'Guest';
          resolvedPhone = resolved.phone || null;
        }
      } else {
        // ensure UI shows Guest for clarity
        const cInput = document.getElementById('customerSearch');
        if (cInput && !cInput.value.trim()) cInput.value = 'Guest';
      }
      clearCustomerError();

      const payload = {
        customerName: resolvedName,
        phoneNumber: resolvedPhone,
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
          showToast('Customer pays less than total.', 'error');
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
          // Create flow: stay on page, fully reset to initial state (Guest + cleared inputs)
          showToast(`Created ${code} successfully.`, 'success');
          resetOrderForm();
        }
      } catch (err) {
        console.error(err);
        showToast('Stock is gone.', 'error', 5000);
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
// Global toast helpers to dedupe messages while typing
function kvEnsureToastContainer() {
  let el = document.getElementById('posToastContainer');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'posToastContainer';
  el.className = 'pos-toast-container';
  document.body.appendChild(el);
  return el;
}

function showToastOnce(key, message, type = 'info', timeoutMs = 2500) {
  const container = kvEnsureToastContainer();
  const existing = container.querySelector(`.pos-toast[data-key="${key}"]`);
  if (existing) return;
  const toast = document.createElement('div');
  const cls = type === 'success' ? 'pos-toast--success' : type === 'error' ? 'pos-toast--error' : 'pos-toast--info';
  toast.className = `pos-toast ${cls}`;
  toast.setAttribute('data-key', key);
  toast.innerHTML = `<span class="pos-toast__msg">${message}</span><button class="pos-toast__close" aria-label="Close">A-</button>`;
  container.appendChild(toast);
  const remove = () => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); };
  toast.querySelector('.pos-toast__close')?.addEventListener('click', remove);
  setTimeout(remove, timeoutMs);
}

function hideToastByKey(key) {
  const container = kvEnsureToastContainer();
  const el = container.querySelector(`.pos-toast[data-key="${key}"]`);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}
