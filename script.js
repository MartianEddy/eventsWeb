// Performance-optimized JavaScript with lazy loading and caching
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for images
    initializeLazyLoading();
    
    // Initialize service worker for caching
    initializeServiceWorker();
    
    // Handle urgent CTA strip
    handleUrgentStrip();
    
    // Handle navigation
    handleNavigation();
    
    // Handle gallery tabs
    handleGalleryTabs();
    
    // Handle testimonial slider
    handleTestimonialSlider();
    
    // Handle callback form
    handleCallbackForm();
    
    // Handle scroll effects
    handleScrollEffects();
    
    // Handle intersection observer animations
    handleIntersectionAnimations();
    
    // Handle mobile optimizations
    handleMobileOptimizations();
});

// Lazy Loading Implementation
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const placeholder = img.previousElementSibling;
                
                // Create a new image to preload
                const tempImg = new Image();
                tempImg.onload = function() {
                    // Image loaded successfully
                    img.src = img.dataset.src;
                    img.style.display = 'block';
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    // Fade in the image
                    setTimeout(() => {
                        img.style.opacity = '1';
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                    }, 50);
                };
                
                tempImg.onerror = function() {
                    // Handle image load error
                    console.warn('Failed to load image:', img.dataset.src);
                    if (placeholder) {
                        placeholder.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">Image unavailable</div>';
                    }
                };
                
                tempImg.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Service Worker for Caching
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Urgent CTA Strip Handler
function handleUrgentStrip() {
    const urgentStrip = document.querySelector('.urgent-cta-strip');
    const header = document.querySelector('.header');
    const closeBtn = document.querySelector('.close-strip');
    
    if (urgentStrip && header) {
        header.classList.add('with-urgent-strip');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                urgentStrip.style.transform = 'translateY(-100%)';
                urgentStrip.style.opacity = '0';
                header.classList.remove('with-urgent-strip');
                
                setTimeout(() => {
                    urgentStrip.style.display = 'none';
                }, 300);
                
                localStorage.setItem('urgentStripClosed', 'true');
            });
        }
        
        if (localStorage.getItem('urgentStripClosed') === 'true') {
            urgentStrip.style.display = 'none';
            header.classList.remove('with-urgent-strip');
        }
    }
}

// Navigation Handler
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const urgentStrip = document.querySelector('.urgent-cta-strip');
    
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
}

// Gallery Tabs Handler
function handleGalleryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Trigger lazy loading for newly visible images
                const lazyImages = targetContent.querySelectorAll('.lazy-image');
                lazyImages.forEach(img => {
                    if (img.dataset.src && !img.src) {
                        const event = new Event('intersect');
                        img.dispatchEvent(event);
                    }
                });
            }
        });
    });
}

// Testimonial Slider Handler
function handleTestimonialSlider() {
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-nav.prev');
    const nextBtn = document.querySelector('.testimonial-nav.next');
    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        testimonialDots.forEach(dot => dot.classList.remove('active'));
        
        if (testimonialSlides[index]) {
            testimonialSlides[index].classList.add('active');
        }
        if (testimonialDots[index]) {
            testimonialDots[index].classList.add('active');
        }
        
        const track = document.querySelector('.testimonial-track');
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 8000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    });
    
    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            stopAutoPlay();
            startAutoPlay();
        });
    });

    // Touch/swipe support
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        let touchStartX = 0;
        let touchEndX = 0;

        testimonialSlider.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        testimonialSlider.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            startAutoPlay();
        }, { passive: true });
    }

    // Start auto-play
    startAutoPlay();

    // Pause auto-play when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

// Callback Form Handler
function handleCallbackForm() {
    const callbackForm = document.querySelector('.callback-form');
    if (!callbackForm) return;

    callbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[name="name"]').value.trim();
        const phone = this.querySelector('input[name="phone"]').value.trim();
        const eventType = this.querySelector('select[name="event_type"]').value;
        
        // Validation
        if (!name || !phone || !eventType) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Phone validation for Kenyan numbers
        const phoneRegex = /^(\+254|0)[17]\d{8}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            showNotification('Please enter a valid Kenyan phone number (e.g., 0712345678)', 'error');
            return;
        }
        
        // Submit form
        const submitBtn = this.querySelector('.callback-btn');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<svg class="icon"><use href="#icon-phone"></use></svg>Requesting Callback...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            showNotification(`Thank you ${name}! We'll call you back at ${phone} within 15 minutes to discuss your ${eventType} event.`, 'success');
            this.reset();
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'callback_request', {
                    event_category: 'engagement',
                    event_label: eventType,
                    value: 1
                });
            }
        }, 2000);
    });

    // Phone number formatting
    const phoneInput = callbackForm.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.startsWith('254')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                // Keep as is for local format
            } else if (value.length > 0 && !value.startsWith('0')) {
                value = '0' + value;
            }
            
            this.value = value;
        });
    }
}

// Scroll Effects Handler
function handleScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let ticking = false;

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}

// Intersection Observer Animations
function handleIntersectionAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.service-card, .contact-item, .about-text, .about-image, .timeline-item, .gallery-item, .testimonial-slide, .testimonial-incentive, .quick-callback-form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Mobile Optimizations
function handleMobileOptimizations() {
    // Create mobile menu
    const nav = document.querySelector('.nav');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<svg class="icon"><use href="#icon-menu"></use></svg>';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--green-primary);
        cursor: pointer;
        padding: 8px;
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
                z-index: 1001;
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

    // Handle sticky button animations
    const stickyButtons = document.querySelectorAll('.sticky-btn');
    stickyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-size: 0.9rem;
        line-height: 1.4;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Performance:', {
                    'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                    'TCP Connection': perfData.connectEnd - perfData.connectStart,
                    'Request': perfData.responseStart - perfData.requestStart,
                    'Response': perfData.responseEnd - perfData.responseStart,
                    'DOM Processing': perfData.domContentLoadedEventStart - perfData.responseEnd,
                    'Total Load Time': perfData.loadEventEnd - perfData.navigationStart
                });
            }, 0);
        });
    }
}

measurePerformance();

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Image optimization utility
function optimizeImage(url, width = 800, quality = 80) {
    if (url.includes('pexels.com')) {
        return url.replace(/w=\d+/, `w=${width}`).replace(/cs=tinysrgb/, `cs=tinysrgb&q=${quality}`);
    }
    return url;
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalImages = [
        'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

preloadCriticalResources();