# Supabase 데이터베이스 연동 가이드

## 📋 개요

Supabase는 Firebase의 오픈소스 대안으로, PostgreSQL 기반의 실시간 데이터베이스 서비스입니다. Carbonyx 사전신청 데이터와 시세 정보를 저장하는 데 사용됩니다.

---

## 🚀 단계별 설정 방법

### 1. Supabase 계정 생성
1. [supabase.com](https://supabase.com) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜으로 시작

### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 설정:
   - **Name**: carbonyx-db
   - **Database Password**: 강력한 비밀번호 생성
   - **Region**: Northeast Asia (Seoul) 선택
3. "Create new project" 클릭

---

## 🗄️ 데이터베이스 스키마 설정

### 1. 테이블 생성

**SQL Editor에서 다음 쿼리 실행:**

```sql
-- 사전신청 테이블
CREATE TABLE pre_registrations (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    generation_capacity DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT
);

-- 시세 데이터 테이블
CREATE TABLE market_prices (
    id BIGSERIAL PRIMARY KEY,
    min_price INTEGER NOT NULL,
    avg_price INTEGER NOT NULL,
    max_price INTEGER NOT NULL,
    recommended_price INTEGER NOT NULL,
    daily_change DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- 방문자 로그 테이블
CREATE TABLE page_analytics (
    id BIGSERIAL PRIMARY KEY,
    visitor_ip INET,
    user_agent TEXT,
    referrer TEXT,
    page_path VARCHAR(255),
    session_id VARCHAR(100),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    country VARCHAR(2),
    city VARCHAR(100)
);

-- 계산기 사용 로그
CREATE TABLE calculator_usage (
    id BIGSERIAL PRIMARY KEY,
    generation_input DECIMAL(10,2) NOT NULL,
    calculated_kcu DECIMAL(10,2) NOT NULL,
    estimated_revenue INTEGER NOT NULL,
    visitor_ip INET,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 인덱스 생성
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_pre_registrations_created_at ON pre_registrations(created_at DESC);
CREATE INDEX idx_pre_registrations_status ON pre_registrations(status);
CREATE INDEX idx_market_prices_updated_at ON market_prices(updated_at DESC);
CREATE INDEX idx_market_prices_active ON market_prices(is_active) WHERE is_active = true;
CREATE INDEX idx_page_analytics_visited_at ON page_analytics(visited_at DESC);
```

### 3. RLS (Row Level Security) 설정
```sql
-- RLS 활성화
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_usage ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (시세 데이터)
CREATE POLICY "Market prices are viewable by everyone"
ON market_prices FOR SELECT
USING (is_active = true);

-- 삽입 정책 (사전신청)
CREATE POLICY "Anyone can insert pre_registrations"
ON pre_registrations FOR INSERT
WITH CHECK (true);

-- 관리자만 시세 데이터 수정 가능
CREATE POLICY "Only admins can modify market prices"
ON market_prices FOR ALL
USING (auth.role() = 'authenticated');
```

---

## 🔧 JavaScript 클라이언트 설정

### 1. Supabase 클라이언트 라이브러리 추가

**HTML head에 추가:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 2. 클라이언트 초기화

**assets/js/supabase-client.js 파일 생성:**
```javascript
// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 사전신청 데이터 저장
async function savePreRegistration(formData) {
    try {
        const { data, error } = await supabase
            .from('pre_registrations')
            .insert([
                {
                    company_name: formData.companyName,
                    contact_name: formData.contactName,
                    phone: formData.phone,
                    email: formData.email,
                    generation_capacity: formData.generationCapacity
                }
            ]);

        if (error) throw error;

        console.log('Registration saved:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error saving registration:', error);
        return { success: false, error: error.message };
    }
}

// 시세 데이터 조회
async function getLatestMarketPrices() {
    try {
        const { data, error } = await supabase
            .from('market_prices')
            .select('*')
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error fetching market prices:', error);
        return { success: false, error: error.message };
    }
}

// 계산기 사용 로그 저장
async function logCalculatorUsage(generationInput, calculatedKcu, estimatedRevenue) {
    try {
        const { data, error } = await supabase
            .from('calculator_usage')
            .insert([
                {
                    generation_input: generationInput,
                    calculated_kcu: calculatedKcu,
                    estimated_revenue: estimatedRevenue
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error logging calculator usage:', error);
        return { success: false, error: error.message };
    }
}

// 페이지 방문 로그 저장
async function logPageVisit(pagePath, referrer) {
    try {
        const { data, error } = await supabase
            .from('page_analytics')
            .insert([
                {
                    page_path: pagePath,
                    referrer: referrer,
                    user_agent: navigator.userAgent
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error logging page visit:', error);
        return { success: false, error: error.message };
    }
}

// 실시간 시세 업데이트 구독
function subscribeToMarketPrices(callback) {
    const subscription = supabase
        .channel('market_prices_changes')
        .on('postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'market_prices'
            },
            callback
        )
        .subscribe();

    return subscription;
}
```

### 3. 기존 JavaScript에 통합

**assets/js/script.js 수정:**
```javascript
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

    // 유효성 검사
    if (!validateForm(data)) return;

    const submitBtn = registrationForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = '신청 중...';
    submitBtn.disabled = true;

    // Supabase에 데이터 저장
    const result = await savePreRegistration(data);

    if (result.success) {
        alert('사전 신청이 완료되었습니다!\n전문가가 곧 연락드리겠습니다.');
        registrationForm.reset();

        // 이메일 알림 발송 (EmailJS 또는 Supabase Edge Functions)
        await sendNotificationEmail(data);
    } else {
        alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Registration error:', result.error);
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

// 시세 데이터 업데이트
async function updateMarketPricesFromDB() {
    const result = await getLatestMarketPrices();

    if (result.success && result.data) {
        const prices = result.data;

        // 전역 시세 객체 업데이트
        marketPrices.min = prices.min_price;
        marketPrices.avg = prices.avg_price;
        marketPrices.max = prices.max_price;
        marketPrices.recommended = prices.recommended_price;

        // UI 업데이트
        updateMarketPricesDisplay();
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 함수들...

    // 시세 데이터 로드
    updateMarketPricesFromDB();

    // 페이지 방문 로그
    logPageVisit(window.location.pathname, document.referrer);

    // 실시간 시세 업데이트 구독
    subscribeToMarketPrices((payload) => {
        console.log('Market prices updated:', payload);
        updateMarketPricesFromDB();
    });
});
```

---

## 🔑 환경 변수 설정

### 1. Vercel 환경 변수 설정
Vercel 대시보드에서:
1. Settings → Environment Variables
2. 다음 변수들 추가:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 로컬 개발용 .env 파일
```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📊 관리자 대시보드 (선택사항)

### 1. 간단한 관리자 페이지

**admin.html 생성:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carbonyx 관리자</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <div id="admin-panel">
        <h1>시세 관리</h1>
        <form id="price-form">
            <input type="number" id="min-price" placeholder="최저가">
            <input type="number" id="avg-price" placeholder="평균가">
            <input type="number" id="max-price" placeholder="최고가">
            <input type="number" id="recommended-price" placeholder="추천가">
            <button type="submit">시세 업데이트</button>
        </form>

        <h2>사전신청 목록</h2>
        <div id="registrations-list"></div>
    </div>

    <script src="assets/js/admin.js"></script>
</body>
</html>
```

---

## 💰 예상 비용

### 무료 플랜
- 데이터베이스: 500MB
- API 요청: 2,500,000/월
- 대역폭: 5GB
- **월 비용: ₩0**

### Pro 플랜
- 데이터베이스: 8GB
- API 요청: 무제한
- 대역폭: 50GB
- **월 비용: $25 (약 ₩33,000)**

---

## 🔧 트러블슈팅

### 1. 연결 오류
```javascript
// 연결 테스트
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('pre_registrations')
            .select('count(*)')
            .limit(1);

        console.log('Connection test:', data);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}
```

### 2. RLS 정책 문제
- 모든 테이블에 적절한 정책 설정 확인
- `auth.role()`과 `auth.uid()` 함수 활용

### 3. 성능 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 캐싱 전략 수립

---

**다음 단계**: [Google Analytics 연동 가이드](./03-google-analytics-guide.md)