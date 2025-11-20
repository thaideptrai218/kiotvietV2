(() => {
  const columnDefaults = {
    ordercode: true,
    orderdate: true,
    customer: true,
    phonenumber: false,
    subtotal: true,
    discount: true,
    customerpays: false,
    remaining: false,
    paidamount: true,
    paymentmethod: true,
    cashier: false,
    status: true
  };

  const state = {
    columns: { ...columnDefaults },
    selected: new Set(),
    forceBulk: false
  };

  const els = {};

  function cacheElements() {
    els.table = document.getElementById('tblPreorder');
    els.tblBody = document.querySelector('#tblPreorder tbody');
    els.chkAll = document.getElementById('chkAll');
    els.hdrNormal = document.getElementById('hdrNormal');
    els.hdrBulk = document.getElementById('hdrBulk');
    els.selCount = document.getElementById('selCount');
    els.btnClearSel = document.getElementById('btnClearSel');
    els.btnBulkDelete = document.getElementById('btnBulkDelete');
    els.colOrderCode = document.getElementById('colOrderCode');
    els.colOrderDate = document.getElementById('colOrderDate');
    els.colCustomer = document.getElementById('colCustomer');
    els.colPhoneNumber = document.getElementById('colPhoneNumber');
    els.colSubTotal = document.getElementById('colSubTotal');
    els.colDiscount = document.getElementById('colDiscount');
    els.colPaidAmount = document.getElementById('colPaidAmount');
    els.colCustomerPays = document.getElementById('colCustomerPays');
    els.colRemaining = document.getElementById('colRemaining');
    els.colPaymentMethod = document.getElementById('colPaymentMethod');
    els.colCashier = document.getElementById('colCashier');
    els.colStatus = document.getElementById('colStatus');
    els.btnResetColumns = document.getElementById('btnResetColumns');
  }

  function storageKey() {
    try {
      const token = localStorage.getItem('jwtToken')
        || sessionStorage.getItem('jwtToken')
        || localStorage.getItem('accessToken')
        || sessionStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        return `orders.columns.v1.${payload.companyId || 'default'}`;
      }
    } catch {
      /* ignore */
    }
    return 'orders.columns.v1.default';
  }

  function saveColumns() {
    localStorage.setItem(storageKey(), JSON.stringify(state.columns));
  }

  function applyColumnVisibility() {
    if (!els.table) return;
    els.table.querySelectorAll('th[data-col], td[data-col]').forEach((el) => {
      const key = el.getAttribute('data-col');
      if (!key) return;
      el.classList.toggle('col-hidden', state.columns[key] === false);
    });
  }

  function syncCheckboxes() {
    if (els.colOrderCode) els.colOrderCode.checked = !!state.columns.ordercode;
    if (els.colOrderDate) els.colOrderDate.checked = !!state.columns.orderdate;
    if (els.colCustomer) els.colCustomer.checked = !!state.columns.customer;
    if (els.colPhoneNumber) els.colPhoneNumber.checked = !!state.columns.phonenumber;
    if (els.colSubTotal) els.colSubTotal.checked = !!state.columns.subtotal;
    if (els.colDiscount) els.colDiscount.checked = !!state.columns.discount;
    if (els.colCustomerPays) els.colCustomerPays.checked = !!state.columns.customerpays;
    if (els.colRemaining) els.colRemaining.checked = !!state.columns.remaining;
    if (els.colPaidAmount) els.colPaidAmount.checked = !!state.columns.paidamount;
    if (els.colPaymentMethod) els.colPaymentMethod.checked = !!state.columns.paymentmethod;
    if (els.colCashier) els.colCashier.checked = !!state.columns.cashier;
    if (els.colStatus) els.colStatus.checked = !!state.columns.status;
  }

  function loadColumns() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}');
      if (saved && typeof saved === 'object') {
        state.columns = { ...columnDefaults, ...saved };
      } else {
        state.columns = { ...columnDefaults };
      }
    } catch {
      state.columns = { ...columnDefaults };
    }
    syncCheckboxes();
    applyColumnVisibility();
  }

  function bindColumnToggle(input, key) {
    if (!input) return;
    input.addEventListener('change', () => {
      state.columns[key] = input.checked;
      saveColumns();
      applyColumnVisibility();
    });
  }

  function bindColumnControls() {
    bindColumnToggle(els.colOrderCode, 'ordercode');
    bindColumnToggle(els.colOrderDate, 'orderdate');
    bindColumnToggle(els.colCustomer, 'customer');
    bindColumnToggle(els.colPhoneNumber, 'phonenumber');
    bindColumnToggle(els.colSubTotal, 'subtotal');
    bindColumnToggle(els.colDiscount, 'discount');
    bindColumnToggle(els.colCustomerPays, 'customerpays');
    bindColumnToggle(els.colRemaining, 'remaining');
    bindColumnToggle(els.colPaidAmount, 'paidamount');
    bindColumnToggle(els.colPaymentMethod, 'paymentmethod');
    bindColumnToggle(els.colCashier, 'cashier');
    bindColumnToggle(els.colStatus, 'status');

    els.btnResetColumns?.addEventListener('click', () => {
      state.columns = { ...columnDefaults };
      saveColumns();
      syncCheckboxes();
      applyColumnVisibility();
    });
  }

  function rowChecks() {
    return els.tblBody ? Array.from(els.tblBody.querySelectorAll('input.row-check')) : [];
  }

  function rowIdFromCheckbox(cb) {
    if (!cb) return null;
    if (!cb.dataset.rowId) {
      const fallback = cb.dataset.id
        || cb.value
        || cb.id
        || cb.name
        || cb.closest('tr')?.dataset.id;
      cb.dataset.rowId = fallback || `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    return cb.dataset.rowId;
  }

  function syncHeaderCheckbox() {
    if (!els.chkAll) return;
    const checks = rowChecks();
    if (!checks.length) {
      els.chkAll.indeterminate = false;
      return;
    }
    const checked = checks.filter((cb) => cb.checked).length;
    els.chkAll.checked = checked === checks.length;
    els.chkAll.indeterminate = checked > 0 && checked < checks.length;
  }

  function updateHeaderMode() {
    const count = state.selected.size;
    if (els.selCount) els.selCount.textContent = count;
    const bulkVisible = count > 0 || state.forceBulk;
    els.hdrBulk?.classList.toggle('d-none', !bulkVisible);
    els.hdrNormal?.classList.toggle('d-none', bulkVisible);
  }

  function handleRowToggle(cb) {
    const id = rowIdFromCheckbox(cb);
    if (!id) return;
    if (cb.checked) {
      state.selected.add(id);
    } else {
      state.selected.delete(id);
    }
    state.forceBulk = state.selected.size > 0;
    syncHeaderCheckbox();
    updateHeaderMode();
  }

  function clearSelection() {
    state.selected.clear();
    rowChecks().forEach((cb) => { cb.checked = false; });
    if (els.chkAll) {
      els.chkAll.checked = false;
      els.chkAll.indeterminate = false;
    }
    state.forceBulk = false;
    updateHeaderMode();
  }

  function bindSelectionEvents() {
    els.tblBody?.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.classList.contains('row-check')) {
        handleRowToggle(target);
      }
    });

    els.chkAll?.addEventListener('change', () => {
      const checks = rowChecks();
      const shouldCheck = !!els.chkAll.checked;
      checks.forEach((cb) => {
        cb.checked = shouldCheck;
        const id = rowIdFromCheckbox(cb);
        if (!id) return;
        if (shouldCheck) state.selected.add(id);
        else state.selected.delete(id);
      });
      state.forceBulk = shouldCheck;
      syncHeaderCheckbox();
      updateHeaderMode();
    });

    els.btnClearSel?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.selected.size && !state.forceBulk) return;
      clearSelection();
    });

    els.btnBulkDelete?.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!state.selected.size) return;
      if (!confirm(`Delete ${state.selected.size} orders?`)) return;
      try {
        const ids = [...state.selected]
          .map(v => {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          })
          .filter(v => v != null);
        if (!ids.length) return;
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/orders/bulk', { method: 'DELETE', headers, body: JSON.stringify(ids) });
        if (!res.ok) throw new Error(`Bulk delete failed: ${res.status}`);
        clearSelection();
        document.getElementById('btnRefresh')?.click();
      } catch (err) {
        console.error(err);
        alert('Failed to delete orders.');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    // Ensure initial view matches "Reset to default" on first entry
    try {
      const key = storageKey && typeof storageKey === 'function' ? storageKey() : null;
      if (key) localStorage.removeItem(key);
    } catch { /* ignore */ }
    loadColumns();
    bindColumnControls();
    bindSelectionEvents();
    syncHeaderCheckbox();
    updateHeaderMode();
  });
})();

const popupTime = document.getElementById("popupTime");
    const popupCustom = document.getElementById("popupCustom");

    document.querySelectorAll("input[name='time']").forEach(r => {
        r.addEventListener("change", () => {
            if (r.value === "thisMonth") {
                popupTime.style.display = "block";
                popupCustom.style.display = "none";
            } else {
                popupTime.style.display = "none";
                popupCustom.style.display = "block";
            }
        });
    });

    // Active button toggle
    document.querySelectorAll(".btn-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.parentElement.querySelectorAll(".btn-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            console.log("Selected:", btn.innerText);
        });
    });

    /* =====================================================
   THIS MONTH PRESET POPUP
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const presetBtn = document.getElementById("datePresetBtn");
    const popup = document.getElementById("datePopup");
    const dateLabel = document.getElementById("selectedDateLabel");
    const presetRadio = document.querySelector("input[name='dateRange']");
    const customPopupEl = document.getElementById("customDatePopup");
    const customRadioEl = document.getElementById("customRadio");

    popup.classList.remove("show");

    presetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        customPopupEl?.classList.add("hidden");
        if (customRadioEl) customRadioEl.checked = false;
        popup.classList.toggle("show");
    });

    popup.addEventListener("click", (e) => {
        if (!e.target.classList.contains("popup-item")) return;

        document.querySelectorAll(".popup-item").forEach(i => i.classList.remove("selected"));
        e.target.classList.add("selected");

        dateLabel.textContent = e.target.textContent;

        popup.classList.remove("show");
        presetRadio.checked = true;
    });

    document.addEventListener("click", (e) => {
        if (!popup.contains(e.target) && !presetBtn.contains(e.target)) {
            popup.classList.remove("show");
        }
    });
});

/* =====================================================
   CUSTOM DATE RANGE PICKER
===================================================== */

let customPopup = document.getElementById("customDatePopup");
let customRadio = document.getElementById("customRadio");
let customTrigger = document.getElementById("customTrigger");
const datePopupPanel = document.getElementById("datePopup");

let fromDate = null;
let toDate = null;

let currentYearFrom = 2025;
let currentMonthFrom = 10;
let currentYearTo = 2025;
let currentMonthTo = 10;

let viewModeFrom = "day";  
let viewModeTo = "day";

const fromCal = document.getElementById("fromCalendar");
const toCal = document.getElementById("toCalendar");

const fromTitle = document.getElementById("fromCalTitle");
const toTitle = document.getElementById("toCalTitle");

const fromDateText = document.getElementById("fromDateText");
const toDateText = document.getElementById("toDateText");

/* ---------------------------
   OPEN POPUP
--------------------------- */

customTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    customRadio.checked = true;
    customPopup.classList.remove("hidden");
    datePopupPanel?.classList.remove("show");
});

customRadio.addEventListener("change", () => {
    if (customRadio.checked) {
        customPopup.classList.remove("hidden");
        datePopupPanel?.classList.remove("show");
    }
});

/* ---------------------------
   CLICK OUTSIDE
--------------------------- */

document.addEventListener("click", (e) => {
    if (!customPopup.contains(e.target) && !customTrigger.contains(e.target)) {
        customPopup.classList.add("hidden");
        viewModeFrom = "day";
        viewModeTo = "day";
    }
});

/* =====================================================
   MONTH SELECTOR
===================================================== */

function renderMonthSelector(title, calendar, year, side) {
    if (side === "from") viewModeFrom = "month";
    else viewModeTo = "month";

    title.textContent = year;

    calendar.innerHTML = `
        <div class="month-grid">
            ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                .map((m,i)=>`<div class="month-item" data-side="${side}" data-month="${i}">${m}</div>`).join("")}
        </div>
    `;
}

/* =====================================================
   RENDER CALENDAR NORMAL
===================================================== */

function renderCalendar(year, month, calendar, title, side) {
    title.textContent = new Date(year, month, 1)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" });

    let date = new Date(year, month, 1);
    let start = date.getDay();
    let days = new Date(year, month + 1, 0).getDate();

    let html = "";

    for (let i = 0; i < start; i++) html += "<div></div>";

    for (let d = 1; d <= days; d++) {
        let cls = "cal-day";

        if (side === "from" && fromDate && d === fromDate.getDate() && month === fromDate.getMonth()) {
            cls += " selected-date";
        }
        if (side === "to" && toDate && d === toDate.getDate() && month === toDate.getMonth()) {
            cls += " selected-date";
        }

        html += `<div class="${cls}" data-side="${side}" data-day="${d}">${d}</div>`;
    }

    calendar.innerHTML = html;
}

/* =====================================================
   INIT RENDER
===================================================== */

renderCalendar(currentYearFrom, currentMonthFrom, fromCal, fromTitle, "from");
renderCalendar(currentYearTo, currentMonthTo, toCal, toTitle, "to");

/* =====================================================
   TITLE CLICK -> MONTH SELECTOR
===================================================== */

fromTitle.addEventListener("click", () => renderMonthSelector(fromTitle, fromCal, currentYearFrom, "from"));
toTitle.addEventListener("click", () => renderMonthSelector(toTitle, toCal, currentYearTo, "to"));

/* =====================================================
   PREV / NEXT BUTTONS
===================================================== */

document.querySelectorAll(".cal-prev").forEach(btn => {
    btn.addEventListener("click", () => {
        let type = btn.dataset.cal;

        if (type === "from") {
            if (viewModeFrom === "month") currentYearFrom--;
            else currentMonthFrom--;
            renderView("from");
        } else {
            if (viewModeTo === "month") currentYearTo--;
            else currentMonthTo--;
            renderView("to");
        }
    });
});

document.querySelectorAll(".cal-next").forEach(btn => {
    btn.addEventListener("click", () => {
        let type = btn.dataset.cal;

        if (type === "from") {
            if (viewModeFrom === "month") currentYearFrom++;
            else currentMonthFrom++;
            renderView("from");
        } else {
            if (viewModeTo === "month") currentYearTo++;
            else currentMonthTo++;
            renderView("to");
        }
    });
});

/* =====================================================
   RENDER VIEW BY MODE
===================================================== */

function renderView(side) {
    if (side === "from") {
        if (viewModeFrom === "month")
            renderMonthSelector(fromTitle, fromCal, currentYearFrom, "from");
        else
            renderCalendar(currentYearFrom, currentMonthFrom, fromCal, fromTitle, "from");
    }

    if (side === "to") {
        if (viewModeTo === "month")
            renderMonthSelector(toTitle, toCal, currentYearTo, "to");
        else
            renderCalendar(currentYearTo, currentMonthTo, toCal, toTitle, "to");
    }
}

/* =====================================================
   CLICK MONTH
===================================================== */

document.addEventListener("click", e => {
    if (!e.target.classList.contains("month-item")) return;

    let side = e.target.dataset.side;
    let month = parseInt(e.target.dataset.month);

    if (side === "from") {
        currentMonthFrom = month;
        viewModeFrom = "day";
        renderView("from");
    } else {
        currentMonthTo = month;
        viewModeTo = "day";
        renderView("to");
    }
});

/* =====================================================
   CLICK DAY
===================================================== */

document.addEventListener("click", e => {
    if (!e.target.classList.contains("cal-day")) return;

    let day = parseInt(e.target.dataset.day);
    let side = e.target.dataset.side;

    if (side === "from") {
        fromDate = new Date(currentYearFrom, currentMonthFrom, day);
        fromDateText.textContent = format(fromDate);
    } else {
        toDate = new Date(currentYearTo, currentMonthTo, day);
        toDateText.textContent = format(toDate);
    }

    renderView("from");
    renderView("to");
});

/* =====================================================
   TODAY BUTTON
===================================================== */

document.getElementById("customTodayBtn").addEventListener("click", () => {
    let today = new Date();

    fromDate = today;
    toDate = today;

    fromDateText.textContent = format(today);
    toDateText.textContent = format(today);

    currentYearFrom = currentYearTo = today.getFullYear();
    currentMonthFrom = currentMonthTo = today.getMonth();

    viewModeFrom = viewModeTo = "day";

    renderView("from");
    renderView("to");
});

/* =====================================================
   APPLY BUTTON
===================================================== */

document.getElementById("customApplyBtn").addEventListener("click", () => {
    if (!fromDate || !toDate) {
        alert("Please select both dates.");
        return;
    }

    let label = document.getElementById("customRangeLabel");
    label.textContent = `${format(fromDate)} → ${format(toDate)}`;

    customPopup.classList.add("hidden");
    customRadio.checked = true;

    console.log("APPLIED RANGE:", format(fromDate), format(toDate));
});

/* =====================================================
   CANCEL BUTTON
===================================================== */

document.getElementById("customCancelBtn").addEventListener("click", () => {
    customPopup.classList.add("hidden");
});

/* =====================================================
   FORMAT DATE
===================================================== */

function format(d) {
    return d.toLocaleDateString("en-GB");
}

/* =====================================================
   DATA LOADING & RENDERING (API)
===================================================== */
(function () {
  const api = {
    base: '/api/orders',
    headers() {
      const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    }
  };

  const els = {
    tblBody: document.querySelector('#tblPreorder tbody'),
    chkAll: document.getElementById('chkAll'),
    btnRefresh: document.getElementById('btnRefresh'),
    pageInfo: document.getElementById('pageInfo'),
    sizeSel: document.getElementById('sizeSel'),
    pagi: document.getElementById('pagi')
  };

  const state = {
    page: 0,
    size: parseInt(els.sizeSel?.value || '25', 10) || 25,
    total: 0,
    totalPages: 0,
    loading: false
  };

  function fmtMoney(v) {
    try {
      if (v === null || v === undefined) return '0';
      const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '0';
    } catch (_) { return '0'; }
  }

  function fmtDateTime(iso) {
    try {
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
    } catch (_) { return iso; }
  }

  function statusBadge(status) {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED') return '<span class="status-badge status-completed">Completed</span>';
    if (s === 'SHIPPING') return '<span class="status-badge status-shipping">Shipping</span>';
    return '<span class="status-badge status-draft">Draft</span>';
  }

  function renderRows(items) {
    if (!els.tblBody) return;
    if (!Array.isArray(items) || !items.length) {
      els.tblBody.innerHTML = '<tr><td colspan="11" class="text-center text-muted">No orders found</td></tr>';
      if (els.chkAll) { els.chkAll.checked = false; els.chkAll.indeterminate = false; }
      return;
    }

    const rows = items.map(it => `
      <tr data-id="${it.id}">
        <td><input type="checkbox" class="row-check" data-id="${it.id}"></td>
        <td class="fw-bold text-primary" data-col="ordercode">${it.orderCode || ''}</td>
        <td class="text-muted small" data-col="orderdate">${fmtDateTime(it.orderDate)}</td>
        <td class="fw-medium" data-col="customer">${it.customerName || ''}</td>
        <td data-col="phonenumber">${it.phoneNumber || ''}</td>
        <td class="text-end fw-semibold" data-col="subtotal">${fmtMoney(it.subtotal)}</td>
        <td class="text-end" data-col="discount">${fmtMoney(it.discount)}</td>
        <td class="text-end fw-semibold" data-col="customerpays">${fmtMoney(it.paidAmount)}</td>\n        <td class="text-end" data-col="remaining">${fmtMoney((it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0))) - Number(it.paidAmount||0))}</td>\n        <td class="text-end fw-semibold" data-col="paidamount">${fmtMoney(it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0)))}</td></td>
        <td data-col="paymentmethod">${(it.paymentMethod||'').toString().toUpperCase()}</td>
        <td data-col="cashier">${it.cashier || ''}</td>
        <td data-col="status">${statusBadge(it.status)}</td>
      </tr>
    `).join('');
    els.tblBody.innerHTML = rows;
    if (els.chkAll) { els.chkAll.checked = false; els.chkAll.indeterminate = false; }

    // Ensure column visibility matches defaults/saved after data render
    try {
      const defaultCols = { ordercode:true, orderdate:true, customer:true, phonenumber:false, subtotal:true, discount:true, customerpays:false, remaining:false, paidamount:true, paymentmethod:true, cashier:false, status:true };
      function key() {
        try {
          const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            return `orders.columns.v1.${payload.companyId || 'default'}`;
          }
        } catch {}
        return 'orders.columns.v1.default';
      }
      let cfg = {};
      try { cfg = JSON.parse(localStorage.getItem(key()) || '{}') || {}; } catch { cfg = {}; }
      const cols = Object.assign({}, defaultCols, cfg);
      document.querySelectorAll('#tblPreorder th[data-col], #tblPreorder td[data-col]')
        .forEach(el => {
          const c = el.getAttribute('data-col');
          if (!c) return;
          el.classList.toggle('col-hidden', cols[c] === false);
        });
    } catch {}
  }

  function renderPagination(page, size, total, totalPages) {
    if (els.pageInfo) {
      const start = total === 0 ? 0 : (page * size) + 1;
      const end = Math.min(total, (page + 1) * size);
      els.pageInfo.textContent = `${start}-${end} of ${total}`;
    }
    if (!els.pagi) return;
    const prevDisabled = page <= 0 ? 'disabled' : '';
    const nextDisabled = page >= totalPages - 1 ? 'disabled' : '';
    const pages = [];
    for (let i = 0; i < Math.min(totalPages, 5); i++) {
      const active = i === page ? 'active' : '';
      pages.push(`<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`);
    }
    els.pagi.innerHTML = `
      <li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-nav="prev"><i class="fas fa-chevron-left"></i></a></li>
      ${pages.join('')}
      <li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-nav="next"><i class="fas fa-chevron-right"></i></a></li>
    `;
  }

  async function load() {
    if (state.loading) return;
    state.loading = true;
    try {
      const url = `${api.base}?page=${state.page}&size=${state.size}`;
      const res = await fetch(url, { headers: api.headers() });
      if (!res.ok) throw new Error(`Failed to load orders: ${res.status}`);
      const body = await res.json();
      const paged = body?.data || {};
      const items = paged.content || [];
      state.total = paged.totalElements || items.length || 0;
      state.totalPages = paged.totalPages || 1;
      renderRows(items);
      renderPagination(paged.page || state.page, paged.size || state.size, state.total, state.totalPages);
    } catch (err) {
      console.error(err);
      renderRows([]);
      renderPagination(0, state.size, 0, 0);
    } finally {
      state.loading = false;
    }
  }

  function bindEvents() {
    els.btnRefresh?.addEventListener('click', (e) => { e.preventDefault(); load(); });
    els.sizeSel?.addEventListener('change', () => { state.size = parseInt(els.sizeSel.value, 10) || 25; state.page = 0; load(); });
    els.pagi?.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      const nav = a.getAttribute('data-nav');
      const p = a.getAttribute('data-page');
      if (nav === 'prev' && state.page > 0) { state.page -= 1; load(); }
      else if (nav === 'next' && state.page < state.totalPages - 1) { state.page += 1; load(); }
      else if (p != null) { state.page = parseInt(p, 10) || 0; load(); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    load();
  });
})();

// Navigate to Create Order page from the list toolbar
document.addEventListener('DOMContentLoaded', () => {
  const btnAdd = document.getElementById('btnAdd');
  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/order/create';
    });
  }
});

