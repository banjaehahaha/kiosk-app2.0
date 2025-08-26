'use client';

import BouncingImages from './BouncingImages';

type PageType = 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

// props.json에서 이미지 경로들 (실제로는 import해서 사용)
const imagePaths = [
  '/images/props/p1.png',
  '/images/props/p2.png',
  '/images/props/p3.png',
  '/images/props/p4.png',
  '/images/props/p5.png',
  '/images/props/p6.png',
  '/images/props/p7.png',
  '/images/props/p8.png',
  '/images/props/p9.png',
  '/images/props/p10.png',
  '/images/props/p11.png',
  '/images/props/p12.png',
  '/images/props/p13.png',
  '/images/props/p14.png',
  '/images/props/p15.png',
  '/images/props/p16.png',
  '/images/props/p17.png',
  '/images/props/p18.png',
  '/images/props/p19.png',
  '/images/props/p20.png',
  '/images/props/p21.png',
  '/images/props/p22.png',
  '/images/props/p23.png',
  '/images/props/p24.png',
  '/images/props/p25.png',
  '/images/props/p26.png',
  '/images/props/p27.png',
  '/images/props/p28.png',
  '/images/props/p29.png',
  '/images/props/p30.png',
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-12 relative overflow-hidden">
      {/* 당구공 효과로 돌아다니는 이미지들 */}
      <BouncingImages images={imagePaths} count={5} />
      
      {/* 메인 제목만 중앙에 표시 */}
      <div className="text-center mb-8 relative z-20">
        <h1 className="text-[10rem] font-d2coding-bold text-[#e5e5e5] leading-tight tracking-tight">
          부재시<br />
          픽션을<br />
          문 앞에<br />
          놔주세요
        </h1>
      </div>
      
      {/* 픽션으로 들어가기 버튼 */}
      <div className="mt-8 relative z-20">
        <button
          onClick={() => onNavigate('characters')}
          className="relative px-10 py-6 bg-[#F8D1E7] text-[#1a1a1a] font-pretendard-semibold text-xl shadow-lg overflow-hidden"
        >
          {/* 부드러운 빛 스윕 애니메이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 animate-shine"></div>
          
          {/* 버튼 내용 */}
          <div className="relative flex items-center space-x-3">
            <span>픽션으로 들어가기</span>
            <svg 
              className="w-6 h-6 animate-bounce-x" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          {/* 터치 시에만 작동하는 리플 효과 */}
          <div className="absolute inset-0 bg-white/20 scale-0 transition-transform duration-200 ease-out active:scale-100"></div>
        </button>
      </div>
    </div>
  );
}
