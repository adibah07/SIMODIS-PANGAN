/**
 * SIMODIS-Pangan - Pengaturan Controller JS
 * Controls user profile updates, system settings configuration, and local storage database reset.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSettingsData();
});

// Load and fill profile and app settings forms
function loadSettingsData() {
    const user = DB.getCurrentUser();
    const settings = DB.getSettings();

    if (user) {
        // Pre-fill profile form
        document.getElementById('profile-name-input').value = user.nama;
        document.getElementById('profile-email-input').value = user.email;
        document.getElementById('profile-password-input').value = '';

        // Update left card details
        document.getElementById('settings-profile-name').innerText = user.nama;
        document.getElementById('settings-profile-email').innerText = user.email;

        // Initials avatar
        const initials = user.nama.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        document.getElementById('settings-avatar').innerText = initials;
    }

    if (settings) {
        // Pre-fill app settings form
        document.getElementById('app-name-input').value = settings.appName;
        document.getElementById('app-org-input').value = settings.organization;
    }
}

// Save profile updates
function saveProfileSettings(event) {
    event.preventDefault();

    const userSession = DB.getCurrentUser();
    const newName = document.getElementById('profile-name-input').value.trim();
    const newEmail = document.getElementById('profile-email-input').value.trim();
    const newPassword = document.getElementById('profile-password-input').value;

    if (!newName || !newEmail) {
        Toast.show('Formulir Tidak Valid', 'Nama dan Email wajib diisi.', 'warning');
        return;
    }

    // Load users list
    const users = DB.get(DB_KEY_USERS);
    const userIndex = users.findIndex(u => u.id === userSession.id);

    if (userIndex !== -1) {
        // Update user values
        users[userIndex].nama = newName;
        users[userIndex].email = newEmail;
        
        // If password was input, update it
        if (newPassword) {
            users[userIndex].password = newPassword;
        }

        // Save users list
        DB.set(DB_KEY_USERS, users);

        // Update current session storage
        DB.setCurrentUser({
            id: userSession.id,
            nama: newName,
            email: newEmail
        });

        Toast.show('Profil Disimpan', 'Profil pengguna berhasil diperbarui.', 'success');
        
        // Reload page elements
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        Toast.show('Gagal Menyimpan', 'Pengguna tidak ditemukan di basis data.', 'error');
    }
}

// Save app parameters
function saveAppSettings(event) {
    event.preventDefault();

    const newAppName = document.getElementById('app-name-input').value.trim();
    const newOrg = document.getElementById('app-org-input').value.trim();

    if (!newAppName || !newOrg) {
        Toast.show('Formulir Tidak Valid', 'Nama Aplikasi dan Instansi wajib diisi.', 'warning');
        return;
    }

    const currentSettings = DB.getSettings();
    const updatedSettings = {
        ...currentSettings,
        appName: newAppName,
        organization: newOrg
    };

    DB.updateSettings(updatedSettings);
    Toast.show('Pengaturan Disimpan', 'Pengaturan aplikasi berhasil disimpan.', 'success');

    // Reload page elements to reflect name change in sidebar header
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Reset localStorage DB to default values
function resetDatabase() {
    ConfirmDelete.show(
        'Setel Ulang Basis Data?',
        'PERINGATAN: Seluruh data wilayah, gudang, titik distribusi, dan logistik pangan yang telah Anda masukkan akan dihapus permanen dan diganti dengan data dummy default. Lanjutkan?',
        () => {
            // Clear all SIMODIS keys
            localStorage.removeItem(DB_KEY_WILAYAH);
            localStorage.removeItem(DB_KEY_GUDANG);
            localStorage.removeItem(DB_KEY_TITIK);
            localStorage.removeItem(DB_KEY_DISTRIBUSI);
            localStorage.removeItem(DB_KEY_SETTINGS);
            localStorage.removeItem(DB_KEY_USERS);

            // Re-initialize databases
            initDatabase();

            Toast.show('Data Disetel Ulang', 'Seluruh basis data berhasil dikembalikan ke setelan awal dummy.', 'success', 3000);

            // Reload page
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        }
    );
}
