// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle urgent CTA strip
    const urgentStrip = document.querySelector('.urgent-cta-strip');
    const header = document.querySelector('.header');
    const closeBtn = document.querySelector('.close-strip');
    
    // Initially show the urgent strip and adjust header position
    if (urgentStrip && header) {
        header.classList.add('with-urgent-strip');
        
        // Handle close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                urgentStrip.style.transform = 'translateY(-100%)';
                urgentStrip.style.opacity = '0';
                header.classList.remove('with-urgent-strip');
                
                setTimeout(() => {
                    urgentStrip.style.display = 'none';
                }, 300);
                
                // Store in localStorage to remember user preference
                localStorage.setItem('urgentStripClosed', 'true');
            });
        }
        
        // Check if user previously closed the strip
        if (localStorage.getItem('urgentStripClosed') === 'true') {
            urgentStrip.style.display = 'none';
            header.classList.remove('with-urgent-strip');
        }
    }

    // Handle navigation clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const urgentStripHeight = urgentStrip && urgentStrip.style.display !== 'none' ? urgentStrip.offsetHeight : 0;
                const totalOffset = headerHeight + urgentStripHeight;
                const targetPosition = targetSection.offsetTop - totalOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle gallery tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Testimonial Slider Functionality
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-nav.prev');
    const nextBtn = document.querySelector('.testimonial-nav.next');
    let currentSlide = 0;

    function showSlide(index) {
        // Hide all slides
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        testimonialDots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        testimonialSlides[index].classList.add('active');
        testimonialDots[index].classList.add('active');
        
        // Update track position
        const track = document.querySelector('.testimonial-track');
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    // Event listeners for testimonial navigation
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Dot navigation
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Auto-play testimonials (optional)
    setInterval(nextSlide, 8000); // Change slide every 8 seconds

    // Handle callback form submission
    const callbackForm = document.querySelector('.callback-form');
    if (callbackForm) {
        callbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = this.querySelector('input[name="name"]').value;
            const phone = this.querySelector('input[name="phone"]').value;
            const eventType = this.querySelector('select[name="event_type"]').value;
            
            // Simple validation
            if (!name || !phone || !eventType) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Phone number validation (basic Kenyan format)
            const phoneRegex = /^(\+254|0)[17]\d{8}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                alert('Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('.callback-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span>Requesting Callback...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert(`Thank you ${name}! We'll call you back at ${phone} within 15 minutes to discuss your ${eventType} event.`);
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Track callback request (could integrate with analytics)
                console.log('Callback requested:', { name, phone, eventType });
            }, 2000);
        });
    }

    // Add scroll effect to header
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add intersection observer for animations
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

    // Observe service cards, contact items, timeline items, gallery items, and testimonials
    const animatedElements = document.querySelectorAll('.service-card, .contact-item, .about-text, .about-image, .timeline-item, .gallery-item, .testimonial-slide, .testimonial-incentive, .quick-callback-form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add click tracking for sticky buttons
    const stickyButtons = document.querySelectorAll('.sticky-btn');
    stickyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Add a subtle animation on click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add hover effect to hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Touch/swipe support for testimonials on mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        testimonialSlider.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        testimonialSlider.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left - next slide
                    nextSlide();
                } else {
                    // Swiped right - previous slide
                    prevSlide();
                }
            }
        }
    }

    // Add urgent CTA tracking
    const urgentBtn = document.querySelector('.urgent-btn');
    if (urgentBtn) {
        urgentBtn.addEventListener('click', function() {
            // Track urgent CTA clicks (could integrate with analytics)
            console.log('Urgent CTA clicked - SMS tent inquiry');
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }

    // Add form field enhancements
    const formInputs = document.querySelectorAll('.form-group input, .form-group select');
    formInputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Phone number formatting for Kenyan numbers
        if (input.type === 'tel') {
            input.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, ''); // Remove non-digits
                
                // Format as Kenyan number
                if (value.startsWith('254')) {
                    value = '+' + value;
                } else if (value.startsWith('0')) {
                    // Keep as is for local format
                } else if (value.length > 0) {
                    value = '0' + value;
                }
                
                this.value = value;
            });
        }
    });

    // Simple mobile menu toggle (if needed in future)
    const createMobileMenu = () => {
        const nav = document.querySelector('.nav');
        const navMenu = document.querySelector('.nav-menu');
        
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--green-primary);
            cursor: pointer;
        `;
        
        nav.appendChild(mobileMenuBtn);
        
        // Add mobile styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 767px) {
                .mobile-menu-btn {
                    display: block !important;
                }
                .nav-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    padding: 1rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .nav-menu.active {
                    display: flex !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Toggle functionality
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    };
    
    createMobileMenu();
});

// Add some utility functions
const utils = {
    // Debounce function for scroll events
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Format phone number for display
    formatPhoneNumber: function(phone) {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Format as +254 XXX XXX XXX
        if (cleaned.startsWith('254') && cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }
        
        // Format as 0XXX XXX XXX
        if (cleaned.startsWith('0') && cleaned.length === 10) {
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        }
        
        return phone; // Return original if no format matches
    }
};

// Performance optimization: Use passive event listeners where appropriate
window.addEventListener('scroll', utils.debounce(() => {
    // Any scroll-based animations can go here
}, 16), { passive: true });