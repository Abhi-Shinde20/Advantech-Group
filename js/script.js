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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
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
    const startOffset = 200; // start 300px before section enters viewport
    const endOffset = 200;   // end 300px after section leaves viewport
    const progress = Math.max(0, Math.min(1, (viewportHeight + startOffset - sectionRect.top) / (viewportHeight + sectionRect.height + startOffset + endOffset)));

    const leftTranslate = -50 + (progress * 100);
    const rightTranslate = 50 - (progress * 100);

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