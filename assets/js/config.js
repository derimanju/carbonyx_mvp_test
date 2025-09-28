// Supabase 환경 설정
const SUPABASE_CONFIG = {
    // 새로운 Supabase 프로젝트 설정
    SUPABASE_URL: 'https://luujmmtkigucwxmaabbd.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dWptbXRraWd1Y3d4bWFhYmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTg2MTYsImV4cCI6MjA3NDUzNDYxNn0.uelz1gRxUCuuvsVf8j-E46cpsCw5b4U3k1IoUn1SAC8'
};

// 환경별 설정 (개발/프로덕션)
const APP_CONFIG = {
    development: {
        DEBUG: true,
        API_TIMEOUT: 10000,
        LOG_LEVEL: 'debug'
    },
    production: {
        DEBUG: false,
        API_TIMEOUT: 5000,
        LOG_LEVEL: 'error'
    }
};

// 현재 환경 감지
const CURRENT_ENV = window.location.hostname === 'carbonyx.co.kr' ||
                   window.location.hostname.includes('vercel.app') ? 'production' : 'development';

const CONFIG = {
    ...SUPABASE_CONFIG,
    ...APP_CONFIG[CURRENT_ENV],
    ENVIRONMENT: CURRENT_ENV
};

// 전역 설정 노출
window.CONFIG = CONFIG;