/**
 * SIMODIS-Pangan - Titik Distribusi Controller JS
 * Handles local CRUD operations, search, pagination, and relations.
 */

// Pagination state variables
let currentPage = 1;
let pageSize = 10;
let filteredData = [];
let originalData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    populateDropdowns();
});

// Load Titik Distribusi data
function loadData() {
    originalData = DB.get(DB_KEY_TITIK);
    filteredData = [...originalData];
    currentPage = 1;
    renderTable();
}

// Populate dropdowns from DB
function populateDropdowns() {
    const wilayahSelect = document.getElementById('select-wilayah');
    const gudangSelect = document.getElementById('select-gudang');
    
    if (wilayahSelect) {
        const listWilayah = DB.get(DB_KEY_WILAYAH);
        let html = '<option value="">-- Pilih Wilayah --</option>';
        listWilayah.forEach(w => {
            html += `<option value="${w.id}">${w.nama_wilayah}</option>`;
        });
        wilayahSelect.innerHTML = html;
    }

    if (gudangSelect) {
        const listGudang = DB.get(DB_KEY_GUDANG);
        let html = '<option value="">-- Pilih Gudang Penyuplai --</option>';
        listGudang.forEach(g => {
            html += `<option value="${g.id}">${g.nama_gudang}</option>`;
        });
        gudangSelect.innerHTML = html;
    }
}

// Render dynamic rows
function renderTable() {
    const tbody = document.getElementById('titik-table-body');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada data titik distribusi ditemukan</td></tr>`;
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
        const warehouseName = DB.getGudangName(item.id_gudang);

        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted);">${rowNumber}</td>
                <td style="font-weight: 600; color: var(--text-main);">${item.nama_titik}</td>
                <td><span class="badge badge-info"><i class="fas fa-map-marker-alt"></i> ${regionName}</span></td>
                <td><span class="badge badge-success"><i class="fas fa-warehouse"></i> ${warehouseName}</span></td>
                <td>${item.lokasi}</td>
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

// Render pagination buttons
function renderPaginationButtons(totalPages) {
    const container = document.getElementById('pagination-buttons');
    if (!container) return;

    let html = '';
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<button class="page-link ${prevDisabled}" onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="page-link ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    html += `<button class="page-link ${nextDisabled}" onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
}

// Handle page size dropdown
function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size-select').value);
    currentPage = 1;
    renderTable();
}

// Navigate pages
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
            const wName = DB.getWilayahName(item.id_wilayah).toLowerCase();
            const gName = DB.getGudangName(item.id_gudang).toLowerCase();
            return item.nama_titik.toLowerCase().includes(query) ||
                   item.lokasi.toLowerCase().includes(query) ||
                   wName.includes(query) ||
                   gName.includes(query);
        });
    }
    currentPage = 1;
    renderTable();
}

// Open modal for adding
function openAddModal() {
    const listWil = DB.get(DB_KEY_WILAYAH);
    const listGud = DB.get(DB_KEY_GUDANG);

    if (listWil.length === 0 || listGud.length === 0) {
        Toast.show('Prasyarat Gagal', 'Data wilayah atau data gudang kosong! Mohon isi data wilayah dan gudang terlebih dahulu.', 'warning', 4000);
        return;
    }

    document.getElementById('titik-id').value = '';
    document.getElementById('titik-form').reset();
    populateDropdowns();
    document.getElementById('modal-title-text').innerText = 'Tambah Titik Distribusi';
    document.getElementById('titik-modal').classList.add('show');
}

// Open modal for editing
function openEditModal(id) {
    const item = originalData.find(t => t.id === id);
    if (!item) return;

    populateDropdowns();

    document.getElementById('titik-id').value = item.id;
    document.getElementById('input-nama').value = item.nama_titik;
    document.getElementById('select-wilayah').value = item.id_wilayah;
    document.getElementById('select-gudang').value = item.id_gudang;
    document.getElementById('input-lokasi').value = item.lokasi;

    document.getElementById('modal-title-text').innerText = 'Ubah Titik Distribusi';
    document.getElementById('titik-modal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('titik-modal').classList.remove('show');
}

// Save form data (Add / Update)
function saveData(event) {
    event.preventDefault();

    const idVal = document.getElementById('titik-id').value;
    const namaVal = document.getElementById('input-nama').value.trim();
    const wilayahVal = parseInt(document.getElementById('select-wilayah').value);
    const gudangVal = parseInt(document.getElementById('select-gudang').value);
    const lokasiVal = document.getElementById('input-lokasi').value.trim();

    if (!namaVal || isNaN(wilayahVal) || isNaN(gudangVal) || !lokasiVal) {
        Toast.show('Formulir Tidak Valid', 'Mohon isi semua kolom bertanda wajib.', 'warning');
        return;
    }

    if (idVal) {
        // UPDATE MODE
        const id = parseInt(idVal);
        const index = originalData.findIndex(t => t.id === id);
        if (index !== -1) {
            originalData[index] = {
                ...originalData[index],
                nama_titik: namaVal,
                id_wilayah: wilayahVal,
                id_gudang: gudangVal,
                lokasi: lokasiVal
            };
            DB.set(DB_KEY_TITIK, originalData);
            Toast.show('Data Disimpan', `Titik "${namaVal}" berhasil diperbarui.`, 'success');
        }
    } else {
        // ADD MODE
        const newId = originalData.length > 0 ? Math.max(...originalData.map(t => t.id)) + 1 : 1;
        const newTitik = {
            id: newId,
            nama_titik: namaVal,
            id_wilayah: wilayahVal,
            id_gudang: gudangVal,
            lokasi: lokasiVal
        };
        originalData.push(newTitik);
        DB.set(DB_KEY_TITIK, originalData);
        Toast.show('Data Disimpan', `Titik "${namaVal}" berhasil ditambahkan.`, 'success');
    }

    closeModal();
    loadData();
}

// Delete Titik
function deleteData(id) {
    const item = originalData.find(t => t.id === id);
    if (!item) return;

    // Check if Titik is referenced in active Distribution logs
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);
    const linkedDist = listDistribusi.filter(d => d.id_titik == id);

    if (linkedDist.length > 0) {
        Toast.show('Gagal Hapus', `Titik "${item.nama_titik}" tidak dapat dihapus karena masih tercatat di ${linkedDist.length} riwayat distribusi pangan.`, 'error', 4000);
        return;
    }

    ConfirmDelete.show(
        'Hapus Titik?',
        `Apakah Anda yakin ingin menghapus titik distribusi "${item.nama_titik}"?`,
        () => {
            const index = originalData.findIndex(t => t.id === id);
            if (index !== -1) {
                originalData.splice(index, 1);
                DB.set(DB_KEY_TITIK, originalData);
                Toast.show('Terhapus', `Titik "${item.nama_titik}" berhasil dihapus.`, 'success');
                loadData();
            }
        }
    );
}
