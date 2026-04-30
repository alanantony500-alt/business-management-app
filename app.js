// Initialize Supabase Client
try {
const SUPABASE_URL = 'https://dhlfcenonuuqgcecixwm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jbSb-Iko_JxHF7cegulmqg_9Iy1xHtO';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize Lucide Icons
lucide.createIcons();

// Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Form Elements
const recordForm = document.getElementById('record-form');
const recordIdInput = document.getElementById('record-id');
const customerName = document.getElementById('customer-name');
const phoneNumber = document.getElementById('phone-number');
const amountInput = document.getElementById('amount');
const staffCommissionInput = document.getElementById('staff-commission');
const staffNameInput = document.getElementById('staff-name');
const serviceDate = document.getElementById('service-date');
const serviceTime = document.getElementById('service-time');
const nationalityInput = document.getElementById('nationality');
const roomNumberInput = document.getElementById('room-number');
const serviceTimingInput = document.getElementById('service-timing');
const bodySizeInput = document.getElementById('body-size');
const behaviorInput = document.getElementById('behavior');
const repeatCustomerInput = document.getElementById('repeat-customer');
const malluCustomerInput = document.getElementById('mallu-customer');

const autoDateTimeBtn = document.getElementById('auto-datetime-btn');
const formTitle = document.getElementById('form-title');
const submitBtnText = document.getElementById('submit-btn-text');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Table & State
const tableBody = document.getElementById('table-body');
const emptyState = document.getElementById('empty-state');
const dataTable = document.getElementById('data-table');
const exportBtn = document.getElementById('export-btn');
const toastContainer = document.getElementById('toast-container');

// Advanced Filters Elements
const searchInput = document.getElementById('search-input');
const filterDateStart = document.getElementById('filter-date-start');
const filterDateEnd = document.getElementById('filter-date-end');
const filterAmount = document.getElementById('filter-amount'); // EXACT match only
const filterNationality = document.getElementById('filter-nationality');
const filterBodySize = document.getElementById('filter-body-size');
const filterBehavior = document.getElementById('filter-behavior');
const filterStaff = document.getElementById('filter-staff'); // hidden field
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// Staff Panel Elements
const staffListEl = document.getElementById('staff-list');
const staffSearchInput = document.getElementById('staff-search-input');
const clearStaffFilterBtn = document.getElementById('clear-staff-filter');

// Stats Elements
const totalEarningsEl = document.getElementById('total-earnings');
const todayCollectionEl = document.getElementById('today-collection');
const totalCommissionEl = document.getElementById('total-commission');

// State
let records = [];
let isAuthenticated = sessionStorage.getItem('is_authenticated') === 'true';

// Initial Setup
async function initApp() {
    checkAuth();
}

async function checkAuth() {
    if (isAuthenticated) {
        loginScreen.classList.remove('active');
        dashboardScreen.classList.add('active');
        await fetchRecords();
        lucide.createIcons();
    } else {
        dashboardScreen.classList.remove('active');
        loginScreen.classList.add('active');
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userVal = usernameInput.value.trim().toLowerCase();
    const passVal = passwordInput.value.trim();
    
    if (userVal === 'admin' && passVal === '12345') {
        isAuthenticated = true;
        sessionStorage.setItem('is_authenticated', 'true');
        loginError.textContent = '';
        usernameInput.value = '';
        passwordInput.value = '';
        checkAuth();
        showToast('Logged in securely as Admin');
    } else {
        loginError.textContent = 'Invalid credentials';
    }
});
} catch (e) {
    alert("Critical Script Error on Load: " + e.message);
    console.error(e);
}

logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    sessionStorage.removeItem('is_authenticated');
    checkAuth();
});

// Fetch Data from Supabase
async function fetchRecords() {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">Loading data from cloud...</td></tr>';
    
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        showToast('Failed to load database: ' + error.message, 'error');
        console.error(error);
        return;
    }
    
    records = data || [];
    
    updateStaffPanel();
    updateFilterDropdowns();
    renderTable();
    updateDashboardCards();
}

// Auto Date/Time
function setAutoDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    serviceDate.value = `${yyyy}-${mm}-${dd}`;
    
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    serviceTime.value = `${hh}:${min}`;
}
autoDateTimeBtn.addEventListener('click', setAutoDateTime);
setAutoDateTime();

// Form Submit (Insert / Update to Supabase)
recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = recordIdInput.value;
    const amountAed = parseFloat(amountInput.value) || 0;
    const staffCommission = parseFloat(staffCommissionInput.value) || 0;
    
    const recordData = {
        name: customerName.value.trim(),
        phone: phoneNumber.value.trim(),
        nationality: nationalityInput.value.trim(),
        amount_aed: amountAed,
        staff_commission: staffCommission,
        staff_name: staffNameInput.value.trim(),
        body_size: bodySizeInput.value,
        behavior: behaviorInput.value,
        service_timing: serviceTimingInput.value,
        service_date: serviceDate.value,
        service_time: serviceTime.value,
        room_number: roomNumberInput.value.trim(),
        repeat_customer: repeatCustomerInput.checked,
        mallu_customer: malluCustomerInput.checked
    };
    
    const originalBtnHtml = submitBtnText.parentElement.innerHTML;
    submitBtnText.parentElement.innerHTML = '<i data-lucide="loader" class="spin"></i> <span>Saving...</span>';
    lucide.createIcons();
    
    if (id) {
        // Update existing record
        const { error } = await supabase
            .from('customers')
            .update(recordData)
            .eq('id', id);
            
        if (error) {
            showToast('Failed to update record: ' + error.message, 'error');
            console.error(error);
        } else {
            showToast('Record updated successfully');
        }
    } else {
        // Insert new record
        const { error } = await supabase
            .from('customers')
            .insert([recordData]);
            
        if (error) {
            showToast('Failed to add record: ' + error.message, 'error');
            console.error(error);
        } else {
            showToast('New record added successfully');
        }
    }
    
    submitBtnText.parentElement.innerHTML = originalBtnHtml;
    lucide.createIcons();
    
    resetForm();
    await fetchRecords(); // Refresh data from cloud
});

// 👩💼 STAFF PANEL LOGIC
function updateStaffPanel() {
    const searchTerm = staffSearchInput.value.toLowerCase();
    
    const staffStats = {};
    records.forEach(r => {
        const name = r.staff_name || 'Unknown';
        if (!staffStats[name]) {
            staffStats[name] = { name: name, clients: 0, earnings: 0 }; 
        }
        staffStats[name].clients += 1;
        staffStats[name].earnings += (r.staff_commission || 0);
    });

    let staffArray = Object.values(staffStats).sort((a,b) => b.earnings - a.earnings);
    if (searchTerm) {
        staffArray = staffArray.filter(s => s.name.toLowerCase().includes(searchTerm));
    }

    staffListEl.innerHTML = '';
    
    if (staffArray.length === 0) {
        staffListEl.innerHTML = `<p class="text-muted" style="text-align:center; font-size: 0.9rem;">No staff found.</p>`;
        return;
    }

    staffArray.forEach(staff => {
        const isActive = filterStaff.value === staff.name;
        const card = document.createElement('div');
        card.className = `staff-card ${isActive ? 'active' : ''}`;
        
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=d4af37&color=000&bold=true`;

        card.innerHTML = `
            <img src="${avatarUrl}" alt="${staff.name}" class="staff-avatar">
            <div class="staff-info">
                <div class="staff-name">${staff.name}</div>
                <div class="staff-stats">
                    <div class="staff-stat-row">
                        <i data-lucide="award"></i> <span class="staff-stat-value">${formatAED(staff.earnings)}</span>
                    </div>
                    <div class="staff-stat-row">
                        <i data-lucide="users"></i> <span class="staff-stat-value">${staff.clients}</span> clients
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (filterStaff.value === staff.name) {
                filterStaff.value = '';
                clearStaffFilterBtn.classList.add('hidden');
            } else {
                filterStaff.value = staff.name;
                clearStaffFilterBtn.classList.remove('hidden');
            }
            updateStaffPanel();
            renderTable();
        });

        staffListEl.appendChild(card);
    });
    
    lucide.createIcons();
}

staffSearchInput.addEventListener('input', updateStaffPanel);
clearStaffFilterBtn.addEventListener('click', () => {
    filterStaff.value = '';
    clearStaffFilterBtn.classList.add('hidden');
    updateStaffPanel();
    renderTable();
});

// 📊 ADVANCED FILTER SYSTEM
function updateFilterDropdowns() {
    const nationalities = [...new Set(records.map(r => r.nationality).filter(Boolean))].sort();
    
    const currNat = filterNationality.value;
    
    filterNationality.innerHTML = '<option value="">All Nationalities</option>' + 
        nationalities.map(n => `<option value="${n}">${n}</option>`).join('');
        
    filterNationality.value = currNat;
}

const formatAED = (value) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value);

function renderTable() {
    tableBody.innerHTML = '';
    
    const term = searchInput.value.toLowerCase();
    const startDate = filterDateStart.value;
    const endDate = filterDateEnd.value;
    const exactAmt = parseFloat(filterAmount.value);
    const nat = filterNationality.value;
    const size = filterBodySize.value;
    const behavior = filterBehavior.value;
    const selectedStaff = filterStaff.value;
    
    const filteredRecords = records.filter(r => {
        const matchesSearch = !term || 
            (r.name && r.name.toLowerCase().includes(term)) ||
            (r.phone && r.phone.includes(term)) ||
            (r.room_number && r.room_number.toLowerCase().includes(term));
            
        const matchesDateStart = !startDate || r.service_date >= startDate;
        const matchesDateEnd = !endDate || r.service_date <= endDate;
        
        // Exact amount search
        const matchesAmt = isNaN(exactAmt) || r.amount_aed === exactAmt;
        
        const matchesNat = !nat || r.nationality === nat;
        const matchesSize = !size || r.body_size === size;
        const matchesBehavior = !behavior || r.behavior === behavior;
        const matchesStaff = !selectedStaff || r.staff_name === selectedStaff;
        
        return matchesSearch && matchesDateStart && matchesDateEnd && 
               matchesAmt && matchesNat && matchesSize && 
               matchesBehavior && matchesStaff;
    });
    
    if (filteredRecords.length === 0) {
        emptyState.classList.remove('hidden');
        dataTable.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        dataTable.style.display = 'table';
        
        filteredRecords.forEach(record => {
            const tr = document.createElement('tr');
            
            const dateObj = new Date(record.created_at);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            
            const amountAedStr = formatAED(record.amount_aed);
            const commStr = formatAED(record.staff_commission);
            
            let badges = '';
            if (record.repeat_customer) badges += `<span class="comm-badge" style="background: rgba(16,185,129,0.2); color: var(--success);">Repeat</span> `;
            if (record.mallu_customer) badges += `<span class="comm-badge" style="background: rgba(212,175,55,0.2); color: var(--accent-primary);">Mallu</span> `;
            
            let behColor = 'var(--text-main)';
            if (record.behavior === 'GOOD') behColor = 'var(--success)';
            if (record.behavior === 'BAD' || record.behavior === 'VERY BAD') behColor = 'var(--danger)';
            
            tr.innerHTML = `
                <td>
                    <div class="cell-bold">${record.service_date}</div>
                    <div class="cell-sub"><i data-lucide="clock"></i> ${record.service_time}</div>
                </td>
                <td>
                    <div class="cell-bold">${record.name}</div>
                    <div class="cell-sub"><i data-lucide="phone"></i> ${record.phone}</div>
                    ${badges ? `<div style="margin-top:0.25rem;">${badges}</div>` : ''}
                </td>
                <td>
                    <div class="cell-sub" title="Room"><i data-lucide="door-open"></i> ${record.room_number || 'N/A'}</div>
                    <div class="cell-sub" title="Timing"><i data-lucide="hourglass"></i> ${record.service_timing || 'N/A'}</div>
                </td>
                <td>
                    <div class="cell-bold" style="color: ${behColor}">${record.behavior || 'N/A'}</div>
                    <div class="cell-sub"><i data-lucide="user"></i> ${record.body_size || 'N/A'}</div>
                </td>
                <td>
                    <div class="cell-bold">${record.staff_name}</div>
                    <div class="cell-sub"><i data-lucide="globe"></i> ${record.nationality || 'N/A'}</div>
                </td>
                <td>
                    <div><span class="amount-badge">${amountAedStr}</span></div>
                    <div><span class="comm-badge" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">Comm: ${commStr}</span></div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-icon btn-edit" onclick="editRecord('${record.id}')" title="Edit">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn btn-icon btn-delete" onclick="deleteRecord('${record.id}')" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        lucide.createIcons();
    }
}

// Bind all filters to renderTable
const filterInputs = [
    searchInput, filterDateStart, filterDateEnd, filterAmount,
    filterNationality, filterBodySize, filterBehavior
];
filterInputs.forEach(input => {
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', renderTable);
});

clearFiltersBtn.addEventListener('click', () => {
    filterInputs.forEach(input => {
        if(input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });
    filterStaff.value = '';
    clearStaffFilterBtn.classList.add('hidden');
    
    updateStaffPanel();
    renderTable();
});

// Edit & Delete
window.editRecord = function(id) {
    const pwd = prompt('Enter Admin Password to edit this record:');
    if (pwd !== 'admin123') {
        showToast('Unauthorized action', 'error');
        return;
    }

    const record = records.find(r => r.id === id);
    if (!record) return;
    
    recordIdInput.value = record.id;
    customerName.value = record.name;
    phoneNumber.value = record.phone;
    amountInput.value = record.amount_aed;
    staffCommissionInput.value = record.staff_commission;
    staffNameInput.value = record.staff_name;
    serviceDate.value = record.service_date;
    serviceTime.value = record.service_time;
    nationalityInput.value = record.nationality;
    roomNumberInput.value = record.room_number || '';
    serviceTimingInput.value = record.service_timing || '';
    bodySizeInput.value = record.body_size || '';
    behaviorInput.value = record.behavior || '';
    repeatCustomerInput.checked = record.repeat_customer || false;
    malluCustomerInput.checked = record.mallu_customer || false;
    
    formTitle.textContent = 'Edit Entry';
    document.getElementById('submit-btn-text').textContent = 'Update Record';
    cancelEditBtn.classList.remove('hidden');
    
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    recordForm.reset();
    recordIdInput.value = '';
    formTitle.textContent = 'New Entry';
    document.getElementById('submit-btn-text').textContent = 'Save Record';
    cancelEditBtn.classList.add('hidden');
    setAutoDateTime();
}

window.deleteRecord = async function(id) {
    const pwd = prompt('Enter Admin Password to delete this record:');
    if (pwd !== 'admin123') {
        showToast('Unauthorized action', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this record permanently?')) {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);
            
        if (error) {
            showToast('Failed to delete record: ' + error.message, 'error');
            console.error(error);
        } else {
            showToast('Record deleted');
            if (recordIdInput.value === id) {
                resetForm();
            }
            await fetchRecords();
        }
    }
}

function updateDashboardCards() {
    let total = 0;
    let todayTotal = 0;
    let totalCommission = 0;
    
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    records.forEach(r => {
        total += (r.amount_aed || 0);
        totalCommission += (r.staff_commission || 0);
        if (r.service_date === todayStr) {
            todayTotal += (r.amount_aed || 0);
        }
    });
    
    totalEarningsEl.textContent = formatAED(total);
    todayCollectionEl.textContent = formatAED(todayTotal);
    totalCommissionEl.textContent = formatAED(totalCommission);
}

// Export to CSV
exportBtn.addEventListener('click', () => {
    if (records.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    const headers = [
        'ID', 'Name', 'Phone', 'Nationality', 'Amount (AED)', 'Staff Commission (AED)', 
        'Staff Name', 'Body Size', 'Behavior', 'Service Timing', 
        'Service Date', 'Service Time', 'Room Number', 
        'Repeat Customer', 'Mallu Customer', 'Created At'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    records.forEach(r => {
        const values = [
            r.id,
            `"${(r.name || '').replace(/"/g, '""')}"`,
            `"${(r.phone || '').replace(/"/g, '""')}"`,
            `"${(r.nationality || '').replace(/"/g, '""')}"`,
            r.amount_aed,
            r.staff_commission,
            `"${(r.staff_name || '').replace(/"/g, '""')}"`,
            `"${(r.body_size || '').replace(/"/g, '""')}"`,
            `"${(r.behavior || '').replace(/"/g, '""')}"`,
            `"${(r.service_timing || '').replace(/"/g, '""')}"`,
            r.service_date,
            r.service_time,
            `"${(r.room_number || '').replace(/"/g, '""')}"`,
            r.repeat_customer ? 'TRUE' : 'FALSE',
            r.mallu_customer ? 'TRUE' : 'FALSE',
            new Date(r.created_at).toISOString()
        ];
        csvRows.push(values.join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Customers_Database_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('Database exported successfully');
});

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if(toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
}

// Boot
initApp();
