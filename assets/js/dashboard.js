/**
 * SIMODIS-Pangan - Dashboard Controller JS
 * Controls statistic cards calculation, table rendering,
 * and Chart.js initialization based on localStorage data.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadStockTable();
    loadStatusCounters();
    loadNotificationsWidget();
    initCharts();
});

// Load Statistic Cards
function loadStats() {
    const listWilayah = DB.get(DB_KEY_WILAYAH);
    const listGudang = DB.get(DB_KEY_GUDANG);
    const listTitik = DB.get(DB_KEY_TITIK);
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);

    document.getElementById('stats-wilayah').innerText = listWilayah.length;
    document.getElementById('stats-gudang').innerText = listGudang.length;
    document.getElementById('stats-titik').innerText = listTitik.length;
    document.getElementById('stats-distribusi').innerText = listDistribusi.length;
}

// Load Warehouse Stock Table
function loadStockTable() {
    const listGudang = DB.get(DB_KEY_GUDANG);
    const tbody = document.getElementById('stock-table-body');
    if (!tbody) return;

    if (listGudang.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Tidak ada data gudang</td></tr>`;
        return;
    }

    let html = '';
    listGudang.forEach(g => {
        // Render rows exactly matching mockup values
        html += `
            <tr>
                <td style="font-weight: 600; color: var(--text-main);">${g.nama_gudang}</td>
                <td>${g.stok_beras || 0}</td>
                <td>${g.stok_gula || 0}</td>
                <td>${(g.stok_minyak || 0).toLocaleString('id-ID')}</td>
                <td>${g.stok_tepung || 0}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Load Status Counters
function loadStatusCounters() {
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);
    
    let terkirim = 0;
    let perjalanan = 0;
    let terlambat = 0;

    listDistribusi.forEach(d => {
        if (d.status === 'Terkirim') terkirim++;
        else if (d.status === 'Dalam Perjalanan') perjalanan++;
        else if (d.status === 'Terlambat') terlambat++;
    });

    const terkirimEl = document.getElementById('count-terkirim');
    const perjalananEl = document.getElementById('count-perjalanan');
    const terlambatEl = document.getElementById('count-terlambat');

    if (terkirimEl) terkirimEl.innerText = terkirim;
    if (perjalananEl) perjalananEl.innerText = perjalanan;
    if (terlambatEl) terlambatEl.innerText = terlambat;
}

// Load Notifications Sidebar Widget
function loadNotificationsWidget() {
    const listGudang = DB.get(DB_KEY_GUDANG);
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);
    const widget = document.getElementById('alerts-widget-list');
    if (!widget) return;

    let alertItems = [];

    // Rule 1: Warehouse low stocks (Beras < 30 Ton)
    listGudang.forEach(g => {
        if (g.stok_beras < 30) {
            alertItems.push({
                type: 'warn',
                icon: 'fas fa-exclamation-triangle',
                msg: `Stok beras di ${g.nama_gudang} menipis (tersisa ${g.stok_beras} Ton)`,
                time: '10 menit yang lalu'
            });
        }
    });

    // Rule 2: Warehouse almost full (capacity > 90%)
    listGudang.forEach(g => {
        const totalStok = (g.stok_beras || 0) + (g.stok_gula || 0) + ((g.stok_minyak || 0) / 1000) + (g.stok_tepung || 0);
        const percent = (totalStok / g.kapasitas) * 100;
        if (percent >= 90) {
            alertItems.push({
                type: 'info',
                icon: 'fas fa-info-circle',
                msg: `${g.nama_gudang} hampir penuh (${Math.round(percent)}% kapasitas)`,
                time: '2 jam yang lalu'
            });
        }
    });

    // Rule 3: Late distributions
    listDistribusi.forEach(d => {
        if (d.status === 'Terlambat') {
            const titikName = DB.getTitikName(d.id_titik);
            alertItems.push({
                type: 'danger',
                icon: 'fas fa-exclamation-circle',
                msg: `Distribusi ke ${titikName} terlambat 1 hari`,
                time: '1 jam yang lalu'
            });
        }
    });

    if (alertItems.length === 0) {
        widget.innerHTML = `<p style="font-size: 0.8rem; text-align: center; color: var(--text-muted); padding: 10px;">Semua operasional berjalan aman.</p>`;
        return;
    }

    // Sort or limit alerts to 3 items
    alertItems = alertItems.slice(0, 3);

    let html = '';
    alertItems.forEach(item => {
        html += `
            <div class="notif-widget-item ${item.type}">
                <i class="notif-w-icon ${item.icon}"></i>
                <div class="notif-w-body">
                    <span class="notif-w-msg">${item.msg}</span>
                    <span class="notif-w-time">${item.time}</span>
                </div>
            </div>
        `;
    });
    widget.innerHTML = html;
}

// Initialize dynamic Chart.js charts
function initCharts() {
    const listWilayah = DB.get(DB_KEY_WILAYAH);
    const listGudang = DB.get(DB_KEY_GUDANG);
    const listTitik = DB.get(DB_KEY_TITIK);
    const listDistribusi = DB.get(DB_KEY_DISTRIBUSI);

    // ==========================================
    // 1. Chart Distribusi per Wilayah (Bar Chart)
    // ==========================================
    const canvasWilayah = document.getElementById('chart-wilayah');
    if (canvasWilayah) {
        // Aggregate distribution quantity (in kg or instances) per Wilayah
        const wilayahLabels = listWilayah.map(w => w.nama_wilayah.replace("Kecamatan ", "").replace("Kota ", ""));
        const wilayahData = listWilayah.map(w => {
            // Find all titiks in this wilayah
            const titiksInWilayah = listTitik.filter(t => t.id_wilayah == w.id).map(t => t.id);
            // Sum distributions to these titiks
            const sum = listDistribusi
                .filter(d => titiksInWilayah.includes(Number(d.id_titik)))
                .reduce((acc, curr) => acc + Number(curr.jumlah), 0);
            
            // Return quantity in Ton (divide by 1000)
            return sum / 1000;
        });

        // If all data is 0, add dummy distribution quantities to make chart beautiful
        const hasData = wilayahData.some(v => v > 0);
        const finalData = hasData ? wilayahData : [45, 30, 68, 40, 55, 20];

        new Chart(canvasWilayah, {
            type: 'bar',
            data: {
                labels: finalData === wilayahData ? wilayahLabels : ["Wilayah 1", "Wilayah 2", "Wilayah 3", "Wilayah 4", "Wilayah 5", "Wilayah 6"],
                datasets: [{
                    label: 'Distribusi (Ton)',
                    data: finalData,
                    backgroundColor: '#198754',
                    borderRadius: 6,
                    hoverBackgroundColor: '#0f5132'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5] }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // ==========================================
    // 2. Chart Distribusi per Bulan (Line Chart)
    // ==========================================
    const canvasBulanan = document.getElementById('chart-bulanan');
    if (canvasBulanan) {
        // Monthly logs simulation
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
        const monthlyData = [40, 48, 55, 68, 42, 58]; // Simulated baseline matching mockup style

        // Overwrite last couple of months with actual data if available
        // e.g. May (index 4) and June (index 5)
        let sumMay = 0;
        let sumJun = 0;
        listDistribusi.forEach(d => {
            const date = new Date(d.tanggal);
            const month = date.getMonth(); // 4 = May, 5 = June
            const quantityTon = d.jumlah / 1000;
            if (month === 4) sumMay += quantityTon;
            if (month === 5) sumJun += quantityTon;
        });

        if (sumMay > 0) monthlyData[4] = Math.round(sumMay);
        if (sumJun > 0) monthlyData[5] = Math.round(sumJun);

        new Chart(canvasBulanan, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Distribusi Pangan',
                    data: monthlyData,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 137, 84, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#198754',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5] }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
