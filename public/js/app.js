// ============================================
// MES Finder - Demo App (HTML Version)
// Uses localStorage for demo purposes
// ============================================

// Initialize demo data if not exists
function initDemoData() {
    if (!localStorage.getItem('mes_customers')) {
        localStorage.setItem('mes_customers', JSON.stringify([]));
    }
    if (!localStorage.getItem('mes_pengiring')) {
        // Add some demo pengiring
        const demoPengiring = [
            { id: 1, nama_pengiring: 'Ahmad Razali', email: 'ahmad@test.com', no_phone: '012-3456789', jantina: 'Lelaki', negeri: 'Selangor', jenis_kereta: 'Proton Saga', no_plate: 'ABC 1234', rating: 4.8, status: 'available' },
            { id: 2, nama_pengiring: 'Siti Aminah', email: 'siti@test.com', no_phone: '012-9876543', jantina: 'Perempuan', negeri: 'Selangor', jenis_kereta: 'Perodua Myvi', no_plate: 'XYZ 5678', rating: 4.5, status: 'available' },
            { id: 3, nama_pengiring: 'Lee Cheng', email: 'lee@test.com', no_phone: '013-1234567', jantina: 'Lelaki', negeri: 'Kuala Lumpur', jenis_kereta: 'Honda Civic', no_plate: 'DEF 9012', rating: 4.2, status: 'busy' },
            { id: 4, nama_pengiring: 'Nurul Huda', email: 'nurul@test.com', no_phone: '014-7654321', jantina: 'Perempuan', negeri: 'Johor', jenis_kereta: 'Perodua Axia', no_plate: 'GHI 3456', rating: 4.9, status: 'available' },
            { id: 5, nama_pengiring: 'Mohd Faiz', email: 'faiz@test.com', no_phone: '016-5432198', jantina: 'Lelaki', negeri: 'Pulau Pinang', jenis_kereta: 'Toyota Vios', no_plate: 'JKL 7890', rating: 4.6, status: 'available' }
        ];
        localStorage.setItem('mes_pengiring', JSON.stringify(demoPengiring));
    }
    if (!localStorage.getItem('mes_bookings')) {
        localStorage.setItem('mes_bookings', JSON.stringify([]));
    }
    if (!localStorage.getItem('mes_currentUser')) {
        localStorage.setItem('mes_currentUser', JSON.stringify(null));
    }
}

// Run initialization
initDemoData();

// ============================================
// Authentication Functions
// ============================================

function registerCustomer(data) {
    const customers = JSON.parse(localStorage.getItem('mes_customers') || '[]');
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    
    const newCustomer = {
        id: newId,
        ...data,
        created_at: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    localStorage.setItem('mes_customers', JSON.stringify(customers));
    
    // Auto login
    loginUser(newCustomer, 'customer');
    return newCustomer;
}

function registerPengiring(data) {
    const pengiringList = JSON.parse(localStorage.getItem('mes_pengiring') || '[]');
    const newId = pengiringList.length > 0 ? Math.max(...pengiringList.map(p => p.id)) + 1 : 1;
    
    const newPengiring = {
        id: newId,
        ...data,
        rating: 0,
        status: 'available',
        created_at: new Date().toISOString()
    };
    
    pengiringList.push(newPengiring);
    localStorage.setItem('mes_pengiring', JSON.stringify(pengiringList));
    
    // Auto login
    loginUser(newPengiring, 'pengiring');
    return newPengiring;
}

function loginUser(user, userType) {
    const session = {
        ...user,
        userType: userType,
        isLoggedIn: true
    };
    localStorage.setItem('mes_currentUser', JSON.stringify(session));
    return session;
}

function logout() {
    localStorage.setItem('mes_currentUser', JSON.stringify(null));
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('mes_currentUser'));
}

function isLoggedIn() {
    const user = getCurrentUser();
    return user && user.isLoggedIn;
}

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ============================================
// Booking Functions
// ============================================

function createBooking(bookingData) {
    const bookings = JSON.parse(localStorage.getItem('mes_bookings') || '[]');
    const user = getCurrentUser();
    const newId = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    
    const newBooking = {
        id: newId,
        customer_id: user.id,
        customer_name: user.nama_penjaga,
        ...bookingData,
        status: 'pending',
        customer_confirmed: 0,
        payment_status: 'unpaid',
        payment_id: null,
        created_at: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    localStorage.setItem('mes_bookings', JSON.stringify(bookings));
    return newBooking;
}

function getBookings() {
    const user = getCurrentUser();
    const bookings = JSON.parse(localStorage.getItem('mes_bookings') || '[]');
    
    if (user.userType === 'customer') {
        return bookings.filter(b => b.customer_id === user.id);
    } else if (user.userType === 'pengiring') {
        return bookings.filter(b => b.pengiring_id === user.id);
    }
    return bookings;
}

function getAllBookings() {
    return JSON.parse(localStorage.getItem('mes_bookings') || '[]');
}

function updateBooking(bookingId, updates) {
    const bookings = JSON.parse(localStorage.getItem('mes_bookings') || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);
    
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...updates };
        localStorage.setItem('mes_bookings', JSON.stringify(bookings));
        return bookings[index];
    }
    return null;
}

// ============================================
// Pengiring Functions
// ============================================

function getPengiring(state = null, gender = null) {
    let pengiringList = JSON.parse(localStorage.getItem('mes_pengiring') || '[]');
    
    // Filter by state
    if (state) {
        pengiringList = pengiringList.filter(p => p.negeri === state);
    }
    
    // Filter by gender
    if (gender) {
        pengiringList = pengiringList.filter(p => p.jantina === gender);
    }
    
    // Only available pengiring
    pengiringList = pengiringList.filter(p => p.status === 'available');
    
    // Sort by rating (highest first)
    pengiringList.sort((a, b) => b.rating - a.rating);
    
    return pengiringList;
}

function getAllPengiring() {
    return JSON.parse(localStorage.getItem('mes_pengiring') || '[]');
}

function updatePengiringStatus(pengiringId, status) {
    const pengiringList = JSON.parse(localStorage.getItem('mes_pengiring') || '[]');
    const index = pengiringList.findIndex(p => p.id === pengiringId);
    
    if (index !== -1) {
        pengiringList[index].status = status;
        localStorage.setItem('mes_pengiring', JSON.stringify(pengiringList));
        return pengiringList[index];
    }
    return null;
}

// ============================================
// Customer Functions
// ============================================

function getAllCustomers() {
    return JSON.parse(localStorage.getItem('mes_customers') || '[]');
}

// ============================================
// Payment Functions (Demo)
// ============================================

function processPayment(bookingId, paymentMethod) {
    const booking = updateBooking(bookingId, {
        payment_status: 'paid',
        payment_id: 'PAY' + Date.now(),
        payment_method: paymentMethod,
        paid_at: new Date().toISOString()
    });
    return booking;
}

// ============================================
// UI Helpers
// ============================================

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '80px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '<span style="color: #ffc107;">' + '&#9733;'.repeat(fullStars) + '</span>';
    if (hasHalfStar) html += '<span style="color: #ffc107;">&#9733;</span>';
    html += '<span style="color: #ccc;">' + '&#9733;'.repeat(emptyStars) + '</span>';
    
    return html;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Malaysian States
const STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu',
    'Wilayah Persekutuan Kuala Lumpur', 'Wilayah Persekutuan Labuan', 'Wilayah Persekutuan Putrajaya'
];

const PACKAGES = {
    '3jam': { hours: 3, price: 60 },
    '6jam': { hours: 6, price: 110 }
};

const EXTRA_HOUR_PRICE = 20;

// Chat functions (localStorage based)
function sendChatMessage(bookingId, message) {
    const key = `chat_${bookingId}`;
    let messages = JSON.parse(localStorage.getItem(key) || '[]');
    const user = getCurrentUser();
    
    const newMessage = {
        id: messages.length + 1,
        sender_type: user.userType,
        sender_name: user.nama_penjaga || user.nama_pengiring,
        sender_id: user.id,
        message: message,
        created_at: new Date().toISOString(),
        is_read: 0
    };
    
    messages.push(newMessage);
    localStorage.setItem(key, JSON.stringify(messages));
    return newMessage;
}

function getChatMessages(bookingId) {
    const key = `chat_${bookingId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// Menu toggle for mobile
function toggleMenu() {
    document.getElementById('navMenu')?.classList.toggle('active');
}

// Generate options HTML for states
function getStateOptions(selected = '') {
    return STATES.map(state => 
        `<option value="${state}" ${state === selected ? 'selected' : ''}>${state}</option>`
    ).join('');
}
