// Podstawowa struktura JavaScript dla strony
console.log('🚀 JavaScript załadowany!');

// Czekamy aż strona się załaduje
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM załadowany - inicjalizuję funkcje...');
    
    // Inicjalizacja wszystkich funkcji
    initNavigation();
    initContactForm();
    initScrollAnimations();
    initThemeToggle();
    initCTAButton();
    
    // Kompaktowy kalendarz zamiast dużego
    if (document.getElementById('week-days')) {
        window.bookingCalendar = new CompactBookingCalendar();
    }
    
    console.log('✅ Wszystkie funkcje zainicjalizowane!');
});

// ===== NAWIGACJA =====
function initNavigation() {
    console.log('🧭 Inicjalizacja nawigacji...');
    
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // Hamburger menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            console.log('🍔 Hamburger menu clicked');
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Zamykanie menu po kliknięciu w link (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Smooth scroll dla linków nawigacyjnych
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('✅ Nawigacja zainicjalizowana');
}

// ===== CTA BUTTON - ULEPSZONE =====
function initCTAButton() {
    console.log('🎯 Inicjalizacja CTA button...');
    
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            console.log('🎯 CTA clicked - scrolling to contact');
            
            // Dodaj efekt loading
            this.classList.add('loading');
            this.textContent = 'Przygotowuję formularz...';
            
            // Płynne przewinięcie do sekcji kontakt
            setTimeout(() => {
                document.querySelector('#contact').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Po przewinięciu
                setTimeout(() => {
                    // Usuń loading
                    this.classList.remove('loading');
                    this.textContent = 'Umów wizytę 💅';
                    
                    // Focus na pierwszym polu
                    const firstInput = document.querySelector('#contact-name');
                    if (firstInput) {
                        firstInput.focus();
                        
                        // Animacja pulsowania pola
                        firstInput.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.5)';
                        setTimeout(() => {
                            firstInput.style.boxShadow = '';
                        }, 2000);
                    }
                }, 1000);
            }, 500);
        });
    }
    
    console.log('✅ CTA button zainicjalizowany');
}

// ===== FORMULARZ KONTAKTOWY - ULEPSZONY =====
function initContactForm() {
    console.log('📝 Inicjalizacja formularza kontaktowego...');
    
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Formularz kontaktowy wysłany');
            
            // Pobieramy dane z formularza
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const notes = document.getElementById('contact-notes').value.trim();
            
            // Pobierz dane z kalendarza
            const bookingData = window.bookingCalendar ? window.bookingCalendar.getBookingData() : {};
            
            // Walidacja podstawowych pól
            if (!name || !email || !phone) {
                showFormMessage('Proszę wypełnić wszystkie wymagane pola (oznaczone *)', 'error');
                return;
            }
            
            // Walidacja rezerwacji
            if (!bookingData.service) {
                showFormMessage('Proszę wybrać rodzaj usługi', 'error');
                return;
            }
            
            if (!bookingData.date) {
                showFormMessage('Proszę wybrać datę wizyty z kalendarza', 'error');
                return;
            }
            
            if (!bookingData.time) {
                showFormMessage('Proszę wybrać godzinę wizyty', 'error');
                return;
            }
            
            // Walidacja email
            if (!isValidEmail(email)) {
                showFormMessage('Proszę podać prawidłowy adres email', 'error');
                return;
            }
            
            // Przygotowanie pełnych danych do wysłania
            const fullBookingData = {
                name: name,
                email: email,
                phone: phone,
                service: window.bookingCalendar.getServiceName(bookingData.service),
                preferredDate: bookingData.formattedDate + ' o ' + bookingData.time,
                notes: notes || 'Brak dodatkowych informacji',
                timestamp: new Date().toLocaleString('pl-PL')
            };
            
            // Animacja przycisku
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Wysyłam...';
            
            // Wysłanie przez Formspree
            setTimeout(async () => {
                const result = await sendBookingEmail(fullBookingData);
                
                // Zapisanie lokalnie jako backup
                saveBookingLocally(fullBookingData);
                
                // Reset formularza i kalendarza
                this.reset();
                if (window.bookingCalendar) {
                    // Reset kalendarza
                    const selectedDay = document.querySelector('.calendar-day.selected');
                    const selectedTime = document.querySelector('.time-slot.selected');
                    if (selectedDay) selectedDay.classList.remove('selected');
                    if (selectedTime) selectedTime.classList.remove('selected');
                    
                    window.bookingCalendar.selectedDate = null;
                    window.bookingCalendar.selectedTime = null;
                    window.bookingCalendar.selectedService = null;
                    window.bookingCalendar.updateSummary();
                }
                
                // Reset przycisku
                submitBtn.classList.remove('loading');
                submitBtn.textContent = '💌 Wyślij rezerwację';
                
                // Pokaż wynik
                if (result && result.success !== false) {
                    showFormMessage('✅ Rezerwacja została wysłana!\n\n📧 Otrzymasz potwierdzenie wkrótce\n📞 Skontaktujemy się z Tobą', 'success');
                } else {
                    showFormMessage('⚠️ Wystąpił problem z wysyłaniem\n\n📞 Zadzwoń: +48 123 456 789\nLub spróbuj ponownie za chwilę', 'error');
                }
            }, 1500);
        });
    }
    
    console.log('✅ Formularz kontaktowy zainicjalizowany');
}

// ===== WALIDACJA PÓL W CZASIE RZECZYWISTYM =====
function addFieldValidation() {
    const nameField = document.getElementById('contact-name');
    const emailField = document.getElementById('contact-email');
    const phoneField = document.getElementById('contact-phone');
    
    // Walidacja imienia
    if (nameField) {
        nameField.addEventListener('blur', function() {
            if (this.value.trim().length < 2) {
                this.style.borderColor = '#e74c3c';
                showFieldError(this, 'Imię musi mieć co najmniej 2 znaki');
            } else {
                this.style.borderColor = '#27ae60';
                hideFieldError(this);
            }
        });
    }
    
    // Walidacja email
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (!isValidEmail(this.value)) {
                this.style.borderColor = '#e74c3c';
                showFieldError(this, 'Nieprawidłowy format email');
            } else {
                this.style.borderColor = '#27ae60';
                hideFieldError(this);
            }
        });
    }
    
    // Walidacja telefonu
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            // Usuń wszystko co nie jest cyfrą, spacją, + lub -
            this.value = this.value.replace(/[^\d\s\+\-]/g, '');
        });
        
        phoneField.addEventListener('blur', function() {
            const phone = this.value.replace(/\s/g, '');
            if (phone.length < 9) {
                this.style.borderColor = '#e74c3c';
                showFieldError(this, 'Numer telefonu jest za krótki');
            } else {
                this.style.borderColor = '#27ae60';
                hideFieldError(this);
            }
        });
    }
}

// ===== OBSŁUGA BŁĘDÓW PÓL =====
function showFieldError(field, message) {
    hideFieldError(field); // Usuń poprzedni błąd
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        animation: slideIn 0.3s ease-out;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// ===== OBSŁUGA DATY I CZASU =====
function initDateTimeInput() {
    console.log('📅 Inicjalizacja datetime input...');
    
    const datetimeInput = document.getElementById('contact-datetime');
    
    if (datetimeInput) {
        // Ustaw minimalną datę na dzisiaj
        setMinDateTime();
        
        // Aktualizuj co minutę
        setInterval(setMinDateTime, 60000);
        
        // Dodaj placeholder info
        datetimeInput.addEventListener('focus', function() {
            if (!this.value) {
                showDateTimeHelp();
            }
        });
    }
    
    console.log('✅ DateTime input zainicjalizowany');
}

function setMinDateTime() {
    const datetimeInput = document.getElementById('contact-datetime');
    if (datetimeInput) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Format: YYYY-MM-DDTHH:MM
        const min = tomorrow.toISOString().slice(0, 16);
        datetimeInput.setAttribute('min', min);
        
        // Maksymalnie 3 miesiące do przodu
        const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const max = maxDate.toISOString().slice(0, 16);
        datetimeInput.setAttribute('max', max);
    }
}

function resetDateTimeMin() {
    setMinDateTime();
}

function showDateTimeHelp() {
    const helpText = document.createElement('div');
    helpText.className = 'datetime-help';
    helpText.innerHTML = `
        <strong>💡 Wskazówka:</strong><br>
        • Wybierz preferowany termin<br>
        • Dostępne: Pon-Pt 9:00-18:00, Sob 10:00-16:00<br>
        • Możemy zaproponować alternatywny termin
    `;
    helpText.style.cssText = `
        background: #e3f2fd;
        border: 1px solid #64b5f6;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #1565c0;
        animation: slideIn 0.3s ease-out;
    `;
    
    const datetimeInput = document.getElementById('contact-datetime');
    if (datetimeInput && !datetimeInput.parentNode.querySelector('.datetime-help')) {
        datetimeInput.parentNode.appendChild(helpText);
        
        // Usuń po 5 sekundach
        setTimeout(() => {
            if (helpText.parentNode) {
                helpText.remove();
            }
        }, 5000);
    }
}

// ===== WYSYŁANIE EMAILA - PRZEZ FORMSPREE =====
async function sendBookingEmail(data) {
    console.log('📧 Wysyłanie przez Formspree...', data);
    
    try {
        const response = await fetch('https://formspree.io/f/xblzkgol', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Dane podstawowe
                /* name: data.name,
                email: data.email,
                phone: data.phone,
                service: data.service,
                preferredDate: data.preferredDate,
                notes: data.notes,
                timestamp: data.timestamp, */
                
                // Formspree specjalne pola
                _replyto: data.email,
                _subject: '🌟 NOWA REZERWACJA - NailArt Studio',
                
                // Sformatowana wiadomość
                message: `
╔══════════════════════════════════════╗
║          🌟 NOWA REZERWACJA           ║
║            NailArt Studio            ║
╚══════════════════════════════════════╝

👤 DANE KLIENTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Imię i nazwisko: ${data.name}
• Email: ${data.email}
• Telefon: ${data.phone}

💅 SZCZEGÓŁY REZERWACJI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wybrana usługa: ${data.service}
• Preferowany termin: ${data.preferredDate}
• Data zgłoszenia: ${data.timestamp}

📝 DODATKOWE INFORMACJE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.notes}

┌─────────────────────────────────────┐
│  AKCJE DO WYKONANIA:                │
│  ✅ Zadzwoń do klienta              │
│  ✅ Potwierdź dostępność terminu    │
│  ✅ Wyślij SMS z potwierdzeniem     │
└─────────────────────────────────────┘

📞 SZYBKI KONTAKT:
• Tel: ${data.phone}
• Email: ${data.email}

---
💎 Wiadomość wysłana automatycznie ze strony
💅 Data: ${data.timestamp}
                `
            })
        });
        
        if (response.ok) {
            console.log('✅ Email wysłany przez Formspree!');
            return { success: true };
        } else {
            throw new Error('Błąd serwera Formspree');
        }
        
    } catch (error) {
        console.error('❌ Błąd wysyłania:', error);
        return { success: false, error: error.message };
    }
}

// Funkcja backup - mailto jako zabezpieczenie
function sendMailtoBackup(data) {
    const subject = encodeURIComponent('🌟 NOWA REZERWACJA - NailArt Studio (Backup)');
    const body = encodeURIComponent(`
NOWA REZERWACJA (wysłana jako backup):

Imię: ${data.name}
Email: ${data.email}
Telefon: ${data.phone}
Usługa: ${data.service}
Termin: ${data.preferredDate}
Uwagi: ${data.notes}
Data: ${data.timestamp}

---
Email nie został wysłany automatycznie.
Proszę skontaktować się z klientem.
    `);
    
    const mailtoUrl = `mailto:krzysztofglicner@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    console.log('📧 Mailto backup uruchomiony');
}

// ===== BACKUP LOKALNY =====
function saveBookingLocally(data) {
    try {
        const bookings = JSON.parse(localStorage.getItem('nailart_bookings') || '[]');
        bookings.push({
            id: Date.now(),
            ...data,
            status: 'sent'
        });
        
        // Przechowuj maksymalnie 50 rezerwacji
        if (bookings.length > 50) {
            bookings.splice(0, bookings.length - 50);
        }
        
        localStorage.setItem('nailart_bookings', JSON.stringify(bookings));
        console.log('💾 Rezerwacja zapisana lokalnie');
    } catch (error) {
        console.error('❌ Błąd zapisu lokalnego:', error);
    }
}

// ===== FUNKCJE POMOCNICZE =====
function getServiceName(serviceValue) {
    const services = {
        'manicure': '💅 Manicure klasyczny (od 40 zł)',
        'hybryda': '✨ Hybryda (od 60 zł)',
        'nail-art': '🎨 Nail Art (od 80 zł)',
        'zel': '💎 Żel z dodatkami (od 70 zł)',
        'pedicure': '🦶 Pedicure (od 80 zł)',
        'przedluzanie': '🌸 Przedłużanie paznokci (od 100 zł)'
    };
    return services[serviceValue] || 'Nie wybrano usługi';
}

function formatDateTime(datetime) {
    if (!datetime) return 'Nie wybrano';
    
    const date = new Date(datetime);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('pl-PL', options);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== WYŚWIETLANIE KOMUNIKATÓW POD SOCIAL MEDIA =====
function showFormMessage(message, type) {
    // Usuń poprzednie komunikaty z formularza
    const existingFormMessage = document.querySelector('.form-message');
    if (existingFormMessage) {
        existingFormMessage.remove();
    }
    
    // Kontener pod social media
    const confirmationContainer = document.getElementById('booking-confirmation');
    
    if (!confirmationContainer) {
        console.error('Nie znaleziono kontenera booking-confirmation');
        return;
    }
    
    // Usuń poprzedni komunikat
    confirmationContainer.innerHTML = '';
    confirmationContainer.style.display = 'none';
    
    // Ustaw nowy komunikat
    confirmationContainer.textContent = message;
    confirmationContainer.className = `booking-confirmation ${type}`;
    
    // Pokaż z animacją
    setTimeout(() => {
        confirmationContainer.style.display = 'block';
    }, 100);
    
    // Scroll do komunikatu (smooth)
    setTimeout(() => {
        confirmationContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 200);
    
    // Auto remove z lepszą animacją
    const timeout = type === 'success' ? 8000 : 6000;
    setTimeout(() => {
        if (confirmationContainer.parentNode) {
            confirmationContainer.style.animation = 'fadeOutUp 0.5s ease-out';
            setTimeout(() => {
                confirmationContainer.style.display = 'none';
                confirmationContainer.style.animation = '';
            }, 500);
        }
    }, timeout);
    
    // Dodaj ikonę w zależności od typu
    const icon = type === 'success' ? '✅ ' : '⚠️ ';
    confirmationContainer.textContent = icon + message;
    
    console.log(`📢 Komunikat wyświetlony pod social media: ${type}`);
}

// ===== ANIMACJE SCROLL =====
function initScrollAnimations() {
    console.log('🎬 Inicjalizacja animacji scroll...');
    
    const animatedElements = document.querySelectorAll('.service-card, .review-card, .stat-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'all 0.8s ease-out';
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        observer.observe(el);
    });
    
    console.log('✅ Animacje scroll zainicjalizowane');
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    console.log('🌓 Inicjalizacja theme toggle...');
    
    const themeCheckbox = document.getElementById('theme-checkbox');
    
    // Sprawdź zapisany motyw
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeCheckbox) themeCheckbox.checked = true;
    }
    
    // Obsługa przełączania
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Animacja przełączania
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
            
            console.log(`🎨 Motyw zmieniony na: ${newTheme}`);
        });
    }
    
    console.log('✅ Theme toggle zainicjalizowany');
}

// ===== DODATKOWE FUNKCJE UX =====

// Funkcja wyświetlająca zapisane rezerwacje (dla debugowania)
function showSavedBookings() {
    const bookings = JSON.parse(localStorage.getItem('nailart_bookings') || '[]');
    console.table(bookings);
    return bookings;
}

// Czyszczenie zapisanych rezerwacji
function clearSavedBookings() {
    localStorage.removeItem('nailart_bookings');
    console.log('🗑️ Zapisane rezerwacje zostały usunięte');
}

// Eksportuj funkcje do global scope (dla testowania w konsoli)
window.showSavedBookings = showSavedBookings;
window.clearSavedBookings = clearSavedBookings;

// Dodaj CSS dla animacji loading
const loadingCSS = `
.cta-button.loading,
.contact-form button.loading {
    position: relative;
    color: transparent !important;
    pointer-events: none;
}

.cta-button.loading::after,
.contact-form button.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 1;
}

@keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}
`;

// Dodaj style do dokumentu
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingCSS;
document.head.appendChild(styleSheet);

console.log('🎉 JavaScript w pełni załadowany i skonfigurowany!');

// ===== KOMPAKTOWY KALENDARZ REZERWACJI =====
class CompactBookingCalendar {
    constructor() {
        this.currentWeekStart = this.getWeekStart(new Date());
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;
        
        this.init();
    }
    
    init() {
        console.log('📅 Inicjalizacja kompaktowego kalendarza...');
        
        this.renderWeek();
        this.addEventListeners();
        this.updateSummary();
        
        console.log('✅ Kompaktowy kalendarz zainicjalizowany');
    }
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Poniedziałek
        return new Date(d.setDate(diff));
    }
    
    addEventListeners() {
        // Nawigacja tygodnia
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousWeek());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextWeek());
        
        // Godziny
        const timeSlots = document.querySelectorAll('.time-mini');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', (e) => this.selectTime(e));
        });
        
        // Select usługi
        const serviceSelect = document.getElementById('contact-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', (e) => this.selectService(e));
        }
    }
    
    renderWeek() {
        const weekDays = document.getElementById('week-days');
        const weekRange = document.getElementById('week-range');
        
        if (!weekDays) return;
        
        weekDays.innerHTML = '';
        
        const dayNames = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
        
        // Update header
        const endWeek = new Date(this.currentWeekStart);
        endWeek.setDate(endWeek.getDate() + 5); // Do soboty
        
        const startStr = this.currentWeekStart.getDate();
        const endStr = endWeek.getDate();
        const monthName = this.currentWeekStart.toLocaleDateString('pl-PL', { month: 'long' });
        
        weekRange.textContent = `${startStr}-${endStr} ${monthName}`;
        
        // Render dni (Pon-Sob)
        for (let i = 0; i < 6; i++) {
            const currentDay = new Date(this.currentWeekStart);
            currentDay.setDate(currentDay.getDate() + i);
            
            const dayElement = this.createDayElement(currentDay, dayNames[i]);
            weekDays.appendChild(dayElement);
        }
    }
    
    createDayElement(date, dayName) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-mini';
        
        const dayNameSpan = document.createElement('div');
        dayNameSpan.className = 'day-name';
        dayNameSpan.textContent = dayName;
        
        const dayNumberSpan = document.createElement('div');
        dayNumberSpan.className = 'day-number';
        dayNumberSpan.textContent = date.getDate();
        
        dayElement.appendChild(dayNameSpan);
        dayElement.appendChild(dayNumberSpan);
        
        // Sprawdź czy dzień jest dostępny
        const today = new Date();
        const dayOfWeek = date.getDay();
        
        if (date < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
            dayElement.title = 'Przeszła data';
        } else if (dayOfWeek === 6) {
            dayElement.classList.add('weekend');
            dayElement.title = 'Sobota: godziny 10:00-16:00';
            dayElement.addEventListener('click', () => this.selectDate(date, dayElement));
        } else {
            dayElement.addEventListener('click', () => this.selectDate(date, dayElement));
        }
        
        return dayElement;
    }
    
    selectDate(date, element) {
        // Usuń poprzednie zaznaczenie
        const previousSelected = document.querySelector('.day-mini.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Zaznacz nowy dzień
        element.classList.add('selected');
        this.selectedDate = date;
        
        // Update dostępnych godzin
        this.updateAvailableTimes(date);
        
        // Reset wybranej godziny
        this.selectedTime = null;
        const selectedTime = document.querySelector('.time-mini.selected');
        if (selectedTime) {
            selectedTime.classList.remove('selected');
        }
        
        this.updateSummary();
        console.log('📅 Wybrano datę:', date.toLocaleDateString('pl-PL'));
    }
    
    updateAvailableTimes(date) {
        const dayOfWeek = date.getDay();
        const timeSlots = document.querySelectorAll('.time-mini');
        
        timeSlots.forEach(slot => {
            slot.classList.remove('unavailable');
            slot.disabled = false;
            
            const time = slot.dataset.time;
            const hour = parseInt(time.split(':')[0]);
            
            // Sobota: tylko 10:00-16:00
            if (dayOfWeek === 6 && (hour < 10 || hour >= 16)) {
                slot.classList.add('unavailable');
                slot.disabled = true;
                slot.title = 'Niedostępne w sobotę';
            }
            // Inne dni: 9:00-18:00
            else if (dayOfWeek !== 6 && (hour < 9 || hour >= 18)) {
                slot.classList.add('unavailable');
                slot.disabled = true;
                slot.title = 'Poza godzinami pracy';
            }
        });
        
        // Symulacja zajętych terminów
        const unavailable = ['10:00', '14:00']; // Przykład
        unavailable.forEach(time => {
            const slot = document.querySelector(`[data-time="${time}"]`);
            if (slot && !slot.disabled) {
                slot.classList.add('unavailable');
                slot.disabled = true;
                slot.title = 'Termin zajęty';
            }
        });
    }
    
    selectTime(event) {
        const slot = event.target;
        
        if (slot.disabled || slot.classList.contains('unavailable')) return;
        
        if (!this.selectedDate) {
            alert('Najpierw wybierz datę');
            return;
        }
        
        // Usuń poprzednie zaznaczenie
        const previousSelected = document.querySelector('.time-mini.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Zaznacz nowy slot
        slot.classList.add('selected');
        this.selectedTime = slot.dataset.time;
        
        this.updateSummary();
        console.log('⏰ Wybrano godzinę:', this.selectedTime);
    }
    
    selectService(event) {
        this.selectedService = event.target.value;
        this.updateSummary();
        console.log('💅 Wybrano usługę:', this.selectedService);
    }
    
    updateSummary() {
        const summaryElement = document.getElementById('mini-summary');
        const summaryText = document.getElementById('summary-text');
        
        if (!summaryElement || !summaryText) return;
        
        if (this.selectedService && this.selectedDate && this.selectedTime) {
            summaryElement.style.display = 'block';
            
            const serviceName = this.getServiceName(this.selectedService);
            const dateStr = this.selectedDate.toLocaleDateString('pl-PL', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            summaryText.textContent = `${serviceName} • ${dateStr} • ${this.selectedTime}`;
        } else {
            summaryElement.style.display = 'none';
        }
    }
    
    getServiceName(serviceValue) {
        const services = {
            'manicure': 'Manicure klasyczny',
            'hybryda': 'Hybryda',
            'nail-art': 'Nail Art',  
            'zel': 'Żel z dodatkami',
            'pedicure': 'Pedicure',
            'przedluzanie': 'Przedłużanie'
        };
        return services[serviceValue] || 'Usługa';
    }
    
    previousWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
        this.renderWeek();
    }
    
    nextWeek() {
        // Maksymalnie 4 tygodnie do przodu
        const maxWeek = new Date();
        maxWeek.setDate(maxWeek.getDate() + 28);
        
        const nextWeek = new Date(this.currentWeekStart);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        if (nextWeek <= maxWeek) {
            this.currentWeekStart = nextWeek;
            this.renderWeek();
        }
    }
    
    // Metoda do pobrania danych rezerwacji (do użycia w formularzu)
    getBookingData() {
        return {
            service: this.selectedService,
            date: this.selectedDate,
            time: this.selectedTime,
            formattedDate: this.selectedDate ? this.selectedDate.toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) : null
        };
    }
}

// Inicjalizacja kalendarza po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Dodaj kalendarz rezerwacji
    if (document.getElementById('calendar-days')) {
        window.bookingCalendar = new BookingCalendar();
    }
});

// ===== ANIMACJA STATYSTYK SALONU =====
class SalonStatsAnimator {
    constructor() {
        this.statsSection = document.querySelector('.salon-stats');
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.animated = false;
        
        if (this.statsSection && this.statNumbers.length > 0) {
            this.init();
        }
    }
    
    init() {
        console.log('📊 Inicjalizacja animacji statystyk...');
        
        // Przygotuj dane statystyk
        this.stats = [
            { element: this.statNumbers[0], target: 500, suffix: '+', duration: 2000 },
            { element: this.statNumbers[1], target: 98, suffix: '%', duration: 2500 },
            { element: this.statNumbers[2], target: 3, suffix: '', duration: 1500 },
            { element: this.statNumbers[3], target: 150, suffix: '+', duration: 2200 }
        ];
        
        // Resetuj liczby na 0
        this.statNumbers.forEach(stat => {
            stat.textContent = '0';
        });
        
        // Obserwuj kiedy sekcja wchodzi do widoku
        this.observeStats();
    }
    
    observeStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    console.log('📈 Rozpoczynam animację statystyk');
                    this.animateStats();
                    this.animated = true;
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });
        
        observer.observe(this.statsSection);
    }
    
    animateStats() {
        this.stats.forEach((stat, index) => {
            // Delay dla każdej statystyki
            setTimeout(() => {
                this.animateNumber(stat.element, 0, stat.target, stat.duration, stat.suffix);
                
                // Dodaj efekt pulsowania
                stat.element.style.animation = 'statPulse 0.6s ease-in-out';
                
                // Usuń pulsowanie po zakończeniu
                setTimeout(() => {
                    stat.element.style.animation = 'floating 3s ease-in-out infinite';
                    stat.element.style.animationDelay = `${index * 0.5}s`;
                }, 600);
            }, index * 300);
        });
    }
    
    animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        const range = end - start;
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function dla płynniejszej animacji
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            const current = Math.floor(start + range * easeOutQuart);
            element.textContent = current + suffix;
            
            // Dodaj efekt świecenia podczas animacji
            if (progress < 1) {
                element.style.textShadow = `0 0 20px rgba(52, 152, 219, ${0.8 * progress})`;
                requestAnimationFrame(updateNumber);
            } else {
                // Finalna wartość
                element.textContent = end + suffix;
                element.style.textShadow = '0 0 15px rgba(52, 152, 219, 0.5)';
                
                // Usuń świecenie po 2 sekundach
                setTimeout(() => {
                    element.style.textShadow = 'none';
                }, 2000);
                
                console.log(`✅ Animacja statystyki ${end}${suffix} zakończona`);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
}

// Dodaj CSS dla animacji pulsowania statystyk
function addStatsCSS() {
    const css = `
        @keyframes statPulse {
            0% { 
                transform: scale(1); 
                color: var(--primary-color);
            }
            50% { 
                transform: scale(1.2); 
                color: var(--accent-color);
                text-shadow: 0 0 20px rgba(231, 76, 60, 0.6);
            }
            100% { 
                transform: scale(1); 
                color: var(--primary-color);
                text-shadow: none;
            }
        }
        
        .stat-number {
            transition: all 0.3s ease;
            font-variant-numeric: tabular-nums;
        }
        
        .stat-item:hover .stat-number {
            animation: statPulse 0.6s ease-in-out !important;
            transform: scale(1.1) !important;
        }
        
        /* Efekt liczenia */
        .counting {
            background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Dark mode */
        [data-theme="dark"] .stat-number {
            text-shadow: 0 0 10px rgba(100, 181, 246, 0.3);
        }
        
        [data-theme="dark"] .counting {
            background: linear-gradient(45deg, var(--primary-color), #ff7043);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);
}

// Inicjalizacja w DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM załadowany - inicjalizuję funkcje...');
    
    // ...existing code...
    
    // Dodaj animacje statystyk
    addStatsCSS();
    window.salonStats = new SalonStatsAnimator();
    
    console.log('✅ Wszystkie funkcje zainicjalizowane!');
});