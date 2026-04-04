// ============= DESIGN 01 - MOBILE SCREEN NAVIGATION =============

// Get all screen elements
const screens = {
    splash: document.getElementById('screen-splash'),
    login: document.getElementById('screen-login'),
    verify: document.getElementById('screen-verify')
};

const indicators = document.querySelectorAll('.indicator');
const screenOrder = ['screen-splash', 'screen-login', 'screen-verify'];

// Navigate to specific screen
function goToScreen(screenId) {
    // Remove active class from all screens
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active-screen');
        }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (screenOrder[index] === screenId) {
            indicator.classList.add('active');
        }
    });

    // Add active class to selected screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active-screen');
    }
}

// Next screen navigation
function nextScreen(currentId, nextId) {
    // Validate input before transitioning
    const currentScreen = currentId.replace('screen-', '');
    
    // Add simple validation
    if (currentId === 'screen-login') {
        const accountNumber = document.getElementById('account-number').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        if (!accountNumber.trim()) {
            alert('Please enter your account number');
            return;
        }
        
        if (!agreeTerms) {
            alert('Please agree to terms and conditions');
            return;
        }
    }
    
    if (currentId === 'screen-verify') {
        const otpCode = document.getElementById('otp-code').value;
        
        if (!otpCode.trim()) {
            alert('Please enter OTP code');
            return;
        }
    }

    goToScreen(nextId);
}

// Previous screen navigation
function prevScreen(currentId, prevId) {
    goToScreen(prevId);
}

// Complete verification
function completeVerification() {
    const otpCode = document.getElementById('otp-code').value;
    
    if (!otpCode.trim() || otpCode.length < 6) {
        alert('Please enter a valid OTP code');
        return;
    }
    
    // Show success message
    alert('Verification successful! ✓\n\nWelcome to MyBank Digital Banking Platform');
    
    // Reset form and go back to splash
    document.getElementById('account-number').value = '';
    document.getElementById('otp-code').value = '';
    document.getElementById('agree-terms').checked = true;
    goToScreen('screen-splash');
}

// Auto-transition from splash to login after 2 seconds on page load
window.addEventListener('load', function() {
    // Optional: Uncomment to auto-advance from splash screen
    // setTimeout(() => {
    //     goToScreen('screen-login');
    // }, 2000);
});

// Keyboard support for OTP input
const otpInput = document.getElementById('otp-code');
if (otpInput) {
    otpInput.addEventListener('input', function(e) {
        // Only allow alphanumeric characters
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // Auto-focus next field if max length reached
        if (this.value.length >= 6) {
            // Could trigger verification automatically
        }
    });
}

// Account number formatting
const accountInput = document.getElementById('account-number');
if (accountInput) {
    accountInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}
