'use client';

interface PropsOrigin {
  country: string;
  city: string;
}

interface PropsItem {
  id: number;
  name: string;
  image: string;
  origin: PropsOrigin;
  shippingDays: string;
  description: string;
}

interface PropsCardProps {
  item: PropsItem;
  onClick?: () => void;
  showDescription?: boolean;
}

export default function PropsCard({ item, onClick, showDescription = false }: PropsCardProps) {
  return (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      {/* 이미지 */}
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 font-pretendard-medium">
            {item.name} 이미지
          </span>
        </div>
      </div>
      
      {/* 상품 정보 */}
      <div className="space-y-3">
        <h3 className="text-xl font-pretendard-bold text-gray-800">
          {item.name}
        </h3>
        
        {/* 출발지 정보 */}
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-pretendard-medium">
            {item.origin.country}, {item.origin.city}
          </span>
        </div>
        
        {/* 배송 기간 */}
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-pretendard-medium">
            예상 배송: {item.shippingDays}
          </span>
        </div>
        
        {/* 설명 (선택적) */}
        {showDescription && (
          <p className="text-gray-700 text-sm leading-relaxed font-pretendard">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
