# Supabase 설정 가이드

## 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://bbmvtbxvmzrvedfzndri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 기존 환경 변수들
NEXTAUTH_URL=https://kiosk-app2-0.vercel.app
PAYAPP_USERID=jiwonnnnnn
PAYAPP_LINKKEY=jMfNQEYYsTgXdHGJbMyp7+1DPJnCCRVaOgT+oqg6zaM=
PAYAPP_LINKVALUE=jMfNQEYYsTgXdHGJbMyp76koJ4SX0XviQjrl1foW85k=
```

## 2. Supabase 데이터베이스 설정

### 2.1 테이블 생성

Supabase SQL 편집기에서 다음 SQL을 실행하세요:

```sql
-- 결제 테이블 생성
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
  payapp_response JSONB
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_payments_mul_no ON payments(mul_no);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

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
```

### 2.2 RLS 정책 설정

테이블 생성 후 RLS 정책이 제대로 적용되었는지 확인하세요.

## 3. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. 테스트

설정 완료 후 다음 API 엔드포인트를 테스트해보세요:

- `GET /api/payment-callback` - 전체 결제 통계 확인
- `POST /api/payment-callback/check-status` - 특정 결제 상태 확인

## 5. 주의사항

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 클라이언트에서 접근 가능하므로 공개되어도 안전합니다
- 프로덕션에서는 RLS 정책을 더 엄격하게 설정하는 것을 권장합니다
- 결제 데이터는 민감한 정보이므로 적절한 보안 조치를 취하세요
