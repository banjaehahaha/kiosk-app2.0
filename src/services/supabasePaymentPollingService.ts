interface CompletedPayment {
  id: number;
  goodname: string;
  created_at: string;
  price: string;
  userid: string;
  processed: boolean;
  memo?: string;
}

interface PaymentPollingCallback {
  onNewPayment: (payment: CompletedPayment) => void;
}

class SupabasePaymentPollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private processedPayments = new Set<number>();

  startPolling(callback: PaymentPollingCallback) {
    if (this.isPolling) return;
    
    console.log('🚀 Supabase 결제 폴링 서비스 시작...');
    this.isPolling = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.checkNewPayments(callback);
      } catch (error) {
        console.error('Supabase payment polling error:', error);
      }
    }, 5000); // 5초마다 폴링
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    console.log('🛑 Supabase 결제 폴링 서비스 중지...');
  }

  private async checkNewPayments(callback: PaymentPollingCallback) {
    try {
      console.log('🔍 Supabase에서 새로운 결제 확인 중...');
      const response = await fetch('/api/payment/supabase-check-completed');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        const newPayments = result.data.filter(
          (payment: CompletedPayment) => 
            !this.processedPayments.has(payment.id)
        );

        console.log(`📊 새로운 결제 ${newPayments.length}건 발견`);

        for (const payment of newPayments) {
          this.processedPayments.add(payment.id);
          callback.onNewPayment(payment);
          
          // 처리 완료로 마킹
          await this.markAsProcessed(payment.id);
        }
      }
    } catch (error) {
      console.error('Error checking Supabase payments:', error);
    }
  }

  private async markAsProcessed(paymentId: number) {
    try {
      const response = await fetch('/api/payment/supabase-check-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Payment ${paymentId} 마킹 실패 (${response.status})`);
        return false;
      }
      
      console.log(`✅ Payment ${paymentId} 처리 완료로 마킹됨`);
      return true;
    } catch (error) {
      console.error('Error marking payment as processed:', error);
      return false;
    }
  }

  reset() {
    this.processedPayments.clear();
  }
}

export default SupabasePaymentPollingService;
export type { CompletedPayment, PaymentPollingCallback };
