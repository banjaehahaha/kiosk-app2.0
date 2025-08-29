export interface CompletedPayment {
  id: string;
  goodname: string;
  created_at: string;
  price: number;
  userid: string;
  processed: boolean;
  memo: string;
}

export interface GlobePaymentMonitorCallbacks {
  onNewPayment: (payment: CompletedPayment) => void;
}

export default class GlobePaymentMonitorService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private callbacks: GlobePaymentMonitorCallbacks | null = null;

  constructor() {
    console.log('🚀 GlobeViewer 결제 모니터링 서비스 생성됨');
  }

  async startPolling(callbacks: GlobePaymentMonitorCallbacks): Promise<void> {
    if (this.isPolling) {
      console.log('⚠️ 이미 폴링 중입니다');
      return;
    }

    this.callbacks = callbacks;
    this.isPolling = true;
    console.log('🔄 GlobeViewer 결제 모니터링 시작...');

    // 즉시 첫 번째 확인
    await this.checkForNewPayments();

    // 5초마다 폴링
    this.pollingInterval = setInterval(async () => {
      if (this.isPolling) {
        await this.checkForNewPayments();
      }
    }, 5000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.callbacks = null;
    console.log('🛑 GlobeViewer 결제 모니터링 중지됨');
  }

  private async checkForNewPayments(): Promise<void> {
    try {
      console.log('🔍 GlobeViewer - 새로운 결제 확인 중...');
      
      const response = await fetch('/api/globe-payment-monitor');
      
      if (!response.ok) {
        console.error('❌ GlobeViewer 모니터링 API 오류:', response.status);
        return;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ GlobeViewer 모니터링 API 실패:', result.error);
        return;
      }

      const payments: CompletedPayment[] = result.data || [];
      
      if (payments.length > 0) {
        console.log(`🎉 GlobeViewer - ${payments.length}개의 새로운 결제 발견!`);
        
        // 각 결제에 대해 콜백 호출
        for (const payment of payments) {
          if (this.callbacks?.onNewPayment) {
            console.log('📱 GlobeViewer - 결제 이벤트 발생:', payment.goodname);
            this.callbacks.onNewPayment(payment);
            
            // 결제를 processed로 표시
            await this.markPaymentAsProcessed(payment.id);
          }
        }
      } else {
        console.log('⏳ GlobeViewer - 새로운 결제 없음');
      }
    } catch (error) {
      console.error('❌ GlobeViewer 모니터링 오류:', error);
    }
  }

  private async markPaymentAsProcessed(paymentId: string): Promise<void> {
    try {
      const response = await fetch('/api/globe-payment-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      if (response.ok) {
        console.log('✅ GlobeViewer - 결제 처리 완료 표시됨:', paymentId);
      } else {
        console.error('❌ GlobeViewer - 결제 처리 완료 표시 실패:', paymentId);
      }
    } catch (error) {
      console.error('❌ GlobeViewer - 결제 처리 완료 표시 오류:', error);
    }
  }

  isActive(): boolean {
    return this.isPolling;
  }
}

