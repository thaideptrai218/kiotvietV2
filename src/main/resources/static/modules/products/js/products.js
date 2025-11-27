(() => {
  const api = {
    base: '/api/products',
    headers() {
      const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      return h;
    }
  };

  const els = {
    q: document.getElementById('q'),
    categoryId: document.getElementById('categoryId'),
    brandId: document.getElementById('brandId'),
    supplierId: document.getElementById('supplierId'),
    status: document.getElementById('status'),
    tracked: document.getElementById('tracked'),

    
    // Autocomplete elements
    categoryAutocomplete: document.getElementById('categoryId'),
    categoryDropdown: document.getElementById('categoryDropdown'),
    categoryClear: document.querySelector('#categoryId + .kv-autocomplete__clear'),
    brandAutocomplete: document.getElementById('brandId'),
    brandDropdown: document.getElementById('brandDropdown'),
    brandClear: document.querySelector('#brandId + .kv-autocomplete__clear'),
    supplierAutocomplete: document.getElementById('supplierId'),
    supplierDropdown: document.getElementById('supplierDropdown'),
    supplierClear: document.querySelector('#supplierId + .kv-autocomplete__clear'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnAdd: document.getElementById('btnAdd'),
    hdrSearch: document.getElementById('hdrSearch'),
    btnColumns: document.getElementById('btnColumns'),
    btnResetColumns: document.getElementById('btnResetColumns'),
    colSku: document.getElementById('colSku'),
    colName: document.getElementById('colName'),
    colCategory: document.getElementById('colCategory'),
    colBrand: document.getElementById('colBrand'),
    colSupplier: document.getElementById('colSupplier'),
    colSellingPrice: document.getElementById('colSellingPrice'),
    colStock: document.getElementById('colStock'),
    colStatus: document.getElementById('colStatus'),
      btnToggleFilter: document.getElementById('btnToggleFilter'),
    btnCollapseFilter: document.getElementById('btnCollapseFilter'),
    filterPanel: document.getElementById('filterPanel'),
    tblBody: document.querySelector('#tbl tbody'),
    tblHead: document.querySelector('#tbl thead'),
    pagi: document.getElementById('pagi'),
    pageInfo: document.getElementById('pageInfo'),
    sizeSel: document.getElementById('sizeSel'),
    alert: document.getElementById('alert'),
    chips: document.getElementById('chips'),
    hdrNormal: document.getElementById('hdrNormal'),
    hdrBulk: document.getElementById('hdrBulk'),
    selCount: document.getElementById('selCount'),
    chkAll: document.getElementById('chkAll'),

    // Edit modal
    modal: new bootstrap.Modal(document.getElementById('editModal')),
    modalTitle: document.getElementById('modalTitle'),
    modalErr: document.getElementById('modalErr'),
    productId: document.getElementById('productId'),
    productSku: document.getElementById('productSku'),
    productBarcode: document.getElementById('productBarcode'),
    productName: document.getElementById('productName'),
    productDescription: document.getElementById('productDescription'),
    productCategory: document.getElementById('productCategory'),
    productBrand: document.getElementById('productBrand'),
    productSupplier: document.getElementById('productSupplier'),
    productSellingPrice: document.getElementById('productSellingPrice'),
    productCostPrice: document.getElementById('productCostPrice'),
    productOnHand: document.getElementById('productOnHand'),
    productMinLevel: document.getElementById('productMinLevel'),
    productMaxLevel: document.getElementById('productMaxLevel'),
    productIsTracked: document.getElementById('productIsTracked'),
    productStatus: document.getElementById('productStatus'),
    productImageFile: document.getElementById('fileImage'),
    productImageUrl: document.getElementById('productImageUrl'),
    productImagePreview: document.getElementById('imgDisplay'),
    productImagePlaceholder: document.getElementById('imagePreview'),
    btnRemoveImage: document.getElementById('btnRemoveImage'),
    btnSave: document.getElementById('btnSave'),
    btnSaveNew: document.getElementById('btnSaveNew'),

    // Import modal
    importModal: document.getElementById('importModal') ? new bootstrap.Modal(document.getElementById('importModal')) : null,
    btnImport: document.getElementById('btnImport'),
    fileExcel: document.getElementById('fileExcel'),
    btnImportUpload: document.getElementById('btnImportUpload'),
    btnDownloadCsv: document.getElementById('btnDownloadCsv'),
    importErr: document.getElementById('importErr')
  };

  const state = { page: 0, size: 15, sortBy: 'name', sortDir: 'asc', loading: false, selected: new Set(), expanded: new Set(), columns: { sku: true, name: true, category: true, brand: true, supplier: true, sellingPrice: true, stock: true, status: true }, lookupData: { categories: [], brands: [], suppliers: [] }, selectedCategories: new Map(), selectedBrands: new Map(), selectedSuppliers: new Map(), autocomplete: { category: { selectedIndex: -1, suggestions: [], isOpen: false }, brand: { selectedIndex: -1, suggestions: [], isOpen: false }, supplier: { selectedIndex: -1, suggestions: [], isOpen: false } } };
  let currentAbort = null;

  const storageKey = () => {
    try {
      const token = api.headers().Authorization?.split(' ')[1];
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return `products.columns.v1.${payload.companyId || 'default'}`;
      }
    } catch { } // eslint-disable-line no-empty
    return 'products.columns.v1.default';
  };

  function loadColumns() {
    try { const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}'); if (saved && typeof saved === 'object') state.columns = { ...state.columns, ...saved }; } catch { } // eslint-disable-line no-empty
    els.colSku.checked = !!state.columns.sku;
    els.colName.checked = !!state.columns.name;
    els.colCategory.checked = !!state.columns.category;
    els.colBrand.checked = !!state.columns.brand;
    els.colSupplier.checked = !!state.columns.supplier;
    els.colSellingPrice.checked = !!state.columns.sellingPrice;
    els.colStock.checked = !!state.columns.stock;
    els.colStatus.checked = !!state.columns.status;
    applyColumnVisibility();
  }

  function saveColumns() { localStorage.setItem(storageKey(), JSON.stringify(state.columns)); }

  function applyColumnVisibility() {
    const map = state.columns;
    document.querySelectorAll('th[data-col], td[data-col]').forEach(el => {
      const key = el.getAttribute('data-col');
      el.classList.toggle('col-hidden', map[key] === false);
    });
  }

  function showAlert(msg, type = 'success') {
    els.alert.className = `alert alert-${type}`;
    els.alert.textContent = msg;
    els.alert.classList.remove('d-none');
    setTimeout(() => els.alert.classList.add('d-none'), 2500);
  }

  function fmt(val) { return val ?? ''; }

  function authGuard(resp) { if (resp.status === 401) throw new Error('Unauthorized. Please login again.'); return resp; }

  function loadFromUrl() {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q') || '';
    const sortBy = p.get('sortBy') || state.sortBy;
    const sortDir = p.get('sortDir') || state.sortDir;
    const page1 = parseInt(p.get('page') || '1', 10);
    const size = parseInt(p.get('size') || state.size, 10);
    const categoryId = p.get('categoryId') || '';
    const brandId = p.get('brandId') || '';
    const supplierId = p.get('supplierId') || '';
    const status = p.get('status') || '';
    const tracked = p.get('tracked') || '';
    els.q.value = q; if (els.hdrSearch) els.hdrSearch.value = q;
    els.categoryId.value = categoryId;
    els.brandId.value = brandId;
    els.supplierId.value = supplierId;
    if (status !== '') els.status.value = status;
    if (tracked !== '') els.tracked.value = tracked;
    state.sortBy = sortBy || null;
    state.sortDir = sortDir || 'asc';
    state.page = isNaN(page1) ? 0 : Math.max(page1 - 1, 0);
    state.size = isNaN(size) ? state.size : size;
    if (els.sizeSel) els.sizeSel.value = String(state.size);
  }

  function updateUrl() {
    const p = new URLSearchParams();
    if (els.q.value.trim()) p.set('q', els.q.value.trim());
    if (state.sortBy) { p.set('sortBy', state.sortBy); p.set('sortDir', state.sortDir); }
    p.set('page', String(state.page + 1));
    p.set('size', String(state.size));

    // Use dataset.selectedValue for autocomplete filters
    const categoryId = els.categoryAutocomplete?.dataset.selectedValue || els.categoryId.value;
    const brandId = els.brandAutocomplete?.dataset.selectedValue || els.brandId.value;
    const supplierId = els.supplierAutocomplete?.dataset.selectedValue || els.supplierId.value;

    if (categoryId) p.set('categoryId', categoryId.trim());
    if (brandId) p.set('brandId', brandId.trim());
    if (supplierId) p.set('supplierId', supplierId.trim());
    if (els.status.value !== '') p.set('status', els.status.value);
    if (els.tracked.value !== '') p.set('tracked', els.tracked.value);
    const url = `${location.pathname}?${p.toString()}`;
    history.replaceState(null, '', url);
  }

  async function fetchList() {
    console.log('fetchList called');

    // Debug: Check if elements exist
    if (!els.tblBody) {
      console.error('Table body element not found');
      return;
    }

    state.loading = true;
    const params = new URLSearchParams();
    if (els.q.value.trim()) params.set('search', els.q.value.trim());

    // Use multiple selected items for filters
    if (state.selectedCategories.size > 0) {
      const categoryIds = Array.from(state.selectedCategories.keys());
      categoryIds.forEach(id => params.append('categoryIds', id));
    }

    if (state.selectedBrands.size > 0) {
      const brandIds = Array.from(state.selectedBrands.keys());
      brandIds.forEach(id => params.append('brandIds', id));
    }

    if (state.selectedSuppliers.size > 0) {
      const supplierIds = Array.from(state.selectedSuppliers.keys());
      supplierIds.forEach(id => params.append('supplierIds', id));
    }

    if (els.status.value !== '') params.set('status', els.status.value);
    if (els.tracked.value !== '') params.set('tracked', els.tracked.value);
    params.set('page', state.page);
    params.set('size', state.size);
    if (state.sortBy) { params.set('sortBy', state.sortBy); params.set('sortDir', state.sortDir); }

    const url = `${api.base}?${params.toString()}`;
    console.log('Fetching products from:', url);

    updateUrl();
    if (currentAbort) currentAbort.abort();
    currentAbort = new AbortController();

    try {
      const resp = await fetch(url, { headers: api.headers(), signal: currentAbort.signal }).then(authGuard);
      console.log('Response status:', resp.status);

      const body = await resp.json();
      console.log('Response body:', body);

      const data = body.data || body;
      renderChips();
      const items = data.items || data.content || data || [];
      console.log('Items to render:', items);

      if (items.length === 0 && state.page > 0 && (data.totalElements ?? 0) > 0) {
        console.log('Empty items but more pages exist, going to previous page');
        state.page = state.page - 1;
        return fetchList();
      }

      renderTable(items);
      renderPagination(data.currentPage ?? data.page ?? state.page, data.totalPages ?? Math.ceil((data.totalElements || 0) / state.size));
      const total = data.totalElements ?? 0;
      const from = total === 0 ? 0 : (state.page * state.size + 1);
      const to = Math.min((state.page + 1) * state.size, total);
      els.pageInfo.textContent = `${from}-${to} of ${total}`;
      state.loading = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert('Failed to load products: ' + error.message, 'danger');
      state.loading = false;
    }
  }

  function renderTable(items) {
    console.log('renderTable called with items:', items.length);

    if (!els.tblBody) {
      console.error('Table body element not found in renderTable');
      return;
    }

    if (!items.length) {
      console.log('No items to render, showing empty message');
      els.tblBody.innerHTML = `<tr><td colspan="10" class="table-empty"><i class="far fa-box-open me-2"></i> No products found</td></tr>`;
      return;
    }

    console.log('Rendering', items.length, 'products');
    const rows = [];
    for (const p of items) {
      const checked = state.selected.has(String(p.id)) ? 'checked' : '';
      const isExpanded = state.expanded.has(String(p.id));
      rows.push(`
        <tr data-id="${p.id}" tabindex="0" aria-expanded="${isExpanded}">
          <td><input type="checkbox" class="row-check" ${checked}></td>
          <td>
            <div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                ${p.image ? `<img src="${p.image}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-image text-muted"></i>`}
            </div>
          </td>
          <td data-col="sku" title="${fmt(p.sku)}">${fmt(p.sku)}</td>
          <td class="fw-semibold" data-col="name" title="${fmt(p.name)}">${fmt(p.name)}</td>
          <td data-col="category" title="${fmt(p.category?.name)}">${fmt(p.category?.name)}</td>
          <td data-col="brand" title="${fmt(p.brand?.name)}">${fmt(p.brand?.name)}</td>
          <td data-col="supplier" title="${fmt(p.supplier?.name)}">${fmt(p.supplier?.name)}</td>
          <td data-col="sellingPrice" class="text-end" title="${fmt(p.sellingPrice)}">${p.sellingPrice ? `₫${Number(p.sellingPrice).toLocaleString('vi-VN')}` : ''}</td>
          <td data-col="stock" class="text-center" title="${fmt(p.onHand)}">${fmt(p.onHand)}</td>
          <td data-col="status"><span class="badge badge-status ${p.status === 'ACTIVE' ? 'active' : 'inactive'}">${fmt(p.status)}</span></td>
        </tr>
        ${isExpanded ? expandedRow(p) : ''}
      `);
    }

    const html = rows.join('');
    console.log('Setting table HTML with', rows.length, 'rows');
    els.tblBody.innerHTML = html;

    applyColumnVisibility();
    syncHeaderCheckbox();
    console.log('Table rendering complete');
  }

  function expandedRow(p) {
    const toggleLabel = p.status === 'ACTIVE' ? 'Deactivate' : 'Activate';
    const categoryPath = p.category ? buildCategoryPath(p.category) : 'Uncategorized';
    const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'N/A';
    const updatedDate = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : 'N/A';
    const stockStatus = getStockStatus(p.onHand, p.minLevel);

    return `
      <tr class="expanded-row" data-id="${p.id}-exp">
        <td colspan="10">
          <div class="expanded-wrapper">
            <!-- Tab Navigation -->
            <ul class="nav nav-tabs" id="productTabs-${p.id}" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="details-tab-${p.id}" data-bs-toggle="tab"
                        data-bs-target="#details-${p.id}" type="button" role="tab"
                        aria-controls="details-${p.id}" aria-selected="true">
                  <i class="fas fa-info-circle me-2"></i>Details
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="description-tab-${p.id}" data-bs-toggle="tab"
                        data-bs-target="#description-${p.id}" type="button" role="tab"
                        aria-controls="description-${p.id}" aria-selected="false">
                  <i class="fas fa-align-left me-2"></i>Description
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="inventory-tab-${p.id}" data-bs-toggle="tab"
                        data-bs-target="#inventory-${p.id}" type="button" role="tab"
                        aria-controls="inventory-${p.id}" aria-selected="false">
                  <i class="fas fa-boxes me-2"></i>Inventory
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="pricing-tab-${p.id}" data-bs-toggle="tab"
                        data-bs-target="#pricing-${p.id}" type="button" role="tab"
                        aria-controls="pricing-${p.id}" aria-selected="false">
                  <i class="fas fa-tag me-2"></i>Pricing
                </button>
              </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="productTabsContent-${p.id}">
              <!-- Details Tab -->
              <div class="tab-pane fade show active" id="details-${p.id}" role="tabpanel"
                   aria-labelledby="details-tab-${p.id}">
                <div class="tab-content-wrapper">
                  <div class="row g-4">
                    <!-- Product Image -->
                    <div class="col-md-3">
                      <div class="product-image-container">
                        ${p.image ? 
                            `<img src="${p.image}" class="img-fluid rounded border" style="width: 100%; max-height: 200px; object-fit: cover;">` :
                            `<div class="product-image-placeholder d-flex align-items-center justify-content-center bg-light border rounded"
                                 style="width: 100%; height: 150px;">
                              <i class="fas fa-image text-muted fa-3x"></i>
                            </div>`
                        }
                      </div>
                    </div>

                    <!-- Product Information -->
                    <div class="col-md-9">
                      <div class="product-header mb-3">
                        <h4 class="product-title mb-1">${fmt(p.name)}</h4>
                        <p class="category-path text-muted mb-2">
                          <i class="fas fa-folder-tree me-1"></i>${categoryPath}
                        </p>
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge badge-status ${p.status === 'ACTIVE' ? 'active' : 'inactive'}">${fmt(p.status)}</span>
                          <span class="badge bg-light text-dark">
                            <i class="fas fa-cube me-1"></i>${p.isTracked ? 'Tracked' : 'Not Tracked'}
                          </span>
                        </div>
                      </div>

                      <!-- 4-Column Details Grid -->
                      <div class="details-grid">
                        <div class="row g-3">
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">SKU / Code</div>
                              <div class="field-value">${fmt(p.sku)}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Brand</div>
                              <div class="field-value">${fmt(p.brand?.name)}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Barcode</div>
                              <div class="field-value">${fmt(p.barcode)}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Selling Price</div>
                              <div class="field-value">${p.sellingPrice ? `₫${Number(p.sellingPrice).toLocaleString('vi-VN')}` : 'Not set'}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Supplier</div>
                              <div class="field-value">${fmt(p.supplier?.name)}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Created Date</div>
                              <div class="field-value">${createdDate}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Updated Date</div>
                              <div class="field-value">${updatedDate}</div>
                            </div>
                          </div>
                          <div class="col-6 col-lg-3">
                            <div class="field-item">
                              <div class="field-label">Stock Status</div>
                              <div class="field-value">
                                <span class="stock-status ${stockStatus.class}">
                                  <span class="stock-indicator ${stockStatus.indicator}"></span>
                                  ${stockStatus.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description Tab -->
              <div class="tab-pane fade" id="description-${p.id}" role="tabpanel"
                   aria-labelledby="description-tab-${p.id}">
                <div class="tab-content-wrapper">
                  <div class="description-content">
                    <h5 class="mb-3">Product Description</h5>
                    ${p.description ?
                      `<div class="description-text">${formatDescription(p.description)}</div>` :
                      `<div class="text-muted italic">No description available</div>`
                    }
                  </div>
                </div>
              </div>

              <!-- Inventory Tab -->
              <div class="tab-pane fade" id="inventory-${p.id}" role="tabpanel"
                   aria-labelledby="inventory-tab-${p.id}">
                <div class="tab-content-wrapper">
                  <div class="row g-4">
                    <div class="col-md-6">
                      <h5 class="mb-3">Stock Information</h5>
                      <div class="inventory-details">
                        <div class="field-item mb-3">
                          <div class="field-label">Current Stock</div>
                          <div class="field-value fs-4 fw-bold ${stockStatus.class}">${fmt(p.onHand)} units</div>
                        </div>
                        <div class="field-item mb-3">
                          <div class="field-label">Minimum Level</div>
                          <div class="field-value">${fmt(p.minLevel)} units</div>
                        </div>
                        <div class="field-item mb-3">
                          <div class="field-label">Maximum Level</div>
                          <div class="field-value">${fmt(p.maxLevel)} units</div>
                        </div>
                        <div class="field-item mb-3">
                          <div class="field-label">Reorder Point</div>
                          <div class="field-value">
                            ${p.minLevel ? fmt(p.minLevel) + ' units' : 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mb-3">Inventory Settings</h5>
                      <div class="inventory-settings">
                        <div class="form-check form-switch mb-3">
                          <input class="form-check-input" type="checkbox" ${p.isTracked ? 'checked' : ''} disabled>
                          <label class="form-check-label">Track Inventory</label>
                        </div>
                        <div class="alert alert-info">
                          <i class="fas fa-info-circle me-2"></i>
                          <strong>Status:</strong> ${stockStatus.text}
                          ${stockStatus.action ? `<br><strong>Recommended Action:</strong> ${stockStatus.action}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pricing Tab -->
              <div class="tab-pane fade" id="pricing-${p.id}" role="tabpanel"
                   aria-labelledby="pricing-tab-${p.id}">
                <div class="tab-content-wrapper">
                  <div class="row g-4">
                    <div class="col-md-6">
                      <h5 class="mb-3">Current Prices</h5>
                      <div class="pricing-details">
                        <div class="field-item mb-3">
                          <div class="field-label">Selling Price</div>
                          <div class="field-value fs-4 fw-bold text-success">
                            ${p.sellingPrice ? `₫${Number(p.sellingPrice).toLocaleString('vi-VN')}` : 'Not set'}
                          </div>
                        </div>
                        <div class="field-item mb-3">
                          <div class="field-label">Cost Price</div>
                          <div class="field-value fs-5">
                            ${p.costPrice ? `₫${Number(p.costPrice).toLocaleString('vi-VN')}` : 'Not set'}
                          </div>
                        </div>
                        <div class="field-item mb-3">
                          <div class="field-label">Profit Margin</div>
                          <div class="field-value">
                            ${calculateProfitMargin(p.sellingPrice, p.costPrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mb-3">Pricing Analysis</h5>
                      <div class="pricing-analysis">
                        ${p.sellingPrice && p.costPrice ?
                          `<div class="alert alert-success">
                            <i class="fas fa-chart-line me-2"></i>
                            <strong>Margin:</strong> ${calculateProfitMargin(p.sellingPrice, p.costPrice)}
                          </div>` :
                          `<div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Set both cost and selling prices to see margin analysis
                          </div>`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="action-bar">
              <div class="d-flex justify-content-end gap-2">
                <button class="kv-btn kv-btn--ghost kv-btn--sm" data-act="delete">
                  <i class="far fa-trash-can me-1"></i>Delete
                </button>
                <button class="kv-btn kv-btn--primary kv-btn--sm" data-act="edit">
                  <i class="far fa-pen-to-square me-1"></i>Update
                </button>
                <button class="kv-btn kv-btn--secondary kv-btn--sm" data-act="toggleStatus">
                  <i class="fas fa-power-off me-1"></i>${toggleLabel}
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>`;
  }

  // Helper functions for enhanced expanded row
  function buildCategoryPath(category) {
    if (!category) return 'Uncategorized';
    if (category.fullPath) return category.fullPath;
    if (category.parentPath) return category.parentPath + ' / ' + category.name;
    return category.name || 'Uncategorized';
  }

  function getStockStatus(onHand, minLevel) {
    const stock = Number(onHand) || 0;
    const min = Number(minLevel) || 0;

    if (stock === 0) {
      return {
        text: 'Out of Stock',
        class: 'text-danger',
        indicator: 'stock-out',
        action: 'Reorder immediately'
      };
    } else if (stock <= min) {
      return {
        text: 'Low Stock',
        class: 'text-warning',
        indicator: 'stock-low',
        action: 'Reorder soon'
      };
    } else {
      return {
        text: 'In Stock',
        class: 'text-success',
        indicator: 'stock-good',
        action: null
      };
    }
  }

  function formatDescription(description) {
    if (!description) return '';
    // Simple markdown-like formatting
    return description
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '');
  }

  function calculateProfitMargin(sellingPrice, costPrice) {
    const selling = Number(sellingPrice) || 0;
    const cost = Number(costPrice) || 0;

    if (selling === 0 || cost === 0) return 'Not available';

    const margin = ((selling - cost) / selling * 100).toFixed(1);
    const profit = selling - cost;

    return `${margin}% (₫${profit.toLocaleString('vi-VN')})`;
  }

  function renderPagination(page, totalPages) {
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

  function openModal(data) {
    els.modalTitle.textContent = data?.id ? 'Edit Product' : 'New Product';
    els.productId.value = data?.id || '';
    els.productSku.value = data?.sku || '';
    els.productBarcode.value = data?.barcode || '';
    els.productName.value = data?.name || '';
    els.productDescription.value = data?.description || '';

    // Set dropdown values with proper handling for nested objects
    setTimeout(() => {
      els.productCategory.value = data?.category?.id || data?.categoryId || '';
      els.productBrand.value = data?.brand?.id || data?.brandId || '';
      els.productSupplier.value = data?.supplier?.id || data?.supplierId || '';
    }, 100);

    els.productSellingPrice.value = data?.sellingPrice || '';
    els.productCostPrice.value = data?.costPrice || '';
    els.productOnHand.value = data?.onHand || '0';
    els.productMinLevel.value = data?.minLevel || '0';
    els.productMaxLevel.value = data?.maxLevel || '0';
    els.productIsTracked.checked = (data?.isTracked ?? true) === true;
    els.productStatus.value = data?.status || 'ACTIVE';

    // Image handling
    els.productImageFile.value = ''; // Reset file input
    els.productImageUrl.value = data?.image || '';
    if (data?.image) {
      els.productImagePreview.src = data.image;
      els.productImagePreview.style.display = 'block';
      els.productImagePlaceholder.style.display = 'none';
      els.btnRemoveImage.style.display = 'block';
    } else {
      els.productImagePreview.src = '';
      els.productImagePreview.style.display = 'none';
      els.productImagePlaceholder.style.display = 'flex';
      els.btnRemoveImage.style.display = 'none';
    }

    // Show/hide appropriate buttons based on edit vs create mode
    const isEdit = !!data?.id;
    if (els.btnSave) {
      els.btnSave.classList.toggle('d-none', !isEdit);
      els.btnSave.disabled = false;
    }
    if (els.btnSaveNew) {
      els.btnSaveNew.classList.toggle('d-none', isEdit);
      // Reset loading state for create button
      const defaultText = els.btnSaveNew.querySelector('.default-text');
      const loadingText = els.btnSaveNew.querySelector('.loading-text');
      if (defaultText) defaultText.classList.remove('d-none');
      if (loadingText) loadingText.classList.add('d-none');
    }

    els.modalErr.classList.add('d-none');
    els.modal.show();
  }

  function setSaving(saving) {
    if (els.btnSave) els.btnSave.disabled = saving;
    if (els.btnSaveNew) {
      els.btnSaveNew.querySelector('.default-text').classList.toggle('d-none', saving);
      els.btnSaveNew.querySelector('.loading-text').classList.toggle('d-none', !saving);
    }
  }

  async function save() {
    const id = els.productId.value;
    const payload = {
      sku: els.productSku.value.trim(),
      barcode: els.productBarcode.value.trim() || null,
      name: els.productName.value.trim(),
      description: els.productDescription.value.trim() || null,
      image: els.productImageUrl.value || null,
      categoryId: els.productCategory.value || null,
      brandId: els.productBrand.value || null,
      supplierId: els.productSupplier.value || null,
      sellingPrice: Number(els.productSellingPrice.value) || 0,
      costPrice: Number(els.productCostPrice.value) || 0,
      onHand: Number(els.productOnHand.value) || 0,
      minLevel: Number(els.productMinLevel.value) || 0,
      maxLevel: Number(els.productMaxLevel.value) || 0,
      isTracked: els.productIsTracked.checked,
      status: els.productStatus.value || 'ACTIVE'
    };
    if (!payload.name) { els.modalErr.textContent = 'Product name is required'; els.modalErr.classList.remove('d-none'); return; }
    setSaving(true);
    try {
      const url = id ? `${api.base}/${id}` : api.base;
      const method = id ? 'PUT' : 'POST';
      const resp = await fetch(url, { method, headers: api.headers(), body: JSON.stringify(payload) }).then(authGuard);
      const body = await resp.json();
      if (resp.ok) { els.modal.hide(); showAlert(id ? 'Product updated' : 'Product created', 'success'); fetchList(); }
      else { throw new Error(body?.message || 'Save failed'); }
    } catch (e) { els.modalErr.textContent = e.message || 'Error'; els.modalErr.classList.remove('d-none'); }
    finally { setSaving(false); }
  }

  async function doDelete(id) {
    if (!confirm('Delete this product?')) return;
    const resp = await fetch(`${api.base}/${id}`, { method: 'DELETE', headers: api.headers() }).then(authGuard);
    if (resp.ok) { showAlert('Product deleted', 'success'); fetchList(); }
    else { const body = await resp.json().catch(() => ({})); showAlert(body?.message || 'Delete failed', 'danger'); }
  }

  function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); }; }

  function updateSortHeaders() {
    document.querySelectorAll('th.sortable').forEach(th => { th.classList.remove('active', 'asc', 'desc'); th.setAttribute('aria-sort', 'none'); if (th.dataset.sort === state.sortBy) { th.classList.add('active', state.sortDir); th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending'); } });
  }

  function syncHeaderCheckbox() {
    const checks = els.tblBody.querySelectorAll('input.row-check');
    if (!checks.length) { els.chkAll.checked = false; els.chkAll.indeterminate = false; return; }
    const checked = [...checks].filter(c => c.checked).length;
    els.chkAll.checked = checked === checks.length;
    els.chkAll.indeterminate = checked > 0 && checked < checks.length;
  }

  function updateHeaderMode() { const count = state.selected.size; els.selCount.textContent = count; els.hdrBulk.classList.toggle('d-none', count === 0); els.hdrNormal.classList.toggle('d-none', count > 0); }

  function renderChips() {
    const chips = [];

    // Search chip
    if (els.q.value.trim()) {
      chips.push(chip('search', 'Search', els.q.value.trim(), () => { els.q.value = ''; fetchList(); }));
    }

    // Category chips from selectedCategories Map
    state.selectedCategories.forEach((item, id) => {
      chips.push(chip('category', 'Category', item.name, () => {
        state.selectedCategories.delete(id);
        renderChips();
        fetchList();
      }));
    });

    // Brand chips from selectedBrands Map
    state.selectedBrands.forEach((item, id) => {
      chips.push(chip('brand', 'Brand', item.name, () => {
        state.selectedBrands.delete(id);
        renderChips();
        fetchList();
      }));
    });

    // Supplier chips from selectedSuppliers Map
    state.selectedSuppliers.forEach((item, id) => {
      chips.push(chip('supplier', 'Supplier', item.name, () => {
        state.selectedSuppliers.delete(id);
        renderChips();
        fetchList();
      }));
    });

    // Status chip
    if (els.status.value !== '') {
      chips.push(chip('status', 'Status', els.status.value, () => { els.status.value = ''; renderChips(); fetchList(); }));
    }

    // Tracked chip
    if (els.tracked.value !== '') {
      chips.push(chip('tracked', 'Tracked', els.tracked.value === 'true' ? 'Yes' : 'No', () => { els.tracked.value = ''; renderChips(); fetchList(); }));
    }

    els.chips.innerHTML = chips.join('');
  }

  function chip(type, label, value, onRemove) { const id = `chip_${Math.random().toString(36).slice(2)}`; setTimeout(() => { const btn = document.getElementById(id); if (btn) btn.addEventListener('click', onRemove); }, 0); return `<span class="chip" data-type="${type}"><span class="text-muted">${label}:</span> ${value} <button id="${id}" aria-label="Remove"><i class="fas fa-times"></i></button></span>`; }

  // API functions to fetch lookup data
  async function fetchCategories() {
    try {
      const resp = await fetch('/api/categories', { headers: api.headers() }).then(authGuard);
      const body = await resp.json();
      console.log('Categories API response:', body);

      // Handle the response structure based on SuccessResponse wrapper
      let categories = [];
      if (body.data && body.data.categories && Array.isArray(body.data.categories)) {
        categories = body.data.categories;
      } else if (body.data && Array.isArray(body.data)) {
        categories = body.data;
      } else if (body.categories && Array.isArray(body.categories)) {
        categories = body.categories;
      } else if (body.items && Array.isArray(body.items)) {
        categories = body.items;
      } else if (body.content && Array.isArray(body.content)) {
        categories = body.content;
      } else if (Array.isArray(body)) {
        categories = body;
      }

      console.log('Parsed categories:', categories);
      state.lookupData.categories = categories;
      populateCategoryDropdowns();
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      state.lookupData.categories = [];
      populateCategoryDropdowns(); // Still populate with empty array
    }
  }

  async function fetchBrands() {
    try {
      // Use autocomplete endpoint for brands as it's more appropriate for filter functionality
      const resp = await fetch('/api/brands/autocomplete?query=&limit=1000', { headers: api.headers() }).then(authGuard);
      const body = await resp.json();
      console.log('Brands API response:', body);

      // Handle the response structure based on SuccessResponse wrapper
      let brands = [];
      if (body.data && Array.isArray(body.data)) {
        brands = body.data;
      } else if (body.data && body.data.content && Array.isArray(body.data.content)) {
        brands = body.data.content;
      } else if (body.content && Array.isArray(body.content)) {
        brands = body.content;
      } else if (body.items && Array.isArray(body.items)) {
        brands = body.items;
      } else if (Array.isArray(body)) {
        brands = body;
      }

      console.log('Parsed brands:', brands);
      state.lookupData.brands = brands;
      populateBrandDropdowns();
    } catch (e) {
      console.error('Failed to fetch brands:', e);
      state.lookupData.brands = [];
      populateBrandDropdowns(); // Still populate with empty array
    }
  }

  async function fetchSuppliers() {
    try {
      // Use autocomplete endpoint for suppliers as it's more appropriate for filter functionality
      const resp = await fetch('/api/suppliers/autocomplete?query=&limit=1000', { headers: api.headers() }).then(authGuard);
      const body = await resp.json();
      console.log('Suppliers API response:', body);

      // Handle the response structure based on SuccessResponse wrapper
      let suppliers = [];
      if (body.data && Array.isArray(body.data)) {
        suppliers = body.data;
      } else if (body.data && body.data.content && Array.isArray(body.data.content)) {
        suppliers = body.data.content;
      } else if (body.content && Array.isArray(body.content)) {
        suppliers = body.content;
      } else if (body.items && Array.isArray(body.items)) {
        suppliers = body.items;
      } else if (Array.isArray(body)) {
        suppliers = body;
      }

      console.log('Parsed suppliers:', suppliers);
      state.lookupData.suppliers = suppliers;
      populateSupplierDropdowns();
    } catch (e) {
      console.error('Failed to fetch suppliers:', e);
      state.lookupData.suppliers = [];
      populateSupplierDropdowns(); // Still populate with empty array
    }
  }

  // Populate dropdown functions
  function populateCategoryDropdowns() {
    console.log('Populating category dropdowns with:', state.lookupData.categories);

    let options = '<option value="">All Categories</option>';
    let modalOptions = '<option value="">Select Category</option>';

    if (Array.isArray(state.lookupData.categories)) {
      state.lookupData.categories.forEach(cat => {
        const safeName = (cat.name || '').replace(/"/g, '&quot;');
        const safeId = cat.id || '';
        options += `<option value="${safeId}">${safeName}</option>`;
        modalOptions += `<option value="${safeId}">${safeName}</option>`;
      });
    }

    if (els.categoryId) {
      els.categoryId.innerHTML = options;
      els.categoryId.value = els.categoryId.value; // Preserve selection
    }
    if (els.productCategory) {
      els.productCategory.innerHTML = modalOptions;
    }
  }

  function populateBrandDropdowns() {
    console.log('Populating brand dropdowns with:', state.lookupData.brands);

    let options = '<option value="">All Brands</option>';
    let modalOptions = '<option value="">Select Brand</option>';

    if (Array.isArray(state.lookupData.brands)) {
      state.lookupData.brands.forEach(brand => {
        const safeName = (brand.name || '').replace(/"/g, '&quot;');
        const safeId = brand.id || '';
        options += `<option value="${safeId}">${safeName}</option>`;
        modalOptions += `<option value="${safeId}">${safeName}</option>`;
      });
    }

    if (els.brandId) {
      els.brandId.innerHTML = options;
      els.brandId.value = els.brandId.value; // Preserve selection
    }
    if (els.productBrand) {
      els.productBrand.innerHTML = modalOptions;
    }
  }

  function populateSupplierDropdowns() {
    console.log('Populating supplier dropdowns with:', state.lookupData.suppliers);

    let options = '<option value="">All Suppliers</option>';
    let modalOptions = '<option value="">Select Supplier</option>';

    if (Array.isArray(state.lookupData.suppliers)) {
      state.lookupData.suppliers.forEach(supplier => {
        // Use displayName first, fallback to name, then to id
        const displayName = supplier.displayName || supplier.name || supplier.id || '';
        const safeName = displayName.replace(/"/g, '&quot;');
        const safeId = supplier.id || '';
        options += `<option value="${safeId}">${safeName}</option>`;
        modalOptions += `<option value="${safeId}">${safeName}</option>`;
      });
    }

    if (els.supplierId) {
      els.supplierId.innerHTML = options;
      els.supplierId.value = els.supplierId.value; // Preserve selection
    }
    if (els.productSupplier) {
      els.productSupplier.innerHTML = modalOptions;
    }
  }

  // Autocomplete functions
  function initAutocomplete(input, dropdown, clearBtn, type) {
    let debounceTimer = null;

    // Input event handler with debouncing
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();

      // Update clear button visibility
      updateClearButton(input.parentElement, value);

      // Store current value for filtering
      state.autocomplete[type].currentValue = value;

      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new debounce timer
      debounceTimer = setTimeout(() => {
        if (value.length >= 1) {
          showSuggestions(type, value);
        } else {
          hideSuggestions(type);
        }
      }, 300);
    });

    // Focus event handler
    input.addEventListener('focus', () => {
      const value = input.value.trim();
      // Show all suggestions on focus, even if input is empty
      showSuggestions(type, value.length >= 1 ? value : '');
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      handleKeyNavigation(e, type, input, dropdown);
    });

    // Clear button click handler
    clearBtn.addEventListener('click', () => {
      clearAutocomplete(input, type);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!input.parentElement.contains(e.target)) {
        hideSuggestions(type);
      }
    });

    // Dropdown item click handler
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.kv-autocomplete__item');
      if (item && !item.classList.contains('no-results')) {
        const value = item.dataset.value;
        const text = item.textContent;
        selectAutocompleteValue(input, type, value, text);
      }
    });
  }

  function showSuggestions(type, query) {
    const dropdown = getDropdown(type);
    const data = getLookupData(type);

    // Filter suggestions based on query (check both name and displayName for suppliers)
    const suggestions = data.filter(item =>
      (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
      (item.displayName && item.displayName.toLowerCase().includes(query.toLowerCase()))
    );

    state.autocomplete[type].suggestions = suggestions;
    state.autocomplete[type].selectedIndex = -1;

    if (suggestions.length > 0) {
      renderSuggestions(type, suggestions);
      dropdown.classList.add('show');
      state.autocomplete[type].isOpen = true;
    } else {
      renderNoResults(type);
      dropdown.classList.add('show');
      state.autocomplete[type].isOpen = true;
    }
  }

  function hideSuggestions(type) {
    const dropdown = getDropdown(type);
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    state.autocomplete[type].isOpen = false;
    state.autocomplete[type].selectedIndex = -1;
  }

  function renderSuggestions(type, suggestions) {
    const dropdown = getDropdown(type);
    dropdown.innerHTML = suggestions.map((item, index) => `
      <div class="kv-autocomplete__item" data-value="${item.id || ''}" data-index="${index}">
        ${item.name || item.displayName || item.id}
      </div>
    `).join('');
  }

  function renderNoResults(type) {
    const dropdown = getDropdown(type);
    dropdown.innerHTML = '<div class="kv-autocomplete__item no-results">No results found</div>';
  }

  function handleKeyNavigation(e, type, input, dropdown) {
    const suggestions = state.autocomplete[type].suggestions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          state.autocomplete[type].selectedIndex = Math.min(state.autocomplete[type].selectedIndex + 1, suggestions.length - 1);
          updateHighlightedSuggestion(type);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          state.autocomplete[type].selectedIndex = Math.max(state.autocomplete[type].selectedIndex - 1, 0);
          updateHighlightedSuggestion(type);
        }
        break;

      case 'Enter':
        e.preventDefault();
        const selectedIndex = state.autocomplete[type].selectedIndex;
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          const selected = suggestions[selectedIndex];
          selectAutocompleteValue(input, type, selected.id || '', selected.name);
        } else {
          // Use current input value if no suggestion selected
          const value = input.value.trim();
          if (value) {
            selectAutocompleteValue(input, type, '', value);
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        hideSuggestions(type);
        input.blur();
        break;
    }
  }

  function updateHighlightedSuggestion(type) {
    const dropdown = getDropdown(type);
    const items = dropdown.querySelectorAll('.kv-autocomplete__item:not(.no-results)');
    const selectedIndex = state.autocomplete[type].selectedIndex;

    items.forEach((item, index) => {
      item.classList.toggle('highlight', index === selectedIndex);
    });

    // Scroll highlighted item into view
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectAutocompleteValue(input, type, value, text) {
    // Check if already selected
    const selectedMap = getSelectedMap(type);
    if (selectedMap.has(value)) {
      // Already selected, do nothing
      return;
    }

    // Get the display name from the suggestion data
    const suggestions = state.autocomplete[type].suggestions;
    const selectedItem = suggestions.find(item => item.id == value);
    const displayName = selectedItem ? (selectedItem.name || selectedItem.displayName || text) : text;

    // Add to selected items
    selectedMap.set(value, { id: value, name: displayName });

    // Clear input for next selection
    input.value = '';
    input.dataset.selectedValue = '';
    input.dataset.displayName = '';

    // Trigger filter update
    state.page = 0;
    fetchList();
  }

  function clearAutocomplete(input, type) {
    // Clear the input
    input.value = '';
    input.dataset.selectedValue = '';
    input.dataset.displayName = '';

    // Clear all selected items for this type
    const selectedMap = getSelectedMap(type);
    selectedMap.clear();

    // Update UI
    updateClearButton(input.parentElement, '');
    hideSuggestions(type);

    // Trigger filter update
    state.page = 0;
    fetchList();
  }

  function updateClearButton(container, value) {
    const clearBtn = container.querySelector('.kv-autocomplete__clear');
    container.classList.toggle('empty', !value);
  }

  function getDropdown(type) {
    switch (type) {
      case 'category': return els.categoryDropdown;
      case 'brand': return els.brandDropdown;
      case 'supplier': return els.supplierDropdown;
      default: return null;
    }
  }

  function getLookupData(type) {
    switch (type) {
      case 'category': return state.lookupData.categories || [];
      case 'brand': return state.lookupData.brands || [];
      case 'supplier': return state.lookupData.suppliers || [];
      default: return [];
    }
  }

  function getSelectedMap(type) {
    switch (type) {
      case 'category': return state.selectedCategories;
      case 'brand': return state.selectedBrands;
      case 'supplier': return state.selectedSuppliers;
      default: return new Map();
    }
  }

  
  // Initialize lookup data
  async function initializeLookupData() {
    await Promise.all([
      fetchCategories(),
      fetchBrands(),
      fetchSuppliers()
    ]);

    // After loading lookup data, set display names for any existing URL filter values
    setDisplayNamesFromUrl();
  }

  function setDisplayNamesFromUrl() {
    // Set display names for existing filter values based on loaded lookup data
    if (els.categoryId.value && els.categoryAutocomplete) {
      const category = state.lookupData.categories.find(cat => cat.id == els.categoryId.value);
      if (category) {
        els.categoryAutocomplete.value = category.name;
        els.categoryAutocomplete.dataset.displayName = category.name;
      }
    }

    if (els.brandId.value && els.brandAutocomplete) {
      const brand = state.lookupData.brands.find(b => b.id == els.brandId.value);
      if (brand) {
        els.brandAutocomplete.value = brand.name;
        els.brandAutocomplete.dataset.displayName = brand.name;
      }
    }

    if (els.supplierId.value && els.supplierAutocomplete) {
      const supplier = state.lookupData.suppliers.find(s => s.id == els.supplierId.value);
      if (supplier) {
        // Use displayName first, fallback to name
        const displayName = supplier.displayName || supplier.name;
        els.supplierAutocomplete.value = displayName;
        els.supplierAutocomplete.dataset.displayName = displayName;
      }
    }
  }

  // Ensure modal exists before binding
  if (els.btnAdd && els.modal) {
    els.btnAdd.addEventListener('click', () => openModal());
  }

  // Events
  els.btnRefresh?.addEventListener('click', () => fetchList());
  els.q?.addEventListener('input', debounce(() => { state.page = 0; fetchList(); }, 300));

  // Initialize autocomplete components
  if (els.categoryAutocomplete && els.categoryDropdown && els.categoryClear) {
    initAutocomplete(els.categoryAutocomplete, els.categoryDropdown, els.categoryClear, 'category');
    // Initialize clear button state
    updateClearButton(els.categoryAutocomplete.parentElement, els.categoryAutocomplete.value.trim());
  }
  if (els.brandAutocomplete && els.brandDropdown && els.brandClear) {
    initAutocomplete(els.brandAutocomplete, els.brandDropdown, els.brandClear, 'brand');
    // Initialize clear button state
    updateClearButton(els.brandAutocomplete.parentElement, els.brandAutocomplete.value.trim());
  }
  if (els.supplierAutocomplete && els.supplierDropdown && els.supplierClear) {
    initAutocomplete(els.supplierAutocomplete, els.supplierDropdown, els.supplierClear, 'supplier');
    // Initialize clear button state
    updateClearButton(els.supplierAutocomplete.parentElement, els.supplierAutocomplete.value.trim());
  }
  els.status?.addEventListener('change', () => { state.page = 0; fetchList(); });
  els.tracked?.addEventListener('change', () => { state.page = 0; fetchList(); });
  els.btnToggleFilter?.addEventListener('click', () => els.filterPanel.classList.toggle('collapsed'));
  els.btnCollapseFilter?.addEventListener('click', () => els.filterPanel.classList.toggle('collapsed'));
  els.pagi?.addEventListener('click', (e) => { const a = e.target.closest('a.page-link'); if (!a) return; const p = parseInt(a.dataset.page, 10); if (isNaN(p) || p < 0) return; state.page = p; state.selected.clear(); state.expanded.clear(); fetchList(); });
  els.sizeSel?.addEventListener('change', () => { state.size = parseInt(els.sizeSel.value, 10) || 15; state.page = 0; fetchList(); });
  els.tblBody?.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const rawId = tr.dataset.id; const id = String(rawId).includes('-exp') ? String(rawId).split('-')[0] : String(rawId);
    if (e.target.matches('input.row-check')) { if (e.target.checked) state.selected.add(id); else state.selected.delete(id); syncHeaderCheckbox(); updateHeaderMode(); return; }
    const btn = e.target.closest('button[data-act]');
    if (btn) {
      const act = btn.dataset.act; if (act === 'edit') { fetch(`${api.base}/${id}`, { headers: api.headers() }).then(authGuard).then(r => r.json()).then(body => openModal(body.data || body)).catch(err => showAlert(err.message, 'danger')); return; }
      if (act === 'delete') { doDelete(id); return; }
      if (act === 'toggleStatus') { const badge = document.querySelector(`tr[data-id="${id}"] [data-col="status"] .badge-status`); const isActive = badge?.classList.contains('active'); fetch(`${api.base}/${id}`, { method: 'PUT', headers: api.headers(), body: JSON.stringify({ status: isActive ? 'INACTIVE' : 'ACTIVE' }) }).then(authGuard).then(r => r.ok ? r.json() : r.json().then(b => Promise.reject(new Error(b?.message || 'Toggle failed')))).then(() => { showAlert('Status updated', 'success'); fetchList(); }).catch(e2 => showAlert(e2.message, 'danger')); return; }
    }

    // Prevent row clicks on tabs and expanded content from collapsing
    const tabClick = e.target.closest('[data-bs-toggle="tab"], .nav-link, .nav-tabs');
    const expandedContentClick = e.target.closest('.expanded-wrapper, .tab-content, .tab-pane, .action-bar button');

    if (tabClick || expandedContentClick) {
      e.stopPropagation();
      return;
    }

    // toggle expand/collapse on row click
    if (state.expanded.has(id)) { state.expanded.clear(); } // eslint-disable-line no-unused-expressions
    else { state.expanded.clear(); state.expanded.add(id); }
    fetchList();
  });
  els.tblHead?.addEventListener('click', (e) => { const th = e.target.closest('th.sortable'); if (!th) return; const key = th.dataset.sort; if (!key) return; if (state.sortBy === key) { if (state.sortDir === 'asc') state.sortDir = 'desc'; else { state.sortBy = null; state.sortDir = 'asc'; } } else { state.sortBy = key; state.sortDir = 'asc'; } updateSortHeaders(); state.expanded.clear(); fetchList(); });
  els.chkAll?.addEventListener('change', (e) => { const checks = els.tblBody.querySelectorAll('input.row-check'); if (e.target.checked) { checks.forEach(c => state.selected.add(String(c.closest('tr')?.dataset.id))); } else { checks.forEach(c => state.selected.delete(String(c.closest('tr')?.dataset.id))); } checks.forEach(c => c.checked = e.target.checked); updateHeaderMode(); });
  document.getElementById('btnClearSel')?.addEventListener('click', () => { state.selected.clear(); syncHeaderCheckbox(); updateHeaderMode(); fetchList(); });
  document.getElementById('btnBulkDelete')?.addEventListener('click', async () => { const ids = [...state.selected]; if (!ids.length) return; if (!confirm(`Delete ${ids.length} products?`)) return; try { for (const id of ids) { const resp = await fetch(`${api.base}/${id}`, { method: 'DELETE', headers: api.headers() }); if (!resp.ok) throw new Error('Delete failed'); } showAlert('Deleted selected products', 'success'); state.selected.clear(); updateHeaderMode(); fetchList(); } catch (e2) { showAlert(e2.message || 'Bulk delete failed', 'danger'); } });
  els.hdrSearch?.addEventListener('input', debounce(() => { els.q.value = els.hdrSearch.value; state.page = 0; fetchList(); }, 300));
  els.hdrSearch?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); els.q.value = els.hdrSearch.value; state.page = 0; fetchList(); } });
  if (els.btnSave) els.btnSave.addEventListener('click', save);
  if (els.btnSaveNew) els.btnSaveNew.addEventListener('click', async () => { els.productId.value = ''; await save(); els.modal.show(); document.getElementById('frm').reset(); els.productIsTracked.checked = true; els.productStatus.value = 'ACTIVE'; });
  els.btnImport?.addEventListener('click', () => { els.importErr?.classList.add('d-none'); if (els.fileExcel) els.fileExcel.value = ''; els.importModal?.show(); });
  els.btnImportUpload?.addEventListener('click', async () => {
    const f = els.fileExcel?.files?.[0];
    if (!f) { if (els.importErr) { els.importErr.textContent = 'Please choose a file'; els.importErr.classList.remove('d-none'); } return; }
    const fd = new FormData(); fd.append('file', f);
    try {
      const resp = await fetch(`${api.base}/bulk`, { method: 'POST', headers: { 'Authorization': api.headers().Authorization }, body: fd }).then(authGuard);
      if (!resp.ok) { const body = await resp.json().catch(() => ({})); throw new Error(body?.message || 'Upload failed'); }
      els.importModal?.hide(); showAlert('Import started', 'success'); fetchList();
    } catch (e2) { if (els.importErr) { els.importErr.textContent = e2.message || 'Upload failed'; els.importErr.classList.remove('d-none'); } }
  });

  // Image Upload Handler
  els.productImageFile?.addEventListener('change', async () => {
      const file = els.productImageFile.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
          const resp = await fetch(`${api.base}/upload-image`, {
              method: 'POST',
              headers: { 'Authorization': api.headers().Authorization },
              body: formData
          }).then(authGuard);

          const body = await resp.json();
          if (resp.ok) {
              const imageUrl = body.data;
              els.productImageUrl.value = imageUrl;
              els.productImagePreview.src = imageUrl;
              els.productImagePreview.classList.remove('d-none');
              els.productImagePlaceholder.classList.add('d-none');
              els.btnRemoveImage.classList.remove('d-none');
          } else {
              throw new Error(body.message || 'Image upload failed');
          }
      } catch (e) {
          showAlert(e.message, 'danger');
          els.productImageFile.value = '';
      }
  });

  // Remove Image Handler
  els.btnRemoveImage?.addEventListener('click', () => {
      els.productImageUrl.value = '';
      els.productImageFile.value = '';
      els.productImagePreview.src = '';
      els.productImagePreview.classList.add('d-none');
      els.productImagePlaceholder.classList.remove('d-none');
      els.btnRemoveImage.classList.add('d-none');
  });

  function bindColToggle(input, key) { input?.addEventListener('change', () => { state.columns[key] = input.checked; if (!input.checked && state.sortBy === key) { state.sortBy = null; updateSortHeaders(); } saveColumns(); applyColumnVisibility(); fetchList(); }); }
  bindColToggle(els.colSku, 'sku');
  bindColToggle(els.colName, 'name');
  bindColToggle(els.colCategory, 'category');
  bindColToggle(els.colBrand, 'brand');
  bindColToggle(els.colSupplier, 'supplier');
  bindColToggle(els.colSellingPrice, 'sellingPrice');
  bindColToggle(els.colStock, 'stock');
  bindColToggle(els.colStatus, 'status');
  els.btnResetColumns?.addEventListener('click', () => { state.columns = { sku: true, name: true, category: true, brand: true, supplier: true, sellingPrice: true, stock: true, status: true }; saveColumns(); loadColumns(); });

  els.btnDownloadCsv?.addEventListener('click', () => {
    try {
      const headers = [];
      const rows = [];

      document.querySelectorAll('#tbl thead th[data-col]').forEach(th => {
        const key = th.getAttribute('data-col');
        if (!th.classList.contains('col-hidden')) headers.push(th.textContent.trim());
      });
      rows.push(headers.join(','));

      document.querySelectorAll('#tbl tbody tr[data-id]').forEach(tr => {
        if (tr.classList.contains('expanded-row')) return;

        const cols = [];
        tr.querySelectorAll('td[data-col]').forEach(td => {
          const colName = td.getAttribute('data-col');
          const th = document.querySelector(`#tbl thead th[data-col="${colName}"]`);
          if (th && !th.classList.contains('col-hidden')) {
            cols.push(`"${(td.innerText || '').replace(/"/g, '""')}"`);
          }
        });
        if (cols.length > 0) rows.push(cols.join(','));
      });

      if (rows.length <= 1) {
        showAlert('No product data to export', 'warning');
        return;
      }

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showAlert('Download started', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to export CSV', 'danger');
    }
  });

  // Init
  console.log('Initializing products page');

  // Debug: Check if critical elements exist
  console.log('Table body element:', els.tblBody);
  console.log('Table head element:', els.tblHead);
  console.log('Category filter:', els.categoryId);
  console.log('Brand filter:', els.brandId);
  console.log('Supplier filter:', els.supplierId);

  loadFromUrl();
  updateSortHeaders();
  loadColumns();

  initializeLookupData().then(() => {
    console.log('Lookup data loaded, fetching products');
    fetchList().catch(e => {
      console.error('Initial fetch failed:', e);
      showAlert(e.message, 'danger');
    });
  }).catch(e => {
    console.error('Failed to initialize lookup data:', e);
    showAlert('Failed to load lookup data', 'danger');
  });
})();
