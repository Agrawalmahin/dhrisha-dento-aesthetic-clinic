// Mobile Menu Toggle with Accessibility
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            const isExpanded = navLinks.classList.toggle('active');

            // Update aria-expanded for accessibility
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

            // Animate hamburger to X
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans.forEach(span => {
                span.classList.toggle('active');
            });
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.focus();
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll with throttling
    const navbar = document.querySelector('.navbar');
    const heroBg = document.querySelector('.hero-bg img');

    // Throttle function to limit scroll event frequency
    let scrollTicking = false;
    const handleScroll = () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }

        // Hero Parallax (skip if reduced motion preferred)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion && window.scrollY < 800 && heroBg) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        }
        scrollTicking = false;
    };

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    // Simple fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Make hero visible immediately
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
    }

    // Clinic Gallery Carousel - duplicate slides for infinite scroll
    initInfiniteCarousel();

    // Stats counter animation
    initStatsCounter();
});

// Stats counter animation - Slow, deliberate counting
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length === 0) return;

    // Track active intervals for cleanup
    const activeIntervals = new Set();

    // Cleanup on page unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
        activeIntervals.forEach(id => clearInterval(id));
        activeIntervals.clear();
    });

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));

        // Skip animation if user prefers reduced motion
        if (prefersReducedMotion) {
            element.textContent = target.toLocaleString();
            return;
        }

        // Configuration for slow, deliberate counting
        let startValue, steps, intervalMs;

        if (target >= 10000) {
            startValue = 9950;
            steps = (target - startValue) / 10;
            intervalMs = 80;
        } else if (target >= 4000) {
            startValue = 3950;
            steps = (target - startValue) / 10;
            intervalMs = 80;
        } else if (target >= 30) {
            startValue = 20;
            steps = target - startValue;
            intervalMs = 120;
        } else if (target >= 12) {
            startValue = 1;
            steps = target - startValue;
            intervalMs = 150;
        } else {
            startValue = 1;
            steps = target - startValue;
            intervalMs = 300;
        }

        let currentValue = startValue;
        const increment = (target - startValue) / steps;
        element.textContent = currentValue.toLocaleString();

        const intervalId = setInterval(() => {
            currentValue += increment;

            if (currentValue >= target) {
                currentValue = target;
                clearInterval(intervalId);
                activeIntervals.delete(intervalId);
            }

            element.textContent = Math.floor(currentValue).toLocaleString();
        }, intervalMs);

        activeIntervals.add(intervalId);
    };

    // Use Intersection Observer to trigger animation when visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));
}

// Infinite scrolling carousel
function initInfiniteCarousel() {
    const carousel = document.getElementById('clinicCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.multi-carousel-track');
    const slides = track.querySelectorAll('.multi-carousel-slide');

    // Clone all slides and append for seamless loop
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        track.appendChild(clone);
    });
}
