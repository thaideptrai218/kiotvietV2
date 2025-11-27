/**
 * Dashboard Core JavaScript
 * Handles business overview stats and user initialization
 */

class DashboardCore {
    constructor() {
        this.api = {
            products: '/api/products',
            categories: '/api/categories',
            suppliers: '/api/suppliers',
            lowStock: '/api/products/low-stock',
            auth: '/api/auth'
        };
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserInfo();
            this.loadStats();
        });
    }

    async loadUserInfo() {
        // Check if there's a global auth object or fetch from API
        // For now, we update the welcome message if a user name is present
        const userNameEl = document.getElementById('welcomeUserName');
        // This part usually integrates with a shared Auth service
        // If a global user object exists:
        if (window.currentUser && window.currentUser.username) {
            userNameEl.textContent = window.currentUser.username;
        }
    }

    async loadStats() {
        try {
            // Parallel fetch for performance
            const [products, categories, suppliers, lowStock] = await Promise.all([
                this.fetchTotalProducts(),
                this.fetchTotalCategories(),
                this.fetchTotalSuppliers(),
                this.fetchLowStockCount()
            ]);

            this.animateValue('totalProducts', products);
            this.animateValue('totalCategories', categories);
            this.animateValue('totalSuppliers', suppliers);
            this.animateValue('lowStockCount', lowStock);

        } catch (error) {
            console.error('Dashboard Stats Error:', error);
            // Fallback to 0 or error state
        }
    }

    // API Calls
    async fetchTotalProducts() {
        // Fetch page 0 size 1 just to get totalElements from metadata
        const res = await fetch(`${this.api.products}?page=0&size=1`);
        const json = await res.json();
        return json.data ? json.data.totalElements : 0;
    }

    async fetchTotalCategories() {
        const res = await fetch(this.api.categories);
        const json = await res.json();
        // API returns a tree structure DTO with totalCategories field
        return json.data ? json.data.totalCategories : 0;
    }

    async fetchTotalSuppliers() {
        const res = await fetch(`${this.api.suppliers}?page=0&size=1`);
        const json = await res.json();
        // PagedResponse usually has totalElements
        return json.data ? json.data.totalElements : 0;
    }

    async fetchLowStockCount() {
        const res = await fetch(this.api.lowStock);
        const json = await res.json();
        // Returns a List<ProductDto>, so we take the length
        return json.data ? json.data.length : 0;
    }

    // Animation Utility
    animateValue(id, end) {
        const obj = document.getElementById(id);
        if (!obj) return;

        // Handle 0 or invalid
        if (!end || isNaN(end)) {
            obj.textContent = '0';
            return;
        }

        const start = 0;
        const duration = 1000;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}

// Initialize
new DashboardCore();
