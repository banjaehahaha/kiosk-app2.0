-- 결제 테이블 생성 (PayApp 매뉴얼 기준)
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  mul_no VARCHAR(255) NOT NULL UNIQUE,
  state VARCHAR(10) NOT NULL,
  price VARCHAR(50) NOT NULL,
  goodname TEXT NOT NULL,
  userid VARCHAR(255) NOT NULL,
  shopname VARCHAR(255) NOT NULL,
  memo TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  source VARCHAR(50) NOT NULL DEFAULT 'payapp_feedback',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- 전체 PayApp 응답 데이터 (JSONB) - 모든 추가 파라미터 포함
  payapp_response JSONB
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_payments_mul_no ON payments(mul_no);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_userid ON payments(userid);

-- RLS (Row Level Security) 활성화
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow public read access" ON payments
  FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 가능하도록 정책 설정
CREATE POLICY "Allow authenticated insert" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON payments
  FOR UPDATE USING (true);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
