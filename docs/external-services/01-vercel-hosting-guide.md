# Vercel 호스팅 서비스 연동 가이드

## 📋 개요

Vercel은 정적 사이트와 서버리스 함수를 위한 클라우드 플랫폼입니다. Carbonyx 랜딩페이지를 빠르고 안정적으로 배포할 수 있습니다.

---

## 🚀 단계별 설정 방법

### 1. Vercel 계정 생성
1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인 (권장)
3. 무료 플랜 선택

### 2. GitHub 저장소 연결
```bash
# Git 저장소 초기화 (로컬에서)
git init
git add .
git commit -m "Initial commit: Carbonyx landing page"

# GitHub에 저장소 생성 후
git remote add origin https://github.com/[username]/carbonyx-landing.git
git push -u origin main
```

### 3. Vercel에서 프로젝트 배포
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 선택
3. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Build Command**: (비워둠)
   - **Output Directory**: (비워둠)
   - **Install Command**: (비워둠)

### 4. 환경 설정 파일 생성

**vercel.json** 파일을 프로젝트 루트에 생성:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🌐 도메인 연결

### 1. 도메인 구매
- 추천: Namecheap, Cloudflare Registrar
- 도메인명: `carbonyx.co.kr` 또는 `carbonyx.com`

### 2. Vercel에서 도메인 설정
1. Vercel 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 구매한 도메인 입력
4. DNS 설정 지침 따라하기

### 3. DNS 레코드 설정
도메인 제공업체에서 다음 레코드 추가:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

---

## 🔧 성능 최적화 설정

### 1. 이미지 최적화
```json
{
  "images": {
    "domains": ["your-domain.com"],
    "formats": ["image/webp", "image/avif"]
  }
}
```

### 2. 캐싱 설정
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 📊 모니터링 설정

### 1. Vercel Analytics 활성화
1. Vercel 대시보드 → Analytics
2. "Enable Analytics" 클릭
3. 기본 설정으로 진행

### 2. 성능 모니터링
- Speed Insights 자동 활성화
- Core Web Vitals 추적
- 로딩 시간 모니터링

---

## 🔒 보안 설정

### 1. SSL 인증서
- Vercel에서 자동으로 Let's Encrypt 인증서 발급
- HTTPS 강제 리다이렉트 자동 설정

### 2. 보안 헤더
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:;"
        }
      ]
    }
  ]
}
```

---

## 🚀 자동 배포 설정

### 1. Git 기반 자동 배포
- main 브랜치에 push하면 자동 배포
- 미리보기 배포: PR 생성 시 자동 미리보기 URL 생성

### 2. 배포 후크 설정
```javascript
// vercel 훅 (선택사항)
module.exports = {
  async afterBuild() {
    // 빌드 후 실행할 로직
    console.log('Build completed');
  }
};
```

---

## 💰 예상 비용

### 무료 플랜 (Hobby)
- 대역폭: 100GB/월
- 빌드: 6,000분/월
- 프로젝트: 무제한
- **월 비용: ₩0**

### 유료 플랜 (Pro)
- 대역폭: 1TB/월
- 빌드: 24,000분/월
- 우선순위 지원
- **월 비용: $20 (약 ₩26,000)**

---

## 🔧 트러블슈팅

### 1. 배포 실패 시
```bash
# 로컬에서 확인
npx vercel --prod

# 로그 확인
vercel logs [deployment-url]
```

### 2. 도메인 연결 실패 시
- DNS 전파 시간: 최대 48시간
- DNS 설정 확인: `nslookup carbonyx.co.kr`

### 3. 성능 이슈 시
- 이미지 압축 및 최적화
- CSS/JS 파일 압축
- CDN 캐싱 활용

---

## 📞 지원 및 문의

- Vercel 공식 문서: [vercel.com/docs](https://vercel.com/docs)
- 커뮤니티 지원: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- 이메일 지원: support@vercel.com (Pro 플랜 이상)

---

**다음 단계**: [Supabase 데이터베이스 연동 가이드](./02-supabase-database-guide.md)