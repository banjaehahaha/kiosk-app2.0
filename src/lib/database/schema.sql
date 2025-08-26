-- 관객 정보 테이블
CREATE TABLE IF NOT EXISTS audience_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  bus_service BOOLEAN DEFAULT FALSE,
  bus_details TEXT,
  privacy_agreement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예매 정보 테이블
CREATE TABLE IF NOT EXISTS booking_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audience_id INTEGER NOT NULL,
  prop_id INTEGER NOT NULL,
  prop_name VARCHAR(200) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_amount INTEGER NOT NULL,
  payapp_mul_no VARCHAR(100),
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audience_id) REFERENCES audience_info(id)
);

-- 결제 로그 테이블
CREATE TABLE IF NOT EXISTS payment_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  payapp_response TEXT,
  payment_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES booking_info(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_audience_phone ON audience_info(phone);
CREATE INDEX IF NOT EXISTS idx_booking_audience ON booking_info(audience_id);
CREATE INDEX IF NOT EXISTS idx_booking_prop ON booking_info(prop_id);
CREATE INDEX IF NOT EXISTS idx_payment_booking ON payment_logs(booking_id);
