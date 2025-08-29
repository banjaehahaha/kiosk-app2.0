interface CompletedPayment {
  id: number;
  prop_name: string;
  created_at: string;
  payment_amount: number;
  audience_name: string;
  processed: boolean;
}

interface PaymentPollingCallback {
  onNewPayment: (payment: CompletedPayment) => void;
}

class PaymentPollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private processedPayments = new Set<number>();

  startPolling(callback: PaymentPollingCallback) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.checkNewPayments(callback);
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 5000); // 5초마다 폴링
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
  }

  private async checkNewPayments(callback: PaymentPollingCallback) {
    try {
      const response = await fetch('/api/payment/check-completed');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const newPayments = result.data.filter(
          (payment: CompletedPayment) => 
            !payment.processed && !this.processedPayments.has(payment.id)
        );

        for (const payment of newPayments) {
          this.processedPayments.add(payment.id);
          callback.onNewPayment(payment);
          
          // 처리 완료로 마킹
          await this.markAsProcessed(payment.id);
        }
      }
    } catch (error) {
      console.error('Error checking payments:', error);
    }
  }

  private async markAsProcessed(paymentId: number) {
    try {
      await fetch('/api/payment/check-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });
    } catch (error) {
      console.error('Error marking payment as processed:', error);
    }
  }

  reset() {
    this.processedPayments.clear();
  }
}

export default PaymentPollingService;
export type { CompletedPayment, PaymentPollingCallback };
