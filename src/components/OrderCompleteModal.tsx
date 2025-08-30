'use client';

import { useEffect, useState } from 'react';

interface OrderCompleteModalProps {
  isVisible: boolean;
  orderInfo: {
    propName: string;
    orderTime: string;
    origin: string;
    shippingDays: string;
  } | null;
  onClose: () => void;
}

export default function OrderCompleteModal({ 
  isVisible, 
  orderInfo, 
  onClose 
}: OrderCompleteModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && orderInfo) {
      setIsAnimating(true);
      
      // 15초 후 자동으로 사라짐
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 500); // 애니메이션 완료 후 닫기
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, orderInfo, onClose]);

  if (!isVisible || !orderInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="text-center">
          {/* 주문 완료 아이콘 */}
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            주문 완료
          </h2>
          
          {/* 주문 정보 */}
          <div className="space-y-3 text-left">
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">상품명</p>
              <p className="font-semibold text-gray-900">{orderInfo.propName}</p>
            </div>
            
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">주문 시각</p>
              <p className="font-semibold text-gray-900">
                {new Date(orderInfo.orderTime).toLocaleString('ko-KR')}
              </p>
            </div>
            
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">출발지</p>
              <p className="font-semibold text-gray-900">{orderInfo.origin}</p>
            </div>
            
            <div className="pb-2">
              <p className="text-sm text-gray-600">배송 예정시간</p>
              <p className="font-semibold text-gray-900">{orderInfo.shippingDays}</p>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
}
