document.addEventListener('DOMContentLoaded', () => {
  // ===============================
  // SECTION SWITCHING (user/store)
  // ===============================
  const sidebar = document.getElementById('settingsSidebar');
  const userSection = document.getElementById('userManagementSection');
  const storeSection = document.getElementById('storeInfoSection');
  const filterSidebar = document.getElementById('filterSidebar');

  const btnEditStore = document.getElementById('btnEditStore');
  const storeModal = document.getElementById('storeModal');
  const storeForm = document.getElementById('storeForm');
  const logoBtn = document.getElementById('btnSelectAvatar');
  const logoInput = document.getElementById('storeLogoInput');
  const logoPreview = document.getElementById('storeLogoPreview');
  const defaultLogo = logoPreview?.getAttribute('data-default') || logoPreview?.src || 'https://via.placeholder.com/72x72.png?text=Logo';

  function showSection(section) {
    if (section === 'user') {
      userSection.style.visibility = 'visible';
      userSection.style.position = 'static';
      userSection.style.left = '0';

      storeSection.style.visibility = 'hidden';
      storeSection.style.position = 'absolute';
      storeSection.style.left = '-9999px';
    }

    if (section === 'store') {
      storeSection.style.visibility = 'visible';
      storeSection.style.position = 'static';
      storeSection.style.left = '0';

      userSection.style.visibility = 'hidden';
      userSection.style.position = 'absolute';
      userSection.style.left = '-9999px';

      filterSidebar.style.display = 'none';
    }
  }

  sidebar.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      sidebar.querySelectorAll('li').forEach((i) => i.classList.remove('active'));
      li.classList.add('active');
      showSection(li.dataset.section);
    });
  });

  // ===============================
  // API HELPERS
  // ===============================
  const api = {
    token() {
      return (
        localStorage.getItem('jwtToken') ||
        sessionStorage.getItem('jwtToken') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
      );
    },
    headers(isJson = true) {
      const headers = { Accept: 'application/json' };
      if (isJson) headers['Content-Type'] = 'application/json';
      const token = this.token();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return headers;
    },
    async request(url, { method = 'GET', body } = {}) {
      const isFormData = body instanceof FormData;
      const opts = {
        method,
        headers: this.headers(!isFormData),
        credentials: 'same-origin'
      };
      if (body !== undefined) {
        opts.body = isFormData ? body : JSON.stringify(body);
        if (isFormData) delete opts.headers['Content-Type'];
      }
      const resp = await fetch(url, opts);
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(payload?.message || 'Request failed');
      }
      return payload?.data ?? payload;
    }
  };

  function notify(message, type = 'success') {
    const core = window?.dashboardCore;
    if (core && typeof core.showToast === 'function') {
      core.showToast(message, type);
      return;
    }
    if (type === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  // ===============================
  // STORE DATA (loaded from API)
  // ===============================
  const storeData = {
    url: '',
    phone: '',
    countryName: '',
    countryFlag: 'vn',
    storeName: '',
    address: '',
    province: '',
    ward: '',
    logoUrl: ''
  };

  function applyCompanyData(company) {
    storeData.url = company?.url || storeData.url || '#';
    storeData.phone = company?.phone || '';
    storeData.storeName = company?.name || '';
    storeData.address = company?.address || '';
    storeData.province = company?.province || '';
    storeData.ward = company?.ward || '';
    storeData.countryName = company?.country || storeData.countryName || 'Vietnam';
    storeData.countryFlag = company?.countryFlag || storeData.countryFlag || 'vn';
    storeData.logoUrl = company?.logoUrl || '';
    renderStore();
  }

  async function loadCompany() {
    try {
      const company = await api.request('/api/company');
      applyCompanyData(company);
    } catch (err) {
      console.error('Failed to load company info', err);
      notify(err.message || 'Unable to load store information', 'error');
    }
  }

  function renderStore() {
    const urlText = document.getElementById('storeUrlText');
    urlText.textContent = storeData.url || 'Not configured';
    urlText.href = storeData.url || '#';

    document.getElementById('storePhoneText').textContent = storeData.phone || '—';
    document.getElementById('storeCountryText').innerHTML = `
      <img src="https://flagcdn.com/w20/${storeData.countryFlag || 'vn'}.png" class="flag-icon">
      ${storeData.countryName || '—'}
    `;
    document.getElementById('storeNameText').textContent = storeData.storeName || '—';
    document.getElementById('storeAddressText').textContent = storeData.address || 'None';
    if (logoPreview) {
      logoPreview.src = storeData.logoUrl || defaultLogo;
    }
  }

  loadCompany();

  // ===============================
  // STORE MODAL
  // ===============================
  const kvBox = document.getElementById('kvCountryBox');
  const kvDropdown = document.getElementById('kvCountryDropdown');
  const kvSearch = document.getElementById('kvCountrySearch');
  const kvList = document.getElementById('kvCountryList');
  const flagEl = document.getElementById('kvCountryFlag');
  const nameEl = document.getElementById('kvCountryName');

  function syncCountrySelection() {
    const currentFlag = storeData.countryFlag || 'vn';
    flagEl.src = `https://flagcdn.com/w20/${currentFlag}.png`;
    nameEl.textContent = storeData.countryName || 'Select country';
    kvList.querySelectorAll('.kv-country-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.flag === currentFlag);
    });
  }

  function openStoreModal() {
    storeForm.url.value = storeData.url || '';
    storeForm.phone.value = storeData.phone || '';
    storeForm.storeName.value = storeData.storeName || '';
    storeForm.address.value = storeData.address || '';
    storeForm.province.value = storeData.province || '';
    storeForm.ward.value = storeData.ward || '';
    syncCountrySelection();
    storeModal.style.display = 'flex';
  }

  function closeStoreModal() {
    storeModal.style.display = 'none';
  }

  btnEditStore.addEventListener('click', openStoreModal);
  document.querySelectorAll("[data-close='storeModal']").forEach((el) => {
    el.addEventListener('click', closeStoreModal);
  });

  kvBox.addEventListener('click', () => {
    kvDropdown.style.display = kvDropdown.style.display === 'block' ? 'none' : 'block';
  });

  kvList.querySelectorAll('.kv-country-item').forEach((item) => {
    item.addEventListener('click', () => {
      kvList.querySelectorAll('.kv-country-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const flag = item.dataset.flag;
      const name = item.dataset.name;

      flagEl.src = `https://flagcdn.com/w20/${flag}.png`;
      nameEl.textContent = name;

      storeData.countryFlag = flag;
      storeData.countryName = name;

      kvDropdown.style.display = 'none';
    });
  });

  kvSearch.addEventListener('input', () => {
    const keyword = kvSearch.value.toLowerCase();
    kvList.querySelectorAll('.kv-country-item').forEach((item) => {
      const name = item.dataset.name.toLowerCase();
      item.style.display = name.includes(keyword) ? 'flex' : 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (!kvBox.contains(e.target) && !kvDropdown.contains(e.target)) {
      kvDropdown.style.display = 'none';
    }
  });

  // ===============================
  // SAVE STORE
  // ===============================
  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      phone: storeForm.phone.value.trim(),
      country: storeData.countryName,
      countryFlag: storeData.countryFlag,
      name: storeForm.storeName.value.trim(),
      address: storeForm.address.value.trim(),
      province: storeForm.province.value.trim(),
      ward: storeForm.ward.value.trim()
    };
    try {
      const company = await api.request('/api/company', { method: 'PUT', body: payload });
      applyCompanyData(company);
      closeStoreModal();
      notify('Store information updated successfully', 'success');
    } catch (err) {
      notify(err.message || 'Failed to update store information', 'error');
    }
  });

  // ===============================
  // LOGO SELECT
  // ===============================
  logoBtn.addEventListener('click', () => logoInput.click());

  logoInput.addEventListener('change', async () => {
    const file = logoInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await api.request('/api/company/logo', { method: 'POST', body: formData });
      storeData.logoUrl = data.logoUrl;
      renderStore();
      notify('Logo updated successfully', 'success');
    } catch (err) {
      notify(err.message || 'Failed to upload logo', 'error');
    } finally {
      logoInput.value = '';
    }
  });
});
