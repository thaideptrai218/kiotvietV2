/**
 * Additional Product Manager Methods
 * Contains pagination, column management, and category picker functionality
 */

// Extend the ProductManager class with additional methods
Object.assign(ProductManager.prototype, {

    /**
     * Render pagination controls
     */
    renderPagination(pagedData) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const { page, totalPages, first, last, hasNext, hasPrevious } = pagedData;

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${hasPrevious ? '' : 'disabled'}">
                <a class="page-link" href="#" data-page="${page - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(0, page - 2);
        const endPage = Math.min(totalPages - 1, page + 2);

        if (startPage > 0) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="0">1</a>
                </li>
            `;
            if (startPage > 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>
            `;
        }

        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${totalPages - 1}">${totalPages}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${hasNext ? '' : 'disabled'}">
                <a class="page-link" href="#" data-page="${page + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = html;

        // Bind pagination events
        pagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.closest('a').dataset.page);
                if (!isNaN(page) && page >= 0) {
                    this.currentPage = page;
                    this.loadProducts();
                    this.updateURL();
                }
            });
        });
    },

    /**
     * Update pagination info
     */
    updatePaginationInfo(pagedData) {
        const showingFrom = document.getElementById('showingFrom');
        const showingTo = document.getElementById('showingTo');
        const totalItems = document.getElementById('totalItems');

        const start = pagedData.page * pagedData.size + 1;
        const end = Math.min((pagedData.page + 1) * pagedData.size, pagedData.totalElements);

        if (showingFrom) showingFrom.textContent = start;
        if (showingTo) showingTo.textContent = end;
        if (totalItems) totalItems.textContent = pagedData.totalElements;
    },

    /**
     * Toggle column visibility
     */
    toggleColumn(column, visible) {
        const elements = document.querySelectorAll(`.column-${column}`);
        elements.forEach(el => {
            el.classList.toggle('d-none', !visible);
        });

        // Save preference to localStorage
        this.saveColumnPreferences();
    },

    /**
     * Reset columns to default visibility
     */
    resetColumns() {
        const defaultColumns = {
            barcode: true,
            sku: true,
            name: true,
            category: true,
            supplier: true,
            price: true,
            stock: true,
            status: true,
            createdAt: false,
            updatedAt: false,
            unit: false,
            brand: false
        };

        document.querySelectorAll('#columnSettingsDropdown input[data-column]').forEach(checkbox => {
            const column = checkbox.dataset.column;
            checkbox.checked = defaultColumns[column];
            this.toggleColumn(column, defaultColumns[column]);
        });
    },

    /**
     * Save column preferences to localStorage
     */
    saveColumnPreferences() {
        const preferences = {};
        document.querySelectorAll('#columnSettingsDropdown input[data-column]').forEach(checkbox => {
            preferences[checkbox.dataset.column] = checkbox.checked;
        });
        localStorage.setItem('productColumns', JSON.stringify(preferences));
    },

    /**
     * Load column preferences from localStorage
     */
    loadColumnPreferences() {
        const saved = localStorage.getItem('productColumns');
        if (saved) {
            try {
                const preferences = JSON.parse(saved);
                Object.entries(preferences).forEach(([column, visible]) => {
                    const checkbox = document.querySelector(`#columnSettingsDropdown input[data-column="${column}"]`);
                    if (checkbox) {
                        checkbox.checked = visible;
                        this.toggleColumn(column, visible);
                    }
                });
            } catch (error) {
                console.error('Error loading column preferences:', error);
            }
        }
    },

    /**
     * Category Picker Methods
     */
    selectedCategoryIds: [],
    categoryPickerType: null, // 'filter' or 'product'

    /**
     * Open category picker modal
     */
    openCategoryPicker(type) {
        this.categoryPickerType = type;
        const modal = new bootstrap.Modal(document.getElementById('categoryPickerModal'));
        const title = document.getElementById('categoryPickerModalLabel');

        title.textContent = type === 'filter' ? 'Select Categories' : 'Select Category';

        // Pre-select categories if editing
        if (type === 'product') {
            const currentCategoryId = document.getElementById('productCategoryId').value;
            if (currentCategoryId) {
                this.selectedCategoryIds = [parseInt(currentCategoryId)];
            }
        }

        this.renderCategoryTree();
        modal.show();
    },

    /**
     * Apply category selection
     */
    applyCategorySelection() {
        const selectedCategories = this.getSelectedCategories();

        if (this.categoryPickerType === 'filter') {
            this.selectedCategoryIds = selectedCategories.map(c => c.id);
            this.updateCategoryDisplay();
        } else if (this.categoryPickerType === 'product') {
            if (selectedCategories.length === 1) {
                document.getElementById('productCategoryId').value = selectedCategories[0].id;
                document.getElementById('productCategoryDisplay').value = selectedCategories[0].name;
            } else {
                this.showError('Please select only one category for a product');
                return;
            }
        }

        bootstrap.Modal.getInstance(document.getElementById('categoryPickerModal')).hide();
    },

    /**
     * Get selected categories
     */
    getSelectedCategories() {
        const selected = [];
        const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
        checkedBoxes.forEach(checkbox => {
            const categoryId = parseInt(checkbox.value);
            const category = this.findCategoryById(categoryId);
            if (category) {
                selected.push(category);
            }
        });
        return selected;
    },

    /**
     * Get selected category IDs
     */
    getSelectedCategoryIds() {
        return this.selectedCategoryIds;
    },

    /**
     * Update category display
     */
    updateCategoryDisplay() {
        const display = document.getElementById('filterCategoryDisplay');
        const container = document.getElementById('selectedCategories');

        const selectedCategories = this.getSelectedCategories();

        if (selectedCategories.length > 0) {
            if (display) {
                display.value = selectedCategories.map(c => c.name).join(', ');
            }
            if (container) {
                container.innerHTML = selectedCategories.map(category => `
                    <span class="category-chip">
                        ${category.name}
                        <button type="button" class="btn-close btn-close-sm" onclick="productManager.removeCategorySelection(${category.id})"></button>
                    </span>
                `).join('');
            }
        } else {
            if (display) display.value = '';
            if (container) container.innerHTML = '';
        }
    },

    /**
     * Remove category from selection
     */
    removeCategorySelection(categoryId) {
        const index = this.selectedCategoryIds.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategoryIds.splice(index, 1);
        }

        const checkbox = document.querySelector(`.category-checkbox[value="${categoryId}"]`);
        if (checkbox) checkbox.checked = false;

        this.updateCategoryDisplay();
    },

    /**
     * Find category by ID
     */
    findCategoryById(categoryId) {
        return this.findCategoryInTree(this.categories, categoryId);
    },

    /**
     * Find category in tree structure
     */
    findCategoryInTree(categories, categoryId) {
        for (const category of categories) {
            if (category.id === categoryId) {
                return category;
            }
            if (category.children && category.children.length > 0) {
                const found = this.findCategoryInTree(category.children, categoryId);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * Render category tree
     */
    renderCategoryTree() {
        const container = document.getElementById('categoryTree');
        if (!container) return;

        container.innerHTML = this.renderCategoryNodes(this.categories, 0);
        this.updateCategoryCheckboxes();
        this.bindCategoryEvents();
    },

    /**
     * Render category nodes recursively
     */
    renderCategoryNodes(categories, level) {
        return categories.map(category => `
            <div class="category-node ${this.selectedCategoryIds.includes(category.id) ? 'selected' : ''}" data-category-id="${category.id}">
                <div class="category-node-content">
                    ${category.children && category.children.length > 0 ? `
                        <button class="category-toggle" onclick="productManager.toggleCategory(${category.id})">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    ` : '<span style="width: 16px; display: inline-block;"></span>'}

                    <input type="checkbox" class="form-check-input category-checkbox me-2"
                           value="${category.id}"
                           ${this.selectedCategoryIds.includes(category.id) ? 'checked' : ''}>

                    <div class="category-label">
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${category.productCount || 0}</span>
                    </div>
                </div>
                ${category.children && category.children.length > 0 ? `
                    <div class="category-children" id="children-${category.id}">
                        ${this.renderCategoryNodes(category.children, level + 1)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    /**
     * Toggle category expansion
     */
    toggleCategory(categoryId) {
        const children = document.getElementById(`children-${categoryId}`);
        const toggle = document.querySelector(`.category-node[data-category-id="${categoryId}"] .category-toggle i`);

        if (children) {
            const isCollapsed = children.classList.contains('collapsed');
            if (isCollapsed) {
                children.classList.remove('collapsed');
                toggle.className = 'fas fa-chevron-down';
            } else {
                children.classList.add('collapsed');
                toggle.className = 'fas fa-chevron-right';
            }
        }
    },

    /**
     * Expand all categories
     */
    expandAllCategories() {
        document.querySelectorAll('.category-children').forEach(children => {
            children.classList.remove('collapsed');
        });
        document.querySelectorAll('.category-toggle i').forEach(icon => {
            icon.className = 'fas fa-chevron-down';
        });
    },

    /**
     * Collapse all categories
     */
    collapseAllCategories() {
        document.querySelectorAll('.category-children').forEach(children => {
            children.classList.add('collapsed');
        });
        document.querySelectorAll('.category-toggle i').forEach(icon => {
            icon.className = 'fas fa-chevron-right';
        });
    },

    /**
     * Search categories
     */
    searchCategories(query) {
        const lowerQuery = query.toLowerCase().trim();
        const allNodes = document.querySelectorAll('.category-node');

        if (!lowerQuery) {
            // Show all categories
            allNodes.forEach(node => {
                node.style.display = 'block';
            });
            return;
        }

        // Hide all categories first
        allNodes.forEach(node => {
            node.style.display = 'none';
        });

        // Show matching categories and their parents
        this.categories.forEach(category => {
            if (this.categoryMatches(category, lowerQuery)) {
                this.showCategoryAndParents(category.id);
            }
        });
    },

    /**
     * Check if category matches search query
     */
    categoryMatches(category, query) {
        if (category.name.toLowerCase().includes(query)) {
            return true;
        }
        if (category.children) {
            return category.children.some(child => this.categoryMatches(child, query));
        }
        return false;
    },

    /**
     * Show category and all its parents
     */
    showCategoryAndParents(categoryId) {
        const category = this.findCategoryById(categoryId);
        if (!category) return;

        // Show this category
        const node = document.querySelector(`.category-node[data-category-id="${categoryId}"]`);
        if (node) {
            node.style.display = 'block';
        }

        // Show and expand all parents
        if (category.parentId) {
            const parent = this.findCategoryById(category.parentId);
            if (parent) {
                this.showCategoryAndParents(parent.id);
                // Expand parent to show this category
                const parentChildren = document.getElementById(`children-${parent.id}`);
                const parentToggle = document.querySelector(`.category-node[data-category-id="${parent.id}"] .category-toggle i`);
                if (parentChildren) {
                    parentChildren.classList.remove('collapsed');
                    if (parentToggle) {
                        parentToggle.className = 'fas fa-chevron-down';
                    }
                }
            }
        }
    },

    /**
     * Update category checkboxes with tri-state logic
     */
    updateCategoryCheckboxes() {
        this.categories.forEach(category => {
            this.updateCategoryCheckboxState(category);
        });
    },

    /**
     * Update checkbox state for a category and its children
     */
    updateCategoryCheckboxState(category) {
        const checkbox = document.querySelector(`.category-checkbox[value="${category.id}"]`);
        if (!checkbox) return;

        const selectedChildren = this.getSelectedChildrenCount(category);
        const totalChildren = this.getTotalChildrenCount(category);

        if (this.selectedCategoryIds.includes(category.id)) {
            checkbox.checked = true;
            checkbox.indeterminate = false;
        } else if (selectedChildren > 0) {
            checkbox.checked = false;
            checkbox.indeterminate = true;
        } else {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        }

        // Recursively update children
        if (category.children) {
            category.children.forEach(child => {
                this.updateCategoryCheckboxState(child);
            });
        }
    },

    /**
     * Get selected children count
     */
    getSelectedChildrenCount(category) {
        let count = 0;
        if (category.children) {
            category.children.forEach(child => {
                if (this.selectedCategoryIds.includes(child.id)) {
                    count++;
                }
                count += this.getSelectedChildrenCount(child);
            });
        }
        return count;
    },

    /**
     * Get total children count
     */
    getTotalChildrenCount(category) {
        let count = 0;
        if (category.children) {
            count = category.children.length;
            category.children.forEach(child => {
                count += this.getTotalChildrenCount(child);
            });
        }
        return count;
    },

    /**
     * Bind category tree events
     */
    bindCategoryEvents() {
        // Category selection with tri-state logic
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const categoryId = parseInt(e.target.value);
                const isChecked = e.target.checked;

                if (this.categoryPickerType === 'filter') {
                    this.handleCategorySelection(categoryId, isChecked);
                } else {
                    // For product picker, only allow single selection
                    document.querySelectorAll('.category-checkbox').forEach(cb => {
                        if (cb !== e.target) cb.checked = false;
                    });
                    this.selectedCategoryIds = isChecked ? [categoryId] : [];
                }

                this.updateCategoryCheckboxes();
            });
        });

        // Category node click (expand/collapse)
        document.querySelectorAll('.category-node-content').forEach(content => {
            content.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox' && !e.target.closest('.category-actions')) {
                    const categoryId = parseInt(e.target.closest('.category-node').dataset.categoryId);
                    this.toggleCategory(categoryId);
                }
            });
        });
    },

    /**
     * Handle category selection with parent-child logic
     */
    handleCategorySelection(categoryId, isChecked) {
        const category = this.findCategoryById(categoryId);
        if (!category) return;

        if (isChecked) {
            // Add category to selection
            if (!this.selectedCategoryIds.includes(categoryId)) {
                this.selectedCategoryIds.push(categoryId);
            }

            // Select all children
            this.selectAllChildren(category, true);
        } else {
            // Remove category from selection
            const index = this.selectedCategoryIds.indexOf(categoryId);
            if (index > -1) {
                this.selectedCategoryIds.splice(index, 1);
            }

            // Deselect all children
            this.selectAllChildren(category, false);
        }
    },

    /**
     * Select/deselect all children of a category
     */
    selectAllChildren(category, select) {
        if (category.children) {
            category.children.forEach(child => {
                if (select) {
                    if (!this.selectedCategoryIds.includes(child.id)) {
                        this.selectedCategoryIds.push(child.id);
                    }
                } else {
                    const index = this.selectedCategoryIds.indexOf(child.id);
                    if (index > -1) {
                        this.selectedCategoryIds.splice(index, 1);
                    }
                }
                this.selectAllChildren(child, select);
            });
        }
    },

    /**
     * Product CRUD operations
     */
    async editProduct(productId) {
        await this.openProductModal(productId);
    },

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await kiotVietAuth.authenticatedFetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Product deleted successfully');
                this.loadProducts();
            } else {
                this.showError(data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showError('Failed to delete product: ' + error.message);
        }
    },

    async toggleProductStatus(productId, status) {
        try {
            const response = await kiotVietAuth.authenticatedFetch(`/api/products/${productId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`Status update failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showSuccess(`Product ${status.toLowerCase()} successfully`);
                this.loadProducts();
            } else {
                this.showError(data.message || 'Failed to update product status');
            }
        } catch (error) {
            console.error('Error updating product status:', error);
            this.showError('Failed to update product status: ' + error.message);
        }
    },

    async bulkDelete() {
        if (this.selectedProducts.size === 0) {
            this.showError('No products selected');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${this.selectedProducts.size} product(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await kiotVietAuth.authenticatedFetch('/api/products/bulk/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productIds: Array.from(this.selectedProducts)
                })
            });

            if (!response.ok) {
                throw new Error(`Bulk delete failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Products deleted successfully');
                this.clearSelection();
                this.loadProducts();
            } else {
                this.showError(data.message || 'Failed to delete products');
            }
        } catch (error) {
            console.error('Error bulk deleting products:', error);
            this.showError('Failed to delete products: ' + error.message);
        }
    },

    async loadProductForEdit(productId) {
        try {
            const response = await kiotVietAuth.authenticatedFetch(`/api/products/${productId}`);

            if (!response.ok) {
                throw new Error(`Failed to load product: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const product = data.data;
                this.populateProductForm(product);
            } else {
                this.showError(data.message || 'Failed to load product details');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError('Failed to load product details: ' + error.message);
        }
    },

    populateProductForm(product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productSku').value = product.sku || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategoryDisplay').value = product.category?.name || '';
        document.getElementById('productCategoryId').value = product.category?.id || '';
        document.getElementById('productSupplier').value = product.supplier?.id || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCostPrice').value = product.costPrice || '';
        document.getElementById('productTaxable').checked = product.taxable || false;
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productMinStock').value = product.minStock || 0;
        document.getElementById('productUnit').value = product.unit || '';
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productTags').value = product.tags || '';
        document.getElementById('productStatus').value = product.status || 'ACTIVE';
    }
});