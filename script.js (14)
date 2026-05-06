/* =========================================
   SCRIPT ANIMASI SCROLL & SLIDER TESTIMONI
   ========================================= */

document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. PENGATURAN ANIMASI SCROLL (MUNCUL HALUS)
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Memilih semua elemen yang mau di-animasiin (termasuk deskripsi dan testimoni baru)
    const animatedElements = document.querySelectorAll('.section-header, .section-description, .gallery-img, .service-item, .partner-logo, .badge, .repair-item, .on-call-box, .slider-container');

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${(index % 6) * 0.1}s`;
        observer.observe(el);
    });


    // ==========================================
    // 2. PENGATURAN SLIDER TESTIMONI BERGERAK
    // ==========================================
    let slideIndex = 0;
    let slideInterval;
    const slides = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');

    // Fungsi utama untuk nampilin slide sesuai urutan
    function showSlides(index) {
        if (slides.length === 0) return; // Jaga-jaga kalau elemen kosong
        
        // Kalau kelewatan batas, balik ke awal
        if (index >= slides.length) slideIndex = 0;
        if (index < 0) slideIndex = slides.length - 1;

        // Sembunyikan semua slide dan hilangkan warna aktif di titik
        slides.forEach(slide => slide.classList.remove('active-slide'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Tampilkan slide dan titik yang terpilih
        slides[slideIndex].classList.add('active-slide');
        dots[slideIndex].classList.add('active');
    }

    // Fungsi untuk geser otomatis ke slide berikutnya
    function nextSlide() {
        slideIndex++;
        showSlides(slideIndex);
    }

    // Mulai hitung waktu otomatis (5000 ms = 5 detik)
    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000); 
    }

    // Bikin fungsi klik titik (dots) bisa diakses dari HTML
    window.currentSlide = function(index) {
        slideIndex = index;
        showSlides(slideIndex);
        
        // Reset waktu geser otomatis kalau pengunjung klik manual
        clearInterval(slideInterval); 
        startInterval(); 
    };

    // Jalankan slider waktu web pertama kali dibuka
    showSlides(slideIndex);
    startInterval();

});