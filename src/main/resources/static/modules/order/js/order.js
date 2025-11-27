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

    function iso(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    function startOfWeek(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); return x; }
    function endOfWeek(d){ const s=startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); return e; }
    function startOfQuarter(d){ const q=Math.floor(d.getMonth()/3); return new Date(d.getFullYear(), q*3, 1); }
    function endOfQuarter(d){ const q=Math.floor(d.getMonth()/3); return new Date(d.getFullYear(), q*3+3, 0); }
    function computeRange(label){
        const today=new Date();
        const lower=label.toLowerCase();
        if(lower.includes('today')){ return [today,today]; }
        if(lower.includes('yesterday')){ const y=new Date(); y.setDate(today.getDate()-1); return [y,y]; }
        if(lower.includes('this week')){ return [startOfWeek(today), endOfWeek(today)]; }
        if(lower.includes('last week')){ const s=startOfWeek(today); s.setDate(s.getDate()-7); const e=new Date(s); e.setDate(s.getDate()+6); return [s,e]; }
        if(lower.includes('last 7 days')){ const s=new Date(); s.setDate(today.getDate()-6); return [s,today]; }
        if(lower.includes('this month')){ return [new Date(today.getFullYear(), today.getMonth(),1), new Date(today.getFullYear(), today.getMonth()+1,0)]; }
        if(lower.includes('last month')){ return [new Date(today.getFullYear(), today.getMonth()-1,1), new Date(today.getFullYear(), today.getMonth(),0)]; }
        if(lower.includes('last 30 days')){ const s=new Date(); s.setDate(today.getDate()-29); return [s,today]; }
        if(lower.includes('this quarter')){ return [startOfQuarter(today), endOfQuarter(today)]; }
        if(lower.includes('last quarter')){ const d=new Date(today.getFullYear(), today.getMonth()-3, 15); return [startOfQuarter(d), endOfQuarter(d)]; }
        return [new Date(today.getFullYear(), today.getMonth(),1), new Date(today.getFullYear(), today.getMonth()+1,0)];
    }

    popup.addEventListener("click", (e) => {
        if (!e.target.classList.contains("popup-item")) return;

        document.querySelectorAll(".popup-item").forEach(i => i.classList.remove("selected"));
        e.target.classList.add("selected");

        dateLabel.textContent = e.target.textContent;

        popup.classList.remove("show");
        presetRadio.checked = true;

        // Apply filter
        const [from, to] = computeRange(e.target.textContent || '');
        if (window.kvOrders && typeof window.kvOrders.setDateRange === 'function') {
            window.kvOrders.setDateRange(iso(from), iso(to));
        }
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
    // Apply filter to list
    try {
        const fromIso = `${fromDate.getFullYear()}-${String(fromDate.getMonth()+1).padStart(2,'0')}-${String(fromDate.getDate()).padStart(2,'0')}`;
        const toIso = `${toDate.getFullYear()}-${String(toDate.getMonth()+1).padStart(2,'0')}-${String(toDate.getDate()).padStart(2,'0')}`;
        if (window.kvOrders && typeof window.kvOrders.setDateRange === 'function') {
            window.kvOrders.setDateRange(fromIso, toIso);
        }
    } catch {}
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
    pagi: document.getElementById('pagi'),
    hdrSearch: document.getElementById('hdrSearch'),
    hdrSearchIcon: document.querySelector('#hdrNormal .kv-input-search i'),
    status: document.getElementById('status')
  };

  const state = {
    page: 0,
    size: parseInt(els.sizeSel?.value || '25', 10) || 25,
    total: 0,
    totalPages: 0,
    loading: false,
    fromDate: null,
    toDate: null,
    status: '',
    q: ''
  };

  // Debounce helper
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

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
      els.tblBody.innerHTML = '<tr><td colspan="13" class="text-center text-muted">No orders found</td></tr>';
      if (els.chkAll) { els.chkAll.checked = false; els.chkAll.indeterminate = false; }
      return;
    }

    const rows = items.map(it => `
      <tr class="kv-order-row" data-id="${it.id}">
        <td><input type="checkbox" class="row-check" data-id="${it.id}"></td>
        <td class="fw-bold text-primary" data-col="ordercode">${it.orderCode || ''}</td>
        <td class="text-muted small" data-col="orderdate">${fmtDateTime(it.orderDate)}</td>
        <td class="fw-medium" data-col="customer">${it.customerName || ''}</td>
        <td data-col="phonenumber">${it.phoneNumber || ''}</td>
        <td class="text-end fw-semibold" data-col="subtotal">${fmtMoney(it.subtotal)}</td>
        <td class="text-end" data-col="discount">${fmtMoney(it.discount)}</td>
        <td class="text-end" data-col="customerpays">${fmtMoney(it.paidAmount)}</td>
        <td class="text-end" data-col="remaining">${fmtMoney((it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0))) - Number(it.paidAmount||0))}</td>
        <td class="text-end fw-semibold" data-col="paidamount">${fmtMoney(it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0)))}</td>
        <td data-col="paymentmethod">${(it.paymentMethod||'').toString().toUpperCase()}</td>
        <td data-col="cashier">${it.cashier || ''}</td>
        <td data-col="status">${statusBadge(it.status)}</td>
      </tr>
    `).join('');
    els.tblBody.innerHTML = rows;
    if (els.chkAll) { els.chkAll.checked = false; els.chkAll.indeterminate = false; }
    // bind row click to expand detail
    els.tblBody.querySelectorAll('tr.kv-order-row')?.forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('input') || e.target.closest('button') || e.target.closest('a')) return;
        const id = tr.getAttribute('data-id');
        window.kvOrderToggleDetail && window.kvOrderToggleDetail(tr, id);
      });
    });

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
      let url = `${api.base}?page=${state.page}&size=${state.size}`;
      if (state.fromDate) url += `&fromDate=${encodeURIComponent(state.fromDate)}`;
      if (state.toDate) url += `&toDate=${encodeURIComponent(state.toDate)}`;
      if (state.status) url += `&status=${encodeURIComponent(state.status)}`;
      if (state.q) url += `&q=${encodeURIComponent(state.q)}`;
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
    els.status?.addEventListener('change', () => { state.page = 0; state.status = els.status.value || ''; load(); });
    // Search by order code: Enter
    els.hdrSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        state.page = 0;
        state.q = (els.hdrSearch.value || '').trim();
        load();
      }
    });
    // Search-as-you-type (debounced)
    const doSearch = debounce(() => {
      state.page = 0;
      state.q = (els.hdrSearch.value || '').trim();
      load();
    }, 300);
    els.hdrSearch?.addEventListener('input', doSearch);
    // Click on search icon triggers search
    els.hdrSearchIcon?.addEventListener('click', (e) => {
      e.preventDefault();
      state.page = 0;
      state.q = (els.hdrSearch.value || '').trim();
      load();
    });
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
    // Default to current month on first load
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    state.fromDate = `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth()+1).padStart(2,'0')}-${String(firstOfMonth.getDate()).padStart(2,'0')}`;
    state.toDate = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth()+1).padStart(2,'0')}-${String(endOfMonth.getDate()).padStart(2,'0')}`;
    // Initialize q from existing input value
    if (els.hdrSearch && els.hdrSearch.value) {
      state.q = (els.hdrSearch.value || '').trim();
    }
    bindEvents();
    load();
  });

  // Expose a tiny API for date filtering from the preset/custom UI
  window.kvOrders = {
    setDateRange(from, to) {
      state.page = 0;
      state.fromDate = from;
      state.toDate = to;
      load();
    },
    reload() { load(); }
  };
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



// Order detail toggler
window.kvOrderToggleDetail = (function(){
  const api = { base: '/api/orders', headers() { const t=localStorage.getItem('jwtToken')||sessionStorage.getItem('jwtToken')||localStorage.getItem('accessToken')||sessionStorage.getItem('accessToken'); const h={'Accept':'application/json'}; if(t) h['Authorization']=`Bearer ${t}`; return h; } };
  function fmt(n){ try{ return Number(n||0).toLocaleString('vi-VN'); }catch{return n; } }
  function dt(iso){ try{ const d=new Date(iso); return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);}catch{return iso;} }
  async function loadDetail(tr,id){
    const open = document.querySelector('.kv-order-detail-row'); if(open) open.remove();
    const cols = tr.children.length;
    const row = document.createElement('tr'); row.className='kv-order-detail-row';
    row.innerHTML = `<td colspan="${cols}"><div class='kv-order-detail kv-slide'><div>Loading...</div></div></td>`;
    tr.after(row); const panel=row.querySelector('.kv-order-detail');
    try{ const res= await fetch(`${api.base}/${id}/detail`,{ headers: api.headers()}); if(!res.ok) throw new Error('fail'); const body= await res.json(); const d=body?.data||{};
      function currentUser(){ try{ const t=localStorage.getItem('jwtToken')||sessionStorage.getItem('jwtToken')||localStorage.getItem('accessToken')||sessionStorage.getItem('accessToken'); if(!t) return ''; const pay=JSON.parse(atob((t.split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/'))||'{}'); return pay.fullName||pay.name||pay.username||pay.sub||''; }catch{return '';} }
      const badge = (d.status||'').toUpperCase()==='COMPLETED' ? 'kv-badge kv-badge--completed' : 'kv-badge kv-badge--draft';
      const items = (d.items||[]).map(it=>`<tr><td>${it.productCode||''}</td><td>${it.productName||''}</td><td class='text-end'>${Number(it.quantity||0)}</td><td class='text-end'>${fmt(it.unitPrice)}</td><td class='text-end'>${fmt(it.discount)}</td><td class='text-end'>${fmt(it.salePrice)}</td><td class='text-end'>${fmt(it.total)}</td></tr>`).join('');
      const itemsCount = (d.items||[]).reduce((acc,it)=> acc + Number(it.quantity||0), 0);
      panel.innerHTML = `
<div class='kv-order-detail__header'>
  <div class='kv-order-detail__title'>
    <span class='fw-semibold'>${d.customerName||'Guest'}</span>
    <span class='text-muted'>${d.orderCode||''}</span>
    <span class='${badge}'>${(d.status||'').charAt(0)+(d.status||'').slice(1).toLowerCase()}</span>
  </div>
  <div class='kv-order-detail__meta'>
    <div>${dt(d.orderDate)}</div>
    <div>${d.branchName||''}</div>
  </div>
</div>
<div class='kv-order-detail__grid'>
  <div class='kv-order-detail__section'>
    <h6>Creator</h6>
    <div class='kv-order-detail__row'><span class='label'>Creator</span><span class='value'>${currentUser()||'Guest'}</span></div>
    <div class='kv-order-detail__row'><span class='label'>Sale channel</span><span class='value'>
      <select class='form-select form-select-sm kv-sale-channel' style='min-width:180px;'>
        ${((d.paymentMethod||'').toUpperCase()==='CASH' || (d.paymentMethod||'').toUpperCase()==='COD')
          ? `<option value="in_store" selected>Sell in-store</option><option value="other">Other</option>`
          : `<option value="in_store">Sell in-store</option><option value="other" selected>Other</option>`}
      </select>
    </span></div>
  </div>
  <div class='kv-order-detail__section'>
    <div class='kv-order-detail__row'><span class='label'><h6>Time</h6></span><span class='value'>${dt(d.orderDate)}</span></div>
  </div>
</div>
<div class='kv-order-detail__section' style='margin-top:10px;'>
  <h6>Order Items</h6>
  <table class='kv-order-items'>
    <thead><tr>
      <th>Product number</th><th>Product name</th><th class='text-end'>Quantity</th><th class='text-end'>Price</th><th class='text-end'>Discount</th><th class='text-end'>Sale price</th><th class='text-end'>Total</th>
    </tr></thead>
    <tbody>${items}</tbody>
  </table>
</div>
<div class='kv-order-detail__grid' style='margin-top:10px;'>
  <div class='kv-order-detail__note'>
    <textarea class='form-control kv-note' placeholder='Note'>${(d.note||'')}</textarea>
  </div>
  <div class='kv-order-detail__summary'>
    <div class='row'><span class="label">Sub-total (${itemsCount})</span><span class="value">${fmt(d.subtotal)}</span></div>
    <div class='row'><span class="label">Discount</span><span class="value">${fmt(d.discountAmount)}</span></div>
    <div class='row total'><span class="label">Total</span><span class="value">${fmt(d.total)}</span></div>
    <div class='row'><span class="label">Paid amount</span><span class="value">${fmt(d.total)}</span></div>
  </div>
</div>
<div class='kv-order-detail__footer'>
  <div class='kv-order-detail__actions'></div>
  <div class='kv-order-detail__actions'>
    <button class='kv-btn--danger' data-action='delete'>Delete</button>
    <button class='kv-btn--ghost' data-action='save'>Save</button>
    <button class='kv-btn--primary' data-action='update'>Update</button>
  </div>
</div>`;
      // bind footer actions
      const delBtn = panel.querySelector("[data-action='delete']");
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (!confirm('Delete this order?')) return;
          try {
            const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const h = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
            if (t) h['Authorization'] = `Bearer ${t}`;
            const res = await fetch('/api/orders/bulk', { method: 'DELETE', headers: h, body: JSON.stringify([Number(id)]) });
            if (!res.ok) throw new Error('Delete failed');
            const open = document.querySelector('.kv-order-detail-row'); if (open) open.remove();
            if (window.kvOrders && typeof window.kvOrders.reload === 'function') window.kvOrders.reload();
          } catch (e) { alert('Failed to delete order'); }
        });
      }
      // Save button: save sale channel and note only (items unchanged)
      const saveBtn = panel.querySelector("[data-action='save']");
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          try {
            const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (t) headers['Authorization'] = `Bearer ${t}`;
            const channelVal = panel.querySelector('.kv-sale-channel')?.value || 'in_store';
            const paymentMethod = channelVal === 'in_store' ? 'CASH' : 'OTHER';
            const noteVal = panel.querySelector('.kv-note')?.value?.trim() || '';
            const items = (d.items||[]).map(it=>{
              const original = Number(it.unitPrice||0);
              const disc = Number(it.discount||0);
              const sale = Math.max(0, original - disc);
              return { productId: null, sku: it.productCode||'', name: it.productName||'', quantity: Number(it.quantity||1), unitPrice: sale, discount: 0 };
            });
            const payload = {
              customerName: d.customerName || 'Guest',
              phoneNumber: d.phoneNumber || null,
              paymentMethod,
              paidAmount: d.paidAmount || 0,
              orderDiscountPercent: d.discountPercent || 0,
              note: noteVal,
              items
            };
            const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Update failed');
            alert('Saved successfully.');
            if (window.kvOrders && typeof window.kvOrders.reload === 'function') window.kvOrders.reload();
          } catch (e) { console.error(e); alert('Failed to save changes.'); }
        });
      }

      // Update button: stash expanded data then navigate to create page for prefill
      const updBtn = panel.querySelector("[data-action='update']");
      if (updBtn) {
        updBtn.addEventListener('click', (e) => {
          e.preventDefault();
          try {
            const payload = {
              id: Number(id),
              orderCode: d.orderCode || '',
              customerName: d.customerName || '',
              discountPercent: d.discountPercent != null ? d.discountPercent : null,
              paidAmount: d.paidAmount != null ? d.paidAmount : null,
              items: Array.isArray(d.items) ? d.items : []
            };
            sessionStorage.setItem('kv.order.update', JSON.stringify(payload));
          } catch {}
          try {
            const targetUrl = `/order/create?orderId=${encodeURIComponent(id)}`;
            window.location.href = targetUrl;
          } catch {
            window.location.href = '/order/create';
          }
        });
      }
      requestAnimationFrame(()=> panel.classList.add('show'));
    }catch(e){ panel.innerHTML = "<div class='text-danger'>Failed to load order detail.</div>"; }
  }
  return function(tr,id){ const next=tr.nextElementSibling; if(next && next.classList.contains('kv-order-detail-row')){ next.remove(); } else { loadDetail(tr,id); } }
})();



