'use client';

interface HeaderProps {
  currentPage: string;
  onPrevious: () => void;
  onNext: () => void;
  onShowToc: () => void;
  showNavigation: boolean;
}

export default function Header({ 
  currentPage, 
  onPrevious, 
  onNext, 
  onShowToc, 
  showNavigation 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
      <div className="relative flex items-center justify-center w-full">
        {/* 중앙 제목 - 절대 위치로 정확한 중앙 배치 */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-2xl font-bold text-[#e5e5e5] font-d2coding-bold whitespace-nowrap">
            {currentPage}
          </h1>
        </div>
        
        {/* 목차 버튼 - 오른쪽에 고정 */}
        <button
          onClick={onShowToc}
          className="absolute right-6 flex items-center justify-center px-4 py-2 text-[#e5e5e5] hover:text-[#b3b3b3] transition-colors duration-200 font-d2coding"
          aria-label="목차 보기"
        >
          목차
        </button>
      </div>
    </header>
  );
}
