/**
 * Dashboard Core JavaScript
 * Core functionality for dashboard initialization and user management
 */

class DashboardCore {
    constructor() {
        this.apiBaseUrl = '/api/auth';
        this.userInfo = null;
        this.isInitialized = false;
    }

    /**
     * Initialize dashboard core functionality
     */
    async init() {
        if (this.isInitialized) return;

        console.log('Dashboard Core: Initializing...');

        try {
            await this.loadUserInfo();
            this.updateUI();
            this.bindEvents();
            this.isInitialized = true;

            console.log('Dashboard Core: Initialized successfully');
        } catch (error) {
            console.error('Dashboard Core: Initialization failed', error);
        }
    }

    /**
     * Load user information from authentication manager
     */
    async loadUserInfo() {
        try {
            // Check if shared auth manager is available
            if (typeof kiotVietAuth !== 'undefined') {
                const isAuthenticated = await kiotVietAuth.isAuthenticated();
                if (isAuthenticated) {
                    this.userInfo = kiotVietAuth.getUserInfo();
                } else {
                    console.warn('Dashboard Core: User not authenticated');
                }
            } else {
                console.warn('Dashboard Core: kiotVietAuth not available');
            }
        } catch (error) {
            console.error('Dashboard Core: Failed to load user info', error);
        }
    }

    /**
     * Update UI with user information
     */
    updateUI() {
        if (!this.userInfo) return;

        // Update user name elements
        const userNameElements = ['userName', 'dropdownUserName', 'headerUserName'];
        userNameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.userInfo.username || this.userInfo.email || 'User';
            }
        });

        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            const name = this.userInfo.username || this.userInfo.email || 'User';
            welcomeMessage.textContent = `Welcome back, ${name}! 👋`;
        }

        // Update user email elements
        ['dropdownUserEmail', 'headerUserEmail'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.userInfo.email || 'No email';
            }
        });

        // Update user role
        const roleText = this.userInfo.role || 'User';
        ['userRole', 'dropdownUserRole'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = id === 'dropdownUserRole' ? `Role: ${roleText}` : roleText;
            }
        });

        // Update user avatar
        this.updateUserAvatar();
    }

    /**
     * Update user avatar with user initial
     */
    updateUserAvatar() {
        const avatarElements = document.querySelectorAll('.user-avatar');

        avatarElements.forEach(avatar => {
            if (this.userInfo && this.userInfo.username && !avatar.querySelector('i')) {
                const initial = this.userInfo.username.charAt(0).toUpperCase();
                avatar.textContent = initial;
            }
        });
    }

    /**
     * Bind core events
     */
    bindEvents() {
        // Logout functionality
        this.bindLogout();

        // Page visibility change
        this.bindVisibilityChange();

        // Window resize events
        this.bindResizeEvents();
    }

    /**
     * Bind logout functionality
     */
    bindLogout() {
        const logoutButtons = document.querySelectorAll('[onclick*="logout"]');

        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    /**
     * Handle user logout
     */
    async logout() {
        try {
            console.log('Dashboard Core: Logging out...');

            if (typeof kiotVietAuth !== 'undefined') {
                await kiotVietAuth.logout();
            } else {
                // Fallback redirect
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Dashboard Core: Logout failed', error);
            // Fallback redirect
            window.location.href = '/login';
        }
    }

    /**
     * Bind page visibility change events
     */
    bindVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                this.refreshUserInfo();
            }
        });
    }

    /**
     * Bind window resize events
     */
    bindResizeEvents() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close dropdowns on resize to prevent layout issues
        this.closeAllDropdowns();

        // Adjust mobile layouts if needed
        this.adjustMobileLayout();
    }

    /**
     * Refresh user information
     */
    async refreshUserInfo() {
        try {
            await this.loadUserInfo();
            this.updateUI();
        } catch (error) {
            console.error('Dashboard Core: Failed to refresh user info', error);
        }
    }

    /**
     * Close all dropdown menus
     */
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-menu, .user-dropdown, .theme-switcher, .notification-dropdown');

        dropdowns.forEach(dropdown => {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        });
    }

    /**
     * Adjust mobile layout
     */
    adjustMobileLayout() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }

    /**
     * Get current user information
     */
    getUserInfo() {
        return this.userInfo;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.userInfo !== null;
    }

    /**
     * Show loading state
     */
    showLoading(element) {
        if (element) {
            element.disabled = true;
            element.setAttribute('data-original-text', element.textContent);
            element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(element) {
        if (element) {
            element.disabled = false;
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
            }
        }
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
        this.showToast(message, 'error');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `dashboard-toast dashboard-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast styles if not already present
        this.addToastStyles();

        // Show toast
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Add toast styles to document
     */
    addToastStyles() {
        if (document.getElementById('dashboard-toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-toast-styles';
        styles.textContent = `
            .dashboard-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                min-width: 300px;
            }

            .dashboard-toast.show {
                opacity: 1;
                transform: translateX(0);
            }

            .dashboard-toast-success {
                border-left: 4px solid var(--secondary-color);
            }

            .dashboard-toast-error {
                border-left: 4px solid #ef4444;
            }

            .dashboard-toast-info {
                border-left: 4px solid var(--primary-color);
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .toast-content i {
                font-size: 1.25rem;
            }

            .dashboard-toast-success .toast-content i {
                color: var(--secondary-color);
            }

            .dashboard-toast-error .toast-content i {
                color: #ef4444;
            }

            .dashboard-toast-info .toast-content i {
                color: var(--primary-color);
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize dashboard core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for kiotVietAuth to be available
    if (typeof kiotVietAuth !== 'undefined') {
        window.dashboardCore = new DashboardCore();
        window.dashboardCore.init();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof kiotVietAuth !== 'undefined') {
                window.dashboardCore = new DashboardCore();
                window.dashboardCore.init();
            } else {
                console.warn('Dashboard Core: kiotVietAuth not available, initializing without auth');
                window.dashboardCore = new DashboardCore();
                window.dashboardCore.init();
            }
        }, 100);
    }
});

// Export for global access
window.DashboardCore = DashboardCore;