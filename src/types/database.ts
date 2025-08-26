// 데이터베이스 테이블 타입 정의

export interface AudienceInfo {
  id?: number;
  name: string;
  phone: string;
  bus_service: boolean;
  bus_details?: string;
  privacy_agreement: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BookingInfo {
  id?: number;
  audience_id: number;
  prop_id: number;
  prop_name: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_amount: number;
  payapp_mul_no?: string;
  booking_status: 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface PaymentLog {
  id?: number;
  booking_id: number;
  payapp_response: string;
  payment_status: string;
  created_at?: string;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// 예매 완료 응답 타입
export interface BookingResponse {
  audienceId: number;
  bookingId: number;
  name: string;
  phone: string;
}

// 예매 조회 응답 타입
export interface BookingQueryResponse {
  audience_id: number;
  name: string;
  phone: string;
  bus_service: boolean;
  bus_details?: string;
  prop_name: string;
  booking_status: string;
  booking_date: string;
}
