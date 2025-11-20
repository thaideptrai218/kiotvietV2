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
    selected: new Set()
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

  function resolveStorageKey() {
    const baseKey = 'orders.columns.v1';
    try {
      const token = localStorage.getItem('jwtToken')
        || sessionStorage.getItem('jwtToken')
        || localStorage.getItem('accessToken')
        || sessionStorage.getItem('accessToken');
      if (!token) return `${baseKey}.default`;
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return `${baseKey}.${payload.companyId || 'default'}`;
    } catch {
      return `${baseKey}.default`;
    }
  }

  function saveColumns() {
    localStorage.setItem(resolveStorageKey(), JSON.stringify(state.columns));
  }

  function applyColumnVisibility() {
    if (!els.table) return;
    const map = state.columns;
    els.table.querySelectorAll('th[data-col], td[data-col]').forEach((el) => {
      const key = el.getAttribute('data-col');
      if (!key) return;
      const visible = map[key] !== false;
      el.classList.toggle('col-hidden', !visible);
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
      const saved = JSON.parse(localStorage.getItem(resolveStorageKey()) || '{}');
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

  function bindEvents() {
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

  function syncHeaderCheckbox() {
    if (!els.chkAll) return;
    const rowChecks = els.tblBody ? els.tblBody.querySelectorAll('input.row-check') : [];
    if (!rowChecks.length) {
      els.chkAll.checked = false;
      els.chkAll.indeterminate = false;
      return;
    }
    const checked = [...rowChecks].filter((cb) => cb.checked).length;
    els.chkAll.checked = checked === rowChecks.length;
    els.chkAll.indeterminate = checked > 0 && checked < rowChecks.length;
  }

  function pruneSelection() {
    state.selected.forEach((cb) => {
      if (!cb || !document.body.contains(cb)) {
        state.selected.delete(cb);
      }
    });
  }

  function updateHeaderMode() {
    pruneSelection();
    const count = state.selected.size;
    if (els.selCount) els.selCount.textContent = count;
    els.hdrBulk?.classList.toggle('d-none', count === 0);
    els.hdrNormal?.classList.toggle('d-none', count > 0);
  }

  function handleRowToggle(checkbox) {
    if (!checkbox) return;
    if (checkbox.checked) {
      state.selected.add(checkbox);
    } else {
      state.selected.delete(checkbox);
    }
    syncHeaderCheckbox();
    updateHeaderMode();
  }

  function clearSelection() {
    const rowChecks = els.tblBody ? els.tblBody.querySelectorAll('input.row-check') : [];
    rowChecks.forEach((cb) => { cb.checked = false; });
    state.selected.clear();
    if (els.chkAll) {
      els.chkAll.checked = false;
      els.chkAll.indeterminate = false;
    }
    updateHeaderMode();
    syncHeaderCheckbox();
  }

  function bindSelectionEvents() {
    els.tblBody?.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.classList.contains('row-check')) {
        handleRowToggle(target);
      }
    });

    els.chkAll?.addEventListener('change', () => {
      const rowChecks = els.tblBody ? els.tblBody.querySelectorAll('input.row-check') : [];
      rowChecks.forEach((cb) => {
        cb.checked = els.chkAll.checked;
        if (els.chkAll.checked) {
          state.selected.add(cb);
        } else {
          state.selected.delete(cb);
        }
      });
      syncHeaderCheckbox();
      updateHeaderMode();
    });

    els.btnClearSel?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.selected.size) return;
      clearSelection();
    });

    els.btnBulkDelete?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.selected.size) return;
      if (!confirm(`Delete ${state.selected.size} orders?`)) return;
      const ids = [...state.selected].map((cb) => cb.dataset.id || cb.value || cb.id || 'unknown');
      console.warn('Bulk delete not implemented for orders. Selected rows:', ids);
      clearSelection();
    });

    updateHeaderMode();
    syncHeaderCheckbox();
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    loadColumns();
    bindEvents();
    bindSelectionEvents();
  });
})();
