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

// Reset date UI to default (This month) and apply to list
try {
  window.kvOrders = window.kvOrders || {};
  window.kvOrders.resetDateUIToDefault = function() {
    try {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth()+1, 0);
      // Radios
      const customRadioEl = document.getElementById('customRadio');
      if (customRadioEl) customRadioEl.checked = false;
      const presetRadio = document.querySelector("input[name='dateRange']");
      if (presetRadio) presetRadio.checked = true;
      // Labels and popups
      const label = document.getElementById('selectedDateLabel');
      if (label) label.textContent = 'This month';
      const customRangeLbl = document.getElementById('customRangeLabel');
      if (customRangeLbl) customRangeLbl.textContent = 'Custom range';
      document.getElementById('customDatePopup')?.classList.add('hidden');
      document.getElementById('datePopup')?.classList.remove('show');
      // Internal picker state and texts
      if (typeof fromDate !== 'undefined') fromDate = first;
      if (typeof toDate !== 'undefined') toDate = last;
      // Sync calendar navigation state back to current month (day view)
      try {
        if (typeof currentYearFrom !== 'undefined') currentYearFrom = first.getFullYear();
        if (typeof currentMonthFrom !== 'undefined') currentMonthFrom = first.getMonth();
        if (typeof currentYearTo !== 'undefined') currentYearTo = last.getFullYear();
        if (typeof currentMonthTo !== 'undefined') currentMonthTo = last.getMonth();
        if (typeof viewModeFrom !== 'undefined') viewModeFrom = 'day';
        if (typeof viewModeTo !== 'undefined') viewModeTo = 'day';
      } catch {}
      const fromText = document.getElementById('fromDateText');
      const toText = document.getElementById('toDateText');
      try { if (fromText) fromText.textContent = format(first); } catch {}
      try { if (toText) toText.textContent = format(last); } catch {}
      // Re-render calendars
      try { if (typeof renderView === 'function') { renderView('from'); renderView('to'); } } catch {}
      // Highlight preset item
      try {
        document.querySelectorAll('#datePopup .popup-item').forEach(i => i.classList.remove('selected'));
        const item = Array.from(document.querySelectorAll('#datePopup .popup-item')).find(i => (i.textContent||'').toLowerCase().includes('this month'));
        if (item) item.classList.add('selected');
      } catch {}
      // Apply to list
      const fromIso = `${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,'0')}-${String(first.getDate()).padStart(2,'0')}`;
      const toIso = `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
      if (window.kvOrders && typeof window.kvOrders.setDateRange === 'function') {
        window.kvOrders.setDateRange(fromIso, toIso);
      }
    } catch {}
  };
  // Reset to All time: clear any date selection and show full data
  window.kvOrders.resetDateUIToAllTime = function() {
    try {
      // Uncheck both radios
      try {
        const presetRadio = document.querySelector("input[name='dateRange']");
        const customRadioEl = document.getElementById('customRadio');
        if (presetRadio) presetRadio.checked = false;
        if (customRadioEl) customRadioEl.checked = false;
      } catch {}
      // Labels
      try {
        const lbl = document.getElementById('selectedDateLabel');
        if (lbl) lbl.textContent = 'All time';
        const customLbl = document.getElementById('customRangeLabel');
        if (customLbl) customLbl.textContent = 'Custom range';
      } catch {}
      // Hide popups
      document.getElementById('customDatePopup')?.classList.add('hidden');
      document.getElementById('datePopup')?.classList.remove('show');
      // Clear internal picker values (keep calendar nav as-is)
      try { if (typeof fromDate !== 'undefined') fromDate = null; } catch {}
      try { if (typeof toDate !== 'undefined') toDate = null; } catch {}
      // Apply no date filter to list
      if (window.kvOrders && typeof window.kvOrders.setDateRange === 'function') {
        window.kvOrders.setDateRange(null, null);
      }
    } catch {}
  };
} catch {}

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
    hdrPhoneSearch: document.getElementById('hdrPhoneSearch'),
    hdrSearchIcon: document.querySelector('#hdrNormal .kv-input-search i'),
    status: document.getElementById('status'),
    cashierFilter: document.getElementById('cashierFilter'),
    phoneFilter: document.getElementById('phoneFilter'),
    customerFilter: document.getElementById('customerFilter')
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
    q: '',
    cashier: '',
    phone: '',
    customer: ''
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
      if (v === null || v === undefined) return '0,00 $';
      const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n)
        ? n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'
        : '0,00 $';
    } catch (_) { return '0,00 $'; }
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

    function currentUserName(){
      try {
        const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!t) return '';
        const p = JSON.parse(atob((t.split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/'))||'{}');
        return p.fullName || p.name || p.username || p.sub || '';
      } catch { return ''; }
    }
    const rows = items.map(it => {
      const isGuest = ((it.customerName || '').toString().trim().toLowerCase() === 'guest');
      const phoneVal = isGuest ? '' : (it.phoneNumber || it.phone_number || it.phone || '');
      return `
      <tr class="kv-order-row" data-id="${it.id}">
        <td><input type="checkbox" class="row-check" data-id="${it.id}"></td>
        <td class="fw-bold text-primary" data-col="ordercode">${it.orderCode || ''}</td>
        <td class="text-muted small" data-col="orderdate">${fmtDateTime(it.orderDate)}</td>
        <td class="fw-medium" data-col="customer">${it.customerName || ''}</td>
        <td data-col="phonenumber">${phoneVal}</td>
        <td class="text-end fw-semibold" data-col="subtotal">${fmtMoney(it.subtotal)}</td>
        <td class="text-end" data-col="discount">${fmtMoney(it.discount)}</td>
        <td class="text-end" data-col="customerpays">${fmtMoney(it.paidAmount)}</td>
        <td class="text-end" data-col="remaining">${fmtMoney((it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0))) - Number(it.paidAmount||0))}</td>
        <td class="text-end fw-semibold" data-col="paidamount">${fmtMoney(it.totalAmount ?? (Number(it.subtotal||0) - Number(it.discount||0)))}</td>
        <td data-col="paymentmethod">${(it.paymentMethod||'').toString().toUpperCase()}</td>
        <td data-col="cashier">${it.cashier || ''}</td>
        <td data-col="status">${statusBadge(it.status)}</td>
      </tr>
    `}).join('');
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

    const p = Math.max(0, page | 0);
    const t = Math.max(1, totalPages | 0);
    const items = [];
    
    const disabledPrev = p === 0 ? 'disabled' : '';
    const disabledNext = p >= t - 1 ? 'disabled' : '';

    // First & Prev
    items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" href="#" data-page="0">First</a></li>`);
    items.push(`<li class="page-item ${disabledPrev}"><a class="page-link" href="#" data-page="${Math.max(0, p - 1)}">Prev</a></li>`);

    // Page Numbers Window
    const startPage = Math.max(0, p - 2);
    const endPage = Math.min(t - 1, p + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      const active = i === p ? 'active' : '';
      items.push(`<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`);
    }

    // Next & Last
    items.push(`<li class="page-item ${disabledNext}"><a class="page-link" href="#" data-page="${Math.min(t - 1, p + 1)}">Next</a></li>`);
    items.push(`<li class="page-item ${disabledNext}"><a class="page-link" href="#" data-page="${t - 1}">Last</a></li>`);

    els.pagi.innerHTML = items.join('');
  }

  async function load() {
    if (state.loading) return;
    state.loading = true;
    try {
      // Determine which text filter to send to backend (server supports single 'q')
      const qEffective = (state.phone && state.phone.length) ? state.phone
                        : (state.customer && state.customer.length) ? state.customer
                        : state.q;
      let url = `${api.base}?page=${state.page}&size=${state.size}`;
      if (state.fromDate) url += `&fromDate=${encodeURIComponent(state.fromDate)}`;
      if (state.toDate) url += `&toDate=${encodeURIComponent(state.toDate)}`;
      if (state.status) url += `&status=${encodeURIComponent(state.status)}`;
      if (qEffective) url += `&q=${encodeURIComponent(qEffective)}`;
      const res = await fetch(url, { headers: api.headers() });
      if (!res.ok) throw new Error(`Failed to load orders: ${res.status}`);
      const body = await res.json();
      const paged = body?.data || {};
      let items = paged.content || [];
      // Client-side cashier filter
      if (state.cashier) {
        const q = state.cashier.toLowerCase();
        items = items.filter(it => ((it.cashier || '').toString().toLowerCase().includes(q)));
      }
      // Client-side phone number filter
      if (state.phone) {
        const q = state.phone.toLowerCase();
        items = items.filter(it => ((it.phoneNumber || '').toString().toLowerCase().includes(q)));
      }
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
    // Phone quick search in toolbar (debounced)
    const doPhoneSearch = debounce(() => {
      state.page = 0;
      state.phone = (els.hdrPhoneSearch?.value || '').trim();
      load();
    }, 300);
    els.hdrPhoneSearch?.addEventListener('input', doPhoneSearch);
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
      const p = a.getAttribute('data-page');
      if (p != null) { 
        const newPage = parseInt(p, 10);
        if (!isNaN(newPage) && newPage >= 0 && newPage < state.totalPages) {
          state.page = newPage; 
          load(); 
        }
      }
    });

    // Apply/Clear filters (match Purchases behavior)
    const btnApply = document.getElementById('btnApplyFilters');
    const btnClear = document.getElementById('btnClearFilters');
    btnApply?.addEventListener('click', () => {
      state.page = 0;
      state.status = els.status?.value || '';
      state.q = (els.hdrSearch?.value || '').trim();
      state.cashier = (els.cashierFilter?.value || '').trim();
      state.phone = (els.phoneFilter?.value || '').trim();
      state.customer = (els.customerFilter?.value || '').trim();
      load();
    });
    btnClear?.addEventListener('click', () => {
      // Reset inputs
      if (els.status) els.status.value = '';
      if (els.hdrSearch) els.hdrSearch.value = '';
      if (els.cashierFilter) els.cashierFilter.value = '';
      if (els.phoneFilter) els.phoneFilter.value = '';
      if (els.customerFilter) els.customerFilter.value = '';
      // Clear all text/number inputs inside the filter form (Customer, Cashier, Phone, etc.)
      try {
        const filterForm = document.querySelector('.kv-filter__form');
        if (filterForm) {
          filterForm.querySelectorAll("input[type='text'], input[type='number'], select").forEach((el) => {
            if (el.id === 'status') return; // handled above
            el.value = '';
          });
        }
      } catch {}
      // Reset date UI and reload
      try { if (window.kvOrders && typeof window.kvOrders.resetDateUIToDefault === 'function') { window.kvOrders.resetDateUIToDefault(); return; } } catch {}
      // Fallback: default month
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      state.fromDate = `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth()+1).padStart(2,'0')}-${String(firstOfMonth.getDate()).padStart(2,'0')}`;
      state.toDate = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth()+1).padStart(2,'0')}-${String(endOfMonth.getDate()).padStart(2,'0')}`;
      state.status = '';
      state.q = '';
      state.cashier = '';
      state.phone = '';
      state.page = 0;
      try { document.getElementById('selectedDateLabel').textContent = 'This month'; } catch {}
      load();
    });

    // Live search: customer name, phone number, cashier (debounced)
    const liveSearch = debounce(() => { state.page = 0; load(); }, 250);
    els.customerFilter?.addEventListener('input', () => {
      state.customer = (els.customerFilter.value || '').trim();
      liveSearch();
    });
    els.phoneFilter?.addEventListener('input', () => {
      state.phone = (els.phoneFilter.value || '').trim();
      liveSearch();
    });
    els.cashierFilter?.addEventListener('input', () => {
      state.cashier = (els.cashierFilter.value || '').trim();
      liveSearch();
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
    if (els.cashierFilter && els.cashierFilter.value) {
      state.cashier = (els.cashierFilter.value || '').trim();
    }
    if (els.phoneFilter && els.phoneFilter.value) {
      state.phone = (els.phoneFilter.value || '').trim();
    }
    if (els.customerFilter && els.customerFilter.value) {
      state.customer = (els.customerFilter.value || '').trim();
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
    reload() { load(); },
    getFilters() {
      return {
        page: state.page,
        size: state.size,
        fromDate: state.fromDate,
        toDate: state.toDate,
        status: state.status,
        q: state.q,
        cashier: state.cashier,
        phone: state.phone
      };
    }
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

// CSV Import/Export wiring and helpers
document.addEventListener('DOMContentLoaded', () => {
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnImport = document.getElementById('btnImport');
  const fileImport = document.getElementById('fileImportCsv');
  const apiBase = '/api/orders';

  function authHeadersJSON() {
    const t = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const h = { 'Accept': 'application/json' };
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }
  function authHeadersJSONPost() {
    const h = authHeadersJSON();
    h['Content-Type'] = 'application/json';
    return h;
  }
  function toCsvValue(v) {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function formatDateTime(iso) {
    try {
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      const pad = (n) => String(n).padStart(2,'0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return iso || ''; }
  }

  async function exportCsvAll() {
    try {
      const filters = (window.kvOrders && window.kvOrders.getFilters) ? window.kvOrders.getFilters() : {};
      const status = document.getElementById('status')?.value || filters.status || '';
      const q = document.getElementById('hdrSearch')?.value?.trim() || filters.q || '';
      const fromDate = filters.fromDate || '';
      const toDate = filters.toDate || '';
      const pageSize = 500;
      let page = 0;
      let rows = [];
      while (true) {
        let url = `${apiBase}?page=${page}&size=${pageSize}`;
        if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
        if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: authHeadersJSON() });
        if (!res.ok) throw new Error(`Export fetch failed: ${res.status}`);
        const body = await res.json();
        const paged = body?.data || {};
        const items = paged.content || [];
        if (!items.length) break;
        rows = rows.concat(items);
        const last = !!paged.last || (paged.totalPages != null && page >= paged.totalPages - 1);
        if (last) break;
        page += 1;
      }
      // Determine visible columns from the column chooser checkboxes
      const vis = {
        ordercode: document.getElementById('colOrderCode')?.checked !== false,
        orderdate: document.getElementById('colOrderDate')?.checked !== false,
        customer: document.getElementById('colCustomer')?.checked !== false,
        phonenumber: document.getElementById('colPhoneNumber')?.checked === true,
        subtotal: document.getElementById('colSubTotal')?.checked !== false,
        discount: document.getElementById('colDiscount')?.checked !== false,
        customerpays: document.getElementById('colCustomerPays')?.checked === true,
        remaining: document.getElementById('colRemaining')?.checked === true,
        paidamount: document.getElementById('colPaidAmount')?.checked !== false,
        paymentmethod: document.getElementById('colPaymentMethod')?.checked === true,
        cashier: document.getElementById('colCashier')?.checked === true,
        status: document.getElementById('colStatus')?.checked !== false,
      };

      const colDefs = [
        { key: 'ordercode', header: 'orderCode', val: (it, ctx) => it.orderCode || '' },
        { key: 'orderdate', header: 'orderDate', val: (it, ctx) => formatDateTime(it.orderDate) },
        { key: 'customer', header: 'customerName', val: (it, ctx) => it.customerName || '' },
        { key: 'phonenumber', header: 'phoneNumber', val: (it, ctx) => it.phoneNumber || '' },
        { key: 'subtotal', header: 'subtotal', val: (it, ctx) => ctx.subtotal },
        { key: 'discount', header: 'discount', val: (it, ctx) => ctx.discount },
        { key: 'customerpays', header: 'customerPays', val: (it, ctx) => ctx.paid },
        { key: 'remaining', header: 'remaining', val: (it, ctx) => ctx.remaining },
        // Note: UI "Paid amount" column actually displays total amount
        { key: 'paidamount', header: 'paidAmount', val: (it, ctx) => ctx.total },
        { key: 'paymentmethod', header: 'paymentMethod', val: (it, ctx) => it.paymentMethod || '' },
        { key: 'cashier', header: 'cashier', val: (it, ctx) => it.cashier || '' },
        { key: 'status', header: 'status', val: (it, ctx) => it.status || '' },
      ];

      const activeCols = colDefs.filter(cd => vis[cd.key]);
      if (!activeCols.length) { alert('No columns visible to export.'); return; }

      const header = activeCols.map(cd => cd.header);
      const lines = [header.join(',')];
      for (const it of rows) {
        const subtotal = (it.subtotal != null ? Number(it.subtotal) : 0) || 0;
        const discount = (it.discount != null ? Number(it.discount) : 0) || 0;
        const total = (it.totalAmount != null ? Number(it.totalAmount) : (subtotal - discount));
        const paid = (it.paidAmount != null ? Number(it.paidAmount) : 0);
        const remaining = total - paid;
        const ctx = { subtotal, discount, total, paid, remaining };
        const row = activeCols.map(cd => toCsvValue(cd.val(it, ctx)));
        lines.push(row.join(','));
      }
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      const urlObj = URL.createObjectURL(blob);
      a.href = urlObj;
      const ts = new Date();
      const pad = (n) => String(n).padStart(2,'0');
      a.download = `orders_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObj);
    } catch (e) { console.error(e); alert('Failed to export CSV.'); }
  }


  function parseCsv(text) {
    const rows = [];
    let i = 0, cur = '', inQuotes = false, row = [];
    function pushCell() { row.push(cur); cur = ''; }
    function pushRow() { rows.push(row); row = []; }
    while (i < text.length) {
      const ch = text[i++];
      if (inQuotes) {
        if (ch === '"') { if (text[i] === '"') { cur += '"'; i++; } else { inQuotes = false; } }
        else { cur += ch; }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') pushCell();
        else if (ch === '\n') { pushCell(); pushRow(); }
        else if (ch === '\r') { /* ignore */ }
        else cur += ch;
      }
    }
    pushCell();
    if (row.length > 1 || row[0] !== '') pushRow();
    return rows;
  }
  function normalizeHeader(h) { return String(h||'').trim().toLowerCase().replace(/[^a-z0-9]+/g, '.'); }

  let __parsedOrders = [];
  let __importInProgress = false;

  async function importCsvFromFile(file) {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) { alert('CSV is empty.'); return; }
      const headers = rows[0].map(normalizeHeader);
      const data = rows.slice(1).filter(r => r.some(c => (c||'').trim() !== ''));
      const idx = (name) => headers.findIndex(h => h === name || h.endsWith('.'+name));

      // Detect if this is the exported list format (no item columns, has id+orderCode)
      const hasId = idx('id') >= 0;
      const hasOrderCode = idx('ordercode') >= 0;
      const hasAnyItemCols = (idx('item.sku')>=0 || idx('itemsku')>=0 || idx('item.name')>=0 || idx('itemname')>=0);

      if (hasOrderCode && !hasAnyItemCols) {
        // Exported list format: treat rows as updates to existing orders
        const colU = {
          id: idx('id'),
          orderCode: idx('ordercode'),
          customerName: idx('customername'),
          phoneNumber: idx('phonenumber'),
          paymentMethod: idx('paymentmethod'),
          // Prefer customerPays column if present; fallback to paidAmount
          paidAmount: (function(){ const a = idx('customerpays'); return a>=0 ? a : idx('paidamount'); })(),
          discount: idx('discount') // absolute discount
        };
        const toNum = (v) => { if (v == null) return null; const s = String(v).replace(/[^0-9.-]/g,''); const n = Number(s); return Number.isFinite(n) ? n : null; };
        const orders = [];
        for (const r of data) {
          const idRaw = colU.id>=0 ? r[colU.id] : null;
          const id = Number(idRaw);
          orders.push({
            id: Number.isFinite(id) ? id : null,
            orderCode: colU.orderCode>=0 ? r[colU.orderCode] : null,
            customerName: colU.customerName>=0 ? r[colU.customerName] : null,
            phoneNumber: colU.phoneNumber>=0 ? r[colU.phoneNumber] : null,
            paymentMethod: colU.paymentMethod>=0 ? r[colU.paymentMethod] : null,
            paidAmount: colU.paidAmount>=0 ? toNum(r[colU.paidAmount]) : null,
            orderDiscount: colU.discount>=0 ? toNum(r[colU.discount]) : null
          });
        }
        if (!orders.length) { alert('No valid rows found.'); return; }
        __parsedOrders = orders;
        showImportPreview(orders);
        return;
      }

      // Otherwise: assume template format with line items and optional grouping
      const col = {
        group: idx('group') >= 0 ? idx('group') : idx('orderref'),
        customerName: idx('customername'),
        phoneNumber: idx('phonenumber'),
        paymentMethod: idx('paymentmethod'),
        paidAmount: idx('paidamount'),
        orderDiscount: idx('orderdiscount'),
        orderDiscountPercent: idx('orderdiscountpercent'),
        note: idx('note'),
        itemSku: idx('item.sku') >= 0 ? idx('item.sku') : idx('itemsku'),
        itemName: idx('item.name') >= 0 ? idx('item.name') : idx('itemname'),
        itemQty: idx('item.quantity') >= 0 ? idx('item.quantity') : idx('itemquantity'),
        itemPrice: idx('item.unitprice') >= 0 ? idx('item.unitprice') : idx('itemprice'),
        itemDiscount: idx('item.discount') >= 0 ? idx('item.discount') : idx('itemdiscount')
      };
      const groups = new Map();
      let counter = 1;
      for (const r of data) {
        const key = (col.group != null && col.group >= 0 && r[col.group]) ? r[col.group] : `ROW_${counter++}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      }
      const toNum = (v) => { if (v == null) return null; const s = String(v).replace(/[^0-9.-]/g,''); const n = Number(s); return Number.isFinite(n) ? n : null; };
      const orders = [];
      for (const [gkey, lines] of groups.entries()) {
        const first = lines[0] || [];
        const items = lines.map(r => ({
          sku: col.itemSku>=0 ? (r[col.itemSku]||'').trim() : null,
          name: col.itemName>=0 ? (r[col.itemName]||'').trim() : null,
          quantity: col.itemQty>=0 ? (toNum(r[col.itemQty])||1) : 1,
          unitPrice: col.itemPrice>=0 ? (toNum(r[col.itemPrice])||0) : 0,
          discount: col.itemDiscount>=0 ? (toNum(r[col.itemDiscount])||0) : 0
        })).filter(it => (it.sku||it.name) && it.quantity>0);
        if (!items.length) continue;
        orders.push({
          customerName: col.customerName>=0 ? first[col.customerName] : null,
          phoneNumber: col.phoneNumber>=0 ? first[col.phoneNumber] : null,
          paymentMethod: col.paymentMethod>=0 ? first[col.paymentMethod] : null,
          paidAmount: col.paidAmount>=0 ? toNum(first[col.paidAmount]) : null,
          orderDiscount: col.orderDiscount>=0 ? toNum(first[col.orderDiscount]) : null,
          orderDiscountPercent: col.orderDiscountPercent>=0 ? toNum(first[col.orderDiscountPercent]) : null,
          note: col.note>=0 ? first[col.note] : null,
          items
        });
      }
      if (!orders.length) { alert('No valid rows (with items) found.'); return; }
      __parsedOrders = orders;
      showImportPreview(orders);
    } catch (e) { console.error(e); alert('Failed to import CSV.'); }
  }

  function showImportPreview(orders) {
    try {
      const tbody = document.getElementById('importPreviewBody');
      const summary = document.getElementById('importSummary');
      const isUpdate = orders.length && orders[0].id != null;
      if (!tbody || !summary) { if (confirm(`${isUpdate ? 'Update' : 'Create'} ${orders.length} orders now?`)) doCreateOrders(orders); return; }
      const totalItems = isUpdate ? '-' : orders.reduce((acc,o)=>acc+(Array.isArray(o.items)?o.items.length:0),0);
      summary.textContent = `${isUpdate ? 'Updates' : 'Orders'}: ${orders.length}` + (isUpdate ? '' : `, Items: ${totalItems}`);
      const rows = orders.map((o, idx) => {
        const paid = o.paidAmount != null ? o.paidAmount : '';
        const discp = (o.orderDiscountPercent != null ? o.orderDiscountPercent : (o.orderDiscount != null ? o.orderDiscount : ''));
        const items = isUpdate ? '-' : (Array.isArray(o.items) ? o.items.length : 0);
        const note = (o.note || '').toString();
        const shortNote = note.length > 40 ? note.slice(0,40) + '…' : note;
        return `
          <tr>
            <td>${idx+1}${isUpdate ? ` <span class="badge bg-secondary">ID ${o.id}</span>` : ''}</td>
            <td>${(o.customerName||'').toString()}</td>
            <td>${(o.phoneNumber||'').toString()}</td>
            <td class="text-end">${items}</td>
            <td class="text-end">${paid}</td>
            <td class="text-end">${discp}</td>
            <td>${shortNote}</td>
          </tr>`;
      }).join('');
      tbody.innerHTML = rows;
      const modalEl = document.getElementById('importPreviewModal');
      if (modalEl && window.bootstrap && bootstrap.Modal) {
        const m = bootstrap.Modal.getOrCreateInstance(modalEl);
        m.show();
      }
    } catch (e) { console.error(e); if (confirm(`Create ${orders.length} orders now?`)) doCreateOrders(orders); }
  }

  async function doCreateOrders(orders) {
    if (__importInProgress) return; __importInProgress = true;
    const btn = document.getElementById('btnConfirmImport');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }
    try {
      const headers = authHeadersJSONPost();
      let ok = 0, fail = 0;
      const errors = [];
      const createdList = [];
      function normPM(v){
        const s = (v||'').toString().trim().toUpperCase();
        if (!s) return null;
        const map = { CASH:'CASH', TRANSFER:'TRANSFER', COD:'COD', CARD:'CARD', OTHER:'OTHER' };
        if (map[s]) return map[s];
        // common variants
        if (['CASH ', 'TIENMAT', 'TIEN_MAT'].includes(s)) return 'CASH';
        if (['BANK', 'BANK_TRANSFER', 'TRANSFER '].includes(s)) return 'TRANSFER';
        return null; // let server default or use existing
      }
      for (const o of orders) {
        try {
          if (o.id != null) {
            // Update flow: fetch existing detail to get items, then PUT
            let targetId = o.id;
            let detRes = await fetch(`${apiBase}/${encodeURIComponent(targetId)}/detail`, { headers: authHeadersJSON() });
            if (!detRes.ok && o.orderCode) {
              // Fallback: resolve by orderCode via search
              const searchRes = await fetch(`${apiBase}?page=0&size=1&q=${encodeURIComponent(o.orderCode)}`, { headers: authHeadersJSON() });
              if (searchRes.ok) {
                try {
                  const srBody = await searchRes.json();
                  const found = (srBody?.data?.content || [])[0];
                  if (found && found.id != null) {
                    targetId = found.id;
                    detRes = await fetch(`${apiBase}/${encodeURIComponent(targetId)}/detail`, { headers: authHeadersJSON() });
                  }
                } catch {}
              }
            }
            if (!detRes.ok) {
              const t = await detRes.text().catch(()=> '');
              throw new Error(`Detail fetch failed (${detRes.status}) ${t}`);
            }
            const detBody = await detRes.json();
            const d = detBody?.data || {};
            const items = Array.isArray(d.items) ? d.items.map(it => {
              // Keep sale price as unitPrice, no item-level discount
              const original = Number(it.unitPrice||0);
              const disc = Number(it.discount||0);
              const sale = Math.max(0, original - disc);
              return { productId: null, sku: it.productCode||'', name: it.productName||'', quantity: Number(it.quantity||1), unitPrice: sale, discount: 0 };
            }) : [];
            const codeChanged = (o.orderCode && d.orderCode) ? (String(o.orderCode).trim() !== String(d.orderCode).trim()) : false;
            if (codeChanged) {
              // Treat as clone: create a new order with same items and updated header fields
              const createPayload = {
                customerName: (o.customerName ?? d.customerName ?? null) || null,
                phoneNumber: (o.phoneNumber ?? d.phoneNumber ?? null) || null,
                paymentMethod: normPM(o.paymentMethod) ?? normPM(d.paymentMethod) ?? undefined,
                paidAmount: (typeof o.paidAmount === 'number' && isFinite(o.paidAmount)) ? o.paidAmount : (typeof d.paidAmount === 'number' ? d.paidAmount : 0),
                orderDiscount: (typeof o.orderDiscount === 'number' && isFinite(o.orderDiscount)) ? o.orderDiscount : (d.discountAmount != null ? Number(d.discountAmount) : undefined),
                note: d.note || null,
                items
              };
              const res = await fetch(apiBase, { method: 'POST', headers, body: JSON.stringify(createPayload) });
              if (!res.ok) {
                const t = await res.text().catch(()=> '');
                throw new Error(`Create (clone) failed (${res.status}) ${t}`);
              }
              try {
                const js = await res.json();
                const data = js?.data || {};
                createdList.push({ resp: data, payload: createPayload });
              } catch {}
              ok++;
            } else {
              // Normal update
              const payload = {
                customerName: (o.customerName ?? d.customerName ?? null) || null,
                phoneNumber: (o.phoneNumber ?? d.phoneNumber ?? null) || null,
                paymentMethod: normPM(o.paymentMethod) ?? normPM(d.paymentMethod) ?? undefined,
                paidAmount: (typeof o.paidAmount === 'number' && isFinite(o.paidAmount)) ? o.paidAmount : (typeof d.paidAmount === 'number' ? d.paidAmount : 0),
                orderDiscount: (typeof o.orderDiscount === 'number' && isFinite(o.orderDiscount)) ? o.orderDiscount : (d.discountAmount != null ? Number(d.discountAmount) : undefined),
                note: d.note || null,
                items
              };
              const upRes = await fetch(`${apiBase}/${encodeURIComponent(targetId)}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
              if (!upRes.ok) {
                const t = await upRes.text().catch(()=> '');
                throw new Error(`Update failed (${upRes.status}) ${t}`);
              }
              ok++;
            }
          } else {
            // Create flow
            const res = await fetch(apiBase, { method: 'POST', headers, body: JSON.stringify(o) });
            if (!res.ok) {
              const t = await res.text().catch(()=> '');
              throw new Error(`Create failed (${res.status}) ${t}`);
            }
            try {
              const js = await res.json();
              const data = js?.data || {};
              createdList.push({ resp: data, payload: o });
            } catch {}
            ok++;
          }
        } catch(e) { console.error(e); fail++; errors.push({ref: o.id ?? (o.customerName||''), error: String(e&&e.message||e)}); }
      }
      if (fail>0) {
        const lines = errors.slice(0,5).map(er => `- ${er.ref}: ${er.error}`).join('\n');
        alert(`Import done. Success: ${ok}, Failed: ${fail}\n${lines}${errors.length>5?`\n...and ${errors.length-5} more`:''}`);
      } else {
        alert(`Import done. Success: ${ok}, Failed: ${fail}`);
      }
      const modalEl = document.getElementById('importPreviewModal');
      if (modalEl && window.bootstrap && bootstrap.Modal) {
        const m = bootstrap.Modal.getOrCreateInstance(modalEl);
        m.hide();
      }
      // If we created new orders (template import), append them to the end of the current list without reloading
      if (createdList.length) {
        const tbody = document.querySelector('#tblPreorder tbody');
        if (tbody) {
          // Remove empty state row if present
          if (tbody.children.length === 1 && /No orders/i.test(tbody.textContent||'')) {
            tbody.innerHTML = '';
          }
          const rowsHtml = createdList.map(({resp, payload}) => {
            const subtotal = Number(resp.subtotal || 0);
            const discount = Number(resp.discount || 0);
            const total = Number(resp.total != null ? resp.total : (subtotal - discount));
            const paid = Number(resp.paidAmount || payload.paidAmount || 0);
            const remaining = total - paid;
            const pm = (payload.paymentMethod || '').toString().toUpperCase();
            const status = (resp.status || 'DRAFT').toString();
            const st = status.toUpperCase();
            const badge = st==='COMPLETED' ? '<span class="status-badge status-completed">Completed</span>' : (st==='SHIPPING' ? '<span class="status-badge status-shipping">Shipping</span>' : '<span class="status-badge status-draft">Draft</span>');
            return `
              <tr class="kv-order-row" data-id="${resp.id}">
                <td><input type="checkbox" class="row-check" data-id="${resp.id}"></td>
                <td class="fw-bold text-primary" data-col="ordercode">${resp.orderCode || ''}</td>
                <td class="text-muted small" data-col="orderdate">${formatDateTime(resp.orderDate)}</td>
                <td class="fw-medium" data-col="customer">${(payload.customerName||'')}</td>
                <td data-col="phonenumber">${(payload.phoneNumber||'')}</td>
                <td class="text-end fw-semibold" data-col="subtotal">${fmtMoney(subtotal)}</td>
                <td class="text-end" data-col="discount">${fmtMoney(discount)}</td>
                <td class="text-end" data-col="customerpays">${fmtMoney(paid)}</td>
                <td class="text-end" data-col="remaining">${fmtMoney(remaining)}</td>
                <td class="text-end fw-semibold" data-col="paidamount">${fmtMoney(total)}</td>
                <td data-col="paymentmethod">${pm}</td>
                <td data-col="cashier"></td>
                <td data-col="status">${badge}</td>
              </tr>`;
          }).join('');
          tbody.insertAdjacentHTML('beforeend', rowsHtml);
        }
      } else {
        // For pure updates or no success, refresh list as before
        document.getElementById('btnRefresh')?.click();
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Create Orders'; }
      __importInProgress = false;
      __parsedOrders = [];
    }
  }

  if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', (e) => { e.preventDefault(); exportCsvAll(); });
  if (btnImport && fileImport) {
    btnImport.addEventListener('click', (e) => { e.preventDefault(); fileImport.click(); });
    fileImport.addEventListener('change', () => {
      const file = fileImport.files && fileImport.files[0];
      if (!file) return;
      importCsvFromFile(file).finally(() => { fileImport.value = ''; });
    });
  }
  document.getElementById('btnConfirmImport')?.addEventListener('click', () => {
    if (!__parsedOrders || !__parsedOrders.length) return;
    doCreateOrders(__parsedOrders);
  });
  // Fallback delegation in case direct binding missed
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest && e.target.closest('#btnConfirmImport');
    if (!btn) return;
    e.preventDefault();
    if (!__parsedOrders || !__parsedOrders.length) { alert('No parsed orders to import. Please re-select the CSV.'); return; }
    doCreateOrders(__parsedOrders);
  });
});



// Order detail toggler
window.kvOrderToggleDetail = (function(){
  const api = { base: '/api/orders', headers() { const t=localStorage.getItem('jwtToken')||sessionStorage.getItem('jwtToken')||localStorage.getItem('accessToken')||sessionStorage.getItem('accessToken'); const h={'Accept':'application/json'}; if(t) h['Authorization']=`Bearer ${t}`; return h; } };
  function fmt(n){ try{ return Number(n||0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'; }catch{return n; } }
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
    ${d.phoneNumber ? `<div><i class="fas fa-phone me-1"></i>${d.phoneNumber}</div>` : ''}
  </div>
</div>
<div class='kv-order-detail__grid'>
  <div class='kv-order-detail__section'>
    <div class='kv-order-detail__row'><span class='label'>Cashier</span><span class='value'>${d.creator || ''}</span></div>
    <div class='kv-order-detail__row'><span class='label'>Phone</span><span class='value'>${d.phoneNumber || ''}</span></div>
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
${(typeof CURRENT_USER_CAN_MANAGE !== 'undefined' && CURRENT_USER_CAN_MANAGE) ? `
<div class='kv-order-detail__footer'>
  <div class='kv-order-detail__actions'></div>
  <div class='kv-order-detail__actions'>
    <button class='kv-btn--danger' data-action='delete'>Delete</button>
    <button class='kv-btn--ghost' data-action='save'>Save</button>
    <button class='kv-btn--primary' data-action='update'>Update</button>
  </div>
</div>` : ''}`;
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





