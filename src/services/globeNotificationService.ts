import { BookingInfo } from '@/types/database';

interface GlobeNotificationData {
  propId: number;
  propName: string;
  fromCity: string;
  fromCountry: string;
  amount: number;
}

export class GlobeNotificationService {
  private static instance: GlobeNotificationService;
  private listeners: Array<(data: GlobeNotificationData) => void> = [];

  private constructor() {}

  public static getInstance(): GlobeNotificationService {
    if (!GlobeNotificationService.instance) {
      GlobeNotificationService.instance = new GlobeNotificationService();
    }
    return GlobeNotificationService.instance;
  }

  // 리스너 추가
  public addListener(listener: (data: GlobeNotificationData) => void): () => void {
    this.listeners.push(listener);
    
    // 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 결제 완료 알림 전송
  public async notifyPaymentCompleted(booking: BookingInfo, propOrigin: { city: string; country: string }): Promise<void> {
    try {
      const notificationData: GlobeNotificationData = {
        propId: booking.prop_id,
        propName: booking.prop_name,
        fromCity: propOrigin.city,
        fromCountry: propOrigin.country,
        amount: booking.payment_amount
      };

      // API 엔드포인트로 알림 전송
      const response = await fetch('/api/payment-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('결제 알림 전송 실패');
      }

      // 로컬 리스너들에게도 알림
      this.notifyLocalListeners(notificationData);

      console.log('지구본 알림 전송 완료:', notificationData);

    } catch (error) {
      console.error('지구본 알림 전송 오류:', error);
      
      // API 실패 시에도 로컬 리스너들에게는 알림
      const notificationData: GlobeNotificationData = {
        propId: booking.prop_id,
        propName: booking.prop_name,
        fromCity: propOrigin.city,
        fromCountry: propOrigin.country,
        amount: booking.payment_amount
      };
      
      this.notifyLocalListeners(notificationData);
    }
  }

  // 로컬 리스너들에게 알림
  private notifyLocalListeners(data: GlobeNotificationData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('리스너 실행 오류:', error);
      }
    });
  }

  // 테스트용 모의 결제 알림
  public sendTestNotification(): void {
    const testData: GlobeNotificationData = {
      propId: Math.floor(Math.random() * 1000),
      propName: '테스트 상품',
      fromCity: 'Test City',
      fromCountry: 'Test Country',
      amount: Math.floor(Math.random() * 50000) + 10000
    };

    this.notifyLocalListeners(testData);
  }
}

// 싱글톤 인스턴스 내보내기
export const globeNotificationService = GlobeNotificationService.getInstance();

