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