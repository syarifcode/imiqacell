/* =========================================
   SCRIPT FULL: INTRO, DARK MODE, FAQ, & SLIDER
   ========================================= */

document.addEventListener("DOMContentLoaded", function() {

    // 1. INTRO LOADING SCREEN LOGIC
    const loader = document.getElementById('intro-loader');
    if (loader) {
        // Beri waktu 2.5 detik agar animasi loader terlihat sempurna
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 2500);
    }


    // 2. DARK MODE TOGGLE (WITH PERSISTENT STORAGE)
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Cek apakah user sebelumnya sudah pernah milih tema tertentu
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Ganti ikon bulan/matahari
        if (body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark'); // Simpan pilihan ke memori browser
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });


    // 3. FAQ ACCORDION LOGIC
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            
            // Tutup FAQ lain yang sedang terbuka (opsional, biar rapi)
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) item.classList.remove('active');
            });

            // Toggle (Buka/Tutup) yang diklik
            faqItem.classList.toggle('active');
        });
    });


    // 4. TESTIMONIAL SLIDER LOGIC
    let slideIndex = 0;
    let slideInterval;
    const slides = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');

    function showSlides(index) {
        if (slides.length === 0) return;
        if (index >= slides.length) slideIndex = 0;
        if (index < 0) slideIndex = slides.length - 1;

        slides.forEach(slide => slide.classList.remove('active-slide'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[slideIndex].classList.add('active-slide');
        dots[slideIndex].classList.add('active');
    }

    function nextSlide() {
        slideIndex++;
        showSlides(slideIndex);
    }

    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000); 
    }

    window.currentSlide = function(index) {
        slideIndex = index;
        showSlides(slideIndex);
        clearInterval(slideInterval); 
        startInterval(); 
    };

    if (slides.length > 0) {
        showSlides(slideIndex);
        startInterval();
    }


    // 5. ANIMASI SCROLL REVEAL (UNTUK SEMUA ELEMEN)
    const observerOptions = {
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.section-header, .section-description, .gallery-img, .service-item, .partner-logo, .badge, .repair-item, .on-call-box, .slider-container, .faq-item');

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${(index % 5) * 0.1}s`;
        observer.observe(el);
    });

});
