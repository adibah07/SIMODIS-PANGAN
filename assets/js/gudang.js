/**
 * SIMODIS-Pangan - Gudang Controller JS
 * Handles local CRUD operations, search, pagination, relations, and integrity constraint validation.
 */

// Pagination state variables
let currentPage = 1;
let pageSize = 10;
let filteredData = [];
let originalData = [];
let listWilayah = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    populateWilayahDropdown();
});

// Load Gudang data
function loadData() {
    originalData = DB.get(DB_KEY_GUDANG);
    listWilayah = DB.get(DB_KEY_WILAYAH);
    filteredData = [...originalData];
    currentPage = 1;
    renderTable();
}

// Populate Wilayah dropdown in Form
function populateWilayahDropdown() {
    const dropdown = document.getElementById('select-wilayah');
    if (!dropdown) return;

    const wilayahs = DB.get(DB_KEY_WILAYAH);
    let html = '<option value="">-- Pilih Wilayah --</option>';
    
    wilayahs.forEach(w => {
        html += `<option value="${w.id}">${w.nama_wilayah}</option>`;
    });

    dropdown.innerHTML = html;
}

// Render Gudang rows
function renderTable() {
    const tbody = document.getElementById('gudang-table-body');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada data gudang ditemukan</td></tr>`;
        updatePaginationFooter(0, 0, 0);
        return;
    }

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
        const regionName = DB.getWilayahName(item.id_wilayah);
        
        // Sum total stocks (Minyak Liter / 1000 to convert to Ton equivalent)
        const totalStok = (item.stok_beras || 0) + (item.stok_gula || 0) + ((item.stok_minyak || 0) / 1000) + (item.stok_tepung || 0);

        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted);">${rowNumber}</td>
                <td style="font-weight: 600; color: var(--text-main);">${item.nama_gudang}</td>
                <td><span class="badge badge-info"><i class="fas fa-map-marker-alt"></i> ${regionName}</span></td>
                <td>${item.lokasi}</td>
                <td style="font-weight: 500;">${item.kapasitas} Ton</td>
                <td>
                    <span style="font-weight: 600; color: ${totalStok < 30 ? 'var(--danger)' : 'var(--text-main)'};">
                        ${totalStok} Ton
                    </span>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                        B: ${item.stok_beras}T | G: ${item.stok_gula}T | M: ${item.stok_minyak}L | T: ${item.stok_tepung}T
                    </div>
                </td>
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

// Handle page size change
function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size-select').value);
    currentPage = 1;
    renderTable();
}

// Navigate to page
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
        filteredData = originalData.filter(item => {
            const regionName = DB.getWilayahName(item.id_wilayah).toLowerCase();
            return item.nama_gudang.toLowerCase().includes(query) ||
                   item.lokasi.toLowerCase().includes(query) ||
                   regionName.includes(query);
        });
    }
    currentPage = 1;
    renderTable();
}

// Open modal for adding
function openAddModal() {
    const listWil = DB.get(DB_KEY_WILAYAH);
    if (listWil.length === 0) {
        Toast.show('Prasyarat Gagal', 'Data wilayah kosong! Silakan isi wilayah terlebih dahulu sebelum menambah gudang.', 'warning', 4000);
        return;
    }

    document.getElementById('gudang-id').value = '';
    document.getElementById('gudang-form').reset();
    populateWilayahDropdown(); // Refresh dropdown list
    document.getElementById('modal-title-text').innerText = 'Tambah Data Gudang';
    document.getElementById('gudang-modal').classList.add('show');
}

// Open modal for editing
function openEditModal(id) {
    const item = originalData.find(g => g.id === id);
    if (!item) return;

    populateWilayahDropdown();

    document.getElementById('gudang-id').value = item.id;
    document.getElementById('input-nama').value = item.nama_gudang;
    document.getElementById('select-wilayah').value = item.id_wilayah;
    document.getElementById('input-kapasitas').value = item.kapasitas;
    document.getElementById('input-lokasi').value = item.lokasi;
    
    // Stocks values
    document.getElementById('input-stok-beras').value = item.stok_beras || 0;
    document.getElementById('input-stok-gula').value = item.stok_gula || 0;
    document.getElementById('input-stok-minyak').value = item.stok_minyak || 0;
    document.getElementById('input-stok-tepung').value = item.stok_tepung || 0;

    document.getElementById('modal-title-text').innerText = 'Ubah Data Gudang';
    document.getElementById('gudang-modal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('gudang-modal').classList.remove('show');
}

// Save form data (Add / Update)
function saveData(event) {
    event.preventDefault();

    const idVal = document.getElementById('gudang-id').value;
    const namaVal = document.getElementById('input-nama').value.trim();
    const wilayahVal = parseInt(document.getElementById('select-wilayah').value);
    const kapasitasVal = parseInt(document.getElementById('input-kapasitas').value);
    const lokasiVal = document.getElementById('input-lokasi').value.trim();
    
    // Stocks
    const berasVal = parseInt(document.getElementById('input-stok-beras').value) || 0;
    const gulaVal = parseInt(document.getElementById('input-stok-gula').value) || 0;
    const minyakVal = parseInt(document.getElementById('input-stok-minyak').value) || 0;
    const tepungVal = parseInt(document.getElementById('input-stok-tepung').value) || 0;

    if (!namaVal || isNaN(wilayahVal) || isNaN(kapasitasVal) || !lokasiVal) {
        Toast.show('Formulir Tidak Valid', 'Mohon isi semua kolom bertanda wajib.', 'warning');
        return;
    }

    // Capacity limits check
    const totalStok = berasVal + gulaVal + (minyakVal / 1000) + tepungVal;
    if (totalStok > kapasitasVal) {
        Toast.show('Kelebihan Kapasitas', `Gagal menyimpan! Total stok komoditas (${totalStok} Ton) melebihi kapasitas gudang (${kapasitasVal} Ton).`, 'error', 4000);
        return;
    }

    if (idVal) {
        // UPDATE MODE
        const id = parseInt(idVal);
        const index = originalData.findIndex(g => g.id === id);
        if (index !== -1) {
            originalData[index] = {
                ...originalData[index],
                nama_gudang: namaVal,
                id_wilayah: wilayahVal,
                kapasitas: kapasitasVal,
                lokasi: lokasiVal,
                stok_beras: berasVal,
                stok_gula: gulaVal,
                stok_minyak: minyakVal,
                stok_tepung: tepungVal
            };
            DB.set(DB_KEY_GUDANG, originalData);
            Toast.show('Data Disimpan', `Gudang "${namaVal}" berhasil diperbarui.`, 'success');
        }
    } else {
        // ADD MODE
        const newId = originalData.length > 0 ? Math.max(...originalData.map(g => g.id)) + 1 : 1;
        const newGudang = {
            id: newId,
            nama_gudang: namaVal,
            id_wilayah: wilayahVal,
            kapasitas: kapasitasVal,
            lokasi: lokasiVal,
            stok_beras: berasVal,
            stok_gula: gulaVal,
            stok_minyak: minyakVal,
            stok_tepung: tepungVal
        };
        originalData.push(newGudang);
        DB.set(DB_KEY_GUDANG, originalData);
        Toast.show('Data Disimpan', `Gudang "${namaVal}" berhasil ditambahkan.`, 'success');
    }

    closeModal();
    loadData();
}

// Delete Gudang with integrity constraint check
function deleteData(id) {
    const item = originalData.find(g => g.id === id);
    if (!item) return;

    // Integrity constraint checks
    // 1. Check in Titik Distribusi
    const listTitik = DB.get(DB_KEY_TITIK);
    const linkedTitik = listTitik.filter(t => t.id_gudang == id);

    // 2. Check in Distribusi Pangan Log
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);
    const linkedDist = listDistribusi.filter(d => d.id_gudang == id);

    if (linkedTitik.length > 0 || linkedDist.length > 0) {
        let msg = `Gudang "${item.nama_gudang}" tidak dapat dihapus karena masih digunakan oleh:\n`;
        if (linkedTitik.length > 0) msg += `- ${linkedTitik.length} Titik Distribusi\n`;
        if (linkedDist.length > 0) msg += `- ${linkedDist.length} Kegiatan Logistik Pangan\n`;
        msg += 'Silakan hapus relasi terkait terlebih dahulu.';

        Toast.show('Gagal Hapus', msg, 'error', 5000);
        return;
    }

    ConfirmDelete.show(
        'Hapus Gudang?',
        `Apakah Anda yakin ingin menghapus gudang "${item.nama_gudang}"?`,
        () => {
            const index = originalData.findIndex(g => g.id === id);
            if (index !== -1) {
                originalData.splice(index, 1);
                DB.set(DB_KEY_GUDANG, originalData);
                Toast.show('Terhapus', `Gudang "${item.nama_gudang}" berhasil dihapus.`, 'success');
                loadData();
            }
        }
    );
}
