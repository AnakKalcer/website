// ============= DESIGN 01 - INTERACTIVE BANKING APP =============

// Global variable for splash screen timeout
let splashTimeout;

// Screen Navigation
function goToScreen(screenId) {
    console.log('Going to screen:', screenId); // Debug log
    
    // Clear any existing splash timeout
    if (splashTimeout) {
        clearTimeout(splashTimeout);
        console.log('Previous splash timeout cleared'); // Debug log
    }
    
    // Hide all screens
    const allScreens = document.querySelectorAll('.app-screen');
    allScreens.forEach(screen => {
        screen  .classList.remove('active-screen');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
        console.log('Screen shown:', screenId); // Debug log
        
        // Update bottom navigation visibility and active state
        updateBottomNav(screenId);
        
        // Auto-advance from splash screen to login after 5 seconds
        if (screenId === 'screen-splash') {
            console.log('Splash screen shown, starting 5 second timer...'); // Debug log
            splashTimeout = setTimeout(() => {
                console.log('5 seconds timeout triggered, going to login'); // Debug log
                goToScreen('screen-login');
            }, 5000);
        }
        
        // Load data when screen changes
        if (screenId === 'screen-profile') {
            displayUserProfile();
        } else if (screenId === 'screen-settings') {
            loadSettingsForm();
        } else if (screenId === 'screen-transactions') {
            displayTransactions();
        } else if (screenId === 'screen-news') {
            loadNewsFromAPI();
        } else if (screenId === 'screen-dashboard') {
            checkProfileCompletion();
            updateDashboardNews();
            setupNewsAutoRefresh();
        }
    } else {
        console.error('Screen not found:', screenId); // Error log
    }
}

// ============= LOGIN FLOW =============

// Handle Login Form Submit
function handleLogin() {
    const accountNumber = document.getElementById('account-number').value.trim();
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Phone number validation (MSISDN format)
    if (!accountNumber) {
        showToast('Masukkan nomor telepon Anda', 'error');
        return;
    }
    
    // Validate phone format: +62 or 08, followed by 9-11 digits
    const phoneRegex = /^(\+62|08)\d{9,11}$/;
    const cleanedPhone = accountNumber.replace(/\D/g, '');
    
    if (!phoneRegex.test(accountNumber) && !phoneRegex.test('08' + cleanedPhone.substring(1))) {
        showToast('Format nomor telepon tidak valid (gunakan +62 atau 08)', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Setujui syarat & ketentuan untuk melanjutkan', 'error');
        return;
    }
    
    // Save phone number to localStorage for session
    localStorage.setItem('accountNumber', accountNumber);
    
    // Display phone number on OTP screen
    document.getElementById('otp-phone-number').textContent = `Kode verifikasi dikirim ke ${accountNumber}`;
    
    // Start OTP resend countdown
    startOTPCountdown();
    
    // Navigate to OTP verification screen
    goToScreen('screen-verify');
    
    // Focus on first OTP input
    setTimeout(() => {
        const firstOTPBox = document.querySelector('.otp-box');
        if (firstOTPBox) firstOTPBox.focus();
    }, 100);
}

// ============= VERIFICATION FLOW =============

// Handle OTP Verification
function handleVerify() {
    const uniqueCodeInput = document.getElementById('unique-code');
    const uniqueCode = uniqueCodeInput.value.trim();
    
    // Validation
    if (!uniqueCode) {
        showToast('Masukkan kode unik Anda', 'error');
        return;
    }
    
    if (uniqueCode.length < 3) {
        showToast('Kode unik harus minimal 3 karakter', 'error');
        return;
    }
    
    // For demo: any non-empty code is accepted as valid
    // In production, this would be sent to backend for verification
    
    // Show success and navigate to dashboard
    showToast('Kode Berhasil Diverifikasi! ✓', 'success');
    
    // Clear unique code input for next login
    uniqueCodeInput.value = '';
    
    // Initialize CRUD data if not exists
    initializeCRUDData();
    
    // Navigate to dashboard
    setTimeout(() => {
        goToScreen('screen-dashboard');
    }, 500);
}

// ============= VERIFICATION FLOW (CONTINUED) =============

// Back button from verify to login
function goBackToLogin() {
    // Clear unique code input
    const uniqueCodeInput = document.getElementById('unique-code');
    if (uniqueCodeInput) {
        uniqueCodeInput.value = '';
    }
    
    // Clear countdown timer
    if (window.otpCountdownInterval) {
        clearInterval(window.otpCountdownInterval);
    }
    
    goToScreen('screen-login');
}

// Auto-focus next OTP box when digit is entered
function focusNextOTP(element) {
    // Only allow numbers
    element.value = element.value.replace(/[^0-9]/g, '');
    
    if (element.value.length > 0) {
        const index = parseInt(element.getAttribute('data-index'));
        const otpBoxes = document.querySelectorAll('.otp-box');
        
        // Move to next box if available
        if (index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
        }
    }
}

// Start OTP resend countdown timer
let otpCountdownInterval;
function startOTPCountdown() {
    const resendBtn = document.getElementById('btn-resend');
    const countdownSpan = document.getElementById('countdown');
    let seconds = 30;
    
    // Disable resend button
    resendBtn.disabled = true;
    countdownSpan.textContent = seconds;
    
    // Countdown interval
    if (otpCountdownInterval) clearInterval(otpCountdownInterval);
    
    otpCountdownInterval = setInterval(() => {
        seconds--;
        countdownSpan.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(otpCountdownInterval);
            resendBtn.disabled = false;
            countdownSpan.textContent = 'Kirim ulang';
            resendBtn.textContent = 'Kirim Ulang';
        }
    }, 1000);
}

// Handle OTP resend
function resendOTP() {
    const resendBtn = document.getElementById('btn-resend');
    showToast('Kode OTP telah dikirim ulang', 'success');
    resendBtn.disabled = true;
    startOTPCountdown();
}

// ============= DASHBOARD & LOGOUT =============

// Handle Logout
function handleLogout() {
    console.log('Logout button clicked'); // Debug log
    const confirmLogout = confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
        console.log('Logout confirmed'); // Debug log
        
        // Clear localStorage
        localStorage.removeItem('accountNumber');
        console.log('LocalStorage cleared'); // Debug log
        
        // Clear all form inputs - using more specific selectors
        try {
            const accountInput = document.getElementById('account-number');
            const otpInput = document.getElementById('otp-code');
            const agreeCheckbox = document.getElementById('agree-terms');
            
            if (accountInput) {
                accountInput.value = '';
                console.log('Account input cleared'); // Debug log
            }
            if (otpInput) {
                otpInput.value = '';
                console.log('OTP input cleared'); // Debug log
            }
            if (agreeCheckbox) {
                agreeCheckbox.checked = false;
                console.log('Checkbox cleared'); // Debug log
            }
        } catch (e) {
            console.error('Error clearing inputs:', e);
        }
        
        console.log('All inputs cleared'); // Debug log
        
        // Return to splash screen (which will auto-advance after 5 seconds)
        goToScreen('screen-splash');
        
        console.log('Navigated to splash'); // Debug log
        
        alert('Berhasil keluar dari akun. Selamat datang kembali!');
    } else {
        console.log('Logout cancelled'); // Debug log
    }
}

// ============= INPUT FORMATTING =============

// Account number input - numbers only
const accountInput = document.getElementById('account-number');
if (accountInput) {
    accountInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// OTP input - alphanumeric, max 6 characters
const otpInput = document.getElementById('otp-code');
if (otpInput) {
    otpInput.addEventListener('input', function(e) {
        // Only allow alphanumeric characters
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // Limit to 6 characters
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
    });
}

// ============= PROFILE MANAGEMENT =============

// Display user profile
function displayUserProfile() {
    const userName = localStorage.getItem('userName') || '-';
    const userEmail = localStorage.getItem('userEmail') || '-';
    const userPhone = localStorage.getItem('userPhone') || '-';
    const userDOB = localStorage.getItem('userDOB') || '-';
    const userPhoto = localStorage.getItem('userPhoto');
    
    document.getElementById('display-name').textContent = userName;
    document.getElementById('display-email').textContent = userEmail;
    document.getElementById('display-phone').textContent = userPhone;
    document.getElementById('display-dob').textContent = userDOB;
    
    if (userPhoto) {
        document.getElementById('profile-photo-display').src = userPhoto;
    }
    
    // Check if profile is incomplete
    checkProfileCompletion();
}

// Load settings form from localStorage
function loadSettingsForm() {
    document.getElementById('settings-name').value = localStorage.getItem('userName') || '';
    document.getElementById('settings-email').value = localStorage.getItem('userEmail') || '';
    document.getElementById('settings-phone').value = localStorage.getItem('userPhone') || '';
    document.getElementById('settings-dob').value = localStorage.getItem('userDOB') || '';
}

// Save profile settings
function saveProfileSettings() {
    const name = document.getElementById('settings-name').value.trim();
    const email = document.getElementById('settings-email').value.trim();
    const phone = document.getElementById('settings-phone').value.trim();
    const dob = document.getElementById('settings-dob').value;
    
    // Validation
    if (!name || !email || !phone || !dob) {
        alert('Mohon isi semua bidang');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Format email tidak valid');
        return;
    }
    
    // Phone validation (basic)
    if (!/^\d{10,13}$/.test(phone.replace(/\D/g, ''))) {
        alert('Nomor telepon harus 10-13 digit');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userDOB', dob);
    localStorage.setItem('profileComplete', 'true');
    
    alert('Profil berhasil disimpan!');
    
    // Refresh profile display
    displayUserProfile();
    
    // Update notification badge immediately
    checkProfileCompletion();
    
    // Go back to dashboard
    goToScreen('screen-dashboard');
}

// Handle photo upload
function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const photoData = e.target.result;
            
            // Save photo as base64 to localStorage
            localStorage.setItem('userPhoto', photoData);
            
            // Update preview
            document.getElementById('profile-photo-display').src = photoData;
            
            alert('Foto profil berhasil diperbarui!');
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Check if profile is complete
function checkProfileCompletion() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userDOB = localStorage.getItem('userDOB');
    
    const isComplete = userName && userEmail && userDOB;
    const badge = document.getElementById('notification-badge');
    
    if (!isComplete && badge) {
        badge.style.display = 'flex';
        badge.textContent = '!';
    } else if (badge) {
        badge.style.display = 'none';
    }
    
    // Update notifications screen
    updateNotificationsScreen();
}

// Update notifications screen content
function updateNotificationsScreen() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;
    
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userDOB = localStorage.getItem('userDOB');
    
    const isComplete = userName && userEmail && userDOB;
    
    // Build notifications array
    const notifications = [];
    
    if (!isComplete) {
        notifications.push({
            type: 'warning',
            icon: 'fa-exclamation-circle',
            title: 'Profil Belum Lengkap',
            message: 'Lengkapi profil Anda sekarang untuk membuka akses penuh ke semua fitur premium FinHub.',
            action: 'Lengkapi Sekarang',
            actionHandler: "goToScreen('screen-settings')"
        });
    }
    
    // Add welcome notification
    notifications.push({
        type: 'info',
        icon: 'fa-info-circle',
        title: 'Selamat Datang!',
        message: 'Nikmati kemudahan transaksi perbankan digital dengan FinHub yang aman dan terpercaya.'
    });
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `<div class="notification-item notification-success">
            <i class="fas fa-check-circle"></i>
            <div class="notification-item-content">
                <p class="notification-item-title">Semua Siap! ✓</p>
                <p>Tidak ada notifikasi baru. Profil Anda sudah lengkap dan siap digunakan.</p>
            </div>
        </div>`;
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notif => {
        const actionBtn = notif.actionHandler ? `<button class="notification-action" onclick="${notif.actionHandler}">${notif.action}</button>` : '';
        const title = notif.title ? `<p class="notification-item-title">${notif.title}</p>` : '';
        return `<div class="notification-item notification-${notif.type}">
            <i class="fas ${notif.icon}"></i>
            <div class="notification-item-content">
                ${title}
                <p>${notif.message}</p>
                ${actionBtn}
            </div>
        </div>`;
    }).join('');
}

// Close profile notification (legacy - keeping for compatibility)
function closeProfileNotification() {
    // Function now handled by badge system
}

// ============= SEARCH FUNCTIONALITY =============

const searchData = [
    { name: 'Transfer', icon: 'fa-arrow-right-arrow-left', screen: 'screen-transactions' },
    { name: 'Pembayaran', icon: 'fa-credit-card' },
    { name: 'Investasi', icon: 'fa-chart-line' },
    { name: 'Cicilan', icon: 'fa-percent' },
    { name: 'Kartu Kredit', icon: 'fa-wallet' },
    { name: 'Berita Terkini', icon: 'fa-newspaper', screen: 'screen-news' },
    { name: 'Chat Support', icon: 'fa-comments' },
    { name: 'FAQ', icon: 'fa-circle-question' }
];

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    const emptyContainer = document.getElementById('search-empty');
    
    if (!searchTerm) {
        resultsContainer.style.display = 'none';
        emptyContainer.style.display = 'block';
        return;
    }
    
    // Filter search data
    const results = searchData.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );
    
    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="selectSearchResult('${item.screen || ''}')">
                <i class="fas ${item.icon}"></i>
                <p>${item.name}</p>
            </div>
        `).join('');
        resultsContainer.style.display = 'grid';
        emptyContainer.style.display = 'none';
    } else {
        resultsContainer.style.display = 'none';
        emptyContainer.style.display = 'block';
    }
}

function selectSearchResult(screenId) {
    if (screenId) {
        goToScreen(screenId);
    }
}

// ============= TRANSACTIONS/NEWS SCREEN =============

function displayTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    
    // Sample transaction data
    const transactions = [
        { title: 'Transfer Ke Dini Suryani', date: '15 Januari 2024', amount: '-Rp100.000', icon: 'fa-arrow-right' },
        { title: 'Terima Transfer dari Budi', date: '14 Januari 2024', amount: '+Rp500.000', icon: 'fa-arrow-left' },
        { title: 'Pembayaran Listrik', date: '13 Januari 2024', amount: '-Rp450.000', icon: 'fa-bolt' },
        { title: 'Tagihan Kartu Kredit', date: '12 Januari 2024', amount: '-Rp2.500.000', icon: 'fa-credit-card' }
    ];
    
    transactionsList.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon">
                    <i class="fas ${t.icon}"></i>
                </div>
                <div class="transaction-details">
                    <p class="transaction-title">${t.title}</p>
                    <p class="transaction-date">${t.date}</p>
                </div>
            </div>
            <div class="transaction-amount">${t.amount}</div>
        </div>
    `).join('');
}

// ============= NEWS SCREEN WITH API INTEGRATION =============

// Show skeleton loading for news
function showSkeletonLoading() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    const skeletons = Array(4).fill().map(() => `
        <div class="skeleton-card">
            <div class="skeleton-image skeleton"></div>
            <div class="skeleton-text">
                <div class="skeleton-title skeleton"></div>
                <div class="skeleton-desc skeleton"></div>
                <div class="skeleton-desc skeleton" style="width: 75%;"></div>
            </div>
        </div>
    `).join('');
    
    newsList.innerHTML = skeletons;
}

async function loadNewsFromAPI() {
    const newsList = document.getElementById('news-list');
    showSkeletonLoading(); // Show skeleton loading while fetching
    
    try {
        // Try using GNews API (free, no auth needed for basic queries)
        // Alternative: NewsAPI.org (get free API key from https://newsapi.org)
        
        // Option 1: Using GNews API (No key required for basic usage)
        const gNewsUrl = 'https://gnews.io/api/v4/search?q=banking%20OR%20finance&lang=en&sortby=publishedAt&max=10';
        
        try {
            const response = await fetch(gNewsUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.articles && data.articles.length > 0) {
                    displayApiNews(data.articles);
                    return;
                }
            }
        } catch (apiError) {
            console.log('GNews API failed, trying alternative...');
        }
        
        // Option 2: Using NewsAPI.org (recommended - get free API key from newsapi.org)
        // Free key: demo for limited requests
        const newsApiUrl = 'https://newsapi.org/v2/everything?q=banking&sortBy=publishedAt&language=en&pageSize=10&apiKey=demo';
        
        try {
            const response = await fetch(newsApiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.articles && data.articles.length > 0) {
                    displayApiNews(data.articles);
                    return;
                }
            }
        } catch (apiError) {
            console.log('NewsAPI failed, shows sample news');
        }
        
        // Fallback to sample data if APIs fail
        displaySampleNews();
        
    } catch (error) {
        console.error('Error loading news:', error);
        displaySampleNews();
    }
}

function displayApiNews(articles) {
    const newsList = document.getElementById('news-list');
    
    // Process and display API news with enhanced formatting
    const newsHTML = articles.slice(0, 8).map((article, index) => {
        const imageUrl = article.image || article.urlToImage || generatePlaceholderImage();
        const title = article.title || 'Berita Tanpa Judul';
        const description = article.description || article.content || 'Baca selengkapnya...';
        const source = article.source?.name || article.source || 'News Source';
        const date = formatDate(article.publishedAt || article.pubDate || new Date());
        const shortTitle = title.substring(0, 55) + (title.length > 55 ? '...' : '');
        const shortDesc = description.substring(0, 95) + (description.length > 95 ? '...' : '');
        const animationDelay = (index * 0.1) + 's';
        
        return `<div class="news-item" style="animation-delay: ${animationDelay}">
            <img src="${imageUrl}" class="news-image" alt="${title.substring(0, 30)}" loading="lazy">
            <div class="news-body">
                <p class="news-source">${source}</p>
                <p class="news-title">${shortTitle}</p>
                <p class="news-description">${shortDesc}</p>
                <p class="news-date">${date}</p>
            </div>
        </div>`;
    }).join('');
    
    newsList.innerHTML = newsHTML || '<p style="text-align: center; color: #999; padding: 20px;">Tidak ada berita tersedia</p>';
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch {
        return new Date().toLocaleDateString('id-ID');
    }
}

function generatePlaceholderImage() {
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 150%22%3E%3Crect fill=%22%230052CC%22 width=%22300%22 height=%22150%22/%3E%3Ctext x=%22150%22 y=%2275%22 text-anchor=%22middle%22 dy=%220.3em%22 fill=%22white%22 font-size=%2224%22%3E📰%3C/text%3E%3C/svg%3E';
}

function displaySampleNews() {
    const newsList = document.getElementById('news-list');
    
    // Sample news data for fallback
    const newsData = [
        {
            source: 'FINTECH NEWS',
            title: 'BCA Luncurkan Platform Investasi Digital Terbaru 2024',
            description: 'BCA mengumumkan peluncuran platform investasi digital dengan fitur lengkap untuk investor pemula dengan return investment yang kompetitif.',
            date: 'Hari ini',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"%3E%3Crect fill="%230052CC" width="300" height="150"/%3E%3Ctext x="150" y="75" text-anchor="middle" dy="0.3em" fill="white" font-size="24"%3E💼%3C/text%3E%3C/svg%3E'
        },
        {
            source: 'BANKING UPDATE',
            title: 'Suku Bunga Bank Indonesia Turun 0.5% Semester Ini',
            description: 'Bank Indonesia mengumumkan penurunan suku bunga acuan sebagai bagian dari kebijakan moneter ekspansif untuk mendorong pertumbuhan ekonomi.',
            date: 'Kemarin',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"%3E%3Crect fill="%23003DA5" width="300" height="150"/%3E%3Ctext x="150" y="75" text-anchor="middle" dy="0.3em" fill="white" font-size="24"%3E📊%3C/text%3E%3C/svg%3E'
        },
        {
            source: 'FINANCIAL NEWS',
            title: 'Tips Mengatur Keuangan Pribadi di Era Digital',
            description: 'Pakar keuangan memberikan tips praktis untuk mengelola keuangan pribadi dengan aplikasi banking digital dan investasi cerdas.',
            date: '2 hari lalu',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"%3E%3Crect fill="%2300C44D" width="300" height="150"/%3E%3Ctext x="150" y="75" text-anchor="middle" dy="0.3em" fill="white" font-size="24"%3E💡%3C/text%3E%3C/svg%3E'
        },
        {
            source: 'MARKET ANALYSIS',
            title: 'Rupiah Menguat Terhadap Dollar AS Minggu Ini',
            description: 'Mata uang rupiah menunjukkan tren penguatan terhadap dolar Amerika di tengah perkembangan positif ekonomi domestik.',
            date: '3 hari lalu',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"%3E%3Crect fill="%23FF6348" width="300" height="150"/%3E%3Ctext x="150" y="75" text-anchor="middle" dy="0.3em" fill="white" font-size="24"%3E💰%3C/text%3E%3C/svg%3E'
        },
        {
            source: 'CRYPTO NEWS',
            title: 'Blockchain dan Cryptocurrency Makin Diterima Bank',
            description: 'Beberapa bank besar mulai mengadopsi teknologi blockchain untuk meningkatkan efisiensi transaksi internasional.',
            date: '4 hari lalu',
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"%3E%3Crect fill="%239C27B0" width="300" height="150"/%3E%3Ctext x="150" y="75" text-anchor="middle" dy="0.3em" fill="white" font-size="24"%3E⛓️%3C/text%3E%3C/svg%3E'
        }
    ];
    
    newsList.innerHTML = newsData.map((news, index) => {
        const animationDelay = (index * 0.1) + 's';
        return `<div class="news-item" style="animation-delay: ${animationDelay}">
            <img src="${news.image}" class="news-image" alt="${news.title}">
            <div class="news-body">
                <p class="news-source">${news.source}</p>
                <p class="news-title">${news.title}</p>
                <p class="news-description">${news.description}</p>
                <p class="news-date">${news.date}</p>
            </div>
        </div>`;
    }).join('');
}

// Global variable for news refresh interval
let newsRefreshInterval;

// Update balance card from dashboard news section WITH IMAGES
async function updateDashboardNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        // Try fetching from GNews API first
        const gNewsUrl = 'https://gnews.io/api/v4/search?q=banking%20finance&lang=en&sortby=publishedAt&max=2';
        
        try {
            const response = await fetch(gNewsUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.articles && data.articles.length > 0) {
                    const articles = data.articles.slice(0, 2);
                    
                    // Create cards with images from API
                    newsContainer.innerHTML = articles.map((article, idx) => {
                        const imageUrl = article.image || '';
                        const title = article.title?.substring(0, 40) || 'Berita Financial';
                        const desc = article.description?.substring(0, 35) || 'Baca selengkapnya';
                        const bgImage = imageUrl ? `background-image: url('${imageUrl}');` : '';
                        
                        return `<div class="promo-card promo-blue" style="${bgImage} background-size: cover; background-position: center;">
                            <div class="promo-card-content">
                                <div class="promo-label"><i class="fas fa-newspaper"></i> ${title}</div>
                                <p class="promo-desc">${desc}</p>
                            </div>
                        </div>`;
                    }).join('');
                    return;
                }
            }
        } catch (error) {
            console.log('GNews API failed for dashboard');
        }
        
        // Fallback to sample promo news with placeholder images
        displayDefaultDashboardNews();
        
    } catch (error) {
        console.error('Error updating dashboard news:', error);
        displayDefaultDashboardNews();
    }
}

// Display default dashboard news
function displayDefaultDashboardNews() {
    const newsContainer = document.getElementById('news-container');
    const newsData = [
        { 
            title: 'Investasi Menguntungkan', 
            desc: 'Return 8% per tahun', 
            emoji: '📈',
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g1%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%230052CC;%22/%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2300C44D;%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22url(%23g1)%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%22200%22 y=%22100%22 text-anchor=%22middle%22 dy=%220.3em%22 fill=%22white%22 font-size=%2248%22%3E📈%3C/text%3E%3C/svg%3E'
        },
        { 
            title: 'Program Cashback', 
            desc: 'Hingga 5% setiap transaksi', 
            emoji: '💰',
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g2%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%23003DA5;%22/%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%230052CC;%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22url(%23g2)%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%22200%22 y=%22100%22 text-anchor=%22middle%22 dy=%220.3em%22 fill=%22white%22 font-size=%2248%22%3E💰%3C/text%3E%3C/svg%3E'
        }
    ];
    
    newsContainer.innerHTML = newsData.map(n => {
        const bgImage = `background-image: url('${n.image}');`;
        return `<div class="promo-card promo-blue" style="${bgImage} background-size: cover; background-position: center;">
            <div class="promo-card-content">
                <div class="promo-label">${n.emoji} ${n.title}</div>
                <p class="promo-desc">${n.desc}</p>
            </div>
        </div>`;
    }).join('');
}

// Setup auto-refresh news every 5 minutes (300000 ms)
function setupNewsAutoRefresh() {
    // Clear previous interval if exists
    if (newsRefreshInterval) {
        clearInterval(newsRefreshInterval);
    }
    
    // Refresh news every 5 minutes
    newsRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing news...');
        updateDashboardNews();
        loadNewsFromAPI();
    }, 300000); // 5 minutes
}

// ============= BOTTOM NAVIGATION =============

function updateBottomNav(screenId) {
    // Map screen IDs to nav items
    const screenMap = {
        'screen-dashboard': 0,
        'screen-transactions': 1,
        'screen-search': 2,
        'screen-profile': 3
    };
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.classList.remove('active');
    });
    
    const targetIndex = screenMap[screenId];
    if (targetIndex !== undefined && navItems[targetIndex]) {
        navItems[targetIndex].classList.add('active');
    }
    
    // Control bottom navigation visibility
    const bottomNav = document.querySelector('.bottom-nav');
    const hideNavScreens = ['screen-splash', 'screen-login', 'screen-verify'];
    
    if (bottomNav) {
        if (hideNavScreens.includes(screenId)) {
            bottomNav.style.display = 'none';
            bottomNav.style.visibility = 'hidden';
            bottomNav.style.opacity = '0';
            bottomNav.style.pointerEvents = 'none';
        } else {
            bottomNav.style.display = 'flex';
            bottomNav.style.visibility = 'visible';
            bottomNav.style.opacity = '1';
            bottomNav.style.pointerEvents = 'auto';
        }
    }
}

// ============= CRUD SYSTEM & LOCALSTORAGE UTILITIES =============

// Initialize CRUD data structures
function initializeCRUDData() {
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('payments')) {
        localStorage.setItem('payments', JSON.stringify([]));
    }
    if (!localStorage.getItem('investments')) {
        localStorage.setItem('investments', JSON.stringify([]));
    }
    if (!localStorage.getItem('loans')) {
        localStorage.setItem('loans', JSON.stringify([]));
    }
}

// Get all activities (aggregated from all transaction types)
function getAllActivities() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
    
    const allActivities = [
        ...transactions.map(t => ({ ...t, type: 'transfer', icon: 'fa-arrow-right-arrow-left' })),
        ...payments.map(p => ({ ...p, type: 'payment', icon: 'fa-credit-card' })),
        ...investments.map(i => ({ ...i, type: 'investment', icon: 'fa-chart-line' })),
        ...loans.map(l => ({ ...l, type: 'loan', icon: 'fa-percent' }))
    ];
    
    // Sort by date (newest first)
    return allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============= MODAL FUNCTIONS =============

let currentTransactionId = null;
let currentTransactionType = null;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Clear form inputs
        clearModalForm(modalId);
    }
}

function clearModalForm(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const inputs = modal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
    }
}

// ============= TRANSFER FUNCTIONS =============

function submitTransfer() {
    const recipient = document.getElementById('transfer-recipient').value.trim();
    const account = document.getElementById('transfer-account').value.trim();
    const amount = document.getElementById('transfer-amount').value.trim();
    const note = document.getElementById('transfer-note').value.trim();
    
    // Validation
    if (!recipient || !account || !amount) {
        showToast('Mohon isi semua field yang wajib', 'error');
        return;
    }
    
    if (amount <= 0) {
        showToast('Nominal harus lebih dari 0', 'error');
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(),
        recipient,
        account,
        amount: parseInt(amount),
        note,
        date: new Date().toLocaleString('id-ID'),
        timestamp: new Date().getTime()
    };
    
    // Save to localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Close modal and show success message
    closeModal('modal-transfer');
    showToast(`Transfer ke ${recipient} sebesar Rp${parseInt(amount).toLocaleString('id-ID')} berhasil!`, 'success');
    
    // Refresh transactions display
    loadTransactionsView();
}

// ============= PAYMENT FUNCTIONS =============

function submitPayment() {
    const type = document.getElementById('payment-type').value.trim();
    const customerId = document.getElementById('payment-customer-id').value.trim();
    const amount = document.getElementById('payment-amount').value.trim();
    
    // Validation
    if (!type || !customerId || !amount) {
        showToast('Mohon isi semua field yang wajib', 'error');
        return;
    }
    
    if (amount <= 0) {
        showToast('Nominal harus lebih dari 0', 'error');
        return;
    }
    
    // Create payment object
    const payment = {
        id: Date.now(),
        type,
        customerId,
        amount: parseInt(amount),
        date: new Date().toLocaleString('id-ID'),
        timestamp: new Date().getTime(),
        status: 'completed'
    };
    
    // Save to localStorage
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Close modal and show success message
    closeModal('modal-payment');
    showToast(`Pembayaran ${type} sebesar Rp${parseInt(amount).toLocaleString('id-ID')} berhasil!`, 'success');
    
    // Refresh transactions display
    loadTransactionsView();
}

// ============= INVESTMENT FUNCTIONS =============

function submitInvestment() {
    const asset = document.getElementById('investment-asset').value.trim();
    const amount = document.getElementById('investment-amount').value.trim();
    const duration = document.getElementById('investment-duration').value.trim();
    
    // Validation
    if (!asset || !amount || !duration) {
        showToast('Mohon isi semua field yang wajib', 'error');
        return;
    }
    
    if (amount <= 0 || duration <= 0) {
        showToast('Nominal dan durasi harus lebih dari 0', 'error');
        return;
    }
    
    // Create investment object
    const investment = {
        id: Date.now(),
        asset,
        amount: parseInt(amount),
        duration: parseInt(duration),
        date: new Date().toLocaleString('id-ID'),
        timestamp: new Date().getTime(),
        status: 'active',
        returns: Math.round(parseInt(amount) * 0.08) // Simulated 8% returns
    };
    
    // Save to localStorage
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    investments.push(investment);
    localStorage.setItem('investments', JSON.stringify(investments));
    
    // Close modal and show success message
    closeModal('modal-investment');
    showToast(`Investasi di ${asset} sebesar Rp${parseInt(amount).toLocaleString('id-ID')} berhasil dimulai!`, 'success');
    
    // Refresh transactions display
    loadTransactionsView();
}

// ============= LOAN FUNCTIONS =============

function submitLoan() {
    const name = document.getElementById('loan-name').value.trim();
    const total = document.getElementById('loan-total').value.trim();
    const months = document.getElementById('loan-months').value.trim();
    const duedate = document.getElementById('loan-duedate').value;
    
    // Validation
    if (!name || !total || !months || !duedate) {
        showToast('Mohon isi semua field yang wajib', 'error');
        return;
    }
    
    if (total <= 0 || months <= 0) {
        showToast('Total cicilan dan durasi harus lebih dari 0', 'error');
        return;
    }
    
    // Create loan object
    const loan = {
        id: Date.now(),
        name,
        total: parseInt(total),
        months: parseInt(months),
        monthlyPayment: Math.ceil(parseInt(total) / parseInt(months)),
        dueDate: duedate,
        date: new Date().toLocaleString('id-ID'),
        timestamp: new Date().getTime(),
        status: 'active',
        paidMonths: 0
    };
    
    // Save to localStorage
    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
    loans.push(loan);
    localStorage.setItem('loans', JSON.stringify(loans));
    
    // Close modal and show success message
    closeModal('modal-loan');
    showToast(`Cicilan ${name} sebesar Rp${loan.monthlyPayment.toLocaleString('id-ID')}/bulan berhasil diajukan!`, 'success');
    
    // Refresh transactions display
    loadTransactionsView();
}

// ============= TRANSACTION LIST DISPLAY =============

function loadTransactionsView() {
    const allActivities = getAllActivities();
    const transactionsList = document.getElementById('transactions-list');
    
    if (!transactionsList) return;
    
    if (allActivities.length === 0) {
        transactionsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>Belum ada aktivitas transaksi</p>
                <p style="font-size: 12px;">Mulai dengan melakukan transfer, pembayaran, atau investasi</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = allActivities.map(activity => {
        let title = '';
        let description = '';
        let amount = '';
        let icon = activity.icon;
        
        if (activity.type === 'transfer') {
            title = `Transfer ke ${activity.recipient}`;
            description = `Rekening: ${activity.account}`;
            amount = `-Rp${activity.amount.toLocaleString('id-ID')}`;
        } else if (activity.type === 'payment') {
            title = `Pembayaran ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`;
            description = `ID: ${activity.customerId}`;
            amount = `-Rp${activity.amount.toLocaleString('id-ID')}`;
        } else if (activity.type === 'investment') {
            title = `Investasi - ${activity.asset}`;
            description = `Durasi: ${activity.duration} bulan`;
            amount = `-Rp${activity.amount.toLocaleString('id-ID')}`;
        } else if (activity.type === 'loan') {
            title = `Cicilan - ${activity.name}`;
            description = `Rp${activity.monthlyPayment.toLocaleString('id-ID')}/bulan`;
            amount = `Rp${activity.monthlyPayment.toLocaleString('id-ID')}`;
        }
        
        return `
            <div class="transaction-item" onclick="showTransactionDetail('${activity.type}', ${activity.id})">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="transaction-details">
                        <p class="transaction-title">${title}</p>
                        <p class="transaction-date">${activity.date}</p>
                    </div>
                </div>
                <div class="transaction-amount">${amount}</div>
            </div>
        `;
    }).join('');
}

// ============= TRANSACTION DETAIL VIEW =============

function showTransactionDetail(type, id) {
    currentTransactionType = type;
    currentTransactionId = id;
    
    let data = [];
    if (type === 'transfer') {
        data = JSON.parse(localStorage.getItem('transactions') || '[]');
    } else if (type === 'payment') {
        data = JSON.parse(localStorage.getItem('payments') || '[]');
    } else if (type === 'investment') {
        data = JSON.parse(localStorage.getItem('investments') || '[]');
    } else if (type === 'loan') {
        data = JSON.parse(localStorage.getItem('loans') || '[]');
    }
    
    const activity = data.find(item => item.id === id);
    if (!activity) {
        showToast('Data tidak ditemukan', 'error');
        return;
    }
    
    let detailHTML = '';
    
    if (type === 'transfer') {
        detailHTML = `
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Penerima</span>
                <span class="transaction-detail-value">${activity.recipient}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Nomor Rekening</span>
                <span class="transaction-detail-value">${activity.account}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Nominal</span>
                <span class="transaction-detail-value" style="color: #FF4757;">-Rp${activity.amount.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Catatan</span>
                <span class="transaction-detail-value">${activity.note || '-'}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Tanggal & Waktu</span>
                <span class="transaction-detail-value">${activity.date}</span>
            </div>
        `;
    } else if (type === 'payment') {
        detailHTML = `
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Jenis Tagihan</span>
                <span class="transaction-detail-value">${activity.type}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">ID Pelanggan</span>
                <span class="transaction-detail-value">${activity.customerId}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Nominal Pembayaran</span>
                <span class="transaction-detail-value" style="color: #FF4757;">-Rp${activity.amount.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Status</span>
                <span class="transaction-detail-value" style="color: #00C44D;">${activity.status}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Tanggal & Waktu</span>
                <span class="transaction-detail-value">${activity.date}</span>
            </div>
        `;
    } else if (type === 'investment') {
        detailHTML = `
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Aset Investasi</span>
                <span class="transaction-detail-value">${activity.asset}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Nominal Investasi</span>
                <span class="transaction-detail-value">Rp${activity.amount.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Durasi</span>
                <span class="transaction-detail-value">${activity.duration} bulan</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Proyeksi Return</span>
                <span class="transaction-detail-value" style="color: #00C44D;">+Rp${activity.returns.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Status</span>
                <span class="transaction-detail-value" style="color: #00C44D;">${activity.status}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Tanggal & Waktu</span>
                <span class="transaction-detail-value">${activity.date}</span>
            </div>
        `;
    } else if (type === 'loan') {
        detailHTML = `
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Nama Cicilan</span>
                <span class="transaction-detail-value">${activity.name}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Total Cicilan</span>
                <span class="transaction-detail-value">Rp${activity.total.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Durasi</span>
                <span class="transaction-detail-value">${activity.months} bulan</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Cicilan per Bulan</span>
                <span class="transaction-detail-value">Rp${activity.monthlyPayment.toLocaleString('id-ID')}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Bulan Terbayar</span>
                <span class="transaction-detail-value">${activity.paidMonths} / ${activity.months}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Tanggal Jatuh Tempo</span>
                <span class="transaction-detail-value">${activity.dueDate}</span>
            </div>
            <div class="transaction-detail-item">
                <span class="transaction-detail-label">Status</span>
                <span class="transaction-detail-value" style="color: #00C44D;">${activity.status}</span>
            </div>
        `;
    }
    
    document.getElementById('detail-content').innerHTML = detailHTML;
    openModal('modal-detail');
}

// ============= DELETE TRANSACTION =============

function deleteTransaction() {
    if (!currentTransactionType || !currentTransactionId) return;
    
    const confirmed = confirm('Apakah Anda yakin ingin menghapus data ini?');
    if (!confirmed) return;
    
    let storageKey = '';
    if (currentTransactionType === 'transfer') storageKey = 'transactions';
    else if (currentTransactionType === 'payment') storageKey = 'payments';
    else if (currentTransactionType === 'investment') storageKey = 'investments';
    else if (currentTransactionType === 'loan') storageKey = 'loans';
    
    let data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    data = data.filter(item => item.id !== currentTransactionId);
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    closeModal('modal-detail');
    showToast('Data berhasil dihapus', 'success');
    loadTransactionsView();
}

// ============= EDIT TRANSACTION (Update) =============

function openEditModal() {
    showToast('Fitur edit sedang dikembangkan', 'warning');
    // TODO: Implement edit functionality
}

// ============= TOAST NOTIFICATIONS =============

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============= AUTO-LOAD PREVIOUS SESSION =============

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing app'); // Debug log
    
    // Initialize CRUD data structures
    initializeCRUDData();
    
    // Initialize transactions display
    loadTransactionsView();
    
    // Load initial news
    loadNewsFromAPI();
    
    // Always start from splash screen (which will auto-advance after 5 seconds)
    goToScreen('screen-splash');
});
