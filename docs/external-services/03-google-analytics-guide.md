# Google Analytics 4 연동 가이드

## 📋 개요

Google Analytics 4(GA4)를 사용하여 Carbonyx 랜딩페이지의 사용자 행동을 추적하고 분석합니다. 전환율, 사용자 플로우, 성과 지표를 모니터링할 수 있습니다.

---

## 🚀 단계별 설정 방법

### 1. Google Analytics 계정 생성

1. [analytics.google.com](https://analytics.google.com) 접속
2. Google 계정으로 로그인
3. "측정 시작" 클릭
4. 계정 설정:
   - **계정 이름**: Carbonyx
   - **데이터 공유 설정**: 기본값 유지

### 2. 속성(Property) 생성

1. **속성 이름**: Carbonyx Landing Page
2. **보고 시간대**: 대한민국 표준시 (GMT+09:00)
3. **통화**: 한국 원 (KRW)
4. **업종**: 환경 서비스
5. **비즈니스 규모**: 소규모

### 3. 데이터 스트림 설정

1. **플랫폼**: 웹
2. **웹사이트 URL**: https://carbonyx.co.kr
3. **스트림 이름**: Carbonyx Web
4. **향상된 측정** 활성화

---

## 🔧 Google Tag Manager 설정 (권장)

### 1. GTM 계정 생성
1. [tagmanager.google.com](https://tagmanager.google.com) 접속
2. 새 계정 생성:
   - **계정 이름**: Carbonyx
   - **컨테이너 이름**: Carbonyx Web
   - **대상 플랫폼**: 웹

### 2. HTML에 GTM 코드 추가

**index.html의 `<head>` 섹션 상단에 추가:**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**`<body>` 태그 바로 다음에 추가:**
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 3. GTM에서 GA4 태그 설정

1. GTM 대시보드에서 "태그" → "새로 만들기"
2. 태그 유형: Google 애널리틱스: GA4 구성
3. 측정 ID: GA4에서 받은 ID (G-XXXXXXXXXX)
4. 트리거: All Pages

---

## 📊 핵심 이벤트 추적 설정

### 1. 맞춤 이벤트 정의

**assets/js/analytics.js 파일 생성:**
```javascript
// Google Analytics 4 이벤트 추적

// 기본 설정
function initializeGA4() {
    // 기본 페이지뷰는 자동으로 추적됨
    console.log('GA4 initialized');
}

// 사전신청 폼 제출 추적
function trackFormSubmission(formData) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'pre_registration',
            form_type: 'contact_form',
            company_name: formData.companyName,
            value: 1
        });

        // 전환 이벤트 (중요도 높음)
        gtag('event', 'conversion', {
            send_to: 'GA_MEASUREMENT_ID/pre_registration_conversion'
        });
    }
}

// 수익 계산기 사용 추적
function trackCalculatorUsage(generationInput, calculatedRevenue) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculator_use', {
            event_category: 'engagement',
            event_label: 'revenue_calculator',
            generation_input: generationInput,
            calculated_revenue: calculatedRevenue,
            value: 1
        });
    }
}

// CTA 버튼 클릭 추적
function trackCTAClick(buttonText, location) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
            event_category: 'engagement',
            event_label: buttonText,
            button_location: location,
            value: 1
        });
    }
}

// 스크롤 깊이 추적
function trackScrollDepth(percentage) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll', {
            event_category: 'engagement',
            event_label: `scroll_${percentage}%`,
            scroll_depth: percentage,
            value: percentage
        });
    }
}

// 파일 다운로드 추적 (미래 사용)
function trackFileDownload(fileName, fileType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'file_download', {
            event_category: 'engagement',
            event_label: fileName,
            file_extension: fileType,
            value: 1
        });
    }
}

// 외부 링크 클릭 추적
function trackExternalLink(url, linkText) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: 'engagement',
            event_label: 'external_link',
            link_url: url,
            link_text: linkText,
            value: 1
        });
    }
}

// 에러 추적
function trackError(errorMessage, errorLocation) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: errorMessage,
            location: errorLocation,
            fatal: false
        });
    }
}

// 타이밍 추적 (페이지 로드 등)
function trackTiming(name, value, category = 'performance') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            name: name,
            value: value,
            event_category: category
        });
    }
}
```

### 2. 기존 JavaScript에 통합

**assets/js/script.js에 추가:**
```javascript
// 페이지 로드 시 GA4 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 코드...

    // GA4 초기화
    initializeGA4();

    // 스크롤 깊이 추적 설정
    initScrollTracking();

    // 외부 링크 추적 설정
    initExternalLinkTracking();
});

// 스크롤 깊이 추적 구현
function initScrollTracking() {
    let scrollDepthMarks = [25, 50, 75, 100];
    let triggeredMarks = [];

    window.addEventListener('scroll', function() {
        let scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        scrollDepthMarks.forEach(mark => {
            if (scrollPercent >= mark && !triggeredMarks.includes(mark)) {
                triggeredMarks.push(mark);
                trackScrollDepth(mark);
            }
        });
    });
}

// 외부 링크 추적 구현
function initExternalLinkTracking() {
    document.addEventListener('click', function(event) {
        let target = event.target;

        // 링크인지 확인
        if (target.tagName === 'A' || target.closest('a')) {
            let link = target.tagName === 'A' ? target : target.closest('a');
            let href = link.href;

            // 외부 링크인지 확인
            if (href && !href.includes(window.location.hostname)) {
                trackExternalLink(href, link.textContent.trim());
            }
        }
    });
}

// 폼 제출 함수 수정
async function handleFormSubmission(event) {
    event.preventDefault();

    const formData = new FormData(registrationForm);
    const data = {
        companyName: formData.get('company-name'),
        contactName: formData.get('contact-name'),
        phone: formData.get('phone'),
        email: formData.get('email')
    };

    // GA4 추적
    trackFormSubmission(data);

    // 기존 제출 로직...
}

// 계산기 함수 수정
function calculateRevenue() {
    const generationValue = parseFloat(generationInput.value);

    if (!generationValue || generationValue <= 0) {
        alert('발전량을 올바르게 입력해주세요.');
        return;
    }

    // 계산 로직...
    const calculatedRevenue = avgRevenue; // 계산된 수익

    // GA4 추적
    trackCalculatorUsage(generationValue, calculatedRevenue);

    // 기존 표시 로직...
}

// CTA 버튼 클릭 추적 추가
document.querySelectorAll('.cta-button, .fixed-cta-btn').forEach(button => {
    button.addEventListener('click', function() {
        trackCTAClick(this.textContent.trim(), this.className);
    });
});
```

---

## 🎯 목표 및 전환 설정

### 1. 주요 전환 목표 설정

GA4 관리자에서 "전환" → "전환 이벤트" → "새 전환 이벤트 만들기":

```
1. 사전신청 완료
   - 이벤트명: form_submit
   - 조건: event_label = 'pre_registration'

2. 계산기 사용
   - 이벤트명: calculator_use
   - 조건: generation_input > 0

3. 깊은 스크롤 (75% 이상)
   - 이벤트명: scroll
   - 조건: scroll_depth >= 75

4. CTA 클릭
   - 이벤트명: cta_click
   - 조건: button_location 포함
```

### 2. 맞춤 차원 설정

관리자 → 맞춤 정의 → 맞춤 차원:

```
1. 기업 규모
   - 매개변수: company_size
   - 범위: 이벤트

2. 발전량 범위
   - 매개변수: generation_range
   - 범위: 이벤트

3. 유입 경로
   - 매개변수: traffic_source
   - 범위: 세션
```

---

## 📈 대시보드 및 보고서 설정

### 1. 맞춤 대시보드 생성

Google Analytics → 탐색 → 새 탐색 만들기:

**주요 KPI 대시보드:**
- 일일 방문자 수
- 사전신청 전환율
- 계산기 사용률
- 평균 세션 시간
- 이탈률

### 2. 주요 보고서 설정

```javascript
// 실시간 보고서 API (선택사항)
function getRealtimeReport() {
    // Google Analytics Reporting API 호출
    // 실시간 데이터 표시용
}

// 주간 성과 요약 (자동화)
function generateWeeklyReport() {
    // 주요 지표 집계
    // 이메일 발송 또는 슬랙 알림
}
```

---

## 🔒 개인정보 보호 설정

### 1. 쿠키 동의 배너

**HTML에 추가:**
```html
<div id="cookie-banner" class="cookie-banner">
    <p>이 사이트는 사용자 경험 개선을 위해 쿠키를 사용합니다.</p>
    <button onclick="acceptCookies()">동의</button>
    <button onclick="declineCookies()">거부</button>
</div>
```

**JavaScript 추가:**
```javascript
// 쿠키 동의 처리
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-banner').style.display = 'none';

    // GA4 활성화
    gtag('consent', 'update', {
        analytics_storage: 'granted'
    });
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookie-banner').style.display = 'none';

    // GA4 비활성화
    gtag('consent', 'update', {
        analytics_storage: 'denied'
    });
}

// 페이지 로드 시 동의 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    const consent = localStorage.getItem('cookieConsent');

    if (!consent) {
        document.getElementById('cookie-banner').style.display = 'block';
    } else if (consent === 'accepted') {
        gtag('consent', 'update', {
            analytics_storage: 'granted'
        });
    }
});
```

### 2. IP 익명화 설정

GTM에서 GA4 태그 설정 시:
```
구성 매개변수:
- anonymize_ip: true
- allow_google_signals: false (필요시)
```

---

## 📊 성과 측정 지표

### 1. 핵심 성과 지표(KPI)

```javascript
// KPI 추적을 위한 맞춤 메트릭
const kpiMetrics = {
    // 전환 관련
    conversionRate: '사전신청 전환율',
    calculatorUsageRate: '계산기 사용률',

    // 참여도 관련
    avgSessionDuration: '평균 세션 시간',
    bounceRate: '이탈률',
    scrollDepth: '스크롤 깊이',

    // 트래픽 관련
    organicTraffic: '자연 검색 트래픽',
    directTraffic: '직접 방문',
    referralTraffic: '추천 트래픽'
};
```

### 2. 목표 수치

```
1차 목표 (첫 달):
- 월 방문자: 1,000명
- 사전신청 전환율: 5%
- 계산기 사용률: 30%
- 이탈률: 70% 이하

2차 목표 (3개월):
- 월 방문자: 5,000명
- 사전신청 전환율: 8%
- 계산기 사용률: 50%
- 이탈률: 60% 이하
```

---

## 💰 예상 비용

### Google Analytics 4
- **기본**: 무료
- **Analytics 360**: $150,000/년 (대기업용)

### Google Tag Manager
- **기본**: 무료
- **GTM 360**: $99,000/년 (대기업용)

**Carbonyx 랜딩페이지**: **₩0/월** (무료 플랜으로 충분)

---

## 🔧 트러블슈팅

### 1. 데이터가 표시되지 않는 경우
```javascript
// GA4 연결 테스트
function testGA4Connection() {
    gtag('event', 'test_event', {
        event_category: 'test',
        event_label: 'connection_test',
        value: 1
    });

    console.log('GA4 test event sent');
}
```

### 2. 실시간 데이터 확인
- GA4 → 보고서 → 실시간
- 최대 30분 지연 가능

### 3. 디버깅 도구
```html
<!-- GA4 디버그 모드 활성화 -->
<script>
gtag('config', 'GA_MEASUREMENT_ID', {
    debug_mode: true
});
</script>
```

---

**다음 단계**: [EmailJS 연동 가이드](./04-emailjs-guide.md)