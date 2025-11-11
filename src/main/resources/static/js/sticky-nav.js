/**
 * Sticky Navigation Manager
 * Handles navbar visibility based on scroll direction
 */

class StickyNavigation {
    constructor() {
        this.header = null;
        this.navbar = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 50; // Minimum scroll to trigger show/hide
        this.navbarHeight = 0;
        this.isNavbarHidden = false;

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }
    }

    setupNavigation() {
        this.header = document.querySelector('.header');
        this.navbar = document.querySelector('.moduleNav');

        if (!this.header || !this.navbar) {
            console.warn('Header or navbar not found');
            return;
        }

        // Store navbar height
        this.navbarHeight = this.navbar.offsetHeight;

        // Add scroll listener with throttle
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial setup
        this.updateNavbarPosition();

        console.log('Sticky navigation initialized');
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Don't hide navbar if we're at the top of the page
        if (scrollTop < this.scrollThreshold) {
            this.showNavbar();
            this.lastScrollTop = scrollTop;
            return;
        }

        // Determine scroll direction
        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
        const scrollDistance = Math.abs(scrollTop - this.lastScrollTop);

        // Only react if we've scrolled past the threshold
        if (scrollDistance > this.scrollThreshold) {
            if (scrollDirection === 'down' && !this.isNavbarHidden) {
                this.hideNavbar();
            } else if (scrollDirection === 'up' && this.isNavbarHidden) {
                this.showNavbar();
            }
        }

        this.lastScrollTop = scrollTop;
    }

    hideNavbar() {
        if (this.navbar && !this.isNavbarHidden) {
            this.navbar.classList.add('hidden');
            this.isNavbarHidden = true;

            // Adjust dashboard content margin when navbar is hidden
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.marginTop = `${this.headerHeight}px`;
            }
        }
    }

    showNavbar() {
        if (this.navbar && this.isNavbarHidden) {
            this.navbar.classList.remove('hidden');
            this.isNavbarHidden = false;

            // Reset dashboard content margin when navbar is visible
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                dashboardContent.style.marginTop = '0';
            }
        }
    }

    updateNavbarPosition() {
        if (this.navbar && this.header) {
            this.headerHeight = this.header.offsetHeight;

            // Ensure navbar is positioned correctly relative to header
            this.navbar.style.top = `${this.headerHeight}px`;

            // Adjust dashboard content margin to account for both header and navbar
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent && !this.isNavbarHidden) {
                dashboardContent.style.marginTop = '0';
                dashboardContent.style.marginLeft = '240px'; // Account for sidebar
            }
        }
    }

    // Public method to manually show/hide navbar
    toggleNavbar() {
        if (this.isNavbarHidden) {
            this.showNavbar();
        } else {
            this.hideNavbar();
        }
    }

    // Public method to reset scroll position
    reset() {
        this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.updateNavbarPosition();
    }
}

// Auto-initialize
window.stickyNavigation = new StickyNavigation();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StickyNavigation;
}