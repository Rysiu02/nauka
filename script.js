// Podstawowa struktura JavaScript dla strony
console.log('🚀 JavaScript załadowany!');

// Czekamy aż strona się załaduje
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Strona gotowa do działania!');
    
    // Inicjalizacja funkcji
    initNavigation();
    initContactForm();
    initScrollEffects(); // <-- Upewnij się że to jest wywołane
    initDarkMode(); // <-- Nowa funkcja!
});

// Funkcja obsługująca nawigację
function initNavigation() {
    console.log('🧭 Inicjalizacja nawigacji...');
    
    // Pobierz wszystkie linki nawigacji
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // Dodaj event listener do każdego linku
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Zatrzymaj domyślne działanie linku
            
            // Pobierz href (np. "#home", "#about")
            const targetId = this.getAttribute('href');
            
            // Znajdź element docelowy
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Płynne przewijanie do sekcji
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                console.log(`📍 Przewijanie do sekcji: ${targetId}`);
            }
        });
    });
}

// Funkcja obsługująca formularz
function initContactForm() {
    console.log('📝 Inicjalizacja formularza...');
    
    // Znajdź formularz kontaktowy
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Zatrzymaj wysyłanie formularza
            
            // Pobierz dane z formularza
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Sprawdź czy wszystkie pola są wypełnione
            if (validateForm(name, email, message)) {
                // Symuluj wysyłanie formularza
                showMessage('✅ Dziękuję za wiadomość! Odpowiem wkrótce.', 'success');
                
                // Wyczyść formularz
                this.reset();
                
                console.log(`📧 Formularz wysłany:`, {
                    name: name,
                    email: email,
                    message: message
                });
            }
        });
    }
}

// Funkcja walidacji formularza
function validateForm(name, email, message) {
    if (!name || name.length < 2) {
        showMessage('❌ Imię musi mieć co najmniej 2 znaki!', 'error');
        return false;
    }
    
    if (!email || !email.includes('@')) {
        showMessage('❌ Podaj poprawny adres email!', 'error');
        return false;
    }
    
    if (!message || message.length < 10) {
        showMessage('❌ Wiadomość musi mieć co najmniej 10 znaków!', 'error');
        return false;
    }
    
    return true;
}

// Funkcja wyświetlania komunikatów
function showMessage(text, type) {
    // Usuń poprzedni komunikat jeśli istnieje
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Stwórz nowy komunikat
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = text;
    
    // Dodaj komunikat nad formularzem
    const contactForm = document.querySelector('.contact-form');
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Usuń komunikat po 5 sekundach
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Funkcja obsługująca efekty przewijania
function initScrollEffects() {
    console.log('🎬 Inicjalizacja efektów przewijania...');
    
    // Elementy do animowania - sprawdźmy różne selektory
    const animatedElements = document.querySelectorAll('.about-content, .contact-content, #about h2, #contact h2');
    
    console.log('🎯 Znalezione elementy do animacji:', animatedElements.length);
    
    if (animatedElements.length === 0) {
        console.log('❌ Nie znaleziono elementów do animacji!');
        return;
    }
    
    // Dodaj style początkowe dla animacji
    animatedElements.forEach((element, index) => {
        console.log(`📝 Przygotowuję element ${index + 1}:`, element);
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'all 0.8s ease-out';
    });
    
    // Funkcja sprawdzająca czy element jest widoczny
    function isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isVisible = rect.top < windowHeight - 50;
        return isVisible;
    }
    
    // Funkcja animująca elementy
    function animateOnScroll() {
        animatedElements.forEach((element, index) => {
            if (isElementVisible(element) && element.style.opacity === '0') {
                console.log(`🎬 Animuję element ${index + 1}`);
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Nasłuchuj przewijania
    window.addEventListener('scroll', animateOnScroll);
    
    // Sprawdź na start
    setTimeout(animateOnScroll, 100);
    
    // Dodaj efekt zmiany nawigacji przy przewijaniu
    addNavbarScrollEffect();
}

// Funkcja zmiany nawigacji przy przewijaniu
function addNavbarScrollEffect() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)'; // Półprzezroczyste tło
            header.style.backdropFilter = 'blur(10px)'; // Efekt rozmycia
        } else {
            header.style.backgroundColor = 'var(--secondary-color)'; // Normalne tło
            header.style.backdropFilter = 'none';
        }
    });
}

// Funkcja Dark Mode

function initDarkMode() {
    console.log('🌙 Inicjalizacja Dark Mode...');
    
    const themeToggle = document.getElementById('theme-checkbox'); // ✅ POPRAWNE ID
    const body = document.body;
    
    // Sprawdź czy element istnieje
    if (!themeToggle) {
        console.error('❌ Nie znaleziono przycisku theme toggle!');
        return;
    }
    
    // Sprawdź zapisane ustawienie lub domyślnie light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Ustaw początkowy motyw
    body.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
    
    console.log(`🎨 Ustawiono motyw: ${savedTheme}`);
    
    // Obsługa przełączania motywu
    themeToggle.addEventListener('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        console.log(`🔄 Zmieniono motyw na: ${newTheme}`);
        
        // Dodaj płynną animację przełączania
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    });
}


// Funkcja dodatkowych animacji
function initAdvancedAnimations() {
    console.log('🎨 Inicjalizacja dodatkowych animacji...');
    
    // Dodaj particles do hero sekcji
    createParticles();
    
    // Animacja liczników (jeśli byłyby)
    // animateCounters();
    
    // Parallax efekt
    initParallaxEffect();
    
    // Hover efekty
    initHoverEffects();
}

// Tworzenie particles
function createParticles() {
    const hero = document.querySelector('#home');
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    hero.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Losowe rozmiary i pozycje
        const size = Math.random() * 4 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Parallax efekt
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const hero = document.querySelector('#home');
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Hover efekty
function initHoverEffects() {
    // CTA Button loading effect
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        });
    }
    
    // Typing effect dla hero tekstu
    const heroTitle = document.querySelector('.hero h2');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
}

// Dodaj wywołanie w DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Strona gotowa do działania!');
    
    // Inicjalizacja funkcji
    initNavigation();
    initContactForm();
    initScrollEffects();
    initDarkMode();
    initAdvancedAnimations(); // <-- Nowa funkcja!
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');

mobileMenuToggle.addEventListener('click', () => {
  // Toggle klasy
  mobileMenuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  
  // Zapobiegaj scrollowaniu gdy menu otwarte
  if (navMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Zamknij menu po kliknięciu w link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Zamknij menu przy resize do desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
});