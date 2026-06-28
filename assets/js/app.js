/**
 * SIMODIS-Pangan - Core Application JS
 * Handles Database initialization, Shared UI Layout Injection,
 * Auth Guards, Notifications, and Modal Controls.
 */

// Global DB Structure Key
const DB_KEY_USERS = 'simodis_users';
const DB_KEY_WILAYAH = 'simodis_wilayah';
const DB_KEY_GUDANG = 'simodis_gudang';
const DB_KEY_TITIK = 'simodis_titik';
const DB_KEY_DISTRIBUSI = 'simodis_distribusi';
const DB_KEY_SETTINGS = 'simodis_settings';
const DB_KEY_SESSION = 'simodis_session';

// Initialize Database if Empty
function initDatabase() {
    // 1. Initial Admin User
    if (!localStorage.getItem(DB_KEY_USERS)) {
        const defaultUsers = [
            {
                id: 1,
                nama: "Adibah Sholihah",
                email: "admin@simodis.id",
                password: "admin"
            }
        ];
        localStorage.setItem(DB_KEY_USERS, JSON.stringify(defaultUsers));
    }

    // 2. Initial Settings
    if (!localStorage.getItem(DB_KEY_SETTINGS)) {
        const defaultSettings = {
            appName: "SIMODIS-Pangan Terpadu",
            organization: "Dinas Ketahanan Pangan Kabupaten",
            regionName: "Wilayah Terpencil & Terluar",
            appVersion: "1.0.0"
        };
        localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(defaultSettings));
    }

    // 3. Initial Wilayah (Region) Data
    if (!localStorage.getItem(DB_KEY_WILAYAH)) {
        const defaultWilayah = [
            { id: 1, nama_wilayah: "Kota Depok", provinsi: "Jawa Barat", jumlah_kecamatan: 11, koordinat: "-6.4025, 106.7942", keterangan: "Wilayah administratif utama" },
            { id: 2, nama_wilayah: "Kecamatan Beji", provinsi: "Jawa Barat", jumlah_kecamatan: 3, koordinat: "-6.3725, 106.8142", keterangan: "Cakupan daerah penyangga utara" },
            { id: 3, nama_wilayah: "Kecamatan Sukmajaya", provinsi: "Jawa Barat", jumlah_kecamatan: 4, koordinat: "-6.3980, 106.8450", keterangan: "Kepadatan penduduk sedang" },
            { id: 4, nama_wilayah: "Kecamatan Cimanggis", provinsi: "Jawa Barat", jumlah_kecamatan: 5, koordinat: "-6.3685, 106.8720", keterangan: "Daerah perbatasan industri" },
            { id: 5, nama_wilayah: "Kecamatan Cilodong", provinsi: "Jawa Barat", jumlah_kecamatan: 3, koordinat: "-6.4250, 106.8400", keterangan: "Penyangga logistik pangan timur" },
            { id: 6, nama_wilayah: "Kecamatan Tapos", provinsi: "Jawa Barat", jumlah_kecamatan: 5, koordinat: "-6.4150, 106.8900", keterangan: "Wilayah terluar berbukit" }
        ];
        localStorage.setItem(DB_KEY_WILAYAH, JSON.stringify(defaultWilayah));
    }

    // 4. Initial Gudang (Warehouse) Data with commodity stocks (Beras, Gula in Ton, Minyak in Liter, Tepung in Ton)
    if (!localStorage.getItem(DB_KEY_GUDANG)) {
        const defaultGudang = [
            { id: 1, nama_gudang: "Gudang Sukmajaya", lokasi: "Jl. Proklamasi No.15", kapasitas: 200, stok_beras: 120, stok_gula: 15, stok_minyak: 2000, stok_tepung: 18, id_wilayah: 3 },
            { id: 2, nama_gudang: "Gudang Beji", lokasi: "Jl. Nusantara No.88", kapasitas: 100, stok_beras: 20, stok_gula: 8, stok_minyak: 1200, stok_tepung: 10, id_wilayah: 2 },
            { id: 3, nama_gudang: "Gudang Cimanggis", lokasi: "Jl. Raya Bogor KM.32", kapasitas: 150, stok_beras: 60, stok_gula: 10, stok_minyak: 1500, stok_tepung: 12, id_wilayah: 4 },
            { id: 4, nama_gudang: "Gudang Cilodong", lokasi: "Jl. Markas TNI No.5", kapasitas: 180, stok_beras: 80, stok_gula: 12, stok_minyak: 1800, stok_tepung: 14, id_wilayah: 5 },
            { id: 5, nama_gudang: "Gudang Tapos", lokasi: "Jl. Kramat Raya No.3", kapasitas: 100, stok_beras: 30, stok_gula: 6, stok_minyak: 900, stok_tepung: 8, id_wilayah: 6 }
        ];
        localStorage.setItem(DB_KEY_GUDANG, JSON.stringify(defaultGudang));
    }

    // 5. Initial Titik Distribusi Data
    if (!localStorage.getItem(DB_KEY_TITIK)) {
        const defaultTitik = [
            { id: 1, nama_titik: "Kel. Abadijaya", lokasi: "Kantor Kelurahan Abadijaya", id_wilayah: 3, id_gudang: 1 },
            { id: 2, nama_titik: "Kel. Mekarjaya", lokasi: "Pos Pangan Mekarjaya", id_wilayah: 3, id_gudang: 1 },
            { id: 3, nama_titik: "Kel. Kemiri Muka", lokasi: "Balai Desa Kemiri Muka", id_wilayah: 2, id_gudang: 2 },
            { id: 4, nama_titik: "Kel. Cisalak", lokasi: "Gedung RW 04 Cisalak", id_wilayah: 4, id_gudang: 3 },
            { id: 5, nama_titik: "Kel. Tapos", lokasi: "Posko Relawan Tapos", id_wilayah: 6, id_gudang: 5 }
        ];
        localStorage.setItem(DB_KEY_TITIK, JSON.stringify(defaultTitik));
    }

    // 6. Initial Distribusi Pangan Data
    if (!localStorage.getItem(DB_KEY_DISTRIBUSI)) {
        const defaultDistribusi = [
            { id: 1, tanggal: "2026-05-12", id_gudang: 2, id_titik: 2, jenis_pangan: "Beras", jumlah: 2000, status: "Terkirim" },
            { id: 2, tanggal: "2026-05-12", id_gudang: 1, id_titik: 1, jenis_pangan: "Gula", jumlah: 1000, status: "Dalam Perjalanan" },
            { id: 3, tanggal: "2026-05-11", id_gudang: 2, id_titik: 3, jenis_pangan: "Minyak Goreng", jumlah: 500, status: "Terkirim" },
            { id: 4, tanggal: "2026-05-10", id_gudang: 3, id_titik: 4, jenis_pangan: "Tepung", jumlah: 800, status: "Terlambat" },
            { id: 5, tanggal: "2026-06-02", id_gudang: 4, id_titik: 4, jenis_pangan: "Beras", jumlah: 1500, status: "Terkirim" },
            { id: 6, tanggal: "2026-06-15", id_gudang: 5, id_titik: 5, jenis_pangan: "Beras", jumlah: 1200, status: "Dalam Perjalanan" },
            { id: 7, tanggal: "2026-06-20", id_gudang: 1, id_titik: 2, jenis_pangan: "Minyak Goreng", jumlah: 800, status: "Terkirim" },
            { id: 8, tanggal: "2026-06-22", id_gudang: 3, id_titik: 4, jenis_pangan: "Gula", jumlah: 400, status: "Dalam Perjalanan" }
        ];
        localStorage.setItem(DB_KEY_DISTRIBUSI, JSON.stringify(defaultDistribusi));
    }
}

// Call database initializer
initDatabase();

// Database Access helpers
const DB = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    
    // Auth helpers
    getCurrentUser: () => JSON.parse(localStorage.getItem(DB_KEY_SESSION)),
    setCurrentUser: (user) => localStorage.setItem(DB_KEY_SESSION, JSON.stringify(user)),
    logout: () => {
        localStorage.removeItem(DB_KEY_SESSION);
        window.location.href = "index.html";
    },
    
    // Setting helpers
    getSettings: () => JSON.parse(localStorage.getItem(DB_KEY_SETTINGS)),
    updateSettings: (settings) => localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(settings)),

    // Relations Resolver Helpers
    getWilayahName: (id) => {
        const list = DB.get(DB_KEY_WILAYAH);
        const item = list.find(w => w.id == id);
        return item ? item.nama_wilayah : '-';
    },
    getGudangName: (id) => {
        const list = DB.get(DB_KEY_GUDANG);
        const item = list.find(g => g.id == id);
        return item ? item.nama_gudang : '-';
    },
    getTitikName: (id) => {
        const list = DB.get(DB_KEY_TITIK);
        const item = list.find(t => t.id == id);
        return item ? item.nama_titik : '-';
    }
};

// Auth Guard Check
function checkAuth() {
    const user = DB.getCurrentUser();
    const isLoginPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') || 
                        window.location.pathname === '';
    
    if (!user && !isLoginPage) {
        // Redirect to login if accessing app page unauthorized
        window.location.href = "index.html";
    } else if (user && isLoginPage) {
        // Redirect to dashboard if logged-in user visits login page
        window.location.href = "dashboard.html";
    }
}
checkAuth();

// Shared UI Injection
document.addEventListener('DOMContentLoaded', () => {
    injectSidebar();
    injectHeader();
    setupDropdowns();
    setupSidebarToggle();
});

// Inject left sidebar
function injectSidebar() {
    const placeholder = document.getElementById('sidebar-placeholder');
    if (!placeholder) return;
    
    const settings = DB.getSettings();
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const menuItems = [
        { file: 'dashboard.html', icon: 'fas fa-chart-line', label: 'Dashboard' },
        { file: 'wilayah.html', icon: 'fas fa-map-marked-alt', label: 'Data Wilayah' },
        { file: 'gudang.html', icon: 'fas fa-warehouse', label: 'Data Gudang' },
        { file: 'titik-distribusi.html', icon: 'fas fa-map-pin', label: 'Titik Distribusi' },
        { file: 'distribusi.html', icon: 'fas fa-truck-loading', label: 'Distribusi Pangan' },
        { file: 'laporan.html', icon: 'fas fa-file-invoice', label: 'Laporan' },
        { file: 'pengaturan.html', icon: 'fas fa-sliders-h', label: 'Pengaturan' }
    ];

    let menuHTML = '';
    menuItems.forEach(item => {
        const isActive = currentPath === item.file ? 'active' : '';
        menuHTML += `
            <li class="menu-item ${isActive}">
                <a href="${item.file}">
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    });

    const user = DB.getCurrentUser() || { nama: "Administrator" };

    placeholder.outerHTML = `
        <aside class="sidebar" id="app-sidebar">
            <div>
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <i class="fas fa-shipping-fast" style="color: var(--primary-accent); font-size: 1.25rem;"></i>
                    </div>
                    <div>
                        <h1 class="sidebar-title">${settings.appName.split(' ')[0]}</h1>
                        <p class="sidebar-subtitle">Monitoring Pangan</p>
                    </div>
                </div>
                <ul class="sidebar-menu">
                    ${menuHTML}
                </ul>
            </div>
            <div class="sidebar-footer">
                <button type="button" class="logout-btn" onclick="DB.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    `;
}

// Inject Header Bar
function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    const user = DB.getCurrentUser() || { nama: "Admin", email: "admin@simodis.id" };
    const nameInitials = user.nama ? user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';

    // Mock Notifications List
    const notifications = [
        { type: 'danger', title: 'Stok Beji Menipis', desc: 'Stok beras Gudang Beji tersisa 20 Ton.', time: '10 menit yang lalu' },
        { type: 'warning', title: 'Distribusi Terlambat', desc: 'Pengiriman ke Kel. Mekarjaya terlambat 1 hari.', time: '1 jam yang lalu' },
        { type: 'info', title: 'Kapasitas Gudang', desc: 'Gudang Tapos hampir penuh (90% kapasitas).', time: '2 jam yang lalu' }
    ];

    let notifHTML = '';
    notifications.forEach(n => {
        let iconClass = 'fas fa-exclamation-circle';
        if (n.type === 'danger') iconClass = 'fas fa-exclamation-triangle';
        if (n.type === 'info') iconClass = 'fas fa-info-circle';
        
        notifHTML += `
            <div class="dropdown-item ${n.type}">
                <i class="${iconClass}"></i>
                <div class="notification-content">
                    <p class="notification-title">${n.title}</p>
                    <p class="notification-desc">${n.desc}</p>
                    <p class="notification-time">${n.time}</p>
                </div>
            </div>
        `;
    });

    placeholder.outerHTML = `
        <header class="main-header">
            <div class="header-left">
                <button class="sidebar-toggle" id="toggle-btn" aria-label="Toggle Sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="header-search">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-input" id="global-search" placeholder="Cari data cepat..." onkeyup="handleGlobalSearch(event)">
                </div>
            </div>
            
            <div class="header-right">
                <!-- Notifications Dropdown -->
                <div class="dropdown-container">
                    <button class="header-action-btn" id="notif-dropdown-btn">
                        <i class="fas fa-bell"></i>
                        <span class="badge-dot"></span>
                    </button>
                    <div class="dropdown-panel" id="notif-dropdown-panel">
                        <div class="dropdown-header">
                            <h4>Notifikasi Baru</h4>
                        </div>
                        <div class="dropdown-list">
                            ${notifHTML}
                        </div>
                        <div class="dropdown-footer">
                            <a href="#" onclick="showAllAlerts()">Tandai Semua Dibaca</a>
                        </div>
                    </div>
                </div>

                <!-- User Dropdown -->
                <div class="dropdown-container">
                    <div class="user-profile-menu" id="profile-dropdown-btn">
                        <div class="profile-avatar">${nameInitials}</div>
                        <div class="profile-info">
                            <span class="profile-name">${user.nama}</span>
                            <span class="profile-role">Senior Admin</span>
                        </div>
                        <i class="fas fa-chevron-down" style="font-size: 0.75rem; color: var(--text-muted);"></i>
                    </div>
                    <div class="dropdown-panel" id="profile-dropdown-panel">
                        <div class="dropdown-header">
                            <h4>Akun Admin</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</p>
                        </div>
                        <div class="dropdown-list">
                            <a href="pengaturan.html" class="dropdown-item">
                                <i class="fas fa-user-cog" style="color: var(--primary-light);"></i>
                                <span>Profil Pengaturan</span>
                            </a>
                            <a href="#" class="dropdown-item" onclick="DB.logout()">
                                <i class="fas fa-sign-out-alt" style="color: var(--danger);"></i>
                                <span>Keluar Sistem</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Dropdown click handlers
function setupDropdowns() {
    const notifBtn = document.getElementById('notif-dropdown-btn');
    const notifPanel = document.getElementById('notif-dropdown-panel');
    const profileBtn = document.getElementById('profile-dropdown-btn');
    const profilePanel = document.getElementById('profile-dropdown-panel');

    if (notifBtn && notifPanel) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPanel.classList.toggle('show');
            if (profilePanel) profilePanel.classList.remove('show');
        });
    }

    if (profileBtn && profilePanel) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profilePanel.classList.toggle('show');
            if (notifPanel) notifPanel.classList.remove('show');
        });
    }

    // Close on click outside
    document.addEventListener('click', () => {
        if (notifPanel) notifPanel.classList.remove('show');
        if (profilePanel) profilePanel.classList.remove('show');
    });
}

// Sidebar toggle on mobile
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggle-btn');
    const appContainer = document.querySelector('.app-container');
    const sidebar = document.getElementById('app-sidebar');

    if (toggleBtn && sidebar && appContainer) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
}

// Global search simulation
function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase().trim();
        if (query) {
            Toast.show('Pencarian', `Mencari "${query}" di seluruh modul...`, 'info');
            // Check if page can handle search internally, or dispatch custom event
            const localSearchInput = document.getElementById('local-search-input');
            if (localSearchInput) {
                localSearchInput.value = query;
                localSearchInput.dispatchEvent(new Event('keyup'));
            }
        }
    }
}

// Show alerts warning
function showAllAlerts() {
    Toast.show('Notifikasi', 'Semua notifikasi telah dibaca.', 'success');
    const dot = document.querySelector('.badge-dot');
    if (dot) dot.style.display = 'none';
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
const Toast = {
    show: (title, message, type = 'success', duration = 3000) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fas fa-check-circle';
        if (type === 'error') icon = 'fas fa-exclamation-circle';
        if (type === 'warning') icon = 'fas fa-exclamation-triangle';
        if (type === 'info') icon = 'fas fa-info-circle';

        toast.innerHTML = `
            <i class="toast-icon ${icon}"></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // Progress bar animation
        const progressBar = toast.querySelector('.toast-progress');
        progressBar.style.transition = `width ${duration}ms linear`;
        // Force reflow
        progressBar.getBoundingClientRect();
        progressBar.style.width = '0%';

        // Auto remove
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.style.animation = 'fadeOut 0.3s ease forwards';
                toast.addEventListener('animationend', () => toast.remove());
            }
        }, duration);
    }
};

// ==========================================
// DELETE CONFIRMATION SYSTEM
// ==========================================
const ConfirmDelete = {
    show: (title, message, onConfirm) => {
        // Create confirmation modal structure if not exists
        let overlay = document.getElementById('confirm-delete-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'confirm-delete-overlay';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-card" style="max-width: 400px;">
                    <div class="modal-header" style="background-color: rgba(239, 68, 68, 0.05); border-bottom-color: rgba(239, 68, 68, 0.1);">
                        <h3 class="modal-title" style="color: var(--danger);">Konfirmasi Hapus</h3>
                        <button class="modal-close" id="confirm-delete-close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem 1.25rem;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 1.75rem; color: var(--danger);"></i>
                            <div>
                                <h4 id="confirm-delete-title" style="margin-bottom: 6px; font-weight: 600;">Hapus Data?</h4>
                                <p id="confirm-delete-msg" style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 1rem 1.25rem; background-color: #fafafa;">
                        <button class="btn btn-secondary" id="confirm-delete-cancel-btn" style="padding: 8px 16px; font-size: 0.85rem;">Batal</button>
                        <button class="btn btn-danger" id="confirm-delete-confirm-btn" style="padding: 8px 16px; font-size: 0.85rem;">Hapus Data</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Set labels
        document.getElementById('confirm-delete-title').innerText = title;
        document.getElementById('confirm-delete-msg').innerText = message;

        // Overlay visibility
        overlay.classList.add('show');

        // Handlers
        const closeBtn = document.getElementById('confirm-delete-close-btn');
        const cancelBtn = document.getElementById('confirm-delete-cancel-btn');
        const confirmBtn = document.getElementById('confirm-delete-confirm-btn');

        const closeConfirmModal = () => {
            overlay.classList.remove('show');
        };

        closeBtn.onclick = closeConfirmModal;
        cancelBtn.onclick = closeConfirmModal;
        
        confirmBtn.onclick = () => {
            closeConfirmModal();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        };
    }
};
