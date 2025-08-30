'use client';

import { useEffect, useState, useRef } from 'react';

// 🏠 PayApp 결제창 주소 필드 읽기 전용 설정 함수
const makePayAppAddressFieldsReadOnly = () => {
  try {
    // PayApp 결제창 내부의 주소 관련 필드들을 찾아서 숨김
    const addressSelectors = [
      // 주소 입력 필드들
      'input[name*="addr"]',
      'input[name*="address"]',
      'input[name*="zip"]',
      'input[name*="post"]',
      'input[name*="delivery"]',
      'input[name*="shipping"]',
      // 주소 선택 필드들
      'select[name*="addr"]',
      'select[name*="address"]',
      'select[name*="zip"]',
      'select[name*="post"]',
      // 주소 텍스트 영역들
      'textarea[name*="addr"]',
      'textarea[name*="address"]',
      // 주소 라벨들
      'label[for*="addr"]',
      'label[for*="address"]',
      'label[for*="zip"]',
      'label[for*="post"]',
      // 주소 관련 클래스들
      '.addr-field',
      '.address-field',
      '.zip-field',
      '.post-field',
      '.delivery-field',
      '.shipping-field',
      // PayApp 특정 클래스들
      '.payapp-addr',
      '.payapp-address',
      '.payapp-zip',
      '.payapp-post',
      // 일반적인 주소 관련 클래스들
      '[class*="addr"]',
      '[class*="address"]',
      '[class*="zip"]',
      '[class*="post"]',
      // 주소 관련 ID들
      '[id*="addr"]',
      '[id*="address"]',
      '[id*="zip"]',
      '[id*="post"]'
    ];

    // 모든 주소 관련 요소들을 찾아서 숨김
    addressSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'none';
          element.style.visibility = 'hidden';
          element.style.opacity = '0';
          element.style.height = '0';
          element.style.width = '0';
          element.style.margin = '0';
          element.style.padding = '0';
          element.style.border = '0';
          element.style.position = 'absolute';
          element.style.left = '-9999px';
          element.style.top = '-9999px';
          element.style.clip = 'rect(0, 0, 0, 0)';
          element.style.overflow = 'hidden';
          
          // 부모 요소도 숨김 (주소 입력 그룹 전체)
          const parent = element.closest('.form-group, .input-group, .field-group');
          if (parent && parent instanceof HTMLElement) {
            parent.style.display = 'none';
            parent.style.visibility = 'hidden';
          }
        }
      });
    });

    console.log('🏠 PayApp 주소 필드 읽기 전용 설정 완료');
  } catch (error) {
    console.error('PayApp 주소 필드 읽기 전용 설정 중 오류:', error);
  }
};

// 🏠 PayApp 결제창 모니터링 및 주소 필드 읽기 전용 설정
const monitorAndMakePayAppFieldsReadOnly = () => {
  // MutationObserver를 사용하여 DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // 새로운 노드가 추가되었는지 확인
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // PayApp 관련 요소가 추가되었는지 확인
            if (node.querySelector && (
              node.querySelector('[src*="payapp.kr"]') ||
              node.querySelector('.payapp') ||
              node.querySelector('[class*="payapp"]')
            )) {
              console.log('🏠 PayApp 결제창 감지됨, 주소 필드 읽기 전용 설정 시작');
              // 약간의 지연 후 주소 필드 읽기 전용 설정 (DOM 렌더링 완료 대기)
              setTimeout(makePayAppAddressFieldsReadOnly, 100);
              setTimeout(makePayAppAddressFieldsReadOnly, 500);
              setTimeout(makePayAppAddressFieldsReadOnly, 1000);
            }
          }
        });
      }
    });
  });

  // 전체 문서 모니터링 시작
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 초기 실행
  makePayAppAddressFieldsReadOnly();

  return observer;
};

interface Payment {
  id: string;
  propName: string;
  fromCity: string;
  fromCountry: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed';
}

interface PaymentTrackerProps {
  onConnectionChange: (connected: boolean) => void;
  onPaymentCountChange: (count: number) => void;
}

export function PaymentTracker({ onConnectionChange, onPaymentCountChange }: PaymentTrackerProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const payAppObserverRef = useRef<MutationObserver | null>(null);

  // PayApp 주소 필드 읽기 전용 설정 모니터링 시작
  useEffect(() => {
    console.log('🏠 PayApp 주소 필드 읽기 전용 설정 모니터링 시작');
    payAppObserverRef.current = monitorAndMakePayAppFieldsReadOnly();

    return () => {
      if (payAppObserverRef.current) {
        payAppObserverRef.current.disconnect();
        console.log('🏠 PayApp 주소 필드 읽기 전용 설정 모니터링 중지');
      }
    };
  }, []);

  // WebSocket 연결 관리
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // 실제 배포 시에는 환경변수로 설정
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? 'wss://your-domain.com/ws' 
          : 'ws://localhost:3001/ws';
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket 연결됨');
          setIsConnected(true);
          onConnectionChange(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'payment') {
              handleNewPayment(data.payment);
            }
          } catch (error) {
            console.error('메시지 파싱 오류:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket 연결 끊어짐');
          setIsConnected(false);
          onConnectionChange(false);
          
          // 재연결 시도
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket 오류:', error);
        };

      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
        // 개발 환경에서는 모의 데이터 사용
        if (process.env.NODE_ENV === 'development') {
          simulatePayments();
        }
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onConnectionChange]);

  // 새로운 결제 처리
  const handleNewPayment = (paymentData: any) => {
    const newPayment: Payment = {
      id: paymentData.id || Date.now().toString(),
      propName: paymentData.propName || '알 수 없는 상품',
      fromCity: paymentData.fromCity || '알 수 없는 도시',
      fromCountry: paymentData.fromCountry || '알 수 없는 국가',
      amount: paymentData.amount || 0,
      timestamp: new Date(paymentData.timestamp || Date.now()),
      status: paymentData.status || 'completed'
    };

    setPayments(prev => {
      const updated = [newPayment, ...prev].slice(0, 50); // 최대 50개만 유지
      onPaymentCountChange(updated.length);
      return updated;
    });

    // 지구본에 화살표 표시를 위한 이벤트 발생
    window.dispatchEvent(new CustomEvent('payment-completed', {
      detail: {
        id: newPayment.id,
        fromCity: {
          name: newPayment.fromCity,
          country: newPayment.fromCountry,
          city: `${newPayment.fromCity}, ${newPayment.fromCountry}`,
          lat: getCityCoordinates(newPayment.fromCity, newPayment.fromCountry).lat,
          lng: getCityCoordinates(newPayment.fromCity, newPayment.fromCountry).lng,
          propName: newPayment.propName
        },
        toCity: {
          lat: 37.5665, // 서울
          lng: 126.9780,
          name: 'Seoul, South Korea'
        },
        timestamp: newPayment.timestamp,
        status: newPayment.status
      }
    }));
  };

  // 도시 좌표 가져오기 (간단한 매핑)
  const getCityCoordinates = (city: string, country: string) => {
    const cityMap: { [key: string]: { lat: number; lng: number } } = {
      'Charleston': { lat: 32.7765, lng: -79.9311 },
      'Netania': { lat: 32.3328, lng: 34.8600 },
      'Zagreb': { lat: 45.8150, lng: 15.9819 },
      'Sofia': { lat: 42.6977, lng: 23.3219 },
      'Middelburg': { lat: 51.5000, lng: 3.6100 },
      'Bucharest': { lat: 44.4268, lng: 26.1025 },
      'Mrázov': { lat: 49.8175, lng: 12.7000 },
      'Sutton': { lat: 51.3600, lng: -0.2000 },
      'Kochi': { lat: 33.5588, lng: 133.5314 },
      'Liaoning': { lat: 41.8057, lng: 123.4315 }
    };

    return cityMap[city] || { lat: 0, lng: 0 };
  };

  // 개발 환경용 모의 결제 데이터
  const simulatePayments = () => {
    const mockPayments = [
      {
        propName: 'North Korean Army Airborne Glider Infantry Badge Pin',
        fromCity: 'Charleston',
        fromCountry: 'United States',
        amount: 45000,
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5분 전
      },
      {
        propName: 'DPRK 1969 Vintage Photo Postcards Set',
        fromCity: 'Sutton',
        fromCountry: 'United Kingdom',
        amount: 32000,
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15분 전
      }
    ];

    mockPayments.forEach((payment, index) => {
      setTimeout(() => {
        handleNewPayment({
          id: `mock-${Date.now()}-${index}`,
          ...payment
        });
      }, index * 2000); // 2초 간격으로 모의 결제
    });
  };

  // 수동으로 테스트 결제 추가
  const addTestPayment = () => {
    const testCities = [
      { city: 'Charleston', country: 'United States' },
      { city: 'Netania', country: 'Israel' },
      { city: 'Zagreb', country: 'Republic of Croatia' },
      { city: 'Sofia', country: 'Bulgaria' },
      { city: 'Kochi', country: 'Japan' }
    ];
    
    const randomCity = testCities[Math.floor(Math.random() * testCities.length)];
    const testProps = [
      'North Korean Army Airborne Glider Infantry Badge Pin',
      'North Korea Badge',
      'Vintage North Korea badge ZENLAM Space programm',
      'Very Rare Vintage DPRK North Korean Army Parachutist Badge Pin'
    ];
    
    const randomProp = testProps[Math.floor(Math.random() * testProps.length)];
    
    handleNewPayment({
      id: `test-${Date.now()}`,
      propName: randomProp,
      fromCity: randomCity.city,
      fromCountry: randomCity.country,
      amount: Math.floor(Math.random() * 50000) + 10000,
      timestamp: new Date(),
      status: 'completed'
    });
  };

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-pink-400 mb-2">실시간 결제 현황</h2>
        <div className="flex items-center space-x-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-300">
            {isConnected ? '실시간 연결됨' : '연결 대기중'}
          </span>
        </div>
        
        {/* 테스트 버튼 */}
        <button
          onClick={addTestPayment}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          테스트 결제 추가
        </button>
      </div>

      {/* 결제 목록 */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🌍</div>
            <p>아직 결제가 없습니다</p>
            <p className="text-sm">첫 번째 결제를 기다리고 있어요!</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-gray-700 rounded-lg p-3 border-l-4 border-pink-400"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-white text-sm line-clamp-2">
                  {payment.propName}
                </h3>
                <span className="text-pink-400 font-bold text-sm">
                  ₩{payment.amount.toLocaleString()}
                </span>
              </div>
              
              <div className="text-xs text-gray-300 mb-2">
                <span className="text-pink-300">📍</span> {payment.fromCity}, {payment.fromCountry}
              </div>
              
              <div className="text-xs text-gray-400">
                {payment.timestamp.toLocaleTimeString('ko-KR')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 연결 상태 표시 */}
      {!isConnected && (
        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">
            실시간 연결을 시도하고 있습니다...
          </p>
        </div>
      )}
    </div>
  );
}

