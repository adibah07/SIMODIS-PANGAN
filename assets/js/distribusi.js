/**
 * SIMODIS-Pangan - Distribusi Controller JS
 * Handles local CRUD operations, stock deduction validations, search, pagination, and status filters.
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

// Load Distribusi Pangan data
function loadData() {
    originalData = DB.get(DB_KEY_DISTRIBUSI);
    filteredData = [...originalData];
    currentPage = 1;
    renderTable();
}

// Populate Gudang and Titik dropdowns
function populateDropdowns() {
    const gudangSelect = document.getElementById('select-gudang');
    const titikSelect = document.getElementById('select-titik');

    if (gudangSelect) {
        const listGudang = DB.get(DB_KEY_GUDANG);
        let html = '<option value="">-- Pilih Gudang Asal --</option>';
        listGudang.forEach(g => {
            html += `<option value="${g.id}">${g.nama_gudang}</option>`;
        });
        gudangSelect.innerHTML = html;
    }

    if (titikSelect) {
        const listTitik = DB.get(DB_KEY_TITIK);
        let html = '<option value="">-- Pilih Titik Penerima --</option>';
        listTitik.forEach(t => {
            const wName = DB.getWilayahName(t.id_wilayah);
            html += `<option value="${t.id}">${t.nama_titik} (${wName})</option>`;
        });
        titikSelect.innerHTML = html;
    }
}

// Show selected warehouse stock info helper
function showWarehouseStockInfo() {
    const label = document.getElementById('warehouse-stock-info-label');
    const gudangId = parseInt(document.getElementById('select-gudang').value);
    const jenisPangan = document.getElementById('select-pangan').value;

    if (!label) return;
    if (isNaN(gudangId) || !jenisPangan) {
        label.innerText = '';
        return;
    }

    const listGudang = DB.get(DB_KEY_GUDANG);
    const gudang = listGudang.find(g => g.id === gudangId);

    if (gudang) {
        let stock = 0;
        let unit = 'Ton';
        
        if (jenisPangan === 'Beras') stock = gudang.stok_beras || 0;
        else if (jenisPangan === 'Gula') stock = gudang.stok_gula || 0;
        else if (jenisPangan === 'Tepung') stock = gudang.stok_tepung || 0;
        else if (jenisPangan === 'Minyak Goreng') {
            stock = gudang.stok_minyak || 0;
            unit = 'Liter';
        }

        label.innerText = `Info Stok Terkini: ${stock.toLocaleString('id-ID')} ${unit} di gudang.`;
    } else {
        label.innerText = '';
    }
}

// Render dynamic rows
function renderTable() {
    const tbody = document.getElementById('distribusi-table-body');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada data distribusi ditemukan</td></tr>`;
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
        const gName = DB.getGudangName(item.id_gudang);
        const tName = DB.getTitikName(item.id_titik);
        
        // Status Badge Style
        let statusBadge = '';
        if (item.status === 'Terkirim') {
            statusBadge = '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Terkirim</span>';
        } else if (item.status === 'Dalam Perjalanan') {
            statusBadge = '<span class="badge badge-warning"><i class="fas fa-truck"></i> Dalam Perjalanan</span>';
        } else if (item.status === 'Terlambat') {
            statusBadge = '<span class="badge badge-danger"><i class="fas fa-exclamation-circle"></i> Terlambat</span>';
        }

        // Format Date
        const dateObj = new Date(item.tanggal);
        const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : item.tanggal;

        const quantityUnit = item.jenis_pangan === 'Minyak Goreng' ? 'L' : 'Kg';

        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted);">${rowNumber}</td>
                <td>${formattedDate}</td>
                <td style="font-weight: 500;">${gName}</td>
                <td>${tName}</td>
                <td><span style="font-weight: 600;">${item.jenis_pangan}</span></td>
                <td>${item.jumlah.toLocaleString('id-ID')} ${quantityUnit}</td>
                <td>${statusBadge}</td>
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

// Update pagination footer
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
    
    // Prev
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<button class="page-link ${prevDisabled}" onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="page-link ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Next
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    html += `<button class="page-link ${nextDisabled}" onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
}

// Handle change of page size
function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size-select').value);
    currentPage = 1;
    renderTable();
}

// Navigate page
function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}

// Search and Filter handler combined
function handleFilter() {
    const statusQuery = document.getElementById('filter-status-select').value;
    const searchQuery = document.getElementById('local-search-input').value.toLowerCase().trim();

    let temp = [...originalData];

    if (statusQuery) {
        temp = temp.filter(item => item.status === statusQuery);
    }

    if (searchQuery) {
        temp = temp.filter(item => {
            const gName = DB.getGudangName(item.id_gudang).toLowerCase();
            const tName = DB.getTitikName(item.id_titik).toLowerCase();
            return gName.includes(searchQuery) ||
                   tName.includes(searchQuery) ||
                   item.jenis_pangan.toLowerCase().includes(searchQuery);
        });
    }

    filteredData = temp;
    currentPage = 1;
    renderTable();
}

function handleSearch() {
    handleFilter();
}

// Open modal for adding
function openAddModal() {
    const listGud = DB.get(DB_KEY_GUDANG);
    const listTit = DB.get(DB_KEY_TITIK);

    if (listGud.length === 0 || listTit.length === 0) {
        Toast.show('Prasyarat Gagal', 'Data gudang atau titik distribusi kosong! Mohon isi data gudang dan titik terlebih dahulu.', 'warning', 4000);
        return;
    }

    document.getElementById('distribusi-id').value = '';
    document.getElementById('distribusi-form').reset();
    populateDropdowns();
    document.getElementById('warehouse-stock-info-label').innerText = '';
    document.getElementById('modal-title-text').innerText = 'Tambah Distribusi Pangan';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-tanggal').value = today;

    document.getElementById('distribusi-modal').classList.add('show');
}

// Open modal for editing
function openEditModal(id) {
    const item = originalData.find(d => d.id === id);
    if (!item) return;

    populateDropdowns();

    document.getElementById('distribusi-id').value = item.id;
    document.getElementById('input-tanggal').value = item.tanggal;
    document.getElementById('select-status').value = item.status;
    document.getElementById('select-gudang').value = item.id_gudang;
    document.getElementById('select-titik').value = item.id_titik;
    document.getElementById('select-pangan').value = item.jenis_pangan;
    document.getElementById('input-jumlah').value = item.jumlah;

    document.getElementById('modal-title-text').innerText = 'Ubah Distribusi Pangan';
    document.getElementById('distribusi-modal').classList.add('show');
    showWarehouseStockInfo();
}

// Close Modal
function closeModal() {
    document.getElementById('distribusi-modal').classList.remove('show');
}

// Save form data (Add / Update) with Stock deductions
function saveData(event) {
    event.preventDefault();

    const idVal = document.getElementById('distribusi-id').value;
    const tanggalVal = document.getElementById('input-tanggal').value;
    const statusVal = document.getElementById('select-status').value;
    const gudangIdVal = parseInt(document.getElementById('select-gudang').value);
    const titikIdVal = parseInt(document.getElementById('select-titik').value);
    const panganVal = document.getElementById('select-pangan').value;
    const jumlahVal = parseInt(document.getElementById('input-jumlah').value);

    if (!tanggalVal || isNaN(gudangIdVal) || isNaN(titikIdVal) || !panganVal || isNaN(jumlahVal) || jumlahVal <= 0) {
        Toast.show('Formulir Tidak Valid', 'Mohon isi semua kolom bertanda wajib.', 'warning');
        return;
    }

    // Verify Stock Availability in source warehouse
    const listGudang = DB.get(DB_KEY_GUDANG);
    const gudangIndex = listGudang.findIndex(g => g.id === gudangIdVal);
    
    if (gudangIndex === -1) {
        Toast.show('Gudang Tidak Ditemukan', 'Gudang asal tidak valid.', 'error');
        return;
    }

    const gudang = listGudang[gudangIndex];
    let originalQty = 0;

    // If edit mode, find original item first to calculate stock adjustment
    if (idVal) {
        const id = parseInt(idVal);
        const prevItem = originalData.find(d => d.id === id);
        // Only adjust if it's the same gudang and commodity type
        if (prevItem && prevItem.id_gudang === gudangIdVal && prevItem.jenis_pangan === panganVal) {
            originalQty = prevItem.jumlah;
        }
    }

    // Convert distribution unit to match warehouse unit (KG/Liter to Ton)
    let amountNeeded = jumlahVal;
    let currentStock = 0;
    
    if (panganVal === 'Beras') {
        amountNeeded = jumlahVal / 1000; // in Ton
        currentStock = gudang.stok_beras || 0;
    } else if (panganVal === 'Gula') {
        amountNeeded = jumlahVal / 1000; // in Ton
        currentStock = gudang.stok_gula || 0;
    } else if (panganVal === 'Tepung') {
        amountNeeded = jumlahVal / 1000; // in Ton
        currentStock = gudang.stok_tepung || 0;
    } else if (panganVal === 'Minyak Goreng') {
        amountNeeded = jumlahVal; // in Liter
        currentStock = gudang.stok_minyak || 0;
    }

    // Convert originalQty to match warehouse unit as well (re-added stock)
    let restoredStockValue = originalQty;
    if (panganVal !== 'Minyak Goreng') restoredStockValue = originalQty / 1000;

    // Check if enough stock exists (including re-added previous amount in edit mode)
    if (currentStock + restoredStockValue < amountNeeded) {
        const availableKg = (currentStock + restoredStockValue) * (panganVal === 'Minyak Goreng' ? 1 : 1000);
        const unitLabel = panganVal === 'Minyak Goreng' ? 'L' : 'Kg';
        Toast.show('Stok Tidak Cukup', `Gagal! Stok ${panganVal} tidak cukup di ${gudang.nama_gudang}. Tersedia maksimal: ${availableKg} ${unitLabel}`, 'error', 5000);
        return;
    }

    // Deduct stock in warehouse
    if (panganVal === 'Beras') {
        listGudang[gudangIndex].stok_beras = Number((currentStock + restoredStockValue - amountNeeded).toFixed(2));
    } else if (panganVal === 'Gula') {
        listGudang[gudangIndex].stok_gula = Number((currentStock + restoredStockValue - amountNeeded).toFixed(2));
    } else if (panganVal === 'Tepung') {
        listGudang[gudangIndex].stok_tepung = Number((currentStock + restoredStockValue - amountNeeded).toFixed(2));
    } else if (panganVal === 'Minyak Goreng') {
        listGudang[gudangIndex].stok_minyak = Math.round(currentStock + restoredStockValue - amountNeeded);
    }

    // Update warehouses in DB
    DB.set(DB_KEY_GUDANG, listGudang);

    // Save distribution item
    if (idVal) {
        // UPDATE MODE
        const id = parseInt(idVal);
        const index = originalData.findIndex(d => d.id === id);
        if (index !== -1) {
            // If the user changed the warehouse or commodity type to something else,
            // we need to re-add stock to the OLD warehouse
            const prevItem = originalData[index];
            if (prevItem.id_gudang !== gudangIdVal || prevItem.jenis_pangan !== panganVal) {
                // Re-add to old warehouse
                const oldGudangIndex = listGudang.findIndex(g => g.id === prevItem.id_gudang);
                if (oldGudangIndex !== -1) {
                    const oldGud = listGudang[oldGudangIndex];
                    let oldVal = prevItem.jumlah;
                    if (prevItem.jenis_pangan !== 'Minyak Goreng') oldVal = prevItem.jumlah / 1000;
                    
                    if (prevItem.jenis_pangan === 'Beras') listGudang[oldGudangIndex].stok_beras += oldVal;
                    else if (prevItem.jenis_pangan === 'Gula') listGudang[oldGudangIndex].stok_gula += oldVal;
                    else if (prevItem.jenis_pangan === 'Tepung') listGudang[oldGudangIndex].stok_tepung += oldVal;
                    else if (prevItem.jenis_pangan === 'Minyak Goreng') listGudang[oldGudangIndex].stok_minyak += oldVal;
                    
                    DB.set(DB_KEY_GUDANG, listGudang);
                }
            }

            originalData[index] = {
                ...originalData[index],
                tanggal: tanggalVal,
                id_gudang: gudangIdVal,
                id_titik: titikIdVal,
                jenis_pangan: panganVal,
                jumlah: jumlahVal,
                status: statusVal
            };
            DB.set(DB_KEY_DISTRIBUSI, originalData);
            Toast.show('Data Disimpan', 'Kegiatan distribusi pangan berhasil diperbarui.', 'success');
        }
    } else {
        // ADD MODE
        const newId = originalData.length > 0 ? Math.max(...originalData.map(d => d.id)) + 1 : 1;
        const newDist = {
            id: newId,
            tanggal: tanggalVal,
            id_gudang: gudangIdVal,
            id_titik: titikIdVal,
            jenis_pangan: panganVal,
            jumlah: jumlahVal,
            status: statusVal
        };
        originalData.push(newDist);
        DB.set(DB_KEY_DISTRIBUSI, originalData);
        Toast.show('Data Disimpan', 'Kegiatan distribusi baru berhasil dicatat.', 'success');
    }

    closeModal();
    loadData();
}

// Delete Record (and restore stocks to source warehouse)
function deleteData(id) {
    const item = originalData.find(d => d.id === id);
    if (!item) return;

    ConfirmDelete.show(
        'Hapus Distribusi?',
        `Apakah Anda yakin ingin menghapus catatan distribusi ${item.jenis_pangan} sebanyak ${item.jumlah} ini? Stok gudang asal akan dikembalikan.`,
        () => {
            // Restore stocks to Gudang Asal
            const listGudang = DB.get(DB_KEY_GUDANG);
            const gudangIndex = listGudang.findIndex(g => g.id === item.id_gudang);
            
            if (gudangIndex !== -1) {
                let returnVal = item.jumlah;
                if (item.jenis_pangan !== 'Minyak Goreng') returnVal = item.jumlah / 1000; // in Ton

                if (item.jenis_pangan === 'Beras') listGudang[gudangIndex].stok_beras += returnVal;
                else if (item.jenis_pangan === 'Gula') listGudang[gudangIndex].stok_gula += returnVal;
                else if (item.jenis_pangan === 'Tepung') listGudang[gudangIndex].stok_tepung += returnVal;
                else if (item.jenis_pangan === 'Minyak Goreng') listGudang[gudangIndex].stok_minyak += returnVal;
                
                DB.set(DB_KEY_GUDANG, listGudang);
            }

            const index = originalData.findIndex(d => d.id === id);
            if (index !== -1) {
                originalData.splice(index, 1);
                DB.set(DB_KEY_DISTRIBUSI, originalData);
                Toast.show('Terhapus', 'Catatan distribusi berhasil dihapus dan stok gudang dikembalikan.', 'success');
                loadData();
            }
        }
    );
}
