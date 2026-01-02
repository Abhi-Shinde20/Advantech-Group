// Custom JavaScript for Advantech Home 3

// Load header
document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const header = document.querySelector('.header-style2');
            const topBar = document.querySelector('.top-bar');
            const headerHeight = header ? header.offsetHeight : 0;
            const topBarHeight = topBar ? topBar.offsetHeight : 0;
            const offset = headerHeight + topBarHeight;
            
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar toggle for mobile
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function() {
        navbarCollapse.classList.toggle('show');
    });
}

// Add active class to current nav item (basic implementation)
const currentLocation = location.href;
const menuItem = document.querySelectorAll('.navbar-nav .nav-link');
const menuLength = menuItem.length;
for (let i = 0; i < menuLength; i++) {
    if (menuItem[i].href === currentLocation) {
        menuItem[i].classList.add('active');
    }
}

// Scroll-triggered card animation
function animateCardsOnScroll() {
    const section = document.querySelector('#capabilities');
    const leftCards = document.querySelectorAll('.slide-left');
    const rightCards = document.querySelectorAll('.slide-right');

    if (!section) return;

    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Extended range for earlier start and slower movement
    const startOffset = 200; // start 200px before section enters viewport
    const endOffset = 200;   // end 200px after section leaves viewport
    const progress = Math.max(0, Math.min(1, (viewportHeight + startOffset - sectionRect.top) / (viewportHeight + sectionRect.height + startOffset + endOffset)));

    // Stop animation when cards reach center (around 50% progress)
    const stopAtProgress = 0.5;
    const currentProgress = Math.min(progress, stopAtProgress);

    const leftTranslate = -50 + (currentProgress * 100);
    const rightTranslate = 50 - (currentProgress * 100);

    leftCards.forEach(card => {
        card.style.transform = `translateX(${leftTranslate}%)`;
    });

    rightCards.forEach(card => {
        card.style.transform = `translateX(${rightTranslate}%)`;
    });
}

window.addEventListener('scroll', animateCardsOnScroll);
animateCardsOnScroll(); // Initial call

// Hide/show top-bar on scroll
let lastScrollTop = 0;
const topBar = document.querySelector('.top-bar');
const header = document.querySelector('.header-style2');

// Initial state based on current scroll position
const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
if (initialScrollTop > 50) {
    topBar.classList.add('hide');
    header.classList.add('adjusted');
}

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 50) {
        // Scrolling down and past 50px
        topBar.classList.add('hide');
        header.classList.add('adjusted');
    } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        topBar.classList.remove('hide');
        header.classList.remove('adjusted');
    }
    lastScrollTop = scrollTop;
});

// Header transparency on scroll for about page
window.addEventListener('scroll', function() {
    const header = document.querySelector('.transparent-header');
    if (header) {
        const hero = document.querySelector('.advantech-hero');
        if (hero) {
            const heroHeight = hero.offsetHeight;
            if (window.scrollY > heroHeight - 100) { // small buffer
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
});

// Counter animation on scroll
function animateCounter(element) {
    const target = +element.getAttribute('data-target');
    const suffix = element.getAttribute('data-suffix') || '';
    let current = 0;
    const fastIncrement = Math.max(1, Math.floor(target / 50)); // fast increment
    const fastInterval = 50; // ms
    const slowInterval = 500; // ms for last 3

    function update() {
        if (current < target - 3) {
            current += fastIncrement;
            if (current > target - 3) current = target - 3;
            element.textContent = Math.floor(current) + suffix;
            setTimeout(update, fastInterval);
        } else if (current < target) {
            element.classList.add('flip');
            current += 1;
            setTimeout(() => {
                element.textContent = Math.floor(current) + suffix;
                setTimeout(() => {
                    element.classList.remove('flip');
                    if (current < target) {
                        update();
                    }
                }, 500); // remove after animation
            }, 100); // small delay to start animation
        }
    }
    update();
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

// Product Carousel
const products = [
    { img: 'images/oil-pump.png', title: 'Brake Levers', desc: 'High-precision brake levers designed for optimal braking performance. Material: Aluminum alloy. Applications: Two-wheelers, three-wheelers.' },
    { img: 'images/plant .png', title: 'Brake Cylinders', desc: 'Durable brake cylinders available in cast iron and aluminum variants. Material: Cast iron, Aluminum. Applications: Automotive braking systems.' },
    { img: 'images/Partners.png', title: 'Wiping System Components', desc: 'Essential components for vehicle windshield wiper systems. Material: Aluminum, Steel. Applications: Automotive wiper mechanisms.' },
    { img: 'images/factory PNG.png', title: 'Alternator Covers', desc: 'Protective covers for alternator assemblies ensuring optimal performance. Material: Aluminum die-cast. Applications: Automotive electrical systems.' },
    { img: 'images/about-home.jpg', title: 'Clutch Housing', desc: 'Robust clutch housings for smooth transmission operations. Material: Cast iron, Aluminum. Applications: Vehicle transmission systems.' },
    { img: 'images/about-home1.jpg', title: 'Custom Machined Components', desc: 'Tailored precision-machined parts for specific automotive requirements. Material: Various metals. Applications: Custom automotive assemblies.' }
];

let currentIndex = 0;

function updateCarousel() {
    for (let i = 0; i < 3; i++) {
        const product = products[(currentIndex + i) % products.length];
        const card = document.getElementById('card' + (i + 1));
        card.querySelector('.card-img-top').src = product.img;
        card.querySelector('.card-title').textContent = product.title;
        card.querySelector('.card-text').textContent = product.desc;
    }
    currentIndex = (currentIndex + 1) % products.length;
}

setInterval(updateCarousel, 5000);
updateCarousel(); // initial call

// Quote Modal Functions
function openQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        // Focus on first input field
        setTimeout(() => {
            document.getElementById('quoteName').focus();
        }, 300);
    }
}

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        // Reset form
        document.getElementById('quoteForm').reset();
    }
}

// Netlify Forms AJAX submission handler
function submitQuote(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('quoteName').value,
        mobile: document.getElementById('quoteMobile').value,
        email: document.getElementById('quoteEmail').value,
        company: document.getElementById('quoteCompany').value,
        requirements: document.getElementById('quoteRequirements').value
    };
    
    // Basic validation
    if (!formData.name || !formData.mobile || !formData.email || !formData.company || !formData.requirements) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Please enter a valid email address.', 'error');
        return;
    }
    
    // Mobile validation (basic)
    const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanMobile = formData.mobile.replace(/[\s\-\(\)]/g, '');
    if (!mobileRegex.test(cleanMobile) || cleanMobile.length < 10) {
        showAlert('Please enter a valid mobile number.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.quote-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
    submitBtn.disabled = true;
    
    // Get the form element
    const form = event.target;
    const formDataNetlify = new FormData(form);
    
    // Submit via AJAX to Netlify
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formDataNetlify).toString()
    })
    .then(() => {
        // Success
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Quote Requested!';
        submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        setTimeout(() => {
            showAlert('Thank you for your quote request! We will contact you within 24 hours.', 'success');
            closeQuoteModal();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 1500);
    })
    .catch((error) => {
        // Error handling
        showAlert('There was an error submitting your request. Please try again.', 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Helper function to submit data to backend
async function submitToBackend(endpoint, data) {
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-url.herokuapp.com' // Replace with actual production URL
        : 'http://localhost:3001';
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Netlify Forms AJAX handler for contact form
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    submitBtn.disabled = true;
    
    // Submit via AJAX to Netlify
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
    .then(() => {
        // Success
        showAlert('Thank you for your message! We will get back to you soon.', 'success');
        form.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    })
    .catch((error) => {
        // Error handling
        showAlert('There was an error sending your message. Please try again.', 'error');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('quoteModal');
    if (modal && event.target === modal) {
        closeQuoteModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeQuoteModal();
    }
});

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Contact form handler
    const contactForm = document.querySelector('form[name="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Hero section height management
function updateHeroHeight() {
    const hero = document.querySelector('.advantech-hero');
    const video = document.querySelector('.hero-background-video');
    const overlay = document.querySelector('.hero-overlay');
    const container = hero.querySelector('.container');
    
    if (!hero || !video || !overlay || !container) return;
    
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('.header-style2')?.offsetHeight || 0;
    const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
    const headerTotalHeight = headerHeight + topBarHeight;
    
    // Calculate available height (viewport minus header space)
    const availableHeight = viewportHeight - headerTotalHeight;
    
    // Set minimum height to prevent too small sections
    const minHeight = Math.max(availableHeight, 500);
    
    // Apply height to hero section
    hero.style.minHeight = minHeight + 'px';
    video.style.minHeight = minHeight + 'px';
    overlay.style.minHeight = minHeight + 'px';
    
    // Ensure container padding accounts for header
    container.style.paddingTop = (headerTotalHeight + 20) + 'px';
    container.style.paddingBottom = '50px';
}

// Initial call and resize listener
updateHeroHeight();
window.addEventListener('resize', updateHeroHeight);