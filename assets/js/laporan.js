/**
 * SIMODIS-Pangan - Laporan Controller JS
 * Handles date filters, warehouse relation lookups, printing dates formatting, and summary calculations.
 */

let originalData = [];
let filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    populateGudangSelect();
    setSignatureDate();
});

// Load original data
function loadData() {
    originalData = DB.get(DB_KEY_DISTRIBUSI);
    filteredData = [...originalData];
    renderReportTable();
}

// Populate Gudang dropdown
function populateGudangSelect() {
    const select = document.getElementById('filter-gudang');
    if (!select) return;

    const warehouses = DB.get(DB_KEY_GUDANG);
    let html = '<option value="">Semua Gudang</option>';
    warehouses.forEach(w => {
        html += `<option value="${w.id}">${w.nama_gudang}</option>`;
    });
    select.innerHTML = html;
}

// Set dynamic date in the government signature block
function setSignatureDate() {
    const sigDateEl = document.getElementById('signature-date');
    if (!sigDateEl) return;

    const today = new Date();
    const indonesianMonths = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formattedDate = `Depok, ${today.getDate()} ${indonesianMonths[today.getMonth()]} ${today.getFullYear()}`;
    sigDateEl.innerText = formattedDate;
}

// Calculate and render report table rows and summary counters
function renderReportTable() {
    const tbody = document.getElementById('report-table-body');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada data laporan yang sesuai filter</td></tr>`;
        updateSummaryCounters(0, 0, 0);
        return;
    }

    let html = '';
    let totalTon = 0;
    let totalLiter = 0;

    filteredData.forEach((item, index) => {
        const rowNumber = index + 1;
        const gName = DB.getGudangName(item.id_gudang);
        const tName = DB.getTitikName(item.id_titik);
        
        // Find Wilayah of this Titik
        const listTitik = DB.get(DB_KEY_TITIK);
        const titik = listTitik.find(t => t.id == item.id_titik);
        const regionName = titik ? DB.getWilayahName(titik.id_wilayah) : '-';

        // Format Date
        const dateObj = new Date(item.tanggal);
        const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : item.tanggal;

        const quantityUnit = item.jenis_pangan === 'Minyak Goreng' ? 'L' : 'Kg';

        // Add to counters
        if (item.jenis_pangan === 'Minyak Goreng') {
            totalLiter += Number(item.jumlah);
        } else {
            totalTon += Number(item.jumlah) / 1000; // in Ton
        }

        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted);">${rowNumber}</td>
                <td>${formattedDate}</td>
                <td style="font-weight: 600; color: var(--text-main);">${gName}</td>
                <td>${tName}</td>
                <td>${regionName}</td>
                <td><span style="font-weight: 500;">${item.jenis_pangan}</span></td>
                <td>${item.jumlah.toLocaleString('id-ID')} ${quantityUnit}</td>
                <td>
                    <span style="font-weight: 600; color: ${item.status === 'Terkirim' ? 'var(--success)' : item.status === 'Terlambat' ? 'var(--danger)' : 'var(--warning)'};">
                        ${item.status}
                    </span>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    updateSummaryCounters(filteredData.length, totalTon.toFixed(2), totalLiter);
}

// Update upper counters labels
function updateSummaryCounters(count, ton, liter) {
    document.getElementById('report-stat-count').innerText = count;
    document.getElementById('report-stat-volume-ton').innerText = ton;
    document.getElementById('report-stat-volume-liter').innerText = liter.toLocaleString('id-ID');
}

// Apply chosen filters
function applyFilters() {
    const startDateVal = document.getElementById('filter-start-date').value;
    const endDateVal = document.getElementById('filter-end-date').value;
    const gudangIdVal = document.getElementById('filter-gudang').value;
    const panganVal = document.getElementById('filter-pangan').value;

    let temp = [...originalData];

    // Filter by start date
    if (startDateVal) {
        temp = temp.filter(item => item.tanggal >= startDateVal);
    }

    // Filter by end date
    if (endDateVal) {
        temp = temp.filter(item => item.tanggal <= endDateVal);
    }

    // Filter by warehouse
    if (gudangIdVal) {
        temp = temp.filter(item => item.id_gudang == gudangIdVal);
    }

    // Filter by commodity
    if (panganVal) {
        temp = temp.filter(item => item.jenis_pangan === panganVal);
    }

    filteredData = temp;
    renderReportTable();

    // Update Print Header Sub-labels dynamically
    const printLabel = document.getElementById('print-duration-label');
    const reportTitleLabel = document.getElementById('report-title-label');
    
    if (printLabel && reportTitleLabel) {
        if (startDateVal && endDateVal) {
            const formatD = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const rangeStr = `Periode: ${formatD(startDateVal)} s.d. ${formatD(endDateVal)}`;
            printLabel.innerText = rangeStr;
            reportTitleLabel.innerText = `Ringkasan Riwayat (${rangeStr})`;
        } else {
            printLabel.innerText = 'Periode: Seluruh Riwayat Distribusi';
            reportTitleLabel.innerText = 'Ringkasan Riwayat Logistik';
        }
    }

    Toast.show('Penyaringan Laporan', `Ditemukan ${filteredData.length} data yang cocok.`, 'success');
}
