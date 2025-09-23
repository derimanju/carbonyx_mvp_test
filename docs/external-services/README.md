# Carbonyx 외부 서비스 연동 가이드

## 📋 개요

Carbonyx 랜딩페이지에서 사용하는 모든 외부 서비스의 연동 방법과 설정 가이드를 제공합니다. 각 서비스별로 상세한 설정 방법, 예상 비용, 트러블슈팅 방법을 안내합니다.

---

## 🛠️ 서비스 연동 순서

### 1단계: 필수 인프라 구축
1. **[Vercel 호스팅](./01-vercel-hosting-guide.md)** - 웹사이트 배포 및 호스팅
2. **[Cloudflare CDN](./05-cloudflare-cdn-guide.md)** - 성능 최적화 및 보안

### 2단계: 데이터 관리
3. **[Supabase 데이터베이스](./02-supabase-database-guide.md)** - 사전신청 데이터 저장

### 3단계: 사용자 소통
4. **[EmailJS 이메일 서비스](./04-emailjs-guide.md)** - 확인 메일 및 알림

### 4단계: 분석 및 모니터링
5. **[Google Analytics 4](./03-google-analytics-guide.md)** - 웹사이트 분석

---

## 💰 예상 운영 비용 요약

### 초기 단계 (MVP) - 월 ₩0~5,000
| 서비스 | 플랜 | 월 비용 | 비고 |
|--------|------|---------|------|
| Vercel | Hobby (무료) | ₩0 | 개인/소규모 프로젝트 |
| Cloudflare | Free | ₩0 | 기본 CDN 및 보안 |
| Supabase | Free | ₩0 | 500MB DB, 50,000 월간 활성 사용자 |
| EmailJS | Free | ₩0 | 월 200통 |
| Google Analytics | Free | ₩0 | 기본 분석 |
| 도메인 | .co.kr | ₩1,250 | 연 ₩15,000 |
| **총합** | | **₩1,250** | |

### 본격 운영 단계 - 월 ₩50,000~100,000
| 서비스 | 플랜 | 월 비용 | 업그레이드 시점 |
|--------|------|---------|---------------|
| Vercel | Pro | ₩26,000 | 트래픽 증가 시 |
| Cloudflare | Pro | ₩26,000 | 이미지 최적화 필요 시 |
| Supabase | Pro | ₩33,000 | 8GB DB 필요 시 |
| EmailJS | Personal | ₩20,000 | 월 1,000통 초과 시 |
| 도메인 | .co.kr | ₩1,250 | 변동 없음 |
| **총합** | | **₩106,250** | |

---

## 🔧 서비스별 핵심 기능

### 📡 Vercel - 호스팅 플랫폼
- **주요 기능**: 정적 사이트 배포, 서버리스 함수, Git 연동
- **장점**: 무료 플랜, 자동 배포, 글로벌 CDN
- **사용처**: 메인 웹사이트 호스팅

### 🛡️ Cloudflare - CDN 및 보안
- **주요 기능**: CDN, DDoS 방어, SSL 인증서, WAF
- **장점**: 무료 플랜, 전 세계 네트워크, 강력한 보안
- **사용처**: 성능 최적화, 보안 강화

### 🗄️ Supabase - 데이터베이스
- **주요 기능**: PostgreSQL, 실시간 API, 인증, 스토리지
- **장점**: Firebase 대안, SQL 지원, 오픈소스
- **사용처**: 사전신청 데이터, 시세 정보, 분석 데이터

### 📧 EmailJS - 이메일 서비스
- **주요 기능**: 클라이언트 사이드 이메일 발송, 템플릿 관리
- **장점**: 서버 불필요, 간단한 설정, Gmail 연동
- **사용처**: 확인 메일, 관리자 알림

### 📊 Google Analytics 4 - 웹 분석
- **주요 기능**: 방문자 추적, 전환 분석, 실시간 모니터링
- **장점**: 무료, 강력한 분석, Google 생태계 연동
- **사용처**: 사용자 행동 분석, 성과 측정

---

## 🚀 빠른 시작 가이드

### 1. 기본 인프라 구축 (30분)
```bash
# 1. Vercel 계정 생성 및 배포
npx vercel

# 2. Cloudflare 계정 생성 및 도메인 연결
# (웹 인터페이스에서 진행)

# 3. 도메인 DNS 설정
# (도메인 업체에서 네임서버 변경)
```

### 2. 데이터베이스 설정 (20분)
```sql
-- Supabase SQL Editor에서 실행
CREATE TABLE pre_registrations (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 이메일 서비스 설정 (15분)
```javascript
// EmailJS 초기화
emailjs.init('YOUR_PUBLIC_KEY');

// 기본 이메일 발송 함수
async function sendConfirmationEmail(userData) {
    return await emailjs.send('service_id', 'template_id', userData);
}
```

### 4. 분석 도구 설정 (10분)
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔍 모니터링 체크리스트

### 일일 점검 사항
- [ ] 웹사이트 접속 상태 (Vercel)
- [ ] 페이지 로딩 속도 (Cloudflare)
- [ ] 사전신청 데이터 저장 (Supabase)
- [ ] 이메일 발송 성공률 (EmailJS)

### 주간 점검 사항
- [ ] 트래픽 분석 (Google Analytics)
- [ ] 전환율 모니터링
- [ ] 서버 성능 지표
- [ ] 보안 이벤트 확인

### 월간 점검 사항
- [ ] 비용 사용량 검토
- [ ] 플랜 업그레이드 필요성
- [ ] 백업 데이터 확인
- [ ] 성능 최적화 기회

---

## 🆘 긴급 상황 대응

### 웹사이트 다운 시
1. **Vercel 상태 확인**: [status.vercel.com](https://status.vercel.com)
2. **Cloudflare 상태 확인**: [cloudflarestatus.com](https://cloudflarestatus.com)
3. **DNS 문제 확인**: `nslookup carbonyx.co.kr`
4. **백업 도메인 활성화** (미리 준비된 경우)

### 데이터베이스 문제 시
1. **Supabase 상태 확인**: [status.supabase.com](https://status.supabase.com)
2. **연결 테스트 실행**
3. **로컬 백업 데이터 확인**
4. **임시 폼 처리 방법 활성화**

### 이메일 발송 실패 시
1. **EmailJS 서비스 상태 확인**
2. **Gmail API 할당량 확인**
3. **대체 이메일 서비스 활성화**
4. **수동 이메일 발송 준비**

---

## 📞 지원 연락처

### 기술 지원
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Cloudflare**: [support.cloudflare.com](https://support.cloudflare.com)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **EmailJS**: [emailjs.com/docs](https://www.emailjs.com/docs)

### 커뮤니티
- **Vercel Discord**: [discord.gg/vercel](https://discord.gg/vercel)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com)

---

## 🔄 업데이트 로그

### 2025-09-22 (v1.0)
- ✅ 초기 문서 작성 완료
- ✅ 모든 외부 서비스 연동 가이드 작성
- ✅ 비용 분석 및 모니터링 가이드 추가

### 향후 업데이트 예정
- 🔄 Hotjar 사용자 행동 분석 가이드
- 🔄 Slack 알림 연동 가이드
- 🔄 Zapier 자동화 가이드
- 🔄 SendGrid 고급 이메일 마케팅 가이드

---

**📚 상세 가이드 바로가기:**
- [Vercel 호스팅 가이드](./01-vercel-hosting-guide.md)
- [Supabase 데이터베이스 가이드](./02-supabase-database-guide.md)
- [Google Analytics 가이드](./03-google-analytics-guide.md)
- [EmailJS 이메일 가이드](./04-emailjs-guide.md)
- [Cloudflare CDN 가이드](./05-cloudflare-cdn-guide.md)