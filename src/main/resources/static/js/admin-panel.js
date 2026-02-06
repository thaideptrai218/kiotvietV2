/**
 * Admin Panel JavaScript
 * Handles API calls, UI interactions, and data management for admin panel
 */

// Admin Panel Namespace
const AdminPanel = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        apiBaseUrl: '/admin/api',
        toastDuration: 5000,
        loadingTimeout: 30000
    };

    // State
    let state = {
        currentPage: 0,
        pageSize: 20,
        filters: {},
        currentCompany: null,
        currentUser: null
    };

    /**
     * API Request Helper
     */
    async function apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, mergedOptions);

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: `HTTP ${response.status}: ${response.statusText}`
                }));
                throw new Error(error.message || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Toast Notifications
     */
    function showToast(type, title, message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast--${type}`;

        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        toast.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'} admin-toast-icon"></i>
            <div class="admin-toast-content">
                <div class="admin-toast-title">${escapeHtml(title)}</div>
                ${message ? `<div class="admin-toast-message">${escapeHtml(message)}</div>` : ''}
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.toastDuration);
    }

    function showSuccessNotification(message, title = 'Success') {
        showToast('success', title, message);
    }

    function showErrorNotification(message, title = 'Error') {
        showToast('error', title, message);
    }

    function showWarningNotification(message, title = 'Warning') {
        showToast('warning', title, message);
    }

    function showInfoNotification(message, title = 'Info') {
        showToast('info', title, message);
    }

    /**
     * Loading States
     */
    function showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="admin-loading-state">
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    function hideLoading() {
        // Remove any loading states
        document.querySelectorAll('.admin-loading-state').forEach(el => {
            el.remove();
        });
    }

    /**
     * Utility Functions
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return 'Never';

        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return formatDate(dateStr);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    }

    function debounce(func, wait) {
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

    /**
     * Dashboard Functions
     */
    async function loadDashboardMetrics() {
        try {
            const data = await apiRequest('/dashboard');
            return data;
        } catch (error) {
            console.error('Error loading dashboard metrics:', error);
            throw error;
        }
    }

    async function loadDashboardChartData(days = 30) {
        try {
            const data = await apiRequest(`/dashboard/charts?days=${days}`);
            return data;
        } catch (error) {
            console.error('Error loading chart data:', error);
            throw error;
        }
    }

    async function loadRecentActivity(limit = 10) {
        try {
            const data = await apiRequest(`/activity?limit=${limit}`);
            return data;
        } catch (error) {
            console.error('Error loading activity:', error);
            throw error;
        }
    }

    /**
     * Company Functions
     */
    async function loadCompanies(page = 0, size = 20, filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page,
                size: size,
                sortBy: filters.sortBy || 'createdAt',
                sortDirection: 'DESC'
            });

            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const data = await apiRequest(`/companies?${params.toString()}`);
            return data;
        } catch (error) {
            console.error('Error loading companies:', error);
            throw error;
        }
    }

    async function getCompanyDetails(companyId) {
        try {
            const data = await apiRequest(`/companies/${companyId}`);
            return data;
        } catch (error) {
            console.error('Error loading company details:', error);
            throw error;
        }
    }

    async function suspendCompany(companyId, reason = '') {
        try {
            const data = await apiRequest(`/companies/${companyId}/suspend`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            return data;
        } catch (error) {
            console.error('Error suspending company:', error);
            throw error;
        }
    }

    async function activateCompany(companyId) {
        try {
            const data = await apiRequest(`/companies/${companyId}/activate`, {
                method: 'POST'
            });
            return data;
        } catch (error) {
            console.error('Error activating company:', error);
            throw error;
        }
    }

    async function getCompanyUsers(companyId) {
        try {
            const data = await apiRequest(`/companies/${companyId}/users`);
            return data;
        } catch (error) {
            console.error('Error loading company users:', error);
            throw error;
        }
    }

    async function getCompanyActivity(companyId, limit = 10) {
        try {
            const data = await apiRequest(`/companies/${companyId}/activity?limit=${limit}`);
            return data;
        } catch (error) {
            console.error('Error loading company activity:', error);
            throw error;
        }
    }

    /**
     * User Functions
     */
    async function loadUsers(page = 0, size = 20, filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page,
                size: size,
                sortBy: filters.sortBy || 'createdAt',
                sortDirection: 'DESC'
            });

            if (filters.role) params.append('role', filters.role);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const data = await apiRequest(`/users?${params.toString()}`);
            return data;
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    }

    async function getUserStatistics() {
        try {
            const data = await apiRequest('/users/statistics');
            return data;
        } catch (error) {
            console.error('Error loading user statistics:', error);
            throw error;
        }
    }

    async function getUserDetails(userId) {
        try {
            const data = await apiRequest(`/users/${userId}`);
            return data;
        } catch (error) {
            console.error('Error loading user details:', error);
            throw error;
        }
    }

    /**
     * Modal Functions
     */
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.admin-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    // Close modals on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    /**
     * Search & Filter Functions
     */
    const debouncedSearch = debounce(function(searchValue) {
        // Trigger search after debounce
        const event = new CustomEvent('adminSearch', { detail: { query: searchValue } });
        document.dispatchEvent(event);
    }, 500);

    function handleSearchInput(event) {
        const searchValue = event.target.value.trim();
        debouncedSearch(searchValue);
    }

    /**
     * Pagination Functions
     */
    function updatePaginationInfo(data, containerId) {
        const start = data.number * data.size + 1;
        const end = Math.min(start + data.size - 1, data.totalElements);

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${data.totalElements}</strong> entries
            `;
        }
    }

    function renderPageNumbers(currentPage, totalPages, containerId, onClick) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let pages = [];

        // Always show first page
        pages.push(0);

        // Show pages around current page
        for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        // Always show last page if there are more pages
        if (totalPages > 1) {
            pages.push(totalPages - 1);
        }

        // Add ellipsis
        const displayPages = [];
        for (let i = 0; i < pages.length; i++) {
            displayPages.push(pages[i]);
            if (i < pages.length - 1 && pages[i + 1] > pages[i] + 1) {
                displayPages.push('...');
            }
        }

        container.innerHTML = displayPages.map(page => {
            if (page === '...') {
                return '<span class="admin-pagination-ellipsis">...</span>';
            }
            return `
                <button class="admin-pagination-number ${page === currentPage ? 'admin-pagination-number--active' : ''}"
                        onclick="${onClick}(${page})">
                    ${page + 1}
                </button>
            `;
        }).join('');
    }

    /**
     * Validation Functions
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone);
    }

    function validateRequired(value) {
        return value && value.trim().length > 0;
    }

    /**
     * Export Functions
     */
    async function exportToCsv(endpoint, filename) {
        try {
            const data = await apiRequest(endpoint);

            // Convert JSON to CSV
            const csv = convertJsonToCsv(data);

            // Create download link
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'export.csv';
            a.click();
            window.URL.revokeObjectURL(url);

            showSuccessNotification('Export completed successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            showErrorNotification('Failed to export data');
        }
    }

    function convertJsonToCsv(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [];

        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    /**
     * Initialize
     */
    function init() {
        // Add global event listeners
        document.addEventListener('adminSearch', function(event) {
            console.log('Search triggered:', event.detail.query);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', function(event) {
            // Reload data if needed
        });

        console.log('Admin Panel initialized');
    }

    // Public API
    return {
        init,
        state,

        // Notifications
        showSuccessNotification,
        showErrorNotification,
        showWarningNotification,
        showInfoNotification,

        // Dashboard
        loadDashboardMetrics,
        loadDashboardChartData,
        loadRecentActivity,

        // Companies
        loadCompanies,
        getCompanyDetails,
        suspendCompany,
        activateCompany,
        getCompanyUsers,
        getCompanyActivity,

        // Users
        loadUsers,
        getUserStatistics,
        getUserDetails,

        // Modals
        showModal,
        hideModal,
        closeAllModals,

        // Utilities
        escapeHtml,
        formatDate,
        formatDateTime,
        formatRelativeTime,
        formatCurrency,
        validateEmail,
        validatePhone,
        validateRequired,

        // Search
        handleSearchInput,

        // Pagination
        updatePaginationInfo,
        renderPageNumbers,

        // Export
        exportToCsv,

        // Loading
        showLoading,
        hideLoading
    };

})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AdminPanel.init);
} else {
    AdminPanel.init();
}

// Export for use in templates
window.AdminPanel = AdminPanel;
