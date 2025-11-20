(() => {
  const columnDefaults = {
    ordercode: true,
    orderdate: true,
    customer: true,
    phonenumber: false,
    subtotal: true,
    discount: false,
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

    els.btnBulkDelete?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.selected.size) return;
      if (!confirm(`Delete ${state.selected.size} orders?`)) return;
      console.warn('Bulk delete not implemented yet. Selected orders:', [...state.selected]);
      clearSelection();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
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
