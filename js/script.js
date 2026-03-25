// Smooth scrolling untuk navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            window.history.pushState(null, null, this.getAttribute('href'));
        }
    });
});

// Button click handlers
const scheduleButtons = document.querySelectorAll('.btn-schedule, .btn-cta');
scheduleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // Cek apakah kita di halaman dengan About section
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            alert('Terima kasih! Kami akan menghubungi Anda untuk menjadwalkan pertemuan.');
        }
    });
});

const chatButton = document.querySelector('.btn-chat');
if (chatButton) {
    chatButton.addEventListener('click', function() {
        alert('Membuka chat dengan Wisnu...');
    });
}

const helpButton = document.querySelector('.btn-help');
if (helpButton) {
    helpButton.addEventListener('click', function() {
        alert('Pusat Bantuan - Jika Anda memiliki pertanyaan, hubungi kami!');
    });
}

// Add scroll animation effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer untuk animasi ketika elemen muncul di viewport
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe hero content elements
document.querySelectorAll('.my-guide-badge, .hero-text, .illustration-container, .chat-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
