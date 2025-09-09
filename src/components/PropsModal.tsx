'use client';

import { useState, useEffect } from 'react';
import AudienceInfoModal from './AudienceInfoModal';

interface QRCodeData {
  payurl: string;
  mul_no: string;
  attendeeCount: number; // 인원 수 추가
}

interface PropsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigateToChapter4?: () => void;
  onNavigateToChapter5?: () => void; // 5장으로 넘어가는 콜백 추가
  onStartBooking: (prop: any) => void; // 공연 예매 시작 콜백 추가
  prop: {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    origin: {
      country: string;
      city: string;
    };
    shippingDays: string;
    status?: string; // status 필드 추가 (optional)
  };
  completedProps?: number[];
}

interface AudienceInfo {
  name: string;
  phone: string;
  attendeeCount: number;
  busService: boolean;
  busAttendeeCount: number;
  privacyAgreement: boolean;
}

export default function PropsModal({ 
  isVisible, 
  onClose, 
  onNavigateToChapter4,
  onNavigateToChapter5,
  onStartBooking,
  prop,
  completedProps = []
}: PropsModalProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<QRCodeData | null>(null);

  // 디버깅용 로그
  console.log('PropsModal 렌더링:', {
    isVisible,
    propId: prop.id,
    showQRCode,
    qrCodeData
  });

  // 모달이 열릴 때 body 스크롤 차단
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);



  if (!isVisible) return null;



  const handleShowPerformanceInfo = () => {
    if (onNavigateToChapter5) {
      onNavigateToChapter5();
    }
    onClose();
  };

  const handleStartBooking = () => {
    console.log('PropsModal: 예매 시작 버튼 클릭');
    // PropsModal을 닫고 부모 컴포넌트에서 AudienceInfoModal 열기
    onClose();
    onStartBooking(prop);
  };



  const handleQRCodeClose = () => {
    console.log('PropsModal: QR코드 모달 닫기');
    setShowQRCode(false);
    setQRCodeData(null);
  };

  const handleTestPaymentSuccess = () => {
    console.log('PropsModal: 테스트 결제 성공 버튼 클릭');
    setShowQRCode(false);
    
    // 2초 후 완료 처리
    setTimeout(() => {
      const handlePropCompleted = (window as unknown as { handlePropCompleted?: (id: number) => void }).handlePropCompleted;
      if (handlePropCompleted) {
        console.log('PropsModal: handlePropCompleted 호출', prop.id);
        handlePropCompleted(prop.id);
      }
    }, 2000);
  };

  // 인원 수에 따른 QR코드 이미지 경로 반환
  const getQRCodeImage = (attendeeCount: number) => {
    const qrImages = {
      1: '/qrcode_1.png',
      2: '/qrcode_2.png',
      3: '/qrcode_3.png',
      4: '/qrcode_4.png'
    };
    return qrImages[attendeeCount as keyof typeof qrImages] || '/qrcode_1.png';
  };

  return (
    <>
      {/* 메인 상품 모달 */}
      <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-5" onClick={onClose}>
        <div className="bg-[#2d2d2d] w-4/5 max-w-2xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-[#e5e5e5] text-4xl font-light hover:text-[#b3b3b3] transition-colors z-10"
          >
            ×
          </button>

          {/* 내용 */}
          <div className="p-6 pt-12">
            {/* 이미지 */}
            <div className="mb-6">
              <img 
                src={prop.image} 
                alt={prop.name}
                className="w-full h-64 object-contain"
              />
            </div>

            {/* 상품 정보 - 가운데 정렬 */}
            <div className="text-center mb-6 space-y-2">
              <h3 className="text-lg font-semibold text-[#e5e5e5]">{prop.name}</h3>
              <p className="text-[#b3b3b3]">출발: {prop.origin.country}, {prop.origin.city}</p>
              <p className="text-[#b3b3b3]">예상 배송시간: {prop.shippingDays}</p>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-4">
              <button
                onClick={handleShowPerformanceInfo}
                className="flex-1 px-4 py-2 bg-[#F8D1E7] text-[#1a1a1a] hover:bg-[#f0c4d8] transition-colors"
              >
                퍼포먼스 내용
              </button>
              
              <button
                onClick={handleStartBooking}
                disabled={completedProps.includes(prop.id) || prop.status === 'ordered' || prop.status === 'completed' || prop.status === 'failed'}
                className={`flex-1 px-4 py-2 text-sm leading-tight transition-colors ${
                  completedProps.includes(prop.id) || prop.status === 'ordered' || prop.status === 'completed' || prop.status === 'failed'
                    ? 'bg-[#404040] text-[#808080] cursor-not-allowed'
                    : 'bg-[#F8D1E7] text-[#1a1a1a] hover:bg-[#f0c4d8]'
                }`}
              >
                {completedProps.includes(prop.id) || prop.status === 'ordered' || prop.status === 'completed' ? (
                  <>
                    주문 완료된<br />
                    상품입니다
                  </>
                ) : prop.status === 'failed' ? (
                  <>
                    주문 실패된<br />
                    상품입니다
                  </>
                ) : (
                  <>
                    퍼포먼스 예매하고<br />
                    이 상품을 퍼포먼스의<br />
                    소품으로 등장시키기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* QR코드 결제 모달 - 최고 우선순위 */}
      {showQRCode && qrCodeData && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-5">
          <div className="bg-[#2d2d2d] w-4/5 max-w-md shadow-2xl relative p-6">
            {/* X 버튼 */}
            <button
              onClick={handleQRCodeClose}
              className="absolute top-2 right-4 text-[#e5e5e5] text-4xl font-light hover:text-[#b3b3b3] transition-colors"
            >
              ×
            </button>

            {/* QR코드 내용 */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">
                💳 결제 진행
              </h3>
              
              {/* QR코드 이미지 - 실제 PNG 파일 사용 */}
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={getQRCodeImage(qrCodeData.attendeeCount)}
                  alt={`QR코드 - ${qrCodeData.attendeeCount}인 예매`}
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    console.error('QR코드 이미지 로드 실패:', e);
                    // 이미지 로드 실패 시 기본 QR코드 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* 이미지 로드 실패 시 대체 표시 */}
                <div 
                  className="w-48 h-48 bg-black flex items-center justify-center hidden"
                  style={{ background: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                >
                  <span className="text-white text-2xl font-bold">QR</span>
                </div>
              </div>
              
              {/* 결제 정보 */}
              <div className="text-[#e5e5e5] space-y-2">
                <p><strong>상품:</strong> {prop.name}</p>
                <p><strong>예매 인원:</strong> {qrCodeData.attendeeCount}명</p>
                <p><strong>결제번호:</strong> {qrCodeData.mul_no}</p>
                <p><strong>결제링크:</strong> {qrCodeData.payurl}</p>
              </div>
              
              {/* 안내 메시지 */}
              <div className="text-[#b3b3b3] text-sm bg-[#404040] p-3 rounded">
                <p>📱 위 QR코드를 스마트폰으로 스캔하여 결제를 진행해주세요</p>
                <p>💳 결제 완료 후 자동으로 다음 단계로 진행됩니다</p>
              </div>
              
              {/* 테스트용 결제 성공 버튼 */}
              <button
                onClick={handleTestPaymentSuccess}
                className="w-full px-4 py-3 bg-[#F8D1E7] text-[#1a1a1a] hover:bg-[#f0c4d8] transition-colors rounded font-semibold"
              >
                🧪 테스트: 결제 성공 시뮬레이션
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
