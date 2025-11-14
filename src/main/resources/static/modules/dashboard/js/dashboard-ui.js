/**
 * Dashboard UI JavaScript
 * UI interactions, dropdowns, modals, and user interface components
 */

class DashboardUI {
    constructor() {
        this.activeDropdowns = new Set();
        this.activeModal = null;
        this.isInitialized = false;
    }

    /**
     * Initialize UI components
     */
    init() {
        if (this.isInitialized) return;

        console.log('Dashboard UI: Initializing components...');

        this.bindDropdownEvents();
        this.bindModalEvents();
        this.bindKeyboardEvents();
        this.bindClickOutsideEvents();
        this.initializeTooltips();
        this.bindFocusManagement();

        this.isInitialized = true;
        console.log('Dashboard UI: Components initialized');
    }

    /**
     * Bind dropdown events
     */
    bindDropdownEvents() {
        // Product dropdown - ensure it works
        const productNavItem = document.querySelector('.nav-item:nth-child(2)');
        if (productNavItem) {
            const dropdownMenu = productNavItem.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                console.log('Dashboard UI: Found product dropdown, binding events');

                // Enhanced hover events for reliability
                productNavItem.addEventListener('mouseenter', () => {
                    this.showDropdown(dropdownMenu);
                });

                productNavItem.addEventListener('mouseleave', (e) => {
                    // Check if mouse is moving to dropdown
                    if (!this.isMovingToDropdown(e, dropdownMenu)) {
                        this.hideDropdown(dropdownMenu);
                    }
                });

                dropdownMenu.addEventListener('mouseenter', () => {
                    this.showDropdown(dropdownMenu);
                });

                dropdownMenu.addEventListener('mouseleave', () => {
                    this.hideDropdown(dropdownMenu);
                });
            }
        }

        // User dropdown
        this.initializeUserDropdown();

        // Theme switcher dropdown
        this.initializeThemeSwitcher();

        // Notification dropdown
        this.initializeNotificationDropdown();
    }

    /**
     * Show dropdown with enhanced reliability
     */
    showDropdown(dropdown) {
        if (!dropdown) return;

        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
        dropdown.style.display = 'block';

        this.activeDropdowns.add(dropdown);

        // Add ARIA attributes
        dropdown.setAttribute('aria-hidden', 'false');
    }

    /**
     * Hide dropdown
     */
    hideDropdown(dropdown) {
        if (!dropdown) return;

        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            if (dropdown.style.opacity === '0') {
                dropdown.style.display = '';
            }
        }, 200);

        this.activeDropdowns.delete(dropdown);

        // Add ARIA attributes
        dropdown.setAttribute('aria-hidden', 'true');
    }

    /**
     * Check if mouse is moving to dropdown
     */
    isMovingToDropdown(event, dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;

        // Check if mouse is within dropdown bounds or moving towards it
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    /**
     * Initialize user dropdown
     */
    initializeUserDropdown() {
        const userButton = document.querySelector('.header-btn[onclick*="toggleUserDropdown"]');
        if (!userButton) return;

        const userDropdown = userButton.querySelector('.user-dropdown');
        if (!userDropdown) return;

        // Enhanced hover handling
        userButton.addEventListener('mouseenter', () => {
            this.showDropdown(userDropdown);
        });

        userButton.addEventListener('mouseleave', (e) => {
            if (!this.isMovingToDropdown(e, userDropdown)) {
                this.hideDropdown(userDropdown);
            }
        });

        userDropdown.addEventListener('mouseenter', () => {
            this.showDropdown(userDropdown);
        });

        userDropdown.addEventListener('mouseleave', () => {
            this.hideDropdown(userDropdown);
        });
    }

    /**
     * Initialize theme switcher
     */
    initializeThemeSwitcher() {
        const themeButton = document.querySelector('.header-btn[title="Switch Theme"]');
        if (!themeButton) return;

        const themeSwitcher = themeButton.querySelector('.theme-switcher');
        if (!themeSwitcher) return;

        themeButton.addEventListener('mouseenter', () => {
            this.showDropdown(themeSwitcher);
        });

        themeButton.addEventListener('mouseleave', (e) => {
            if (!this.isMovingToDropdown(e, themeSwitcher)) {
                this.hideDropdown(themeSwitcher);
            }
        });

        themeSwitcher.addEventListener('mouseenter', () => {
            this.showDropdown(themeSwitcher);
        });

        themeSwitcher.addEventListener('mouseleave', () => {
            this.hideDropdown(themeSwitcher);
        });
    }

    /**
     * Initialize notification dropdown
     */
    initializeNotificationDropdown() {
        const notificationButton = document.querySelector('.header-btn[title="Notifications"]');
        if (!notificationButton) return;

        const notificationDropdown = notificationButton.querySelector('.notification-dropdown');
        if (!notificationDropdown) return;

        notificationButton.addEventListener('mouseenter', () => {
            this.showDropdown(notificationDropdown);
        });

        notificationButton.addEventListener('mouseleave', (e) => {
            if (!this.isMovingToDropdown(e, notificationDropdown)) {
                this.hideDropdown(notificationDropdown);
            }
        });

        notificationDropdown.addEventListener('mouseenter', () => {
            this.showDropdown(notificationDropdown);
        });

        notificationDropdown.addEventListener('mouseleave', () => {
            this.hideDropdown(notificationDropdown);
        });
    }

    /**
     * Bind modal events
     */
    bindModalEvents() {
        // Feedback modal
        this.initializeFeedbackModal();

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feedback-modal')) {
                this.closeFeedbackModal();
            }
        });
    }

    /**
     * Initialize feedback modal
     */
    initializeFeedbackModal() {
        const feedbackButton = document.querySelector('.header-btn[onclick*="openFeedbackModal"]');
        if (feedbackButton) {
            feedbackButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.openFeedbackModal();
            });
        }
    }

    /**
     * Open feedback modal
     */
    openFeedbackModal() {
        const modal = document.getElementById('feedbackModal');
        if (!modal) return;

        modal.classList.add('show');
        this.activeModal = modal;

        // Focus first form element
        const firstInput = modal.querySelector('input, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log('Dashboard UI: Feedback modal opened');
    }

    /**
     * Close feedback modal
     */
    closeFeedbackModal() {
        const modal = document.getElementById('feedbackModal');
        if (!modal) return;

        modal.classList.remove('show');
        this.activeModal = null;

        // Restore body scroll
        document.body.style.overflow = '';

        console.log('Dashboard UI: Feedback modal closed');
    }

    /**
     * Bind keyboard events
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Escape key: close modals and dropdowns
            if (e.key === 'Escape') {
                if (this.activeModal) {
                    this.closeFeedbackModal();
                } else {
                    this.closeAllDropdowns();
                }
            }

            // Tab key: manage focus within modals
            if (e.key === 'Tab' && this.activeModal) {
                this.trapFocus(e, this.activeModal);
            }
        });
    }

    /**
     * Bind click outside events
     */
    bindClickOutsideEvents() {
        document.addEventListener('click', (e) => {
            // Close dropdowns when clicking outside
            if (!e.target.closest('.dropdown-menu') &&
                !e.target.closest('.nav-item') &&
                !e.target.closest('.header-btn')) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Close all active dropdowns
     */
    closeAllDropdowns() {
        this.activeDropdowns.forEach(dropdown => {
            this.hideDropdown(dropdown);
        });
        this.activeDropdowns.clear();
    }

    /**
     * Initialize tooltips - Skip header buttons to avoid interfering with new text labels
     */
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[title]:not(.header-btn)');

        tooltipElements.forEach(element => {
            const title = element.getAttribute('title');
            if (!title) return;

            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'dashboard-tooltip';
            tooltip.textContent = title;

            // Remove title to prevent default tooltip
            element.removeAttribute('title');
            element.setAttribute('aria-label', title);

            // Add hover events
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, tooltip);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip(tooltip);
            });
        });

        this.addTooltipStyles();
    }

    /**
     * Show tooltip
     */
    showTooltip(element, tooltip) {
        const rect = element.getBoundingClientRect();

        // Position tooltip
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = `${window.innerHeight - rect.top + 8}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';

        document.body.appendChild(tooltip);

        // Show with animation
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    /**
     * Hide tooltip
     */
    hideTooltip(tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 200);
    }

    /**
     * Add tooltip styles
     */
    addTooltipStyles() {
        if (document.getElementById('dashboard-tooltip-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-tooltip-styles';
        styles.textContent = `
            .dashboard-tooltip {
                background: var(--dark-color);
                color: var(--white);
                padding: 0.5rem 0.75rem;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
                z-index: 10000;
                opacity: 0;
                transform: translateX(-50%) translateY(8px);
                transition: all 0.2s ease;
                pointer-events: none;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .dashboard-tooltip.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            .dashboard-tooltip::before {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid var(--dark-color);
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Bind focus management
     */
    bindFocusManagement() {
        // Add focus indicators for better accessibility
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('dashboard-focused');
            });

            element.addEventListener('blur', () => {
                element.classList.remove('dashboard-focused');
            });
        });

        this.addFocusStyles();
    }

    /**
     * Add focus styles - Simple and clean
     */
    addFocusStyles() {
        if (document.getElementById('dashboard-focus-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-focus-styles';
        styles.textContent = `
            .nav-item.dashboard-focused .nav-link {
                background: var(--light-bg);
                color: var(--primary-color);
            }

            .nav-item.dashboard-focused .nav-link::after {
                width: 70%;
            }

            .header-btn.dashboard-focused {
                background: var(--light-bg);
                border-color: var(--primary-color);
                color: var(--primary-color);
            }

            .theme-option.dashboard-focused {
                transform: scale(1.1);
                border-color: var(--dark-color);
            }

            .dropdown-item.dashboard-focused,
            .user-dropdown-item.dashboard-focused {
                background: var(--light-bg);
                color: var(--primary-color);
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Trap focus within modal
     */
    trapFocus(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Show loading state on button
     */
    showButtonLoading(button) {
        if (!button) return;

        button.disabled = true;
        button.setAttribute('data-original-text', button.innerHTML);
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    }

    /**
     * Hide loading state on button
     */
    hideButtonLoading(button) {
        if (!button) return;

        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }

    /**
     * Debounce function for performance
     */
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

// Global UI functions for HTML onclick handlers
window.openFeedbackModal = function() {
    if (window.dashboardUI) {
        window.dashboardUI.openFeedbackModal();
    }
};

window.closeFeedbackModal = function() {
    if (window.dashboardUI) {
        window.dashboardUI.closeFeedbackModal();
    }
};

window.toggleUserDropdown = function() {
    // Toggle functionality is handled by hover events
    console.log('Dashboard UI: User dropdown toggle requested (hover-based)');
};

window.openUserProfile = function() {
    window.location.href = '/profile';
};

window.openTwoFactorSettings = function() {
    window.location.href = '/profile';
};

window.openUserSettings = function() {
    window.location.href = '/setting';
};

// Initialize UI components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardUI = new DashboardUI();
    window.dashboardUI.init();
});

// Export for global access
window.DashboardUI = DashboardUI;
