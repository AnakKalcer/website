// ============= DESIGN 01 - INTERACTIVE BANKING APP =============

// Screen Navigation
function goToScreen(screenId) {
    // Hide all screens
    const allScreens = document.querySelectorAll('.app-screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active-screen');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
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
    const confirmLogout = confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
        // Clear localStorage
        localStorage.removeItem('accountNumber');
        
        // Clear all form inputs
        document.getElementById('account-number').value = '';
        document.getElementById('otp-code').value = '';
        document.getElementById('agree-terms').checked = false;
        
        // Return to splash screen
        goToScreen('screen-splash');
        
        alert('Logged out successfully. See you again!');
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
    // Check if user has previous session in localStorage
    const savedAccount = localStorage.getItem('accountNumber');
    
    // Always start from splash screen
    goToScreen('screen-splash');
    
    // Auto-advance from splash to login after 5 seconds
    setTimeout(() => {
        goToScreen('screen-login');
    }, 5000);
});
