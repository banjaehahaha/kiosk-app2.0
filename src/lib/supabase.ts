import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 환경 변수가 없어도 빌드는 가능하도록 설정
export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 결제 관련 타입 정의 (PayApp 매뉴얼 기준)
export interface PaymentRecord {
  id?: number;
  mul_no: string;
  state: string;
  price: string;
  goodname: string;
  userid: string;
  shopname: string;
  memo?: string;
  status: 'completed' | 'failed' | 'pending';
  source: 'payapp_feedback' | 'manual_check' | 'api_call';
  created_at?: string;
  updated_at?: string;
  processed_at?: string;
  
  // 전체 PayApp 응답 데이터 (JSONB) - 모든 추가 파라미터 포함
  payapp_response?: any;
}

// 결제 테이블 이름
export const PAYMENTS_TABLE = 'payments';
