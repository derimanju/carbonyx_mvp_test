-- 빠른 수정용 스키마 (Supabase SQL Editor에서 실행)
-- ========================================

-- 1. 기본 테이블만 생성 (RLS 없이)
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

-- 2. RLS 비활성화 (테스트용)
ALTER TABLE pre_registrations DISABLE ROW LEVEL SECURITY;

-- 3. 테스트 데이터 삽입
INSERT INTO pre_registrations (company_name, contact_name, phone, email)
VALUES ('테스트기업', '김테스트', '010-1234-5678', 'test@test.com')
ON CONFLICT DO NOTHING;

-- 4. 확인 쿼리
SELECT * FROM pre_registrations;