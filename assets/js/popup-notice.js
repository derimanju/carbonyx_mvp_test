// MVP 테스트 안내 팝업 관리
// ========================================

// 팝업 설정
const POPUP_CONFIG = {
    enabled: true,                           // 팝업 활성화 여부
    showDelay: 1500,                        // 표시 지연 시간 (ms)
    suppressDuration: 24 * 60 * 60 * 1000,  // 24시간 재표시 방지 (프로덕션용)
    testMode: true,                         // 테스트 모드 (재접속 시 항상 표시)
    showInDevelopment: true,                // 개발환경에서 표시 여부
    analyticsEvent: true,                   // GA 이벤트 추적 여부
    storageKey: 'carbonyx_popup_shown',     // 로컬스토리지 키
    dismissKey: 'carbonyx_popup_dismissed'  // 사용자 닫기 키
};

class MVPNoticePopup {
    constructor() {
        this.popup = null;
        this.isVisible = false;
        this.isAnimating = false;

        // DOM 요소 초기화
        this.initElements();

        // 이벤트 리스너 설정
        this.bindEvents();

        // 팝업 표시 결정
        this.checkAndShow();
    }

    // DOM 요소 초기화
    initElements() {
        this.popup = document.getElementById('mvp-notice-popup');
        this.modal = this.popup?.querySelector('.popup-modal');
        this.closeBtn = this.popup?.querySelector('.popup-close');
        this.confirmBtn = this.popup?.querySelector('.popup-confirm-btn');

        if (!this.popup) {
            console.warn('MVP Notice Popup: Popup element not found');
            return;
        }
    }

    // 이벤트 리스너 설정
    bindEvents() {
        if (!this.popup) return;

        // 닫기 버튼 클릭
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
                this.trackEvent('popup_close_clicked');
            });
        }

        // 확인 버튼 클릭
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
                this.trackEvent('popup_confirm_clicked');
            });
        }

        // 오버레이 클릭 (모달 외부)
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hide();
                this.trackEvent('popup_overlay_clicked');
            }
        });

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.isVisible) {
                this.handleKeyDown(e);
            }
        });

        // 모달 내부 클릭 시 이벤트 버블링 방지
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // 키보드 이벤트 처리
    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.hide();
                this.trackEvent('popup_escape_pressed');
                break;

            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }

    // Tab 키 포커스 트랩
    handleTabKey(e) {
        if (!this.modal) return;

        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // 팝업 표시 조건 확인
    checkAndShow() {
        console.log('🔍 Popup checkAndShow called');
        console.log('- POPUP_CONFIG.enabled:', POPUP_CONFIG.enabled);
        console.log('- this.popup exists:', !!this.popup);
        console.log('- window.CONFIG:', window.CONFIG);

        if (!POPUP_CONFIG.enabled || !this.popup) {
            console.log('❌ Popup disabled or element not found');
            return;
        }

        // 개발환경 체크
        const isDevelopment = window.CONFIG?.ENVIRONMENT === 'development';
        console.log('- isDevelopment:', isDevelopment);
        console.log('- showInDevelopment:', POPUP_CONFIG.showInDevelopment);

        if (isDevelopment && !POPUP_CONFIG.showInDevelopment) {
            console.log('❌ MVP Notice Popup: Disabled in development environment');
            return;
        }

        // 테스트 모드에서는 페이지별로 체크 (페이지 새로고침 시 항상 표시)
        if (POPUP_CONFIG.testMode) {
            const pageShown = sessionStorage.getItem('popup_shown_this_page');
            if (pageShown === 'true') {
                console.log('MVP Notice Popup: Already shown on this page load (test mode)');
                return;
            }
            console.log('MVP Notice Popup: Test mode - showing popup');
        } else {
            // 프로덕션 모드에서는 기존 로직 사용
            const lastShown = localStorage.getItem(POPUP_CONFIG.storageKey);
            const userDismissed = localStorage.getItem(POPUP_CONFIG.dismissKey);

            if (lastShown) {
                const timePassed = Date.now() - parseInt(lastShown);
                if (timePassed < POPUP_CONFIG.suppressDuration) {
                    console.log('MVP Notice Popup: Suppressed due to recent display');
                    return;
                }
            }

            // 사용자가 직접 닫은 경우 체크
            if (userDismissed === 'true') {
                const dismissTime = localStorage.getItem(POPUP_CONFIG.storageKey);
                if (dismissTime) {
                    const timePassed = Date.now() - parseInt(dismissTime);
                    if (timePassed < POPUP_CONFIG.suppressDuration) {
                        console.log('MVP Notice Popup: User dismissed, suppressing');
                        return;
                    }
                }
            }
        }

        // 지연 후 표시
        setTimeout(() => {
            this.show();
        }, POPUP_CONFIG.showDelay);
    }

    // 팝업 표시
    show() {
        if (!this.popup || this.isVisible || this.isAnimating) {
            return;
        }

        this.isAnimating = true;
        this.isVisible = true;

        // 스크롤 방지
        document.body.style.overflow = 'hidden';

        // 팝업 표시
        this.popup.classList.add('show');
        this.popup.classList.remove('hiding');

        // 첫 번째 포커스 가능한 요소로 포커스 이동
        setTimeout(() => {
            const firstFocusable = this.modal?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            this.isAnimating = false;
        }, 100);

        // 표시 시간 저장
        if (POPUP_CONFIG.testMode) {
            // 테스트 모드에서는 현재 페이지 로드에만 기록
            sessionStorage.setItem('popup_shown_this_page', 'true');
            console.log('✅ MVP Notice Popup displayed (test mode - page load only)');
        } else {
            // 프로덕션 모드에서는 로컬스토리지에 기록
            localStorage.setItem(POPUP_CONFIG.storageKey, Date.now().toString());
            console.log('✅ MVP Notice Popup displayed (production mode)');
        }

        // 분석 이벤트 추적
        this.trackEvent('popup_shown');
    }

    // 팝업 숨김
    hide() {
        if (!this.popup || !this.isVisible || this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        // 애니메이션 클래스 추가
        this.popup.classList.add('hiding');

        // 사용자가 직접 닫았음을 표시
        if (POPUP_CONFIG.testMode) {
            // 테스트 모드에서는 현재 페이지 로드에만 기록
            sessionStorage.setItem('popup_shown_this_page', 'true');
        } else {
            // 프로덕션 모드에서는 로컬스토리지에 기록
            localStorage.setItem(POPUP_CONFIG.dismissKey, 'true');
            localStorage.setItem(POPUP_CONFIG.storageKey, Date.now().toString());
        }

        // 애니메이션 완료 후 숨김
        setTimeout(() => {
            this.popup.classList.remove('show', 'hiding');
            this.isVisible = false;
            this.isAnimating = false;

            // 스크롤 복원
            document.body.style.overflow = '';

            // 포커스 복원 (트리거 요소가 있다면)
            if (this.triggerElement) {
                this.triggerElement.focus();
            }
        }, 300);

        // 분석 이벤트 추적
        this.trackEvent('popup_dismissed');

        console.log('✅ MVP Notice Popup hidden');
    }

    // 분석 이벤트 추적
    trackEvent(eventName) {
        if (!POPUP_CONFIG.analyticsEvent) return;

        try {
            // Google Analytics 4 이벤트
            if (typeof gtag === 'function') {
                gtag('event', eventName, {
                    event_category: 'popup_interaction',
                    event_label: 'mvp_notice_popup'
                });
            }

            // Supabase 로깅 (있는 경우)
            if (window.SupabaseClient && typeof window.SupabaseClient.logPageVisit === 'function') {
                window.SupabaseClient.logPageVisit('/popup_interaction', eventName);
            }

            console.log(`📊 Popup event tracked: ${eventName}`);
        } catch (error) {
            console.warn('Failed to track popup event:', error);
        }
    }

    // 수동 표시 (디버깅용)
    forceShow() {
        this.show();
    }

    // 수동 숨김 (디버깅용)
    forceHide() {
        this.hide();
    }

    // 상태 초기화 (디버깅용)
    resetState() {
        if (POPUP_CONFIG.testMode) {
            // 테스트 모드에서는 세션 스토리지 초기화
            sessionStorage.removeItem('popup_shown_this_page');
            console.log('✅ Popup state reset (test mode - page session cleared)');
        } else {
            // 프로덕션 모드에서는 로컬 스토리지 초기화
            localStorage.removeItem(POPUP_CONFIG.storageKey);
            localStorage.removeItem(POPUP_CONFIG.dismissKey);
            console.log('✅ Popup state reset (production mode - local storage cleared)');
        }
    }

    // 현재 상태 확인 (디버깅용)
    getStatus() {
        const lastShown = localStorage.getItem(POPUP_CONFIG.storageKey);
        const userDismissed = localStorage.getItem(POPUP_CONFIG.dismissKey);
        const sessionShown = sessionStorage.getItem('popup_shown_this_page');

        return {
            enabled: POPUP_CONFIG.enabled,
            testMode: POPUP_CONFIG.testMode,
            isVisible: this.isVisible,
            isAnimating: this.isAnimating,

            // 테스트 모드 정보
            sessionShown: sessionShown === 'true',

            // 프로덕션 모드 정보
            lastShown: lastShown ? new Date(parseInt(lastShown)) : null,
            userDismissed: userDismissed === 'true',
            timeSinceLastShow: lastShown ? Date.now() - parseInt(lastShown) : null,
            suppressionRemaining: lastShown ? Math.max(0, POPUP_CONFIG.suppressDuration - (Date.now() - parseInt(lastShown))) : 0,

            // 현재 동작 모드
            currentBehavior: POPUP_CONFIG.testMode ? 'Session-based (shows on new tabs/page refresh)' : 'LocalStorage-based (24h suppression)'
        };
    }
}

// 전역 인스턴스 생성 및 노출
let mvpNoticePopup = null;

// CONFIG 객체를 기다리는 초기화 함수
function waitForConfigAndInit() {
    console.log('🚀 Initializing MVP Notice Popup...');
    console.log('- window.CONFIG available:', !!window.CONFIG);

    if (window.CONFIG) {
        // CONFIG 사용 가능하면 즉시 초기화
        mvpNoticePopup = new MVPNoticePopup();
        window.MVPNoticePopup = mvpNoticePopup;
        console.log('✅ MVP Notice Popup initialized with CONFIG');
    } else {
        // CONFIG 대기 중
        console.log('⏳ Waiting for CONFIG to load...');
        setTimeout(waitForConfigAndInit, 100);
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 새로고침 시 세션 스토리지 초기화
    sessionStorage.removeItem('popup_shown_this_page');
    console.log('🔄 Page refreshed - popup session reset');

    // 약간의 지연 후 CONFIG 확인 및 초기화
    setTimeout(waitForConfigAndInit, 200);
});

// 디버깅용 전역 함수
window.debugPopup = function() {
    if (mvpNoticePopup) {
        return mvpNoticePopup.getStatus();
    }
    return { error: 'Popup not initialized' };
};

window.showPopup = function() {
    if (mvpNoticePopup) {
        mvpNoticePopup.forceShow();
    }
};

window.hidePopup = function() {
    if (mvpNoticePopup) {
        mvpNoticePopup.forceHide();
    }
};

window.resetPopup = function() {
    if (mvpNoticePopup) {
        mvpNoticePopup.resetState();
    }
};

console.log('📋 MVP Notice Popup module loaded');