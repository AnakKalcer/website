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
        screen.classList.remove('active-screen');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
        console.log('Screen shown:', screenId); // Debug log
        
        // Auto-advance from splash screen to login after 5 seconds
        if (screenId === 'screen-splash') {
            console.log('Splash screen shown, starting 5 second timer...'); // Debug log
            splashTimeout = setTimeout(() => {
                console.log('5 seconds timeout triggered, going to login'); // Debug log
                goToScreen('screen-login');
            }, 5000);
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
    
    // Validation
    if (!accountNumber) {
        alert('Please enter your account number');
        return;
    }
    
    if (!agreeTerms) {
        alert('Please agree to terms and conditions');
        return;
    }
    
    // Save account number to localStorage for session
    localStorage.setItem('accountNumber', accountNumber);
    
    // Navigate to OTP verification screen
    goToScreen('screen-verify');
}

// ============= VERIFICATION FLOW =============

// Handle OTP Verification
function handleVerify() {
    const otpCode = document.getElementById('otp-code').value.trim();
    
    // Validation
    if (!otpCode) {
        alert('Please enter OTP code');
        return;
    }
    
    // For demo: any number is accepted as valid OTP
    // In production, this would be sent to backend for verification
    
    // Show success and navigate to dashboard
    alert('OTP Verified Successfully! ✓');
    
    // Update dashboard with account info
    const accountNumber = localStorage.getItem('accountNumber');
    if (accountNumber) {
        document.getElementById('account-display').textContent = accountNumber.substring(0, 4) + '****' + accountNumber.substring(accountNumber.length - 2);
        document.getElementById('current-time').textContent = 'Hai, Anonim';
    }
    
    // Navigate to dashboard
    goToScreen('screen-dashboard');
}

// Back button from verify to login
function goBackToLogin() {
    // Clear OTP input
    document.getElementById('otp-code').value = '';
    goToScreen('screen-login');
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

// ============= AUTO-LOAD PREVIOUS SESSION =============

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing app'); // Debug log
    
    // Always start from splash screen (which will auto-advance after 5 seconds)
    goToScreen('screen-splash');
});
