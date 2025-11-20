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
    customerPay: document.getElementById('customerPay')
  };

  function fmt(n) { try { return Number(n||0).toLocaleString('vi-VN'); } catch { return n; } }
  function parseNumber(n) { const v = Number(n); return Number.isFinite(v) ? v : 0; }

  function tickClock() {
    if (!els.nowTs) return;
    const d = new Date();
    const dd = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    const tt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(d);
    els.nowTs.textContent = `${dd} ${tt}`;
  }

  function calcTotals() {
    // Placeholder calculation: sum visible items' line totals if any numeric present
    let subtotal = 0;
    els.items?.querySelectorAll('.pos-itemcard .line-total').forEach(el => {
      const raw = (el.textContent || '0').replace(/[^0-9.-]/g, '');
      const v = Number(raw);
      if (!Number.isNaN(v)) subtotal += v;
    });
    const discount = 0;
    const total = subtotal - discount;
    if (els.sumSubtotal) els.sumSubtotal.textContent = fmt(subtotal);
    if (els.sumDiscount) els.sumDiscount.textContent = fmt(discount);
    if (els.sumTotal) els.sumTotal.textContent = fmt(total);
  }

  function addItemCard(prod) {
    if (!els.items) return;
    const id = prod.id ?? '';
    const sku = prod.sku ?? '';
    const name = prod.name ?? prod.displayName ?? '';
    const price = parseNumber((prod.sellingPrice || '').toString().replace(/[^0-9.-]/g, ''));

    const row = document.createElement('div');
    row.className = 'pos-itemcard d-flex align-items-center';
    row.dataset.productId = id;
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
      <div class="price text-muted small">${fmt(price)}</div>
      <div class="line-total fw-bold">${fmt(price)}</div>
      <button class="icon-btn" title="More"><i class="fa fa-ellipsis"></i></button>
    `;
    els.items.appendChild(row);
    calcTotals();
    renumberItems();
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
    els.searchDropdown.innerHTML = items.map((p, idx) => {
      const sku = p.sku || '';
      const name = p.displayName || p.name || '';
      const price = p.sellingPrice || '';
      const inStock = p.isAvailable === true;
      const stockBadge = inStock ? '<span class="badge bg-success stock">In stock</span>' : '<span class="badge bg-secondary stock">Out</span>';
      const cls = idx === 0 ? 'item active' : 'item';
      return `
        <div class="${cls}" role="option" data-idx="${idx}" data-id="${p.id}" data-sku="${sku}" data-name="${p.name||''}" data-price="${price}">
          <span class="sku">${sku}</span>
          <span class="name">${name}</span>
          <span class="barcode">${p.barcode ? 'Barcode: ' + p.barcode : ''}</span>
          <span class="ms-auto meta">
            ${stockBadge}
            <span class="price">${price}</span>
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
        const price = parseNumber((card.querySelector('.price')?.textContent||'0').replace(/[^0-9.-]/g,''));
        let q = Math.max(1, parseInt(input.value || '1', 10) - 1);
        input.value = String(q);
        card.querySelector('.line-total').textContent = fmt(price * q);
        calcTotals();
      }
      if (e.target.closest('.btn-qty-plus')) {
        const input = card.querySelector('.qty input');
        const price = parseNumber((card.querySelector('.price')?.textContent||'0').replace(/[^0-9.-]/g,''));
        let q = Math.max(1, parseInt(input.value || '1', 10) + 1);
        input.value = String(q);
        card.querySelector('.line-total').textContent = fmt(price * q);
        calcTotals();
      }
    });
    els.items?.addEventListener('change', (e) => {
      const input = e.target.closest('.qty input');
      if (!input) return;
      const card = e.target.closest('.pos-itemcard');
      const price = parseNumber((card.querySelector('.price')?.textContent||'0').replace(/[^0-9.-]/g,''));
      let q = Math.max(1, parseInt(input.value || '1', 10));
      input.value = String(q);
      card.querySelector('.line-total').textContent = fmt(price * q);
      calcTotals();
    });

    els.btnComplete?.addEventListener('click', async (e) => {
      e.preventDefault();

      // Build items from DOM
      const items = [];
      document.querySelectorAll('.pos-itemcard').forEach(card => {
        const sku = (card.querySelector('.sku')?.textContent || '').trim();
        const name = (card.querySelector('.name')?.textContent || '').trim();
        const qty = Number(card.querySelector('.qty input')?.value || '1') || 1;
        const unitRaw = (card.querySelector('.price')?.textContent || '0').replace(/[^0-9.-]/g, '');
        const unitPrice = Number(unitRaw) || 0;
        const productId = card.dataset.productId ? Number(card.dataset.productId) : null;
        items.push({ productId, sku, name, quantity: qty, unitPrice, discount: 0 });
      });
      if (!items.length) {
        alert('Please add at least one product.');
        return;
      }

      const paidAmount = Number(els.customerPay?.value || '0') || 0;
      const payload = {
        customerName: document.getElementById('customerSearch')?.value || null,
        phoneNumber: null,
        paymentMethod: 'CASH',
        paidAmount,
        items
      };

      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/orders', { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Create failed: ${res.status} ${t}`);
        }
        const body = await res.json();
        const code = body?.data?.orderCode || 'Order';
        // Redirect back to orders list after creation
        window.location.href = '/order';
      } catch (err) {
        console.error(err);
        alert('Failed to create order.');
      }
    });
  });
})();
