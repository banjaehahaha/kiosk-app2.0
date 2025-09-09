'use client';

import { useEffect, useState } from 'react';

interface Prop {
  id: number;
  name: string;
  image: string;
  origin: {
    country: string;
    city: string;
  };
  shippingDays: string;
  url: string;
  status: string; // status 필드 추가
}

interface PropsListProps {
  onPropSelect: (prop: Prop) => void;
  completedProps?: number[]; // 주문 완료된 물품 ID 배열
}

export default function PropsList({ onPropSelect, completedProps = [] }: PropsListProps) {
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const response = await fetch('/api/props');
        if (response.ok) {
          const data = await response.json();
          console.log('API 응답 데이터:', data); // 디버깅용
          
          // 데이터가 배열인지 확인하고 안전하게 처리
          if (data && typeof data === 'object' && 'props' in data && Array.isArray(data.props)) {
            // props 배열을 랜덤으로 섞기
            const shuffledProps = [...data.props].sort(() => Math.random() - 0.5);
            setProps(shuffledProps as Prop[]);
          } else {
            console.error('props 데이터가 올바른 형식이 아닙니다:', data);
          }
        } else {
          console.error('props 데이터를 가져오는데 실패했습니다');
        }
      } catch (error) {
        console.error('props 데이터를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600 font-d2coding">물품 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="columns-3 gap-12 w-full">
        {props.map((prop) => {
          const isCompleted = completedProps.includes(prop.id) || prop.status === 'ordered' || prop.status === 'completed';
          const isFailed = prop.status === 'failed';
          
          return (
            <div 
              key={prop.id} 
              className={`inline-block w-full break-inside-avoid mb-12 transition-transform duration-200 hover:scale-105 ${
                isCompleted || isFailed ? 'cursor-pointer' : 'cursor-pointer'
              }`} 
              onClick={() => onPropSelect(prop)}
            >
              <figure className="m-0 pt-2.5 relative">
                <img
                  src={prop.image}
                  alt={prop.name}
                  className={`w-full h-auto object-contain block rounded-none shadow-none bg-transparent drop-shadow-md ${
                    isCompleted || isFailed ? 'filter blur-[3px]' : ''
                  }`}
                  onError={(e) => {
                    // Remove the placeholder fallback - just let the image fail silently
                    // or you could hide the image element entirely
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* 주문 완료 표시 */}
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#F8D1E7] text-black px-4 py-2 font-bold text-lg transform -rotate-[30deg]">
                      주문 완료
                    </div>
                  </div>
                )}
                
                {/* 주문 실패 표시 */}
                {isFailed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 font-bold text-lg transform -rotate-[30deg]">
                      주문 실패
                    </div>
                  </div>
                )}
                
                <figcaption className="mt-2 text-center">
                  <div className="font-extrabold text-sm tracking-tight mb-1">{prop.name}</div>
                  <div className="text-xs text-gray-500 mb-0.5">{prop.origin.country}, {prop.origin.city}</div>
                  <div className="text-xs text-gray-500">예상 배송: {prop.shippingDays}</div>
                </figcaption>
              </figure>
            </div>
          );
        })}
      </div>
    </>
  );
}
