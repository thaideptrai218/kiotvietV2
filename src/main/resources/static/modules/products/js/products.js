// Products Page JavaScript Module
class ProductsPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 15;
        this.sortField = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.searchQuery = '';
        this.viewMode = 'list';
        this.selectedProducts = new Set();

        this.init();
    }

    init() {
        // Initialize event listeners
        this.bindEvents();

        // Load initial data
        this.loadProducts();

        // Update pagination info
        this.updatePaginationInfo();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(() => {
                    this.searchProducts(e.target.value);
                }, 300)();
            });
        }

        // Page size change
        const pageSizeSelect = document.getElementById('page-size');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.changePageSize(e.target.value);
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Product checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-checkbox')) {
                this.handleProductSelection(e.target);
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.handleFilterChange(e.target.dataset.filter, e.target.value);
            }
        });
    }

    // Search functionality
    searchProducts(query) {
        this.searchQuery = query.trim();
        this.currentPage = 1;
        this.loadProducts();
    }

    // Pagination
    changePageSize(size) {
        this.pageSize = parseInt(size);
        this.currentPage = 1;
        this.loadProducts();
    }

    changePage(page) {
        if (page === 'prev') {
            this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (page === 'next') {
            this.currentPage = Math.min(this.getTotalPages(), this.currentPage + 1);
        } else {
            this.currentPage = page;
        }
        this.loadProducts();
    }

    getTotalPages() {
        // This would come from API response
        return 8; // Example: 120 items / 15 per page = 8 pages
    }

    updatePaginationInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, 120); // Total items from API
        const info = document.getElementById('paginationInfo');
        if (info) {
            info.textContent = `Showing ${start}-${end} of 120 items`;
        }

        // Update pagination buttons
        this.updatePaginationButtons();
    }

    updatePaginationButtons() {
        const totalPages = this.getTotalPages();
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        if (prevButton) {
            prevButton.disabled = this.currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = this.currentPage === totalPages;
        }

        // Update page number buttons
        const paginationList = document.querySelector('.paginationList');
        if (paginationList) {
            // Remove existing page buttons (except prev/next)
            const existingPageButtons = paginationList.querySelectorAll('.paginationButton:not([id="prevPage"]):not([id="nextPage"])');
            existingPageButtons.forEach(button => button.parentElement.remove());

            // Add current page and adjacent pages
            const startPage = Math.max(1, this.currentPage - 1);
            const endPage = Math.min(totalPages, this.currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `paginationButton ${i === this.currentPage ? 'paginationButtonActive' : ''}`;
                button.textContent = i;
                button.onclick = () => this.changePage(i);

                li.appendChild(button);
                paginationList.insertBefore(li, paginationList.querySelector('#nextPage').parentElement);
            }
        }
    }

    // Selection
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const productId = checkbox.closest('tr').dataset.productId;
            if (checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }
        });
    }

    handleProductSelection(checkbox) {
        const productId = checkbox.closest('tr').dataset.productId;
        if (checkbox.checked) {
            this.selectedProducts.add(productId);
        } else {
            this.selectedProducts.delete(productId);
        }

        // Update select all checkbox state
        const selectAllCheckbox = document.getElementById('selectAll');
        const totalCheckboxes = document.querySelectorAll('.product-checkbox');
        const checkedCount = document.querySelectorAll('.product-checkbox:checked');

        selectAllCheckbox.checked = totalCheckboxes.length === checkedCount;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCheckboxes.length;
    }

    // View mode
    setViewMode(mode) {
        this.viewMode = mode;

        // Update button states
        document.querySelectorAll('.viewButton').forEach(button => {
            button.classList.remove('active');
        });

        event.target.closest('button').classList.add('active');

        // Here you would switch between table and grid view
        console.log(`Switching to ${mode} view`);
    }

    // Sorting
    sortProducts(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        this.loadProducts();
    }

    // Filters
    toggleDateRange(value) {
        const customDateRange = document.getElementById('customDateRange');
        if (customDateRange) {
            if (value === 'custom') {
                customDateRange.classList.remove('hidden');
            } else {
                customDateRange.classList.add('hidden');
            }
        }
    }

    handleFilterChange(filterType, value) {
        this.filters[filterType] = value;
        this.currentPage = 1;
        this.loadProducts();
    }

    toggleForSale(button) {
        // Update button states
        const toggleGroup = button.parentElement;
        toggleGroup.querySelectorAll('.toggleButton').forEach(btn => {
            btn.classList.remove('toggleButtonActive');
            btn.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('toggleButtonActive');
        button.setAttribute('aria-pressed', 'true');

        // Apply filter
        this.filters.forSale = button.dataset.value;
        this.loadProducts();
    }

    resetFilters() {
        this.filters = {};
        this.searchQuery = '';
        this.currentPage = 1;

        // Reset form elements
        const form = document.getElementById('productFilterForm');
        if (form) {
            form.reset();
        }

        // Hide custom date range
        const customDateRange = document.getElementById('customDateRange');
        if (customDateRange) {
            customDateRange.classList.add('hidden');
        }

        // Reset toggle buttons
        document.querySelectorAll('.toggleButton').forEach(button => {
            button.classList.remove('toggleButtonActive');
            button.setAttribute('aria-pressed', 'false');
        });

        // Set default "All" button as active
        const allButton = document.querySelector('.toggleButton[data-value="all"]');
        if (allButton) {
            allButton.classList.add('toggleButtonActive');
            allButton.setAttribute('aria-pressed', 'true');
        }

        this.loadProducts();
    }

    // API calls (mock implementations)
    async loadProducts() {
        try {
            // Show loading state
            this.showLoading();

            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                size: this.pageSize,
                search: this.searchQuery,
                sort: this.sortField || '',
                direction: this.sortDirection,
                ...this.filters
            });

            // Mock API call - replace with actual endpoint
            console.log('Loading products with params:', params.toString());

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update table with new data
            this.updateProductsTable();
            this.updatePaginationInfo();

        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    updateProductsTable() {
        // In a real implementation, this would update the table with API data
        // For now, we're using the static data in the HTML
        console.log('Products table updated');
    }

    // UI helpers
    showLoading() {
        const tableBody = document.getElementById('productsTableBody');
        if (tableBody) {
            tableBody.style.opacity = '0.5';
        }
    }

    hideLoading() {
        const tableBody = document.getElementById('productsTableBody');
        if (tableBody) {
            tableBody.style.opacity = '1';
        }
    }

    showError(message) {
        // Simple error display - in production, use a proper notification system
        alert(message);
    }

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Action functions (called from HTML onclick attributes)
function importProducts() {
    console.log('Import products clicked');
    // Implement import functionality
}

function exportProducts() {
    console.log('Export products clicked');
    // Implement export functionality
}

function createProduct() {
    console.log('Create product clicked');
    // Navigate to product creation page or open modal
    window.location.href = '/products/new';
}

function openProductSettings() {
    console.log('Product settings clicked');
    // Open settings modal
}

function openProductHelp() {
    console.log('Product help clicked');
    // Open help documentation
}

function addCategory() {
    console.log('Add category clicked');
    // Open category creation modal
}

function filterCategories(query) {
    console.log('Filtering categories:', query);
    // Implement category filtering
}

function openTableSettings() {
    console.log('Table settings clicked');
    // Open table column configuration modal
}

// Initialize products page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the products page
    if (document.querySelector('.productsMainLayout')) {
        window.productsPage = new ProductsPage();
    }
});