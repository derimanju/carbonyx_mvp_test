// DOM Elements
const countdownDisplay = document.getElementById('countdown');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const fixedTimer = document.getElementById('fixed-timer');
const fixedCTA = document.getElementById('fixed-cta');
const generationInput = document.getElementById('generation-input');
const calculatorResult = document.getElementById('calculator-result');
const registrationForm = document.getElementById('registration-form');

// Target date for countdown (2025년 12월 31일 23:59:59 KST)
const targetDate = new Date('2025-12-31T23:59:59+09:00');

// Market prices (관리자가 설정할 수 있는 값들)
const marketPrices = {
    min: 3000,
    avg: 9000,
    max: 15000,
    recommended: 12500
};

// KCU conversion factor (발전량 MWh → KCU)
const KCU_CONVERSION_FACTOR = 0.459;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initFixedCTA();
    initNavigation();
    initFormValidation();
    updateMarketPrices();
});

// Countdown Timer Functions
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const timeDifference = targetDate - now;

    if (timeDifference > 0) {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        daysElement.textContent = days.toString().padStart(3, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');

        // Update fixed CTA timer
        if (fixedTimer) {
            fixedTimer.textContent = `${days}일 ${hours}시간`;
        }
    } else {
        // Countdown finished
        daysElement.textContent = '000';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';

        if (fixedTimer) {
            fixedTimer.textContent = '마감됨';
        }
    }
}

// Fixed CTA Functions
function initFixedCTA() {
    let urgencySection = document.querySelector('.urgency-section');
    let registrationSection = document.querySelector('.registration-section');

    if (!urgencySection || !registrationSection || !fixedCTA) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target === urgencySection && entry.isIntersecting) {
                fixedCTA.classList.add('visible');
            } else if (entry.target === registrationSection && entry.isIntersecting) {
                fixedCTA.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(urgencySection);
    observer.observe(registrationSection);
}

// Navigation Functions
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Revenue Calculator Functions
function calculateRevenue() {
    const generationValue = parseFloat(generationInput.value);

    if (!generationValue || generationValue <= 0) {
        alert('발전량을 올바르게 입력해주세요.');
        return;
    }

    // Calculate KCU
    const kcuAmount = generationValue * KCU_CONVERSION_FACTOR;

    // Calculate revenues
    const minRevenue = kcuAmount * marketPrices.min;
    const avgRevenue = kcuAmount * marketPrices.avg;
    const maxRevenue = kcuAmount * marketPrices.max;

    // Update display
    document.getElementById('input-generation').textContent = `${generationValue} MWh`;
    document.getElementById('calculated-kcu').textContent = `${kcuAmount.toFixed(1)} KCU`;
    document.getElementById('calculated-revenue').textContent = formatCurrency(avgRevenue);

    document.getElementById('min-revenue').textContent = formatCurrency(minRevenue);
    document.getElementById('avg-revenue').textContent = formatCurrency(avgRevenue);
    document.getElementById('max-revenue').textContent = formatCurrency(maxRevenue);

    // Show result with animation
    calculatorResult.style.opacity = '0';
    calculatorResult.style.display = 'block';

    setTimeout(() => {
        calculatorResult.style.transition = 'opacity 0.5s ease';
        calculatorResult.style.opacity = '1';
    }, 100);

    // Animate numbers (optional enhancement)
    animateNumbers();

    // Log calculator usage to Supabase
    if (window.SupabaseClient) {
        window.SupabaseClient.logCalculatorUsage(generationValue, kcuAmount, avgRevenue)
            .catch(error => console.warn('Failed to log calculator usage:', error));
    }

    // Analytics tracking
    trackCalculatorUsage(generationValue, avgRevenue);
}

function animateNumbers() {
    const numberElements = calculatorResult.querySelectorAll('.step-value, .value');
    numberElements.forEach(element => {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    });
}

function formatCurrency(amount) {
    return '₩' + amount.toLocaleString('ko-KR');
}

// Market Price Update Function
async function updateMarketPrices() {
    // Try to get latest prices from Supabase first
    if (window.SupabaseClient) {
        try {
            const result = await window.SupabaseClient.getLatestMarketPrices();

            if (result.success && result.data) {
                const prices = result.data;

                // Update global market prices object
                marketPrices.min = prices.min_price;
                marketPrices.avg = prices.avg_price;
                marketPrices.max = prices.max_price;
                marketPrices.recommended = prices.recommended_price;

                if (CONFIG.DEBUG) {
                    console.log('Market prices updated from database:', prices);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch market prices from database:', error);
        }
    }

    // Update UI elements
    const currentPriceElement = document.getElementById('current-price');
    const recommendedPriceElement = document.getElementById('recommended-price');
    const priceChangeElement = document.getElementById('price-change');

    if (currentPriceElement) {
        currentPriceElement.textContent = `₩${marketPrices.min.toLocaleString()} ~ ₩${marketPrices.max.toLocaleString()}`;
    }

    if (recommendedPriceElement) {
        recommendedPriceElement.textContent = formatCurrency(marketPrices.recommended);
    }

    if (priceChangeElement) {
        // Simulate price change (실제로는 API에서 가져올 데이터)
        const change = (Math.random() * 10 - 5).toFixed(1);
        const isPositive = change >= 0;

        priceChangeElement.textContent = `${isPositive ? '+' : ''}${change}%`;
        priceChangeElement.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
    }

    // Update CTA price
    const ctaPrice = document.querySelector('.cta-price');
    if (ctaPrice) {
        ctaPrice.textContent = `현재 시세: ${formatCurrency(marketPrices.recommended)}`;
    }
}

// Form Validation and Submission
function initFormValidation() {
    if (!registrationForm) return;

    // Supabase 전용 폼 처리 사용
    registrationForm.addEventListener('submit', function(event) {
        if (typeof handleSupabaseFormSubmission === 'function') {
            handleSupabaseFormSubmission(event);
        } else {
            console.error('❌ Supabase form handler not loaded');
            event.preventDefault();
            alert('시스템 초기화 중입니다. 페이지를 새로고침해주세요.');
        }
    });

    // Real-time validation
    const inputs = registrationForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    // 제출 버튼에 원본 텍스트 저장
    const submitBtn = registrationForm.querySelector('.submit-btn');
    if (submitBtn && !submitBtn.dataset.originalText) {
        submitBtn.dataset.originalText = submitBtn.textContent;
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    removeFieldError(field);

    if (!value) {
        showFieldError(field, '이 필드는 필수입니다.');
        return false;
    }

    // Specific validations
    switch(field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, '올바른 이메일 형식을 입력해주세요.');
                return false;
            }
            break;
        case 'tel':
            if (!isValidPhone(value)) {
                showFieldError(field, '올바른 전화번호를 입력해주세요.');
                return false;
            }
            break;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function showFieldError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#F44336';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';

    field.style.borderColor = '#F44336';
    field.parentNode.appendChild(errorElement);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#E0E0E0';
}

function clearFieldError(event) {
    removeFieldError(event.target);
}

async function handleFormSubmission(event) {
    event.preventDefault();

    console.log('Form submission started');

    // Validate all fields
    const formData = new FormData(registrationForm);
    const data = {
        companyName: formData.get('company-name'),
        contactName: formData.get('contact-name'),
        phone: formData.get('phone'),
        email: formData.get('email')
    };

    console.log('Form data collected:', data);

    // 기본 유효성 검사
    if (!data.companyName || !data.contactName || !data.phone) {
        alert('기업명, 담당자명, 연락처는 필수 입력 항목입니다.');
        return;
    }

    let isValid = true;
    const requiredFields = registrationForm.querySelectorAll('input[required]');

    requiredFields.forEach(field => {
        if (!validateField({target: field})) {
            isValid = false;
        }
    });

    if (!isValid) {
        alert('모든 필수 필드를 올바르게 입력해주세요.');
        return;
    }

    const submitBtn = registrationForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = '신청 처리 중...';
    submitBtn.disabled = true;

    try {
        console.log('Attempting to save to database...');

        // Supabase 클라이언트가 있는지 확인
        if (!window.SupabaseClient) {
            console.error('SupabaseClient not available, using fallback');
            throw new Error('DATABASE_UNAVAILABLE');
        }

        // Supabase에 데이터 저장
        const result = await window.SupabaseClient.savePreRegistration(data);
        console.log('Database save result:', result);

        if (result.success) {
            // 성공 메시지
            let successMessage = '사전 신청이 완료되었습니다!\n전문가가 곧 연락드리겠습니다.';

            // 페이지 방문 로그 저장 (실패해도 메인 기능에 영향 없음)
            try {
                await window.SupabaseClient.logPageVisit(window.location.pathname, document.referrer);
            } catch (logError) {
                console.warn('Failed to log page visit:', logError);
            }

            alert(successMessage);
            registrationForm.reset();

            // Analytics tracking
            if (typeof trackFormSubmission === 'function') {
                trackFormSubmission(data);
            }
        } else {
            throw new Error(result.error || 'Database save failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);

        // Fallback: 로컬 저장 및 사용자 안내
        if (error.message === 'DATABASE_UNAVAILABLE' ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('network') ||
            error.message.includes('connection')) {

            // 로컬 스토리지에 임시 저장
            saveToLocalStorage(data);

            alert('현재 서버 연결에 문제가 있습니다.\n' +
                  '입력하신 정보를 임시 저장했습니다.\n\n' +
                  '직접 연락주시면 즉시 처리해드리겠습니다:\n' +
                  '전화: 1588-0000\n' +
                  '이메일: contact@carbonyx.co.kr');
        } else {
            // 기타 오류
            alert('신청 중 오류가 발생했습니다.\n' +
                  '다시 시도하시거나 전화로 연락주세요.\n\n' +
                  '전화: 1588-0000\n' +
                  '오류 코드: ' + (error.code || 'UNKNOWN'));
        }

        // 에러 추적
        if (typeof trackError === 'function') {
            trackError(error.message, 'form_submission');
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 로컬 스토리지에 임시 저장하는 함수
function saveToLocalStorage(data) {
    try {
        const timestamp = new Date().toISOString();
        const localData = {
            ...data,
            timestamp,
            status: 'pending_upload'
        };

        const existingData = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
        existingData.push(localData);
        localStorage.setItem('pendingRegistrations', JSON.stringify(existingData));

        console.log('Data saved to localStorage:', localData);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// Analytics and Tracking Functions
function trackFormSubmission(data) {
    // Google Analytics 4 이벤트 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'pre_registration',
            value: 1
        });
    }

    // 콘솔에 로그 (개발용)
    console.log('Form submitted:', data);
}

function trackCalculatorUsage(generationValue) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculator_use', {
            event_category: 'engagement',
            event_label: 'revenue_calculator',
            value: generationValue
        });
    }

    console.log('Calculator used with value:', generationValue);
}

// Utility Functions
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

// Performance Optimizations
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Add input event listener for real-time calculation
if (generationInput) {
    generationInput.addEventListener('input', debounce(() => {
        const value = parseFloat(generationInput.value);
        if (value > 0) {
            calculateRevenue();
            trackCalculatorUsage(value);
        }
    }, 500));
}

// Company slider enhancement
function initCompanySlider() {
    const track = document.getElementById('companies-track');
    if (!track) return;

    // Duplicate content for seamless loop
    const originalContent = track.innerHTML;
    track.innerHTML = originalContent + originalContent;

    // Pause animation on hover
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
}

// Initialize company slider
document.addEventListener('DOMContentLoaded', initCompanySlider);

// Scroll-triggered animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.process-step, .case-card, .warning-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(element);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// Error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    // 실제 환경에서는 에러 로깅 서비스로 전송
});

// Service Worker registration (PWA 준비)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// 디버깅용 상태 확인 함수
function checkSystemStatus() {
    const status = {
        timestamp: new Date().toISOString(),
        libraries: {
            CONFIG: !!window.CONFIG,
            supabase: !!window.supabase,
            SupabaseClient: !!window.SupabaseClient,
            fallbackForm: typeof handleFormSubmissionEnhanced === 'function'
        },
        config: window.CONFIG ? {
            environment: window.CONFIG.ENVIRONMENT,
            supabaseUrl: window.CONFIG.SUPABASE_URL ? 'configured' : 'missing',
            debug: window.CONFIG.DEBUG
        } : null,
        form: {
            element: !!registrationForm,
            submitButton: !!document.querySelector('.submit-btn')
        },
        localStorage: {
            available: typeof localStorage !== 'undefined',
            formSubmissions: window.getLocalFormSubmissions ? window.getLocalFormSubmissions().length : 'unknown'
        },
        supabase: {
            clientInitialized: !!(window.SupabaseClient && typeof window.SupabaseClient.savePreRegistration === 'function'),
            initFunction: typeof initSupabase === 'function',
            saveFunction: !!(window.SupabaseClient && typeof window.SupabaseClient.savePreRegistration === 'function'),
            connectionTest: !!(window.SupabaseClient && typeof window.SupabaseClient.testConnection === 'function')
        },
        popup: {
            initialized: !!window.MVPNoticePopup,
            status: window.debugPopup ? window.debugPopup() : 'not available'
        }
    };

    console.table(status.libraries);
    console.log('🔍 Full system status:', status);

    // 간단한 자동 진단
    const issues = [];
    if (!status.libraries.CONFIG) issues.push('CONFIG not loaded');
    if (!status.libraries.supabase) issues.push('Supabase library not loaded');
    if (!status.libraries.SupabaseClient) issues.push('SupabaseClient not initialized');
    if (!status.supabase.clientInitialized) issues.push('Supabase client not ready');
    if (!status.form.element) issues.push('Registration form not found');

    if (issues.length > 0) {
        console.warn('🚨 Detected issues:', issues);
        console.log('💡 Try running: CarbonyxApp.debug.manualInit()');
    } else {
        console.log('✅ All systems appear ready');
    }

    return status;
}

// Export functions for testing or external use
window.CarbonyxApp = {
    calculateRevenue,
    updateMarketPrices,
    scrollToSection,
    checkSystemStatus,

    // 디버깅 헬퍼들
    debug: {
        checkStatus: checkSystemStatus,
        getLocalSubmissions: () => window.getLocalFormSubmissions ? window.getLocalFormSubmissions() : [],
        clearLocalData: () => window.clearLocalFormSubmissions ? window.clearLocalFormSubmissions() : false,
        manualInit: () => window.manualInitSupabase ? window.manualInitSupabase() : false,

        // 팝업 디버깅 기능
        popup: {
            show: () => window.showPopup ? window.showPopup() : console.warn('Popup not initialized'),
            hide: () => window.hidePopup ? window.hidePopup() : console.warn('Popup not initialized'),
            status: () => window.debugPopup ? window.debugPopup() : { error: 'Popup not initialized' },
            reset: () => window.resetPopup ? window.resetPopup() : console.warn('Popup not initialized')
        },

        // Supabase 연결 테스트
        testSupabaseConnection: () => {
            if (typeof testSupabaseConnection === 'function') {
                return testSupabaseConnection();
            } else {
                console.error('❌ testSupabaseConnection function not available');
                return Promise.resolve({ success: false, error: 'Test function not available' });
            }
        },

        // 폼 제출 테스트
        testFormSubmission: () => {
            const testData = {
                companyName: '테스트기업',
                contactName: '김테스트',
                phone: '010-1234-5678',
                email: 'test@test.com'
            };
            console.log('🧪 Testing form submission with data:', testData);

            if (window.SupabaseClient && typeof window.SupabaseClient.savePreRegistration === 'function') {
                return window.SupabaseClient.savePreRegistration(testData);
            } else {
                console.error('❌ SupabaseClient not available');
                return Promise.resolve({ success: false, error: 'SupabaseClient not available' });
            }
        }
    }
};