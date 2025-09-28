-- Carbonyx 랜딩페이지 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- ========================================
-- 1. 테이블 생성
-- ========================================

-- 사전신청 테이블
CREATE TABLE IF NOT EXISTS pre_registrations (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    generation_capacity DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
    notes TEXT
);

-- 시세 데이터 테이블
CREATE TABLE IF NOT EXISTS market_prices (
    id BIGSERIAL PRIMARY KEY,
    min_price INTEGER NOT NULL CHECK (min_price >= 0),
    avg_price INTEGER NOT NULL CHECK (avg_price >= 0),
    max_price INTEGER NOT NULL CHECK (max_price >= 0),
    recommended_price INTEGER NOT NULL CHECK (recommended_price >= 0),
    daily_change DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- 방문자 로그 테이블
CREATE TABLE IF NOT EXISTS page_analytics (
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
CREATE TABLE IF NOT EXISTS calculator_usage (
    id BIGSERIAL PRIMARY KEY,
    generation_input DECIMAL(10,2) NOT NULL CHECK (generation_input > 0),
    calculated_kcu DECIMAL(10,2) NOT NULL CHECK (calculated_kcu > 0),
    estimated_revenue INTEGER NOT NULL CHECK (estimated_revenue >= 0),
    visitor_ip INET,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. 인덱스 생성 (성능 최적화)
-- ========================================

-- 사전신청 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_pre_registrations_created_at ON pre_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_status ON pre_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_company_name ON pre_registrations(company_name);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_contact_name ON pre_registrations(contact_name);

-- 시세 데이터 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_market_prices_updated_at ON market_prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_active ON market_prices(is_active) WHERE is_active = true;

-- 방문자 로그 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_page_analytics_visited_at ON page_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_path ON page_analytics(page_path);

-- 계산기 사용 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_calculator_usage_used_at ON calculator_usage(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_generation_input ON calculator_usage(generation_input);

-- ========================================
-- 3. RLS (Row Level Security) 설정
-- ========================================

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

-- 계산기 사용 로그 삽입 정책
CREATE POLICY "Anyone can insert calculator_usage"
ON calculator_usage FOR INSERT
WITH CHECK (true);

-- 페이지 방문 로그 삽입 정책
CREATE POLICY "Anyone can insert page_analytics"
ON page_analytics FOR INSERT
WITH CHECK (true);

-- 관리자만 시세 데이터 수정 가능
CREATE POLICY "Only authenticated users can modify market prices"
ON market_prices FOR ALL
USING (auth.role() = 'authenticated');

-- 관리자만 사전신청 데이터 조회/수정 가능
CREATE POLICY "Only authenticated users can view pre_registrations"
ON pre_registrations FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update pre_registrations"
ON pre_registrations FOR UPDATE
USING (auth.role() = 'authenticated');

-- ========================================
-- 4. 트리거 함수 생성 (자동 업데이트)
-- ========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_pre_registrations_updated_at
    BEFORE UPDATE ON pre_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. 초기 시세 데이터 삽입
-- ========================================

-- 기본 시세 데이터 (시작용)
INSERT INTO market_prices (min_price, avg_price, max_price, recommended_price, daily_change, is_active)
VALUES (3000, 9000, 15000, 12500, 2.5, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. 뷰 생성 (편의 기능)
-- ========================================

-- 사전신청 요약 뷰
CREATE OR REPLACE VIEW pre_registrations_summary AS
SELECT
    DATE(created_at) as registration_date,
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email_count
FROM pre_registrations
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;

-- 계산기 사용 통계 뷰
CREATE OR REPLACE VIEW calculator_usage_stats AS
SELECT
    DATE(used_at) as usage_date,
    COUNT(*) as total_calculations,
    AVG(generation_input) as avg_generation_input,
    AVG(estimated_revenue) as avg_estimated_revenue,
    MIN(generation_input) as min_generation_input,
    MAX(generation_input) as max_generation_input
FROM calculator_usage
GROUP BY DATE(used_at)
ORDER BY usage_date DESC;

-- 페이지 방문 통계 뷰
CREATE OR REPLACE VIEW page_analytics_daily AS
SELECT
    DATE(visited_at) as visit_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT visitor_ip) as unique_visitors,
    COUNT(CASE WHEN referrer IS NOT NULL AND referrer != '' THEN 1 END) as referred_visits
FROM page_analytics
GROUP BY DATE(visited_at)
ORDER BY visit_date DESC;

-- ========================================
-- 7. 함수 생성 (편의 기능)
-- ========================================

-- 사전신청 통계 함수
CREATE OR REPLACE FUNCTION get_registration_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_registrations BIGINT,
    pending_registrations BIGINT,
    completion_rate NUMERIC,
    daily_average NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_registrations,
        CASE
            WHEN COUNT(*) > 0 THEN
                ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(COUNT(*)::NUMERIC / GREATEST(1, end_date - start_date + 1), 2) as daily_average
    FROM pre_registrations
    WHERE created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 최신 시세 조회 함수
CREATE OR REPLACE FUNCTION get_current_market_price()
RETURNS TABLE (
    min_price INTEGER,
    avg_price INTEGER,
    max_price INTEGER,
    recommended_price INTEGER,
    daily_change NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.min_price,
        mp.avg_price,
        mp.max_price,
        mp.recommended_price,
        mp.daily_change,
        mp.updated_at
    FROM market_prices mp
    WHERE mp.is_active = true
    ORDER BY mp.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 스키마 생성 완료!
-- ========================================

-- 확인 쿼리 (선택사항)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('pre_registrations', 'market_prices', 'page_analytics', 'calculator_usage');

COMMENT ON TABLE pre_registrations IS '사전신청 정보를 저장하는 테이블';
COMMENT ON TABLE market_prices IS '실시간 시세 정보를 저장하는 테이블';
COMMENT ON TABLE page_analytics IS '페이지 방문 로그를 저장하는 테이블';
COMMENT ON TABLE calculator_usage IS '수익 계산기 사용 로그를 저장하는 테이블';