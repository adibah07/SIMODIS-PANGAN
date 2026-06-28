/**
 * SIMODIS-Pangan - Wilayah Controller JS
 * Handles local CRUD operations, search, pagination, and integrity constraints.
 */

// Pagination state variables
let currentPage = 1;
let pageSize = 10;
let filteredData = [];
let originalData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// Load all Wilayah items from DB
function loadData() {
    originalData = DB.get(DB_KEY_WILAYAH);
    filteredData = [...originalData];
    currentPage = 1;
    renderTable();
}

// Render dynamic table rows
function renderTable() {
    const tbody = document.getElementById('wilayah-table-body');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada data wilayah ditemukan</td></tr>`;
        updatePaginationFooter(0, 0, 0);
        return;
    }

    // Pagination calculations
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    const pageItems = filteredData.slice(startIndex, endIndex);

    let html = '';
    pageItems.forEach((item, index) => {
        const rowNumber = startIndex + index + 1;
        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted);">${rowNumber}</td>
                <td style="font-weight: 600; color: var(--text-main);">${item.nama_wilayah}</td>
                <td>${item.provinsi}</td>
                <td>${item.jumlah_kecamatan} Kelurahan</td>
                <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${item.koordinat}</td>
                <td>${item.keterangan || '-'}</td>
                <td style="text-align: center;">
                    <div class="table-actions" style="justify-content: center;">
                        <button type="button" class="action-btn action-edit" onclick="openEditModal(${item.id})" title="Ubah Data">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="action-btn action-delete" onclick="deleteData(${item.id})" title="Hapus Data">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updatePaginationFooter(startIndex + 1, endIndex, totalItems);
    renderPaginationButtons(totalPages);
}

// Update text in pagination footer
function updatePaginationFooter(start, end, total) {
    const textEl = document.getElementById('pagination-info-text');
    if (!textEl) return;
    if (total === 0) {
        textEl.innerText = 'Menampilkan 0 data';
    } else {
        textEl.innerText = `Menampilkan ${start}-${end} dari ${total} data`;
    }
}

// Render dynamic pagination buttons
function renderPaginationButtons(totalPages) {
    const container = document.getElementById('pagination-buttons');
    if (!container) return;

    let html = '';
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<button class="page-link ${prevDisabled}" onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="page-link ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    html += `<button class="page-link ${nextDisabled}" onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
}

// Handle page size dropdown change
function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size-select').value);
    currentPage = 1;
    renderTable();
}

// Navigate to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}

// Search filtration
function handleSearch() {
    const query = document.getElementById('local-search-input').value.toLowerCase().trim();
    if (query === '') {
        filteredData = [...originalData];
    } else {
        filteredData = originalData.filter(item => 
            item.nama_wilayah.toLowerCase().includes(query) ||
            item.provinsi.toLowerCase().includes(query) ||
            (item.keterangan && item.keterangan.toLowerCase().includes(query))
        );
    }
    currentPage = 1;
    renderTable();
}

// Open modal for adding new record
function openAddModal() {
    document.getElementById('wilayah-id').value = '';
    document.getElementById('wilayah-form').reset();
    document.getElementById('modal-title-text').innerText = 'Tambah Data Wilayah';
    document.getElementById('wilayah-modal').classList.add('show');
}

// Open modal for editing existing record
function openEditModal(id) {
    const item = originalData.find(w => w.id === id);
    if (!item) return;

    document.getElementById('wilayah-id').value = item.id;
    document.getElementById('input-nama').value = item.nama_wilayah;
    document.getElementById('input-provinsi').value = item.provinsi;
    document.getElementById('input-kecamatan').value = item.jumlah_kecamatan;
    document.getElementById('input-koordinat').value = item.koordinat;
    document.getElementById('input-keterangan').value = item.keterangan || '';
    
    document.getElementById('modal-title-text').innerText = 'Ubah Data Wilayah';
    document.getElementById('wilayah-modal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('wilayah-modal').classList.remove('show');
}

// Save form data (Add / Update)
function saveData(event) {
    event.preventDefault();

    const idVal = document.getElementById('wilayah-id').value;
    const namaVal = document.getElementById('input-nama').value.trim();
    const provinsiVal = document.getElementById('input-provinsi').value.trim();
    const kecamatanVal = parseInt(document.getElementById('input-kecamatan').value);
    const koordinatVal = document.getElementById('input-koordinat').value.trim();
    const keteranganVal = document.getElementById('input-keterangan').value.trim();

    // Input Validation
    if (!namaVal || !provinsiVal || !koordinatVal || isNaN(kecamatanVal)) {
        Toast.show('Formulir Tidak Valid', 'Mohon isi semua kolom bertanda wajib.', 'warning');
        return;
    }

    if (idVal) {
        // UPDATE MODE
        const id = parseInt(idVal);
        const index = originalData.findIndex(w => w.id === id);
        if (index !== -1) {
            originalData[index] = {
                ...originalData[index],
                nama_wilayah: namaVal,
                provinsi: provinsiVal,
                jumlah_kecamatan: kecamatanVal,
                koordinat: koordinatVal,
                keterangan: keteranganVal
            };
            DB.set(DB_KEY_WILAYAH, originalData);
            Toast.show('Data Disimpan', `Data wilayah "${namaVal}" berhasil diperbarui.`, 'success');
        }
    } else {
        // ADD MODE
        const newId = originalData.length > 0 ? Math.max(...originalData.map(w => w.id)) + 1 : 1;
        const newWilayah = {
            id: newId,
            nama_wilayah: namaVal,
            provinsi: provinsiVal,
            jumlah_kecamatan: kecamatanVal,
            koordinat: koordinatVal,
            keterangan: keteranganVal
        };
        originalData.push(newWilayah);
        DB.set(DB_KEY_WILAYAH, originalData);
        Toast.show('Data Disimpan', `Wilayah "${namaVal}" berhasil ditambahkan.`, 'success');
    }

    closeModal();
    loadData();
}

// Delete Record with integrity checks
function deleteData(id) {
    const item = originalData.find(w => w.id === id);
    if (!item) return;

    // Integrity constraint check: Check if Wilayah has dependent Warehouses
    const listGudang = DB.get(DB_KEY_GUDANG);
    const linkedGudang = listGudang.filter(g => g.id_wilayah == id);

    // Check if Wilayah has dependent Distribution Points
    const listTitik = DB.get(DB_KEY_TITIK);
    const linkedTitik = listTitik.filter(t => t.id_wilayah == id);

    if (linkedGudang.length > 0 || linkedTitik.length > 0) {
        let msg = `Wilayah "${item.nama_wilayah}" tidak dapat dihapus karena masih digunakan oleh:\n`;
        if (linkedGudang.length > 0) msg += `- ${linkedGudang.length} data Gudang\n`;
        if (linkedTitik.length > 0) msg += `- ${linkedTitik.length} data Titik Distribusi\n`;
        msg += 'Silakan hapus relasi terkait terlebih dahulu.';
        
        Toast.show('Gagal Hapus', msg, 'error', 5000);
        return;
    }

    ConfirmDelete.show(
        'Hapus Wilayah?',
        `Apakah Anda yakin ingin menghapus wilayah "${item.nama_wilayah}"?`,
        () => {
            const index = originalData.findIndex(w => w.id === id);
            if (index !== -1) {
                originalData.splice(index, 1);
                DB.set(DB_KEY_WILAYAH, originalData);
                Toast.show('Terhapus', `Data wilayah "${item.nama_wilayah}" berhasil dihapus.`, 'success');
                loadData();
            }
        }
    );
}
