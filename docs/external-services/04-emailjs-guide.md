# EmailJS 이메일 서비스 연동 가이드

## 📋 개요

EmailJS는 서버 없이 클라이언트에서 직접 이메일을 발송할 수 있는 서비스입니다. Carbonyx 사전신청 완료 시 자동 확인 메일과 관리자 알림 메일을 발송하는 데 사용됩니다.

---

## 🚀 단계별 설정 방법

### 1. EmailJS 계정 생성

1. [emailjs.com](https://www.emailjs.com) 접속
2. "Sign Up" 클릭
3. 이메일로 계정 생성
4. 이메일 인증 완료

### 2. 이메일 서비스 연결

**Dashboard → Email Services → Add New Service:**

#### Gmail 연결 (추천)
1. **Service**: Gmail
2. **Service ID**: gmail_service (자동 생성)
3. **Gmail 계정**: carbonyx.official@gmail.com
4. **OAuth 인증** 완료

#### Outlook 연결 (대안)
1. **Service**: Outlook
2. **Service ID**: outlook_service
3. **계정 정보** 입력

---

## 📧 이메일 템플릿 생성

### 1. 사전신청 완료 확인 메일

**Dashboard → Email Templates → Create New Template:**

**Template Name**: pre_registration_confirmation

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Carbonyx 사전신청 완료</title>
    <style>
        body { font-family: 'Noto Sans KR', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E7D32; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .highlight { color: #2E7D32; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 Carbonyx</h1>
            <h2>사전신청이 완료되었습니다!</h2>
        </div>

        <div class="content">
            <h3>안녕하세요, {{contact_name}}님!</h3>

            <p><strong>{{company_name}}</strong>의 탄소배출권 거래 사전신청이 성공적으로 접수되었습니다.</p>

            <h4>📋 신청 정보</h4>
            <ul>
                <li><strong>기업명:</strong> {{company_name}}</li>
                <li><strong>담당자:</strong> {{contact_name}}</li>
                <li><strong>연락처:</strong> {{phone}}</li>
                <li><strong>이메일:</strong> {{email}}</li>
                <li><strong>신청일시:</strong> {{submission_date}}</li>
            </ul>

            <h4>⏰ 다음 단계</h4>
            <p>전문가가 <span class="highlight">1-2일 내</span>에 연락드려 다음과 같은 서비스를 제공합니다:</p>
            <ul>
                <li>🔍 <strong>무료 발전량 분석</strong></li>
                <li>💰 <strong>맞춤형 수익 시뮬레이션</strong></li>
                <li>📊 <strong>최적 거래 타이밍 컨설팅</strong></li>
                <li>📄 <strong>필요 서류 안내</strong></li>
            </ul>

            <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>🚨 긴급 안내</h4>
                <p>2025년 발급 배출권은 <strong>2025년 12월 31일</strong>까지만 거래 가능합니다.</p>
                <p>3년 경과 시 자동 소각되니 빠른 처리가 중요합니다!</p>
            </div>

            <h4>📞 문의사항</h4>
            <p>궁금한 점이 있으시면 언제든 연락주세요:</p>
            <ul>
                <li>📧 이메일: contact@carbonyx.co.kr</li>
                <li>📱 전화: 1588-0000</li>
                <li>🌐 웹사이트: https://carbonyx.co.kr</li>
            </ul>
        </div>

        <div class="footer">
            <p>© 2025 Carbonyx. 탄소배출권 거래의 새로운 기준</p>
            <p>본 메일은 사전신청 완료 확인용이며, 마케팅 목적으로 사용되지 않습니다.</p>
        </div>
    </div>
</body>
</html>
```

### 2. 관리자 알림 메일

**Template Name**: admin_notification

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>새로운 사전신청 접수</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h2>🔔 새로운 사전신청이 접수되었습니다!</h2>
        </div>

        <h3>신청자 정보</h3>
        <table>
            <tr><th>기업명</th><td>{{company_name}}</td></tr>
            <tr><th>담당자명</th><td>{{contact_name}}</td></tr>
            <tr><th>연락처</th><td>{{phone}}</td></tr>
            <tr><th>이메일</th><td>{{email}}</td></tr>
            <tr><th>발전 용량</th><td>{{generation_capacity}} MWh</td></tr>
            <tr><th>신청일시</th><td>{{submission_date}}</td></tr>
        </table>

        <h3>액션 아이템</h3>
        <ul>
            <li>✅ 1-2일 내 전화 연락</li>
            <li>📊 발전량 분석 준비</li>
            <li>💰 수익 시뮬레이션 작성</li>
            <li>📄 필요 서류 리스트 전달</li>
        </ul>

        <p><strong>빠른 대응으로 고객 만족도를 높여주세요!</strong></p>
    </div>
</body>
</html>
```

---

## 🔧 JavaScript 클라이언트 설정

### 1. EmailJS 라이브러리 추가

**HTML head에 추가:**
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
```

### 2. 이메일 발송 모듈 생성

**assets/js/email-service.js 파일 생성:**
```javascript
// EmailJS 설정
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_USER_TEMPLATE_ID = 'pre_registration_confirmation';
const EMAILJS_ADMIN_TEMPLATE_ID = 'admin_notification';
const EMAILJS_PUBLIC_KEY = 'your_public_key';

// EmailJS 초기화
function initEmailJS() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// 사용자 확인 메일 발송
async function sendUserConfirmationEmail(userData) {
    try {
        const templateParams = {
            to_email: userData.email,
            to_name: userData.contactName,
            company_name: userData.companyName,
            contact_name: userData.contactName,
            phone: userData.phone,
            email: userData.email,
            generation_capacity: userData.generationCapacity || '미입력',
            submission_date: new Date().toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_USER_TEMPLATE_ID,
            templateParams
        );

        console.log('User confirmation email sent:', response);
        return { success: true, response };

    } catch (error) {
        console.error('Error sending user confirmation email:', error);
        return { success: false, error: error.text || error.message };
    }
}

// 관리자 알림 메일 발송
async function sendAdminNotificationEmail(userData) {
    try {
        const templateParams = {
            to_email: 'admin@carbonyx.co.kr', // 관리자 이메일
            company_name: userData.companyName,
            contact_name: userData.contactName,
            phone: userData.phone,
            email: userData.email,
            generation_capacity: userData.generationCapacity || '미입력',
            submission_date: new Date().toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_ADMIN_TEMPLATE_ID,
            templateParams
        );

        console.log('Admin notification email sent:', response);
        return { success: true, response };

    } catch (error) {
        console.error('Error sending admin notification email:', error);
        return { success: false, error: error.text || error.message };
    }
}

// 이메일 주소 유효성 검사
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 이메일 발송 재시도 로직
async function sendEmailWithRetry(emailFunction, userData, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await emailFunction(userData);
            if (result.success) {
                return result;
            }

            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${result.error}`);
            }

            // 재시도 대기 시간 (지수 백오프)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));

        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

// 일괄 이메일 발송 (사용자 + 관리자)
async function sendAllNotificationEmails(userData) {
    const results = {
        userEmail: { success: false, error: null },
        adminEmail: { success: false, error: null }
    };

    // 사용자 이메일이 있는 경우에만 발송
    if (userData.email && validateEmail(userData.email)) {
        try {
            results.userEmail = await sendEmailWithRetry(sendUserConfirmationEmail, userData);
        } catch (error) {
            results.userEmail.error = error.message;
            console.error('Failed to send user email:', error);
        }
    }

    // 관리자 이메일 발송 (항상 시도)
    try {
        results.adminEmail = await sendEmailWithRetry(sendAdminNotificationEmail, userData);
    } catch (error) {
        results.adminEmail.error = error.message;
        console.error('Failed to send admin email:', error);
    }

    return results;
}

// 이메일 발송 상태 로깅
function logEmailStatus(userData, results) {
    const logData = {
        timestamp: new Date().toISOString(),
        company: userData.companyName,
        contact: userData.contactName,
        userEmailSent: results.userEmail.success,
        adminEmailSent: results.adminEmail.success,
        errors: {
            userEmail: results.userEmail.error,
            adminEmail: results.adminEmail.error
        }
    };

    // 로컬 스토리지에 임시 저장 (디버깅용)
    const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    emailLogs.push(logData);
    localStorage.setItem('emailLogs', JSON.stringify(emailLogs.slice(-50))); // 최근 50개만 보관

    console.log('Email sending status:', logData);
}
```

### 3. 기존 폼 제출 로직에 통합

**assets/js/script.js 수정:**
```javascript
// 폼 제출 함수 수정
async function handleFormSubmission(event) {
    event.preventDefault();

    const formData = new FormData(registrationForm);
    const userData = {
        companyName: formData.get('company-name'),
        contactName: formData.get('contact-name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        generationCapacity: formData.get('generation-capacity') // 선택적 필드
    };

    // 유효성 검사
    if (!validateFormData(userData)) return;

    const submitBtn = registrationForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = '신청 처리 중...';
    submitBtn.disabled = true;

    try {
        // 1. 데이터베이스 저장 (Supabase)
        const dbResult = await savePreRegistration(userData);

        if (!dbResult.success) {
            throw new Error('데이터 저장 실패: ' + dbResult.error);
        }

        // 2. 이메일 발송
        const emailResults = await sendAllNotificationEmails(userData);

        // 3. 결과 로깅
        logEmailStatus(userData, emailResults);

        // 4. GA4 추적
        trackFormSubmission(userData);

        // 5. 성공 메시지 표시
        let successMessage = '사전 신청이 완료되었습니다!\n전문가가 곧 연락드리겠습니다.';

        if (userData.email && emailResults.userEmail.success) {
            successMessage += '\n\n확인 메일을 발송했습니다. 메일함을 확인해주세요.';
        } else if (userData.email && !emailResults.userEmail.success) {
            successMessage += '\n\n확인 메일 발송에 실패했지만, 신청은 정상 접수되었습니다.';
        }

        alert(successMessage);
        registrationForm.reset();

    } catch (error) {
        console.error('Form submission error:', error);
        alert('신청 중 오류가 발생했습니다.\n다시 시도하시거나 전화로 연락주세요.\n\n전화: 1588-0000');

        // 에러 추적
        trackError(error.message, 'form_submission');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 페이지 로드 시 EmailJS 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 코드...

    // EmailJS 초기화
    initEmailJS();
});
```

---

## 🔑 환경 변수 설정

### 1. Vercel 환경 변수

Vercel 대시보드 → Settings → Environment Variables:

```
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_USER_TEMPLATE_ID=template_xxxxxxx
EMAILJS_ADMIN_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
```

### 2. 클라이언트 사이드 설정

**assets/js/config.js 파일 생성:**
```javascript
// EmailJS 설정 (환경별)
const EMAIL_CONFIG = {
    development: {
        SERVICE_ID: 'service_dev',
        USER_TEMPLATE_ID: 'template_user_dev',
        ADMIN_TEMPLATE_ID: 'template_admin_dev',
        PUBLIC_KEY: 'dev_public_key'
    },
    production: {
        SERVICE_ID: 'service_prod',
        USER_TEMPLATE_ID: 'template_user_prod',
        ADMIN_TEMPLATE_ID: 'template_admin_prod',
        PUBLIC_KEY: 'prod_public_key'
    }
};

// 현재 환경 감지
const CURRENT_ENV = window.location.hostname === 'carbonyx.co.kr' ? 'production' : 'development';
const EMAILJS_CONFIG = EMAIL_CONFIG[CURRENT_ENV];
```

---

## 📊 이메일 발송 모니터링

### 1. 발송 통계 추적

```javascript
// 이메일 발송 통계
class EmailAnalytics {
    constructor() {
        this.stats = {
            totalSent: 0,
            userEmailsSent: 0,
            adminEmailsSent: 0,
            failures: 0,
            successRate: 0
        };
    }

    recordEmailSent(type, success) {
        this.stats.totalSent++;

        if (success) {
            if (type === 'user') this.stats.userEmailsSent++;
            if (type === 'admin') this.stats.adminEmailsSent++;
        } else {
            this.stats.failures++;
        }

        this.stats.successRate =
            ((this.stats.totalSent - this.stats.failures) / this.stats.totalSent * 100).toFixed(2);
    }

    getStats() {
        return this.stats;
    }
}

const emailAnalytics = new EmailAnalytics();
```

### 2. 실시간 모니터링 대시보드

```javascript
// 관리자용 이메일 상태 모니터링
function createEmailMonitoringDashboard() {
    if (window.location.search.includes('admin=true')) {
        const dashboard = document.createElement('div');
        dashboard.id = 'email-dashboard';
        dashboard.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; background: white; border: 1px solid #ccc; padding: 10px; z-index: 9999;">
                <h4>📧 Email Status</h4>
                <div id="email-stats"></div>
                <button onclick="showEmailLogs()">View Logs</button>
            </div>
        `;
        document.body.appendChild(dashboard);

        // 통계 업데이트
        setInterval(updateEmailDashboard, 5000);
    }
}

function updateEmailDashboard() {
    const statsDiv = document.getElementById('email-stats');
    if (statsDiv) {
        const stats = emailAnalytics.getStats();
        statsDiv.innerHTML = `
            <div>Total: ${stats.totalSent}</div>
            <div>Success Rate: ${stats.successRate}%</div>
            <div>Failures: ${stats.failures}</div>
        `;
    }
}

function showEmailLogs() {
    const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    console.table(logs);
    alert(`Email logs: ${logs.length} entries (check console)`);
}
```

---

## 💰 예상 비용

### EmailJS 요금제

#### Free Plan
- 이메일: 200통/월
- 템플릿: 무제한
- **월 비용: ₩0**

#### Personal Plan
- 이메일: 1,000통/월
- 우선 지원
- **월 비용: $15 (약 ₩20,000)**

#### Team Plan
- 이메일: 10,000통/월
- 팀 관리 기능
- **월 비용: $45 (약 ₩60,000)**

**Carbonyx 초기 단계**: Free Plan으로 충분 (월 200통)

---

## 🔧 트러블슈팅

### 1. 이메일 발송 실패

```javascript
// 디버깅용 함수
function debugEmailService() {
    console.log('EmailJS Service ID:', EMAILJS_SERVICE_ID);
    console.log('EmailJS Public Key:', EMAILJS_PUBLIC_KEY);

    // 테스트 이메일 발송
    emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_USER_TEMPLATE_ID,
        {
            to_email: 'test@example.com',
            to_name: 'Test User',
            company_name: 'Test Company'
        }
    ).then(
        response => console.log('Test email success:', response),
        error => console.error('Test email failed:', error)
    );
}
```

### 2. 스팸 필터 회피

- **SPF/DKIM 설정**: Gmail의 경우 자동 처리
- **발송자 평판**: 일정한 발송 패턴 유지
- **내용 최적화**: 스팸 키워드 사용 지양

### 3. 전송률 향상

```javascript
// 이메일 전송 최적화
const emailOptimization = {
    // 발송 시간 분산
    addRandomDelay: () => Math.random() * 3000 + 1000,

    // 템플릿 A/B 테스트
    selectTemplate: (userData) => {
        return Math.random() < 0.5 ? 'template_a' : 'template_b';
    },

    // 재시도 로직
    retryWithBackoff: async (fn, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve =>
                    setTimeout(resolve, Math.pow(2, i) * 1000)
                );
            }
        }
    }
};
```

---

**다음 단계**: [SendGrid 고급 이메일 서비스 가이드](./05-sendgrid-guide.md)