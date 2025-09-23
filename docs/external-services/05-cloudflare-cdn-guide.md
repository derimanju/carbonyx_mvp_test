# Cloudflare CDN 및 보안 서비스 연동 가이드

## 📋 개요

Cloudflare는 전 세계적인 CDN(Content Delivery Network)과 보안 서비스를 제공합니다. Carbonyx 랜딩페이지의 로딩 속도 향상, DDoS 방어, SSL 인증서 관리를 담당합니다.

---

## 🚀 단계별 설정 방법

### 1. Cloudflare 계정 생성

1. [cloudflare.com](https://cloudflare.com) 접속
2. "Sign Up" 클릭
3. 이메일과 비밀번호로 계정 생성
4. 이메일 인증 완료

### 2. 도메인 추가

1. Cloudflare 대시보드에서 "Add Site" 클릭
2. 도메인 입력: `carbonyx.co.kr`
3. 플랜 선택: **Free Plan** (초기에는 충분)
4. DNS 레코드 자동 스캔 완료

### 3. 네임서버 변경

도메인 등록업체에서 네임서버를 Cloudflare로 변경:

```
기존 네임서버를 다음으로 교체:
- dave.ns.cloudflare.com
- lucy.ns.cloudflare.com

(실제 네임서버는 Cloudflare에서 제공하는 고유값 사용)
```

---

## 🌐 DNS 레코드 설정

### 1. 기본 DNS 레코드

Cloudflare 대시보드 → DNS → Records:

```
Type: A
Name: @
Content: 76.76.21.21 (Vercel IP)
Proxy Status: Proxied (주황색 구름)

Type: CNAME
Name: www
Content: carbonyx.co.kr
Proxy Status: Proxied

Type: CNAME
Name: api
Content: carbonyx-api.vercel.app
Proxy Status: Proxied (API 서버용, 미래 사용)
```

### 2. 이메일 서비스용 MX 레코드

```
Type: MX
Name: @
Content: mx1.forwardemail.net
Priority: 10

Type: MX
Name: @
Content: mx2.forwardemail.net
Priority: 20

Type: TXT
Name: @
Content: "v=spf1 include:spf.forwardemail.net ~all"
```

---

## 🔒 보안 설정

### 1. SSL/TLS 설정

**SSL/TLS → Overview:**
- **Encryption Mode**: Full (strict)
- **Always Use HTTPS**: 활성화
- **HTTP Strict Transport Security (HSTS)**: 활성화

**SSL/TLS → Origin Server:**
```
Origin Certificate 생성:
- Key Type: RSA (2048)
- Hostnames: *.carbonyx.co.kr, carbonyx.co.kr
- Certificate Validity: 15 years
```

### 2. 보안 헤더 설정

**Security → Headers:**

```javascript
// Transform Rules에서 HTTP 응답 헤더 추가
HTTP Response Header Modification:

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.emailjs.com;
```

### 3. Firewall Rules

**Security → WAF → Custom Rules:**

```
Rule 1: 한국 트래픽 우선 허용
Expression: (ip.geoip.country ne "KR") and (cf.threat_score gt 10)
Action: Challenge

Rule 2: 봇 트래픽 차단
Expression: (cf.bot_management.score lt 30) and (not cf.bot_management.verified_bot)
Action: Challenge

Rule 3: 의심스러운 User-Agent 차단
Expression: (http.user_agent contains "curl") or (http.user_agent contains "wget")
Action: Block
```

---

## ⚡ 성능 최적화

### 1. 캐싱 설정

**Caching → Configuration:**
- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: 활성화

**Page Rules 설정:**
```
Rule 1: 정적 자산 캐싱
URL: *.carbonyx.co.kr/assets/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month

Rule 2: HTML 페이지 캐싱
URL: carbonyx.co.kr/*
Settings:
- Cache Level: Standard
- Edge Cache TTL: 2 hours
- Browser Cache TTL: 4 hours
```

### 2. 이미지 최적화

**Speed → Optimization:**
- **Auto Minify**: CSS, JavaScript, HTML 모두 활성화
- **Rocket Loader**: 활성화
- **Image Resizing**: 활성화 (Pro 플랜 이상)

### 3. Brotli 압축

**Speed → Optimization:**
- **Brotli**: 활성화 (자동으로 gzip보다 효율적인 압축 제공)

---

## 📊 애널리틱스 설정

### 1. Cloudflare Analytics

**Analytics → Web Analytics:**
```javascript
// HTML head에 추가할 Cloudflare Analytics 코드
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "YOUR_BEACON_TOKEN", "spa": true}'></script>
```

### 2. Real User Monitoring

**Speed → Optimization → Real User Monitoring:**
- 활성화하여 실제 사용자 경험 데이터 수집
- Core Web Vitals 모니터링

---

## 🔧 고급 기능 설정

### 1. Workers를 활용한 A/B 테스트

**Workers & Pages → Create application → Create Worker:**

```javascript
// A/B 테스트용 Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // A/B 테스트: 50% 확률로 다른 버전 제공
  const variant = Math.random() < 0.5 ? 'A' : 'B'

  // 오리지널 요청
  const response = await fetch(request)

  if (url.pathname === '/' && response.headers.get('content-type')?.includes('text/html')) {
    let html = await response.text()

    // 변형 B: CTA 버튼 색상 변경
    if (variant === 'B') {
      html = html.replace(
        'background: linear-gradient(45deg, #4CAF50, #2E7D32)',
        'background: linear-gradient(45deg, #FF5722, #D84315)'
      )
    }

    // A/B 테스트 추적을 위한 스크립트 추가
    html = html.replace('</head>', `
      <script>
        window.abTestVariant = '${variant}';
        // GA4에 변형 정보 전송
        if (typeof gtag !== 'undefined') {
          gtag('config', 'GA_MEASUREMENT_ID', {
            custom_map: { custom_parameter_1: 'ab_variant' }
          });
          gtag('event', 'page_view', {
            ab_variant: '${variant}'
          });
        }
      </script>
      </head>
    `)

    return new Response(html, {
      headers: response.headers
    })
  }

  return response
}
```

### 2. Rate Limiting

**Security → WAF → Rate limiting rules:**

```
Rule 1: 폼 제출 제한
Path: /
Method: POST
Rate: 5 requests per minute per IP
Action: Block

Rule 2: API 호출 제한
Path: /api/*
Rate: 100 requests per minute per IP
Action: Challenge
```

### 3. Bot Management (Pro 플랜 이상)

**Security → Bots:**
- **Bot Fight Mode**: 활성화
- **Super Bot Fight Mode**: Pro 플랜에서 사용 가능
- **Verified Bot Allow List**: Google, Bing 등 검색엔진 봇 허용

---

## 📱 모바일 최적화

### 1. AMP (Accelerated Mobile Pages)

```html
<!-- AMP 버전 페이지 링크 -->
<link rel="amphtml" href="https://carbonyx.co.kr/amp/">
```

### 2. Cloudflare Mobile Redirect

Page Rules에서 모바일 전용 설정:
```
URL: carbonyx.co.kr/*
Settings:
- Forwarding URL: 301 redirect to https://m.carbonyx.co.kr/$1
- If User-Agent contains: Mobile
```

---

## 🔍 SEO 최적화

### 1. Transform Rules로 메타 태그 개선

```javascript
// HTML Response Header Modification
// 동적으로 메타 태그 추가/수정
Response Header Modification:
- Name: content-security-policy
- Value: default-src 'self'; script-src 'self' 'unsafe-inline'

// HTML Element Rewriter (Enterprise 플랜)
// 실시간으로 HTML 콘텐츠 수정 가능
```

### 2. Canonical URL 설정

```html
<!-- HTML head에 추가 -->
<link rel="canonical" href="https://carbonyx.co.kr/">
```

---

## 📊 모니터링 및 알림

### 1. Cloudflare 알림 설정

**Notifications → Add new:**

```
Health Check 알림:
- Type: Origin Error Rate Alert
- Threshold: > 5% error rate
- Duration: 2 minutes
- Notification: 이메일, 슬랙

Traffic 급증 알림:
- Type: Traffic Anomaly Alert
- Threshold: 300% increase
- Notification: 이메일

DDoS 공격 알림:
- Type: DDoS Attack Alert
- Severity: Medium 이상
- Notification: SMS, 이메일
```

### 2. 실시간 모니터링 대시보드

```javascript
// Cloudflare API로 실시간 통계 조회
async function getCloudflareAnalytics() {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/analytics/dashboard`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data.result;
}

// 웹사이트에 실시간 상태 표시
function displaySiteStatus() {
    getCloudflareAnalytics().then(data => {
        console.log('Site performance:', data);
        // 필요시 사이트에 상태 표시
    });
}
```

---

## 🛠️ 개발자 도구

### 1. Cloudflare API 활용

```javascript
// 캐시 무효화 API
async function purgeCache(urls = []) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            files: urls.length > 0 ? urls : ['https://carbonyx.co.kr/']
        })
    });

    return response.json();
}

// 사용 예시
// purgeCache(['https://carbonyx.co.kr/assets/css/style.css']);
```

### 2. Terraform으로 인프라 관리

```hcl
# cloudflare.tf
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_zone" "carbonyx" {
  zone = "carbonyx.co.kr"
}

resource "cloudflare_zone_settings_override" "carbonyx_settings" {
  zone_id = cloudflare_zone.carbonyx.id

  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"
    security_level           = "medium"
    browser_cache_ttl        = 14400
  }
}
```

---

## 💰 예상 비용

### Free Plan (무료)
- **대역폭**: 무제한
- **DDoS 방어**: 기본 보호
- **SSL 인증서**: 무료
- **CDN**: 전 세계 200+ 지점
- **월 비용**: ₩0

### Pro Plan ($20/월)
- **Image Optimization**: 포함
- **WAF**: 고급 규칙
- **Analytics**: 상세 분석
- **월 비용**: ₩26,000

### Business Plan ($200/월)
- **Load Balancing**: 포함
- **Page Rules**: 50개
- **Custom SSL**: 지원
- **월 비용**: ₩260,000

**Carbonyx 초기 단계**: **Free Plan으로 충분**

---

## 🔧 트러블슈팅

### 1. DNS 전파 확인

```bash
# DNS 전파 상태 확인
dig carbonyx.co.kr
nslookup carbonyx.co.kr

# Cloudflare를 통한 접속 확인
curl -I https://carbonyx.co.kr
```

### 2. 캐시 문제 해결

```javascript
// 개발 중 캐시 우회
// URL에 버전 파라미터 추가
const cacheBuster = Date.now();
const cssUrl = `/assets/css/style.css?v=${cacheBuster}`;
```

### 3. SSL 인증서 문제

- **Flexible Mode**: 원서버에 SSL이 없을 때
- **Full Mode**: 원서버에 자체 서명된 SSL
- **Full (Strict)**: 원서버에 유효한 SSL (권장)

---

## 📞 지원 및 문의

- **Cloudflare 문서**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **커뮤니티**: [community.cloudflare.com](https://community.cloudflare.com)
- **지원팀**: Pro 플랜 이상에서 이용 가능

---

**다음 단계**: [Hotjar 사용자 행동 분석 가이드](./06-hotjar-analytics-guide.md)