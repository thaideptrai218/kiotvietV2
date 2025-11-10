/**
 * Dashboard Theme JavaScript
 * Theme switching and management functionality
 */

class DashboardTheme {
    constructor() {
        this.currentTheme = 'default';
        this.storageKey = 'kiotviet-theme';
        this.themes = [
            { name: 'default', color: '#4f46e5', title: 'Default' },
            { name: 'ocean', color: '#0891b2', title: 'Ocean' },
            { name: 'forest', color: '#059669', title: 'Forest' },
            { name: 'sunset', color: '#dc2626', title: 'Sunset' },
            { name: 'purple', color: '#7c3aed', title: 'Purple' },
            { name: 'midnight', color: '#1e293b', title: 'Midnight' },
            { name: 'rose', color: '#e11d48', title: 'Rose' },
            { name: 'emerald', color: '#047857', title: 'Emerald' }
        ];
    }

    /**
     * Initialize theme system
     */
    init() {
        this.loadSavedTheme();
        this.renderThemeOptions();
        this.bindEvents();
    }

    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme && this.isValidTheme(savedTheme)) {
            this.setTheme(savedTheme);
        }
    }

    /**
     * Set active theme
     */
    setTheme(themeName) {
        if (!this.isValidTheme(themeName)) {
            console.warn(`Invalid theme: ${themeName}`);
            return;
        }

        // Update data-theme attribute
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;

        // Save to localStorage
        localStorage.setItem(this.storageKey, themeName);

        // Update active theme indicator
        this.updateActiveThemeIndicator(themeName);

        // Dispatch theme change event
        this.dispatchThemeChangeEvent(themeName);

        console.log(`Dashboard Theme: Theme changed to ${themeName}`);
    }

    /**
     * Check if theme is valid
     */
    isValidTheme(themeName) {
        return this.themes.some(theme => theme.name === themeName);
    }

    /**
     * Render theme options in theme switcher
     */
    renderThemeOptions() {
        const themeOptionsContainer = document.querySelector('.theme-options');
        if (!themeOptionsContainer) return;

        themeOptionsContainer.innerHTML = '';

        this.themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${theme.name === this.currentTheme ? 'active' : ''}`;
            themeOption.style.backgroundColor = theme.color;
            themeOption.title = theme.title;
            themeOption.setAttribute('data-theme', theme.name);
            themeOption.setAttribute('role', 'button');
            themeOption.setAttribute('tabindex', '0');

            themeOption.addEventListener('click', () => {
                this.setTheme(theme.name);
            });

            themeOption.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setTheme(theme.name);
                }
            });

            themeOptionsContainer.appendChild(themeOption);
        });
    }

    /**
     * Update active theme indicator
     */
    updateActiveThemeIndicator(themeName) {
        const themeOptions = document.querySelectorAll('.theme-option');

        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === themeName) {
                option.classList.add('active');
            }
        });
    }

    /**
     * Bind theme-related events
     */
    bindEvents() {
        // Theme switcher visibility
        this.bindThemeSwitcherEvents();

        // Keyboard shortcuts for theme switching
        this.bindKeyboardShortcuts();

        // System theme preference detection
        this.bindSystemThemeDetection();
    }

    /**
     * Bind theme switcher events
     */
    bindThemeSwitcherEvents() {
        const themeButton = document.querySelector('.header-btn[title="Switch Theme"]');
        if (!themeButton) return;

        // Add ARIA attributes for accessibility
        themeButton.setAttribute('aria-label', 'Switch theme');
        themeButton.setAttribute('aria-expanded', 'false');

        // Monitor theme switcher visibility
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
                    const isExpanded = themeButton.getAttribute('aria-expanded') === 'true';
                    themeButton.setAttribute('aria-expanded', isExpanded);
                }
            });
        });

        observer.observe(themeButton, { attributes: true });
    }

    /**
     * Bind keyboard shortcuts for theme switching
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T: Open theme switcher
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleThemeSwitcher();
            }

            // Ctrl/Cmd + Shift + R: Random theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.setRandomTheme();
            }
        });
    }

    /**
     * Bind system theme preference detection
     */
    bindSystemThemeDetection() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleThemeChange = (e) => {
                // Auto-switch to midnight theme when system prefers dark mode
                // Only if user hasn't explicitly set a theme
                if (!localStorage.getItem(this.storageKey)) {
                    if (e.matches) {
                        this.setTheme('midnight');
                    } else {
                        this.setTheme('default');
                    }
                }
            };

            darkModeQuery.addListener(handleThemeChange);
            handleThemeChange(darkModeQuery);
        }
    }

    /**
     * Toggle theme switcher visibility
     */
    toggleThemeSwitcher() {
        const themeSwitcher = document.querySelector('.theme-switcher');
        if (!themeSwitcher) return;

        const isVisible = themeSwitcher.style.opacity === '1';

        if (isVisible) {
            themeSwitcher.style.opacity = '0';
            themeSwitcher.style.visibility = 'hidden';
            themeSwitcher.style.transform = 'translateY(-10px)';
        } else {
            themeSwitcher.style.opacity = '1';
            themeSwitcher.style.visibility = 'visible';
            themeSwitcher.style.transform = 'translateY(0)';

            // Focus first theme option for accessibility
            const firstThemeOption = themeSwitcher.querySelector('.theme-option');
            if (firstThemeOption) {
                firstThemeOption.focus();
            }
        }
    }

    /**
     * Set random theme
     */
    setRandomTheme() {
        const availableThemes = this.themes.filter(theme => theme.name !== this.currentTheme);
        const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
        this.setTheme(randomTheme.name);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return [...this.themes];
    }

    /**
     * Get theme color by name
     */
    getThemeColor(themeName) {
        const theme = this.themes.find(t => t.name === themeName);
        return theme ? theme.color : null;
    }

    /**
     * Reset to default theme
     */
    resetTheme() {
        localStorage.removeItem(this.storageKey);
        this.setTheme('default');
    }

    /**
     * Apply theme with animation
     */
    setThemeWithAnimation(themeName) {
        if (!this.isValidTheme(themeName)) return;

        // Add transition animation class
        document.body.classList.add('theme-transitioning');

        // Set theme after a brief delay for smooth transition
        setTimeout(() => {
            this.setTheme(themeName);

            // Remove transition class after animation
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300);
        }, 50);
    }

    /**
     * Dispatch theme change event
     */
    dispatchThemeChangeEvent(themeName) {
        const event = new CustomEvent('dashboardThemeChange', {
            detail: {
                theme: themeName,
                previousTheme: this.currentTheme === themeName ? null : this.currentTheme,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Get theme CSS variables
     */
    getThemeCSSVariables(themeName) {
        const theme = this.themes.find(t => t.name === themeName);
        if (!theme) return {};

        const computedStyle = getComputedStyle(document.documentElement);

        return {
            primaryColor: computedStyle.getPropertyValue('--primary-color').trim(),
            secondaryColor: computedStyle.getPropertyValue('--secondary-color').trim(),
            accentColor: computedStyle.getPropertyValue('--accent-color').trim(),
            darkColor: computedStyle.getPropertyValue('--dark-color').trim(),
            lightBg: computedStyle.getPropertyValue('--light-bg').trim(),
            borderColor: computedStyle.getPropertyValue('--border-color').trim(),
            textMuted: computedStyle.getPropertyValue('--text-muted').trim()
        };
    }
}

// Global theme switching function for HTML onclick handlers
window.setTheme = function(themeName) {
    if (window.dashboardTheme) {
        window.dashboardTheme.setTheme(themeName);
    }
};

// Initialize theme system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardTheme = new DashboardTheme();
    window.dashboardTheme.init();
});

// Export for global access
window.DashboardTheme = DashboardTheme;