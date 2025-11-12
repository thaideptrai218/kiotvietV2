/**
 * KiotViet Authentication Manager
 * Centralized authentication handling for all pages
 *
 * Features:
 * - JWT token management (localStorage)
 * - Authentication status checking
 * - Automatic redirects for protected pages
 * - UI updates for authenticated users
 * - Token refresh handling
 * - Logout functionality
 */

class KiotVietAuth {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.refreshTokenKey = 'refreshToken';
        this.userInfoKey = 'userInfo';
        this.apiBaseUrl = '/api/auth';
        this._mfaModal = null;
        this._mfaChallengeId = null;
    }

    /**
     * Initialize authentication on page load
     */
    async init() {
        // Check authentication status for protected pages
        if (this.isProtectedPage()) {
            await this.requireAuth();
        } else {
            // Update UI for non-protected pages (landing, etc.)
            await this.updateUIIfAuthenticated();
        }
    }

    /**
     * Check if current page requires authentication
     */
    isProtectedPage() {
        const protectedRoutes = ['/dashboard', '/profile', '/settings', '/products', '/suppliers'];
        const currentPath = window.location.pathname;

        return protectedRoutes.some(route => currentPath.startsWith(route));
    }

    /**
     * Get current JWT token from localStorage
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Store authentication tokens
     */
    setTokens(accessToken, refreshToken, userInfo) {
        localStorage.setItem(this.tokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
    }

    /**
     * Clear all authentication data
     */
    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoKey);
    }

    /**
     * Get stored user information
     */
    getUserInfo() {
        try {
            const userInfo = localStorage.getItem(this.userInfoKey);
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated by validating stored token
     */
    async isAuthenticated() {
        const token = this.getToken();

        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Update stored user info with fresh data
                localStorage.setItem(this.userInfoKey, JSON.stringify(data.data));
                return true;
            } else {
                // Token is invalid, clear it
                this.clearTokens();
                return false;
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            return false;
        }
    }

    /**
     * Require authentication for current page
     * Redirects to login if not authenticated
     */
    async requireAuth() {
        const isAuthenticated = await this.isAuthenticated();

        if (!isAuthenticated) {
            // Store current URL for redirect after login
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }

        return true;
    }

    /**
     * Update UI elements based on authentication status
     */
    async updateUIIfAuthenticated() {
        if (await this.isAuthenticated()) {
            const userInfo = this.getUserInfo();
            this.updateUIForAuthenticatedUser(userInfo);
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    /**
     * Update UI for authenticated users
     */
    updateUIForAuthenticatedUser(userInfo) {
        // Update navbar authentication section
        this.updateNavbarForAuthenticatedUser(userInfo);

        // Update hero section CTAs if on landing page
        this.updateHeroSectionForAuthenticatedUser(userInfo);

        // Update dashboard access button
        this.updateDashboardAccessButton(userInfo);

        // Update trust indicators
        this.updateTrustIndicators(userInfo);
    }

    /**
     * Update navbar for authenticated users
     */
    updateNavbarForAuthenticatedUser(userInfo) {
        const navbarAuth = document.querySelector('.navbar-nav:last-child');
        if (navbarAuth && userInfo) {
            navbarAuth.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-2"></i>${userInfo.username}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/dashboard">
                            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                        </a></li>
                        <li><a class="dropdown-item" href="/profile">
                            <i class="fas fa-user-cog me-2"></i>Profile
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="kiotVietAuth.logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a></li>
                    </ul>
                </div>
            `;
        }
    }

    /**
     * Update hero section for authenticated users
     */
    updateHeroSectionForAuthenticatedUser(userInfo) {
        const heroCTA = document.querySelector('.hero-content .d-flex');
        if (heroCTA && userInfo) {
            heroCTA.innerHTML = `
                <button class="btn btn-light btn-lg px-4 py-3" onclick="kiotVietAuth.goToDashboard()">
                    <i class="fas fa-tachometer-alt me-2"></i>Go to Dashboard
                </button>
                <button class="btn btn-outline-light btn-lg px-4 py-3" onclick="openDemoModal()">
                    <i class="fas fa-play me-2"></i>Watch Demo
                </button>
            `;
        }
    }

    /**
     * Update dashboard access button
     */
    updateDashboardAccessButton(userInfo) {
        const dashboardBtn = document.querySelector('#dashboardAccess button');
        if (dashboardBtn && userInfo) {
            dashboardBtn.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Enter Dashboard';
            dashboardBtn.onclick = () => this.goToDashboard();
        }
    }

    /**
     * Update trust indicators
     */
    updateTrustIndicators(userInfo) {
        const trustIndicators = document.querySelector('.hero-content .mt-4 small');
        if (trustIndicators && userInfo) {
            trustIndicators.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>Welcome back, ${userInfo.username}!
                <i class="fas fa-check-circle ms-3 me-2"></i>${userInfo.companyName || 'Your Company'}
                <i class="fas fa-check-circle ms-3 me-2"></i>Role: ${userInfo.role || 'User'}
            `;
        }
    }

    /**
     * Update UI for unauthenticated users (no-op - default UI is already correct)
     */
    updateUIForUnauthenticatedUser() {
        // Default UI is already correct for unauthenticated users
    }

    /**
     * Handle login form submission
     */
    async handleLogin(loginData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            // MFA required path (HTTP 202)
            if (response.status === 202) {
                const mfa = await response.json().catch(() => ({}));
                const challengeId = mfa?.data?.challengeId || mfa?.challengeId;
                if (!challengeId) throw new Error('MFA challenge missing');
                const verified = await this._handleMfaViaModal(challengeId);
                return { success: true, data: verified };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Login failed');
            }

            const data = await response.json();

            // Store tokens
            this.setTokens(
                data.data.accessToken,
                data.data.refreshToken,
                data.data.userInfo
            );

            return { success: true, data: data.data };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    _handleMfaViaModal(challengeId) {
        this._mfaChallengeId = challengeId;
        return new Promise((resolve, reject) => {
            const modalEl = document.getElementById('mfaModal');
            const codeInput = document.getElementById('mfaCodeInput');
            const verifyBtn = document.getElementById('mfaVerifyBtn');
            const cancelBtn = document.getElementById('mfaCancelBtn');
            const alertEl = document.getElementById('mfaAlert');
            if (!modalEl || !codeInput || !verifyBtn) {
                reject(new Error('MFA UI not available'));
                return;
            }

            // Bootstrap modal with static backdrop to prevent accidental close
            const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
            this._mfaModal = modal;
            alertEl?.classList.add('d-none');
            codeInput.value = '';
            modal.show();
            setTimeout(() => codeInput.focus(), 200);

            const cleanup = () => {
                modalEl.removeEventListener('hidden.bs.modal', onHidden);
                verifyBtn.removeEventListener('click', onVerify);
                cancelBtn?.removeEventListener('click', onCancel);
                codeInput.removeEventListener('keydown', onKey);
                this._mfaModal = null;
                this._mfaChallengeId = null;
            };

            const onHidden = () => {
                cleanup();
                reject(new Error('Two-factor verification cancelled'));
            };

            const onCancel = () => {
                modal.hide();
            };

            const onKey = (e) => {
                if (e.key === 'Enter') onVerify();
            };

            const onVerify = async () => {
                const code = String(codeInput.value || '').trim();
                if (code.length !== 6) {
                    alertEl.className = 'alert alert-danger';
                    alertEl.textContent = 'Please enter the 6-digit code.';
                    alertEl.classList.remove('d-none');
                    return;
                }
                alertEl.classList.add('d-none');
                verifyBtn.disabled = true;
                try {
                    const verifyRes = await fetch(`${this.apiBaseUrl}/mfa/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ challengeId, code })
                    });
                    const body = await verifyRes.json().catch(() => ({}));
                    if (!verifyRes.ok) {
                        alertEl.className = 'alert alert-danger';
                        alertEl.textContent = body.message || body.error || 'Invalid or expired code';
                        alertEl.classList.remove('d-none');
                        verifyBtn.disabled = false;
                        return;
                    }
                    this.setTokens(body.data.accessToken, body.data.refreshToken, body.data.userInfo);
                    modal.hide();
                    cleanup();
                    resolve(body.data);
                } catch (err) {
                    alertEl.className = 'alert alert-danger';
                    alertEl.textContent = 'Network error. Please try again.';
                    alertEl.classList.remove('d-none');
                    verifyBtn.disabled = false;
                }
            };

            modalEl.addEventListener('hidden.bs.modal', onHidden);
            verifyBtn.addEventListener('click', onVerify);
            cancelBtn?.addEventListener('click', onCancel);
            codeInput.addEventListener('keydown', onKey);
        });
    }

    /**
     * Handle user registration
     */
    async handleRegistration(registrationData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Registration failed');
            }

            const data = await response.json();

            // Store tokens from registration
            this.setTokens(
                data.data.accessToken,
                data.data.refreshToken,
                data.data.userInfo
            );

            return { success: true, data: data.data };
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            // Update access token
            localStorage.setItem(this.tokenKey, data.data.accessToken);

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return false;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        const token = this.getToken();

        try {
            // Call logout endpoint if token exists
            if (token) {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        // Clear local storage FIRST before redirect
        this.clearTokens();

        // Add a small delay to ensure local storage is cleared before redirect
        setTimeout(() => {
            // Redirect to login page with logout flag
            window.location.href = '/login?logout=true';
        }, 100);
    }

    /**
     * Navigate to dashboard
     */
    goToDashboard() {
        window.location.href = '/dashboard';
    }

    /**
     * Get authorization header for API calls
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Make authenticated API call
     */
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            throw new Error('No authentication token available');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers
        });
    }
}

// Create global instance
window.kiotVietAuth = new KiotVietAuth();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    kiotVietAuth.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KiotVietAuth;
}
