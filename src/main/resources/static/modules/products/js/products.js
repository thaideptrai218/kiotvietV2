/**
 * PRODUCTS MODULE
 * Kiotviet-style product management frontend
 * Handles CRUD operations, filtering, pagination, and UI interactions
 */

class ProductsManager {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 20;
        this.totalPages = 0;
        this.totalElements = 0;
        this.currentSort = { field: 'name', direction: 'asc' };
        this.currentFilters = {};
        this.editingProductId = null;

        // Cache for dropdowns
        this.categories = [];
        this.brands = [];
        this.suppliers = [];

        // Column visibility
        this.visibleColumns = new Set(['sku', 'name', 'category', 'brand', 'supplier', 'sellingPrice', 'onHand', 'status']);

        this.init();
    }

    /**
     * Initialize the products manager
     */
    init() {
        this.bindEvents();
        this.loadInitialData();
        this.loadProducts();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search and filter events
        document.getElementById('btnApplyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('btnClearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('hdrSearch').addEventListener('input', (e) => this.handleQuickSearch(e));

        // Toolbar buttons
        document.getElementById('btnAdd').addEventListener('click', () => this.showCreateModal());
        document.getElementById('btnRefresh').addEventListener('click', () => this.loadProducts());
        document.getElementById('btnCreateFirst').addEventListener('click', () => this.showCreateModal());

        // Product form modal
        document.getElementById('btnSaveProduct').addEventListener('click', () => this.saveProduct());
        document.getElementById('btnConfirmDelete').addEventListener('click', () => this.confirmDelete());

        // Column visibility dropdown
        document.querySelectorAll('[data-column]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleColumn(e.target.dataset.column, e.target.checked));
        });

        // Table sorting
        document.querySelectorAll('.kv-table th.sortable').forEach(th => {
            th.addEventListener('click', () => this.handleSort(th.dataset.sort));
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.closest('.page-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                if (page) this.goToPage(parseInt(page));
            }
        });

        // Enter key for search
        document.getElementById('q').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFilters();
        });

        document.getElementById('hdrSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadProducts();
        });

        // Modal form validation
        const form = document.getElementById('productForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Price validation
        document.getElementById('productSellingPrice').addEventListener('input', () => this.validatePrices());
        document.getElementById('productCostPrice').addEventListener('input', () => this.validatePrices());
    }

    /**
     * Load initial data for dropdowns
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadBrands(),
                this.loadSuppliers()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load dropdown data');
        }
    }

    /**
     * Load categories for dropdowns
     */
    async loadCategories() {
        try {
            const response = await this.apiCall('/api/productcategories/active', 'GET');
            this.categories = response.data || [];
            this.populateCategoryDropdowns();
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    /**
     * Load brands for dropdowns
     */
    async loadBrands() {
        try {
            const response = await this.apiCall('/api/brands/active', 'GET');
            this.brands = response.data || [];
            this.populateBrandDropdowns();
        } catch (error) {
            console.error('Failed to load brands:', error);
        }
    }

    /**
     * Load suppliers for dropdowns
     */
    async loadSuppliers() {
        try {
            const response = await this.apiCall('/api/suppliers?active=true&size=100', 'GET');
            this.suppliers = response.data?.content || [];
            this.populateSupplierDropdowns();
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        }
    }

    /**
     * Populate category dropdowns
     */
    populateCategoryDropdowns() {
        const filterDropdown = document.getElementById('categoryId');
        const modalDropdown = document.getElementById('productCategory');

        [filterDropdown, modalDropdown].forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Category</option>';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = this.buildCategoryPath(category);
                dropdown.appendChild(option);
            });
        });
    }

    /**
     * Populate brand dropdowns
     */
    populateBrandDropdowns() {
        const filterDropdown = document.getElementById('brandId');
        const modalDropdown = document.getElementById('productBrand');

        [filterDropdown, modalDropdown].forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Brand</option>';
            this.brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.name;
                dropdown.appendChild(option);
            });
        });
    }

    /**
     * Populate supplier dropdowns
     */
    populateSupplierDropdowns() {
        const filterDropdown = document.getElementById('supplierId');
        const modalDropdown = document.getElementById('productSupplier');

        [filterDropdown, modalDropdown].forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Supplier</option>';
            this.suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.id;
                option.textContent = supplier.name;
                dropdown.appendChild(option);
            });
        });
    }

    /**
     * Build category path string
     */
    buildCategoryPath(category, path = '') {
        const currentPath = path ? `${category.name} > ${path}` : category.name;
        if (category.parent) {
            return this.buildCategoryPath(category.parent, currentPath);
        }
        return currentPath;
    }

    /**
     * Load products with current filters and pagination
     */
    async loadProducts() {
        try {
            this.showLoading();

            const params = new URLSearchParams({
                page: this.currentPage,
                size: this.pageSize,
                sortBy: this.currentSort.field,
                sortDir: this.currentSort.direction,
                ...this.currentFilters
            });

            // Remove empty parameters
            for (const [key, value] of [...params.entries()]) {
                if (!value || value === '') {
                    params.delete(key);
                }
            }

            const response = await this.apiCall(`/api/products?${params}`, 'GET');

            if (response.httpCode === 200 && response.data) {
                this.renderProducts(response.data.content);
                this.updatePagination(response.data);
                this.updateEmptyState(response.data.content.length === 0);
            } else {
                throw new Error(response.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError('Failed to load products: ' + error.message);
            this.updateEmptyState(true);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Apply current filters
     */
    applyFilters() {
        this.currentFilters = {
            search: document.getElementById('q').value.trim(),
            categoryId: document.getElementById('categoryId').value,
            brandId: document.getElementById('brandId').value,
            supplierId: document.getElementById('supplierId').value,
            status: document.getElementById('status').value,
            tracked: document.getElementById('tracked').value
        };

        // Remove empty filters
        Object.keys(this.currentFilters).forEach(key => {
            if (!this.currentFilters[key]) {
                delete this.currentFilters[key];
            }
        });

        this.currentPage = 0; // Reset to first page
        this.loadProducts();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('q').value = '';
        document.getElementById('categoryId').value = '';
        document.getElementById('brandId').value = '';
        document.getElementById('supplierId').value = '';
        document.getElementById('status').value = '';
        document.getElementById('tracked').value = '';

        this.currentFilters = {};
        this.currentPage = 0;
        this.loadProducts();
    }

    /**
     * Handle quick search from header
     */
    handleQuickSearch(e) {
        const query = e.target.value.trim();
        if (query.length >= 2 || query.length === 0) {
            this.currentFilters.search = query || undefined;
            this.currentPage = 0;

            // Debounce search
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadProducts();
            }, 300);
        }
    }

    /**
     * Handle column sorting
     */
    handleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }

        this.updateSortHeaders();
        this.loadProducts();
    }

    /**
     * Update sort header UI
     */
    updateSortHeaders() {
        document.querySelectorAll('.kv-table th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.sort === this.currentSort.field) {
                th.classList.add(`sorted-${this.currentSort.direction}`);
            }
        });
    }

    /**
     * Render products in table
     */
    renderProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const row = this.createProductRow(product);
            tbody.appendChild(row);
        });
    }

    /**
     * Create a table row for a product
     */
    createProductRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-column="sku">${this.escapeHtml(product.sku)}</td>
            <td data-column="name">
                <div class="fw-medium">${this.escapeHtml(product.name)}</div>
                ${product.description ? `<small class="text-muted">${this.escapeHtml(product.description.substring(0, 100))}${product.description.length > 100 ? '...' : ''}</small>` : ''}
            </td>
            <td data-column="category">${product.category ? this.escapeHtml(product.category.name) : '-'}</td>
            <td data-column="brand">${product.brand ? this.escapeHtml(product.brand.name) : '-'}</td>
            <td data-column="supplier">${product.supplier ? this.escapeHtml(product.supplier.name) : '-'}</td>
            <td data-column="sellingPrice" class="text-end">₫${this.formatNumber(product.sellingPrice)}</td>
            <td data-column="onHand" class="text-center">
                <span class="stock-status">
                    <span class="stock-indicator ${this.getStockStatusClass(product)}"></span>
                    ${product.onHand}
                </span>
            </td>
            <td data-column="status" class="text-center">
                <span class="status-badge status-${product.status.toLowerCase()}">${product.status}</span>
            </td>
            <td class="text-center kv-sticky-col">
                <div class="btn-group" role="group">
                    <button type="button" class="kv-btn kv-btn--icon kv-btn--edit" onclick="productsManager.editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="kv-btn kv-btn--icon kv-btn--delete" onclick="productsManager.deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    /**
     * Get stock status class for styling
     */
    getStockStatusClass(product) {
        if (!product.isTracked) return '';
        if (product.onHand <= 0) return 'stock-out';
        if (product.needsReorder) return 'stock-low';
        return 'stock-good';
    }

    /**
     * Update pagination UI
     */
    updatePagination(pageData) {
        this.currentPage = pageData.number;
        this.totalPages = pageData.totalPages;
        this.totalElements = pageData.totalElements;

        // Update pagination info
        const start = pageData.numberOfElements > 0 ? (this.currentPage * this.pageSize) + 1 : 0;
        const end = start + pageData.numberOfElements - 1;
        document.getElementById('paginationInfo').textContent =
            `Showing ${start}-${end} of ${this.totalElements} products`;

        // Render pagination buttons
        this.renderPagination();
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const paginationList = document.getElementById('paginationList');
        paginationList.innerHTML = '';

        if (this.totalPages <= 1) return;

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" data-page="${this.currentPage - 1}" tabindex="${this.currentPage === 0 ? '-1' : '0'}">
                <i class="fas fa-chevron-left"></i>
            </a>
        `;
        paginationList.appendChild(prevLi);

        // Page numbers
        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);

        if (startPage > 0) {
            this.addPageButton(paginationList, 0);
            if (startPage > 1) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                paginationList.appendChild(dotsLi);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            this.addPageButton(paginationList, i);
        }

        if (endPage < this.totalPages - 1) {
            if (endPage < this.totalPages - 2) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                paginationList.appendChild(dotsLi);
            }
            this.addPageButton(paginationList, this.totalPages - 1);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage >= this.totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" data-page="${this.currentPage + 1}" tabindex="${this.currentPage >= this.totalPages - 1 ? '-1' : '0'}">
                <i class="fas fa-chevron-right"></i>
            </a>
        `;
        paginationList.appendChild(nextLi);
    }

    /**
     * Add a page button to pagination
     */
    addPageButton(container, pageNumber) {
        const li = document.createElement('li');
        li.className = `page-item ${pageNumber === this.currentPage ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" data-page="${pageNumber}">${pageNumber + 1}</a>
        `;
        container.appendChild(li);
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadProducts();
        }
    }

    /**
     * Show create product modal
     */
    showCreateModal() {
        this.editingProductId = null;
        this.resetProductForm();
        document.getElementById('productModalLabel').textContent = 'Create Product';
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }

    /**
     * Edit a product
     */
    async editProduct(productId) {
        try {
            const response = await this.apiCall(`/api/products/${productId}`, 'GET');
            if (response.httpCode === 200 && response.data) {
                this.populateProductForm(response.data);
                this.editingProductId = productId;
                document.getElementById('productModalLabel').textContent = 'Edit Product';
                const modal = new bootstrap.Modal(document.getElementById('productModal'));
                modal.show();
            } else {
                throw new Error(response.message || 'Failed to load product');
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            this.showError('Failed to load product: ' + error.message);
        }
    }

    /**
     * Populate product form with data
     */
    populateProductForm(product) {
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategory').value = product.category?.id || '';
        document.getElementById('productBrand').value = product.brand?.id || '';
        document.getElementById('productSupplier').value = product.supplier?.id || '';
        document.getElementById('productSellingPrice').value = product.sellingPrice;
        document.getElementById('productCostPrice').value = product.costPrice;
        document.getElementById('productOnHand').value = product.onHand;
        document.getElementById('productMinLevel').value = product.minLevel;
        document.getElementById('productMaxLevel').value = product.maxLevel;
        document.getElementById('productIsTracked').checked = product.isTracked;
        document.getElementById('productStatus').value = product.status;
    }

    /**
     * Reset product form
     */
    resetProductForm() {
        const form = document.getElementById('productForm');
        form.reset();
        form.classList.remove('was-validated');

        // Set default values
        document.getElementById('productOnHand').value = 0;
        document.getElementById('productMinLevel').value = 0;
        document.getElementById('productMaxLevel').value = 0;
        document.getElementById('productIsTracked').checked = true;
        document.getElementById('productStatus').value = 'ACTIVE';

        // Clear validation
        document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }

    /**
     * Save product (create or update)
     */
    async saveProduct() {
        if (!this.validateProductForm()) {
            return;
        }

        try {
            const btn = document.getElementById('btnSaveProduct');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('.btn-text');

            // Show loading
            spinner.classList.remove('d-none');
            btnText.textContent = this.editingProductId ? 'Updating...' : 'Creating...';
            btn.disabled = true;

            const productData = this.getProductFormData();
            const url = this.editingProductId ?
                `/api/products/${this.editingProductId}` :
                '/api/products';
            const method = this.editingProductId ? 'PUT' : 'POST';

            const response = await this.apiCall(url, method, productData);

            if (response.httpCode === 200 && response.data) {
                this.showSuccess(this.editingProductId ? 'Product updated successfully' : 'Product created successfully');
                const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                modal.hide();
                this.loadProducts();
            } else {
                throw new Error(response.message || 'Failed to save product');
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            this.showError('Failed to save product: ' + error.message);
        } finally {
            // Hide loading
            const btn = document.getElementById('btnSaveProduct');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('.btn-text');
            spinner.classList.add('d-none');
            btnText.textContent = 'Save Product';
            btn.disabled = false;
        }
    }

    /**
     * Get product form data
     */
    getProductFormData() {
        return {
            sku: document.getElementById('productSku').value.trim(),
            barcode: document.getElementById('productBarcode').value.trim() || null,
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim() || null,
            categoryId: document.getElementById('productCategory').value ? parseInt(document.getElementById('productCategory').value) : null,
            brandId: document.getElementById('productBrand').value ? parseInt(document.getElementById('productBrand').value) : null,
            supplierId: document.getElementById('productSupplier').value ? parseInt(document.getElementById('productSupplier').value) : null,
            sellingPrice: parseFloat(document.getElementById('productSellingPrice').value),
            costPrice: parseFloat(document.getElementById('productCostPrice').value),
            onHand: parseInt(document.getElementById('productOnHand').value) || 0,
            minLevel: parseInt(document.getElementById('productMinLevel').value) || 0,
            maxLevel: parseInt(document.getElementById('productMaxLevel').value) || 0,
            isTracked: document.getElementById('productIsTracked').checked,
            status: document.getElementById('productStatus').value
        };
    }

    /**
     * Validate product form
     */
    validateProductForm() {
        const form = document.getElementById('productForm');
        let isValid = true;

        // Required fields
        const requiredFields = ['productSku', 'productName', 'productSellingPrice', 'productCostPrice'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();

            if (!value) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Price validation
        const sellingPrice = parseFloat(document.getElementById('productSellingPrice').value);
        const costPrice = parseFloat(document.getElementById('productCostPrice').value);

        if (sellingPrice <= 0 || costPrice <= 0) {
            document.getElementById('productSellingPrice').classList.add('is-invalid');
            document.getElementById('productCostPrice').classList.add('is-invalid');
            isValid = false;
        } else if (sellingPrice <= costPrice) {
            this.showError('Selling price must be greater than cost price');
            isValid = false;
        }

        // Stock level validation
        const minLevel = parseInt(document.getElementById('productMinLevel').value) || 0;
        const maxLevel = parseInt(document.getElementById('productMaxLevel').value) || 0;

        if (maxLevel > 0 && minLevel >= maxLevel) {
            document.getElementById('productMaxLevel').classList.add('is-invalid');
            this.showError('Maximum level must be greater than minimum level');
            isValid = false;
        }

        if (!isValid) {
            form.classList.add('was-validated');
        }

        return isValid;
    }

    /**
     * Validate prices in real-time
     */
    validatePrices() {
        const sellingPrice = parseFloat(document.getElementById('productSellingPrice').value) || 0;
        const costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;

        const sellingField = document.getElementById('productSellingPrice');
        const costField = document.getElementById('productCostPrice');

        if (sellingPrice > 0 && costPrice > 0 && sellingPrice <= costPrice) {
            sellingField.classList.add('is-invalid');
            costField.classList.add('is-invalid');
        } else {
            sellingField.classList.remove('is-invalid');
            costField.classList.remove('is-invalid');
        }
    }

    /**
     * Delete a product
     */
    deleteProduct(productId) {
        // Find product name for confirmation
        const row = document.querySelector(`button[onclick="productsManager.deleteProduct(${productId})"]`).closest('tr');
        const productName = row.querySelector('td[data-column="name"]').textContent.trim();

        document.getElementById('deleteProductName').textContent = productName;
        this.deleteProductId = productId;

        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    /**
     * Confirm product deletion
     */
    async confirmDelete() {
        if (!this.deleteProductId) return;

        try {
            const btn = document.getElementById('btnConfirmDelete');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('.btn-text');

            // Show loading
            spinner.classList.remove('d-none');
            btnText.textContent = 'Deleting...';
            btn.disabled = true;

            const response = await this.apiCall(`/api/products/${this.deleteProductId}`, 'DELETE');

            if (response.httpCode === 200) {
                this.showSuccess('Product deleted successfully');
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
                this.loadProducts();
            } else {
                throw new Error(response.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Failed to delete product:', error);
            this.showError('Failed to delete product: ' + error.message);
        } finally {
            // Hide loading
            const btn = document.getElementById('btnConfirmDelete');
            const spinner = btn.querySelector('.spinner-border');
            const btnText = btn.querySelector('.btn-text');
            spinner.classList.add('d-none');
            btnText.textContent = 'Delete';
            btn.disabled = false;
        }
    }

    /**
     * Toggle column visibility
     */
    toggleColumn(column, visible) {
        if (visible) {
            this.visibleColumns.add(column);
        } else {
            this.visibleColumns.delete(column);
        }

        // Update table
        document.querySelectorAll(`[data-column="${column}"]`).forEach(el => {
            el.style.display = visible ? '' : 'none';
        });
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState(isEmpty) {
        const emptyState = document.getElementById('emptyState');
        const table = document.getElementById('productsTable');

        if (isEmpty) {
            emptyState.style.display = 'block';
            table.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            table.style.display = 'table';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('productsTable').style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('productsTable').style.display = 'table';
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Implementation depends on your notification system
        console.log('Success:', message);
        // You could use a toast library or custom alert
        alert(message);
    }

    /**
     * Show error message
     */
    showError(message) {
        // Implementation depends on your notification system
        console.error('Error:', message);
        // You could use a toast library or custom alert
        alert('Error: ' + message);
    }

    /**
     * Make API call with authentication
     */
    async apiCall(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = {
            method: method,
            headers: headers
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, config);

        if (response.status === 401) {
            // Token expired, try to refresh
            if (await this.refreshToken()) {
                // Retry with new token
                headers['Authorization'] = `Bearer ${localStorage.getItem('jwtToken') || localStorage.getItem('accessToken')}`;
                return this.apiCall(endpoint, method, data);
            } else {
                // Refresh failed, redirect to login
                window.location.href = '/login?logout=true';
                return;
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Refresh JWT token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return false;
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.accessToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    /**
     * Format number with thousand separators
     */
    formatNumber(num) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the products manager when DOM is ready
let productsManager;

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated (try multiple possible token keys)
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    productsManager = new ProductsManager();
});

// Export for global access
window.productsManager = productsManager;