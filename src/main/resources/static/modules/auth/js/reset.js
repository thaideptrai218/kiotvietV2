const showAlert = (type, msg) => {
    const el = document.getElementById('alert');
    el.className = `alert alert-${type}`;
    el.innerHTML = `<i class="fas fa-info-circle me-2"></i>${msg}`;
    el.classList.remove('d-none');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const postJson = (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
});

document.addEventListener('DOMContentLoaded', () => {
    const firstInput = document.querySelector('.form-control');
    if (firstInput) setTimeout(() => firstInput.focus(), 300);

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('fpUsername').value.trim();
            if (!username) {
                showAlert('warning', 'Please enter your username or email.');
                return;
            }
            try {
                const res = await postJson('/api/auth/forgot', { username });
                if (!res.ok) throw new Error();
                showAlert('success', 'If the account exists, a reset link has been sent to your email.');
            } catch {
                showAlert('danger', 'Something went wrong. Please try again later.');
            }
        });
    }

    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = document.getElementById('rpToken').value;
            const pw = document.getElementById('rpPassword').value;
            const cf = document.getElementById('rpConfirm').value;

            if (pw !== cf) { showAlert('warning', 'Passwords do not match.'); return; }
            if (pw.length < 8) { showAlert('warning', 'Password must be at least 8 characters.'); return; }

            try {
                const res = await postJson('/api/auth/reset', { token, newPassword: pw });
                if (!res.ok) throw new Error();
                showAlert('success', 'Password reset successfully! Redirecting to login...');
                setTimeout(() => window.location.href = '/auth/login', 2000);
            } catch {
                showAlert('danger', 'Invalid or expired token. Please request a new link.');
            }
        });
    }
});

