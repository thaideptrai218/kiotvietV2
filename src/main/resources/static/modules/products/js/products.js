/**
 * Product Management JavaScript Module
 * Handles all product management interactions including CRUD operations,
 * search, filtering, pagination, and category picker functionality.
 */

class ProductManager {
    constructor() {
        // API configuration
        this.api = {
            base: '/api/products',
            headers() {
                const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
                const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
                if (token) h['Authorization'] = `Bearer ${token}`;
                return h;
            }
        };

        this.currentPage = 0;
        this.pageSize = 20;
        this.currentSort = { field: 'name', direction: 'asc' };
        this.currentFilters = {};
        this.selectedProducts = new Set();
        this.expandedRows = new Set();
        this.categories = [];
        this.suppliers = [];
        this.searchTimeout = null;

        this.init();
    }

    /**
     * API call helper method using kiotVietAuth
     */
    async apiCall(url, options = {}) {
        try {
            const response = await kiotVietAuth.authenticatedFetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    /**
     * Initialize the product manager
     */
    init() {
        this.bindEvents();
        this.loadInitialData();
        this.loadProducts();
        this.updateUIFromURL();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search functionality
        const mainSearch = document.getElementById('mainSearch');
        if (mainSearch) {
            mainSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter events
        document.getElementById('btnApplyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('btnClearFilters')?.addEventListener('click', () => this.clearFilters());

        // Header actions
        document.getElementById('btnRefresh')?.addEventListener('click', () => this.loadProducts());
        document.getElementById('btnAddProduct')?.addEventListener('click', () => this.openProductModal());
        document.getElementById('btnEmptyAddProduct')?.addEventListener('click', () => this.openProductModal());

        // Bulk operations
        document.getElementById('btnClearSelection')?.addEventListener('click', () => this.clearSelection());
        document.getElementById('btnBulkDelete')?.addEventListener('click', () => this.bulkDelete());

        // Product form
        document.getElementById('btnSaveProduct')?.addEventListener('click', () => this.saveProduct());

        // Column visibility
        document.querySelectorAll('#columnSettingsDropdown input[data-column]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleColumn(e.target.dataset.column, e.target.checked));
        });
        document.getElementById('resetColumns')?.addEventListener('click', () => this.resetColumns());

        // Sortable headers
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });

        // Select all checkbox
        document.getElementById('selectAll')?.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));

        // Category picker
        document.getElementById('btnCategoryPicker')?.addEventListener('click', () => this.openCategoryPicker('filter'));
        document.getElementById('btnProductCategoryPicker')?.addEventListener('click', () => this.openCategoryPicker('product'));
        document.getElementById('btnApplyCategorySelection')?.addEventListener('click', () => this.applyCategorySelection());

        // Category search
        document.getElementById('categorySearchInput')?.addEventListener('input', (e) => this.searchCategories(e.target.value));

        // Category tree controls
        document.getElementById('btnExpandAll')?.addEventListener('click', () => this.expandAllCategories());
        document.getElementById('btnCollapseAll')?.addEventListener('click', () => this.collapseAllCategories());

        // URL changes (for back/forward navigation)
        window.addEventListener('popstate', () => this.updateUIFromURL());
    }

    /**
     * Load initial data (categories and suppliers)
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadSuppliers()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load initial data');
        }
    }

    /**
     * Load categories for dropdowns and picker
     */
    async loadCategories() {
        try {
            const response = await this.apiCall('/api/categories?tree=true');
            if (response.success) {
                this.categories = response.data;
                this.populateSupplierDropdown();
                this.renderCategoryTree();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    /**
     * Load suppliers for dropdowns
     */
    async loadSuppliers() {
        try {
            const response = await this.apiCall('/api/suppliers');
            if (response.success) {
                this.suppliers = response.data.content;
                this.populateSupplierDropdown();
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    /**
     * Populate supplier dropdowns
     */
    populateSupplierDropdown() {
        const filterSupplier = document.getElementById('filterSupplier');
        const productSupplier = document.getElementById('productSupplier');

        const options = '<option value="">All Suppliers</option>' +
            this.suppliers.map(supplier =>
                `<option value="${supplier.id}">${supplier.name}</option>`
            ).join('');

        if (filterSupplier) filterSupplier.innerHTML = options;
        if (productSupplier) {
            productSupplier.innerHTML = '<option value="">Select Supplier</option>' +
                this.suppliers.map(supplier =>
                    `<option value="${supplier.id}">${supplier.name}</option>`
                ).join('');
        }
    }

    /**
     * Load products with current filters and pagination
     */
    async loadProducts() {
        this.showLoading(true);

        try {
            const params = this.buildAPIParams();
            const response = await this.apiCall(`${this.api.base}?${params}`);

            if (response.success) {
                this.renderProducts(response.data.content);
                this.renderPagination(response.data);
                this.updatePaginationInfo(response.data);
                this.hideEmptyState();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products');
            this.showEmptyState();
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Build API parameters from current state
     */
    buildAPIParams() {
        const params = new URLSearchParams({
            page: this.currentPage,
            size: this.pageSize,
            sortBy: this.currentSort.field,
            sortDir: this.currentSort.direction.toUpperCase()
        });

        // Add search query
        const mainSearch = document.getElementById('mainSearch');
        if (mainSearch?.value.trim()) {
            params.append('query', mainSearch.value.trim());
        }

        // Add filters
        if (this.currentFilters.status) {
            params.append('status', this.currentFilters.status);
        }
        if (this.currentFilters.categoryIds && this.currentFilters.categoryIds.length > 0) {
            this.currentFilters.categoryIds.forEach(id => params.append('categoryIds', id));
        }
        if (this.currentFilters.supplierId) {
            params.append('supplierId', this.currentFilters.supplierId);
        }
        if (this.currentFilters.minPrice) {
            params.append('minPrice', this.currentFilters.minPrice);
        }
        if (this.currentFilters.maxPrice) {
            params.append('maxPrice', this.currentFilters.maxPrice);
        }
        if (this.currentFilters.minStock) {
            params.append('minStock', this.currentFilters.minStock);
        }
        if (this.currentFilters.maxStock) {
            params.append('maxStock', this.currentFilters.maxStock);
        }

        return params.toString();
    }

    /**
     * Render products in the table
     */
    renderProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => this.renderProductRow(product)).join('');

        // Re-bind row events
        this.bindRowEvents();
    }

    /**
     * Render a single product row
     */
    renderProductRow(product) {
        const isSelected = this.selectedProducts.has(product.id);
        const isExpanded = this.expandedRows.has(product.id);

        return `
            <tr class="product-row ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}" data-product-id="${product.id}">
                <td class="column-select">
                    <div class="form-check">
                        <input class="form-check-input product-checkbox" type="checkbox"
                               value="${product.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                </td>
                <td class="column-barcode text-truncate-custom" title="${product.barcode || ''}">${product.barcode || '-'}</td>
                <td class="column-sku text-truncate-custom" title="${product.sku || ''}">${product.sku || '-'}</td>
                <td class="column-name text-truncate-custom" title="${product.name}">${product.name}</td>
                <td class="column-category text-truncate-custom" title="${product.categoryName || ''}">${product.categoryName || '-'}</td>
                <td class="column-supplier text-truncate-custom" title="${product.supplierName || ''}">${product.supplierName || '-'}</td>
                <td class="column-price text-end">${product.formattedPrice || '0.00'}</td>
                <td class="column-stock text-end">
                    <div class="stock-indicator ${this.getStockClass(product)}">
                        ${product.stock}
                        ${product.lowStock ? '<i class="fas fa-exclamation-triangle text-warning ms-1"></i>' : ''}
                        ${product.outOfStock ? '<i class="fas fa-times-circle text-danger ms-1"></i>' : ''}
                    </div>
                </td>
                <td class="column-status">
                    <span class="status-badge status-${product.status.toLowerCase()}">${product.status}</span>
                </td>
                <td class="column-createdAt d-none">${this.formatDate(product.createdAt)}</td>
                <td class="column-updatedAt d-none">${this.formatDate(product.updatedAt)}</td>
                <td class="column-unit d-none">${product.unit || '-'}</td>
                <td class="column-brand d-none">${product.brand || '-'}</td>
            </tr>
            ${isExpanded ? this.renderProductDetails(product) : ''}
        `;
    }

    /**
     * Render expanded product details
     */
    renderProductDetails(product) {
        return `
            <tr class="product-details" data-product-id="${product.id}">
                <td colspan="13">
                    <div class="product-details-content">
                        <div class="product-details-grid">
                            <div class="product-detail-item">
                                <div class="product-detail-label">Barcode</div>
                                <div class="product-detail-value">${product.barcode || 'Not set'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">SKU</div>
                                <div class="product-detail-value">${product.sku || 'Not set'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Description</div>
                                <div class="product-detail-value">${product.description || 'No description'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Category</div>
                                <div class="product-detail-value">${product.categoryName || 'Not categorized'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Supplier</div>
                                <div class="product-detail-value">${product.supplierName || 'No supplier'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Unit</div>
                                <div class="product-detail-value">${product.unit || 'Not set'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Brand</div>
                                <div class="product-detail-value">${product.brand || 'Not set'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Tags</div>
                                <div class="product-detail-value">${product.tags || 'No tags'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Price</div>
                                <div class="product-detail-value">${product.formattedPrice || '0.00'}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Stock</div>
                                <div class="product-detail-value">${product.stock}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Created</div>
                                <div class="product-detail-value">${this.formatDate(product.createdAt)}</div>
                            </div>
                            <div class="product-detail-item">
                                <div class="product-detail-label">Updated</div>
                                <div class="product-detail-value">${this.formatDate(product.updatedAt)}</div>
                            </div>
                        </div>
                        <div class="product-details-actions">
                            <div>
                                <button class="btn btn-sm btn-outline-primary" onclick="productManager.editProduct(${product.id})">
                                    <i class="fas fa-edit me-2"></i>Update
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="productManager.toggleProductStatus(${product.id}, '${product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}')">
                                    <i class="fas fa-power-off me-2"></i>${product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-danger" onclick="productManager.deleteProduct(${product.id})">
                                    <i class="fas fa-trash me-2"></i>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Bind events to product rows
     */
    bindRowEvents() {
        // Row expansion
        document.querySelectorAll('.product-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't expand if clicking on checkbox
                if (e.target.type !== 'checkbox') {
                    this.toggleRowExpansion(row.dataset.productId);
                }
            });
        });

        // Product selection
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleProductSelection(e.target.value, e.target.checked);
            });
        });
    }

    /**
     * Toggle row expansion
     */
    toggleRowExpansion(productId) {
        if (this.expandedRows.has(productId)) {
            this.expandedRows.delete(productId);
        } else {
            // Collapse other rows if single-expand mode
            this.expandedRows.clear();
            this.expandedRows.add(productId);
        }

        this.loadProducts(); // Re-render to show/hide expanded rows
    }

    /**
     * Handle product selection
     */
    handleProductSelection(productId, isSelected) {
        if (isSelected) {
            this.selectedProducts.add(productId);
        } else {
            this.selectedProducts.delete(productId);
        }

        this.updateBulkUI();
        this.updateSelectAllCheckbox();
    }

    /**
     * Handle select all checkbox
     */
    handleSelectAll(isSelected) {
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            const productId = checkbox.value;
            if (isSelected) {
                this.selectedProducts.add(productId);
                checkbox.checked = true;
            } else {
                this.selectedProducts.delete(productId);
                checkbox.checked = false;
            }
        });

        this.updateBulkUI();
    }

    /**
     * Update bulk selection UI
     */
    updateBulkUI() {
        const headerNormal = document.getElementById('headerNormal');
        const headerBulk = document.getElementById('headerBulk');
        const bulkCount = document.getElementById('bulkCount');

        if (this.selectedProducts.size > 0) {
            headerNormal?.classList.add('d-none');
            headerBulk?.classList.remove('d-none');
            if (bulkCount) bulkCount.textContent = this.selectedProducts.size;
        } else {
            headerNormal?.classList.remove('d-none');
            headerBulk?.classList.add('d-none');
        }
    }

    /**
     * Update select all checkbox state
     */
    updateSelectAllCheckbox() {
        const selectAll = document.getElementById('selectAll');
        const totalCheckboxes = document.querySelectorAll('.product-checkbox').length;

        if (selectAll) {
            selectAll.checked = totalCheckboxes > 0 && this.selectedProducts.size === totalCheckboxes;
            selectAll.indeterminate = this.selectedProducts.size > 0 && this.selectedProducts.size < totalCheckboxes;
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedProducts.clear();
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateBulkUI();
    }

    /**
     * Handle search with debouncing
     */
    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentFilters.query = query.trim();
            this.currentPage = 0;
            this.loadProducts();
            this.updateURL();
        }, 300);
    }

    /**
     * Handle sorting
     */
    handleSort(field) {
        if (this.currentSort.field === field) {
            // Toggle direction
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }

        this.currentPage = 0;
        this.loadProducts();
        this.updateURL();
        this.updateSortHeaders();
    }

    /**
     * Update sort header visual indicators
     */
    updateSortHeaders() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            const icon = header.querySelector('.sort-icon');
            if (icon) {
                icon.className = 'fas fa-sort sort-icon';
            }
        });

        const currentHeader = document.querySelector(`.sortable[data-sort="${this.currentSort.field}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sort-${this.currentSort.direction}`);
            const icon = currentHeader.querySelector('.sort-icon');
            if (icon) {
                icon.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} sort-icon`;
            }
        }
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.currentFilters = {
            status: document.getElementById('filterStatus')?.value || '',
            categoryIds: this.getSelectedCategoryIds(),
            supplierId: document.getElementById('filterSupplier')?.value || '',
            minPrice: document.getElementById('filterPriceFrom')?.value || '',
            maxPrice: document.getElementById('filterPriceTo')?.value || '',
            minStock: document.getElementById('filterStockFrom')?.value || '',
            maxStock: document.getElementById('filterStockTo')?.value || '',
            keyword: document.getElementById('filterKeyword')?.value?.trim() || ''
        };

        this.currentPage = 0;
        this.loadProducts();
        this.updateURL();
        this.renderActiveFilters();
    }

    /**
     * Clear filters
     */
    clearFilters() {
        // Reset filter form
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterCategoryDisplay').value = '';
        document.getElementById('filterSupplier').value = '';
        document.getElementById('filterPriceFrom').value = '';
        document.getElementById('filterPriceTo').value = '';
        document.getElementById('filterStockFrom').value = '';
        document.getElementById('filterStockTo').value = '';
        document.getElementById('filterKeyword').value = '';

        // Clear selected categories
        this.selectedCategoryIds = [];
        document.getElementById('selectedCategories').innerHTML = '';

        this.currentFilters = {};
        this.currentPage = 0;
        this.loadProducts();
        this.updateURL();
        this.renderActiveFilters();
    }

    /**
     * Render active filter chips
     */
    renderActiveFilters() {
        const container = document.getElementById('activeFilters');
        if (!container) return;

        const chips = [];

        if (this.currentFilters.status) {
            chips.push(`<span class="filter-chip">Status: ${this.currentFilters.status}<button class="btn-close btn-close-sm ms-2" onclick="productManager.removeFilter('status')"></button></span>`);
        }

        if (this.currentFilters.keyword) {
            chips.push(`<span class="filter-chip">Keyword: ${this.currentFilters.keyword}<button class="btn-close btn-close-sm ms-2" onclick="productManager.removeFilter('keyword')"></button></span>`);
        }

        // Add category chips
        const selectedCategories = this.getSelectedCategories();
        selectedCategories.forEach(category => {
            chips.push(`<span class="filter-chip">Category: ${category.name}<button class="btn-close btn-close-sm ms-2" onclick="productManager.removeCategoryFilter(${category.id})"></button></span>`);
        });

        container.innerHTML = chips.join('');
    }

    /**
     * Remove a specific filter
     */
    removeFilter(filterType) {
        switch (filterType) {
            case 'status':
                document.getElementById('filterStatus').value = '';
                break;
            case 'keyword':
                document.getElementById('filterKeyword').value = '';
                break;
        }
        this.applyFilters();
    }

    /**
     * Remove category filter
     */
    removeCategoryFilter(categoryId) {
        const index = this.selectedCategoryIds.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategoryIds.splice(index, 1);
            this.updateCategoryDisplay();
            this.applyFilters();
        }
    }

    /**
     * Open product modal
     */
    async openProductModal(productId = null) {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const title = document.getElementById('productModalLabel');

        if (productId) {
            title.textContent = 'Edit Product';
            await this.loadProductForEdit(productId);
        } else {
            title.textContent = 'New Product';
            this.resetProductForm();
        }

        modal.show();
    }

    /**
     * Reset product form
     */
    resetProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productCategoryDisplay').value = '';
        document.getElementById('productCategoryId').value = '';
    }

    /**
     * Save product
     */
    async saveProduct() {
        const productId = document.getElementById('productId').value;
        const isEdit = !!productId;

        const productData = {
            name: document.getElementById('productName').value,
            barcode: document.getElementById('productBarcode').value,
            sku: document.getElementById('productSku').value,
            description: document.getElementById('productDescription').value,
            categoryId: document.getElementById('productCategoryId').value || null,
            supplierId: document.getElementById('productSupplier').value || null,
            price: parseFloat(document.getElementById('productPrice').value) || null,
            costPrice: parseFloat(document.getElementById('productCostPrice').value) || null,
            taxable: document.getElementById('productTaxable').checked,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            minStock: parseInt(document.getElementById('productMinStock').value) || 0,
            unit: document.getElementById('productUnit').value,
            brand: document.getElementById('productBrand').value,
            tags: document.getElementById('productTags').value,
            status: document.getElementById('productStatus').value
        };

        try {
            const url = isEdit ? `/api/products/${productId}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await this.apiCall(url, {
                method,
                body: JSON.stringify(productData)
            });

            if (response.success) {
                this.showSuccess(isEdit ? 'Product updated successfully' : 'Product created successfully');
                bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
                this.loadProducts();
            } else {
                this.showError(response.message || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showError('Failed to save product');
        }
    }

    /**
     * Get stock class for styling
     */
    getStockClass(product) {
        if (product.outOfStock) return 'stock-out';
        if (product.lowStock) return 'stock-low';
        return 'stock-normal';
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const tableContainer = document.querySelector('.table-responsive');

        if (show) {
            loadingState?.classList.remove('d-none');
            tableContainer?.classList.add('d-none');
        } else {
            loadingState?.classList.add('d-none');
            tableContainer?.classList.remove('d-none');
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        document.getElementById('emptyState')?.classList.remove('d-none');
        document.querySelector('.table-responsive')?.classList.add('d-none');
    }

    /**
     * Hide empty state
     */
    hideEmptyState() {
        document.getElementById('emptyState')?.classList.add('d-none');
        document.querySelector('.table-responsive')?.classList.remove('d-none');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'danger');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.remove();
            }
        }, 5000);

        // Initialize Bootstrap toast
        const toastElement = document.getElementById(toastId);
        if (toastElement && typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }
    }

    /**
     * Update URL to reflect current state
     */
    updateURL() {
        const params = new URLSearchParams();

        if (this.currentFilters.query) params.append('q', this.currentFilters.query);
        if (this.currentSort.field !== 'name') params.append('sortBy', this.currentSort.field);
        if (this.currentSort.direction !== 'asc') params.append('sortDir', this.currentSort.direction);
        if (this.currentPage > 0) params.append('page', this.currentPage.toString());

        // Add filter parameters
        Object.entries(this.currentFilters).forEach(([key, value]) => {
            if (value && key !== 'query') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v.toString()));
                } else {
                    params.append(key, value.toString());
                }
            }
        });

        const url = params.toString() ? `?${params.toString()}` : '/products';
        window.history.pushState({}, '', url);
    }

    /**
     * Update UI from URL parameters
     */
    updateUIFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Load filters from URL
        this.currentFilters.query = params.get('q') || '';
        this.currentFilters.status = params.get('status') || '';
        this.currentFilters.supplierId = params.get('supplierId') || '';
        this.currentFilters.minPrice = params.get('minPrice') || '';
        this.currentFilters.maxPrice = params.get('maxPrice') || '';
        this.currentFilters.minStock = params.get('minStock') || '';
        this.currentFilters.maxStock = params.get('maxStock') || '';

        // Load sort from URL
        this.currentSort.field = params.get('sortBy') || 'name';
        this.currentSort.direction = params.get('sortDir') || 'asc';

        // Load pagination from URL
        this.currentPage = parseInt(params.get('page') || '0');

        // Update UI elements
        const mainSearch = document.getElementById('mainSearch');
        if (mainSearch) mainSearch.value = this.currentFilters.query;

        this.updateSortHeaders();
        this.loadProducts();
    }

    // Category picker methods would go here
    // (This is getting quite long, so I'll continue with the essential methods)
}

// Initialize the product manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.productManager = new ProductManager();
        console.log('Product Manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Product Manager:', error);
    }
});