function showAlert(type, message) {
    const alert = document.getElementById('alert');
    alert.className = 'alert alert-' + type;
    alert.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    alert.classList.remove('d-none');
    alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function loadProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth/login?redirect=/profile';
        return;
    }
    const res = await fetch('/api/profile', {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
        if (res.status === 401) {
            window.location.href = '/auth/login?redirect=/profile';
            return;
        }
        showAlert('danger', 'Failed to load profile');
        return;
    }
    const body = await res.json();
    const p = body.data || {};
    document.getElementById('username').value = p.username || '';
    document.getElementById('role').value = p.role || '';
    document.getElementById('fullName').value = p.fullName || '';
    document.getElementById('email').value = p.email || '';
    document.getElementById('phone').value = p.phone || '';
}

async function saveProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth/login?redirect=/profile';
        return;
    }
    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
        showAlert('success', body.message || 'Profile updated successfully');
        const me = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (me.ok) {
            const meBody = await me.json();
            localStorage.setItem('userInfo', JSON.stringify(meBody.data));
        }
    } else {
        showAlert('danger', (body && body.message) || 'Update failed');
    }
}

document.getElementById('profileForm').addEventListener('submit', saveProfile);
document.addEventListener('DOMContentLoaded', loadProfile);

// Password change helpers
function showPwdAlert(type, message) {
    const alert = document.getElementById('pwdAlert');
    if (!alert) return;
    alert.className = 'alert alert-' + type;
    alert.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    alert.classList.remove('d-none');
    alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function changePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/auth/login?redirect=/profile';
        return;
    }
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showPwdAlert('danger', 'New password and confirmation do not match');
        return;
    }

    try {
        const res = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
            showPwdAlert('success', body.message || 'Password updated successfully');
            document.getElementById('passwordForm').reset();
        } else {
            showPwdAlert('danger', (body && body.message) || 'Failed to update password');
        }
    } catch (err) {
        showPwdAlert('danger', 'Network error while updating password');
    }
}

const pwdForm = document.getElementById('passwordForm');
if (pwdForm) {
    pwdForm.addEventListener('submit', changePassword);
}

// Modal: Change Password overlay behavior
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('showChangePasswordBtn');
    const modal = document.getElementById('changePasswordModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');

    if (!openBtn || !modal) return;

    const openModal = () => {
        modal.classList.remove('d-none');
        document.body.style.overflow = 'hidden';
        // Auto focus first field
        setTimeout(() => document.getElementById('currentPassword')?.focus(), 300);
    };

    const closeModal = () => {
        modal.classList.add('d-none');
        document.body.style.overflow = '';
        document.getElementById('passwordForm').reset();
        const alert = document.getElementById('pwdAlert');
        if (alert) alert.classList.add('d-none');
    };

    // expose globally for inline onclick fallback
    window.openChangePasswordModal = openModal;
    window.closeChangePasswordModal = closeModal;

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Click outside modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});

// ========== Two-Factor Authentication (2FA) ==========
function showTwofaAlert(type, message) {
    const alert = document.getElementById('twofaAlert');
    if (!alert) return;
    alert.className = 'alert alert-' + type;
    alert.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    alert.classList.remove('d-none');
}

async function loadTwofaStatus() {
    const token = localStorage.getItem('jwtToken');
    const statusEl = document.getElementById('twofaStatus');
    const emailEl = document.getElementById('twofaEmail');
    const toggle = document.getElementById('twofaToggle');
    const toggleLabel = document.getElementById('twofaToggleLabel');
    if (!statusEl) return;
    try {
        const res = await fetch('/api/profile/2fa/status', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) throw new Error('status failed');
        const body = await res.json();
        const data = body.data || {};
        if (data.enabled) {
            statusEl.textContent = 'Enabled';
            emailEl.textContent = data.email ? `Email: ${data.email}` : '';
            if (toggle) toggle.checked = true;
            if (toggleLabel) toggleLabel.textContent = 'On';
        } else {
            statusEl.textContent = 'Disabled';
            emailEl.textContent = '';
            if (toggle) toggle.checked = false;
            if (toggleLabel) toggleLabel.textContent = 'Off';
        }
    } catch (e) {
        statusEl.textContent = 'Unavailable';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTwofaStatus();

    const toggle = document.getElementById('twofaToggle');
    const toggleLabel = document.getElementById('twofaToggleLabel');
    const modal = document.getElementById('twoFactorModal');
    const closeBtn = document.getElementById('close2faModalBtn');
    const cancelBtn = document.getElementById('cancel2faModalBtn');
    const sendBtn = document.getElementById('send2faCodeBtn');
    const resendBtn = document.getElementById('resend2faCodeBtn');
    const verifyBtn = document.getElementById('verify2faBtn');
    const codeGroup = document.getElementById('twofaCodeGroup');
    const codeInput = document.getElementById('twofaCodeInput');
    const modalAlert = document.getElementById('twofaModalAlert');

    let openedFromToggle = false;
    const open2faModal = () => {
        if (!modal) return;
        modal.classList.remove('d-none');
        document.body.style.overflow = 'hidden';
        // reset UI state
        codeGroup.classList.add('d-none');
        verifyBtn.classList.add('d-none');
        resendBtn.classList.add('d-none');
        modalAlert.classList.add('d-none');
        codeInput.value = '';
    };
    const close2faModal = () => {
        if (!modal) return;
        modal.classList.add('d-none');
        document.body.style.overflow = '';
        // If user opened from the toggle and closes/ignores, revert toggle to Off
        if (openedFromToggle) {
            const toggle = document.getElementById('twofaToggle');
            const toggleLabel = document.getElementById('twofaToggleLabel');
            if (toggle) toggle.checked = false;
            if (toggleLabel) toggleLabel.textContent = 'Off';
            openedFromToggle = false;
        }
    };

    const openFromToggle = () => { openedFromToggle = true; open2faModal(); };
    if (closeBtn) closeBtn.addEventListener('click', close2faModal);
    if (cancelBtn) cancelBtn.addEventListener('click', close2faModal);
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) close2faModal(); });
    }

    async function sendCode() {
        const token = localStorage.getItem('jwtToken');
        modalAlert.classList.add('d-none');
        const res = await fetch('/api/profile/2fa/send-code', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const body = await res.json().catch(()=>({}));
        if (res.ok) {
            modalAlert.className = 'alert alert-success';
            modalAlert.textContent = (body && body.message) || 'Code sent';
            modalAlert.classList.remove('d-none');
            codeGroup.classList.remove('d-none');
            verifyBtn.classList.remove('d-none');
            resendBtn.classList.remove('d-none');
        } else {
            modalAlert.className = 'alert alert-danger';
            modalAlert.textContent = (body && body.message) || 'Failed to send code';
            modalAlert.classList.remove('d-none');
        }
    }

    async function verifyCode() {
        const token = localStorage.getItem('jwtToken');
        const code = codeInput.value.trim();
        modalAlert.classList.add('d-none');
        const res = await fetch('/api/profile/2fa/verify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        const body = await res.json().catch(()=>({}));
        if (res.ok) {
            modalAlert.className = 'alert alert-success';
            modalAlert.textContent = (body && body.message) || 'Two-factor enabled';
            modalAlert.classList.remove('d-none');
            setTimeout(() => { openedFromToggle = false; close2faModal(); loadTwofaStatus(); }, 600);
        } else {
            modalAlert.className = 'alert alert-danger';
            modalAlert.textContent = (body && body.message) || 'Invalid or expired code';
            modalAlert.classList.remove('d-none');
        }
    }

    async function disable2fa() {
        if (!confirm('Disable two-factor authentication?')) {
            if (toggle) toggle.checked = true;
            if (toggleLabel) toggleLabel.textContent = 'On';
            return;
        }
        const token = localStorage.getItem('jwtToken');
        const res = await fetch('/api/profile/2fa', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
        const body = await res.json().catch(()=>({}));
        if (res.ok) {
            showTwofaAlert('success', (body && body.message) || 'Two-factor disabled');
            if (toggle) toggle.checked = false;
            if (toggleLabel) toggleLabel.textContent = 'Off';
            const statusEl = document.getElementById('twofaStatus');
            const phoneEl = document.getElementById('twofaPhone');
            if (statusEl) statusEl.textContent = 'Disabled';
            if (phoneEl) phoneEl.textContent = '';
        } else {
            showTwofaAlert('danger', (body && body.message) || 'Failed to disable');
            if (toggle) toggle.checked = true;
            if (toggleLabel) toggleLabel.textContent = 'On';
        }
    }

    if (sendBtn) sendBtn.addEventListener('click', sendCode);
    if (resendBtn) resendBtn.addEventListener('click', sendCode);
    if (verifyBtn) verifyBtn.addEventListener('click', verifyCode);
    if (toggle) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                if (toggleLabel) toggleLabel.textContent = 'On';
                openFromToggle();
            } else {
                if (toggleLabel) toggleLabel.textContent = 'Off';
                disable2fa();
            }
        });
    }
});
