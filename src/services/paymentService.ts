import { supabase, PAYMENTS_TABLE, PaymentRecord } from '@/lib/supabase';

export class PaymentService {
  // Supabase 연결 확인
  private static checkConnection(): boolean {
    if (!supabase) {
      console.error('❌ Supabase 연결이 설정되지 않았습니다. 환경 변수를 확인하세요.');
      return false;
    }
    return true;
  }

  // 결제 정보 저장 (PayApp 매뉴얼 기준)
  static async savePayment(paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord | null> {
    if (!this.checkConnection()) return null;

    try {
      const { data, error } = await supabase!
        .from(PAYMENTS_TABLE)
        .upsert(paymentData, { 
          onConflict: 'mul_no',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('결제 정보 저장 오류:', error);
        return null;
      }

      console.log('✅ 결제 정보 저장 성공:', data.mul_no);
      return data;
    } catch (error) {
      console.error('결제 정보 저장 중 예외 발생:', error);
      return null;
    }
  }

  // 결제 상태 조회
  static async getPaymentStatus(mulNo: string): Promise<PaymentRecord | null> {
    if (!this.checkConnection()) return null;

    try {
      const { data, error } = await supabase!
        .from(PAYMENTS_TABLE)
        .select('*')
        .eq('mul_no', mulNo)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터가 없는 경우
          return null;
        }
        console.error('결제 상태 조회 오류:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('결제 상태 조회 중 예외 발생:', error);
      return null;
    }
  }

  // 결제 상태 업데이트
  static async updatePaymentStatus(mulNo: string, status: PaymentRecord['status'], additionalData?: Partial<PaymentRecord>): Promise<boolean> {
    if (!this.checkConnection()) return false;

    try {
      const updateData: Partial<PaymentRecord> = {
        status,
        processed_at: new Date().toISOString(),
        ...additionalData
      };

      const { error } = await supabase!
        .from(PAYMENTS_TABLE)
        .update(updateData)
        .eq('mul_no', mulNo);

      if (error) {
        console.error('결제 상태 업데이트 오류:', error);
        return false;
      }

      console.log('✅ 결제 상태 업데이트 성공:', mulNo, status);
      return true;
    } catch (error) {
      console.error('결제 상태 업데이트 중 예외 발생:', error);
      return false;
    }
  }

  // 모든 결제 목록 조회
  static async getAllPayments(): Promise<PaymentRecord[]> {
    if (!this.checkConnection()) return [];

    try {
      const { data, error } = await supabase!
        .from(PAYMENTS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('결제 목록 조회 오류:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('결제 목록 조회 중 예외 발생:', error);
      return [];
    }
  }

  // 결제 통계 조회
  static async getPaymentStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
  }> {
    if (!this.checkConnection()) {
      return { total: 0, completed: 0, failed: 0, pending: 0 };
    }

    try {
      const { data, error } = await supabase!
        .from(PAYMENTS_TABLE)
        .select('status');

      if (error) {
        console.error('결제 통계 조회 오류:', error);
        return { total: 0, completed: 0, failed: 0, pending: 0 };
      }

      const stats = {
        total: data.length,
        completed: data.filter(p => p.status === 'completed').length,
        failed: data.filter(p => p.status === 'failed').length,
        pending: data.filter(p => p.status === 'pending').length,
      };

      return stats;
    } catch (error) {
      console.error('결제 통계 조회 중 예외 발생:', error);
      return { total: 0, completed: 0, failed: 0, pending: 0 };
    }
  }

  // 에러 코드별 통계 조회 (JSONB에서 추출)
  static async getErrorCodeStats(): Promise<Record<string, number>> {
    if (!this.checkConnection()) return {};

    try {
      const { data, error } = await supabase!
        .from(PAYMENTS_TABLE)
        .select('payapp_response');

      if (error) {
        console.error('에러 코드 통계 조회 오류:', error);
        return {};
      }

      const errorStats: Record<string, number> = {};
      data.forEach(item => {
        if (item.payapp_response?.errorCode || item.payapp_response?.error_code) {
          const errorCode = item.payapp_response.errorCode || item.payapp_response.error_code;
          if (errorCode) {
            errorStats[errorCode] = (errorStats[errorCode] || 0) + 1;
          }
        }
      });

      return errorStats;
    } catch (error) {
      console.error('에러 코드 통계 조회 중 예외 발생:', error);
      return {};
    }
  }

  // 결제 정보 삭제 (테스트용)
  static async deletePayment(mulNo: string): Promise<boolean> {
    if (!this.checkConnection()) return false;

    try {
      const { error } = await supabase!
        .from(PAYMENTS_TABLE)
        .delete()
        .eq('mul_no', mulNo);

      if (error) {
        console.error('결제 정보 삭제 오류:', error);
        return false;
      }

      console.log('✅ 결제 정보 삭제 성공:', mulNo);
      return true;
    } catch (error) {
      console.error('결제 정보 삭제 중 예외 발생:', error);
      return false;
    }
  }
}
