// Language switching functionality
let currentLanguage = 'ar';

// Translation data
const translations = {
    ar: {
        'navbar-brand': 'تعليم اللغة القبطية',
        'loading-text': 'جاري التحميل...',
        'footer-text': 'تعليم اللغة القبطية'
    },
    en: {
        'navbar-brand': 'Learn Coptic Language',
        'loading-text': 'Loading...',
        'footer-text': 'Learn Coptic Language'
    }
};

function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update HTML lang and dir attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update elements with data attributes
    document.querySelectorAll('[data-ar][data-en]').forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = element.getAttribute(`data-${lang}`);
        } else {
            element.textContent = element.getAttribute(`data-${lang}`);
        }
    });
    
    // Update specific elements
    updateNavbar();
    updateFooter();
    updateLoadingText();
    updateLanguageSwitcherPosition();
    
    // Save preference to localStorage
    localStorage.setItem('preferredLanguage', lang);
}

function updateNavbar() {
    const navbar = document.querySelector('.navbar-brand');
    if (navbar) {
        navbar.textContent = translations[currentLanguage]['navbar-brand'];
    }
}

function updateFooter() {
    const footer = document.querySelector('footer span[data-ar][data-en]');
    if (footer) {
        footer.textContent = translations[currentLanguage]['footer-text'];
    }
}

function updateLoadingText() {
    const loadingText = document.querySelector('#global-loader .visually-hidden');
    if (loadingText) {
        loadingText.textContent = translations[currentLanguage]['loading-text'];
    }
}

function updateLanguageSwitcherPosition() {
    const languageSwitcher = document.querySelector('#languageSelector').parentElement;
    if (languageSwitcher) {
        if (currentLanguage === 'ar') {
            // Arabic (RTL) - move to right side
            languageSwitcher.style.marginRight = 'auto';
            languageSwitcher.style.marginLeft = 'unset';
        } else {
            // English (LTR) - move to left side
            languageSwitcher.style.marginLeft = 'auto';
            languageSwitcher.style.marginRight = 'unset';
        }
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
        currentLanguage = savedLanguage;
        document.getElementById('languageSelector').value = savedLanguage;
    }
    
    // Apply current language
    changeLanguage(currentLanguage);
});

// Export for use in other scripts
window.currentLanguage = currentLanguage;
window.changeLanguage = changeLanguage;
