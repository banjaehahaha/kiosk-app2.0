'use client';

type PageType = 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';

interface FooterProps {
  currentPage: PageType;
  onPrevious: () => void;
  onNext: () => void;
  onShowToc: () => void;
  showNavigation: boolean;
}

export default function Footer({ onPrevious, onNext, showNavigation, currentPage }: FooterProps) {
  if (!showNavigation) return null;

  const isFirstPage = currentPage === 'home';
  const isLastPage = currentPage === 'chapter5';

  // 왼쪽 버튼 텍스트 결정
  const getLeftButtonText = () => {
    if (currentPage === 'home') return '표지';
    if (currentPage === 'characters') return '표지';
    if (currentPage === 'chapter1') return '등장인물';
    if (currentPage === 'chapter2') return '1장';
    if (currentPage === 'chapter3') return '2장';
    if (currentPage === 'chapter4') return '3장';
    if (currentPage === 'chapter5') return '4장';
    return '이전 장';
  };

  // 오른쪽 버튼 텍스트 결정
  const getRightButtonText = () => {
    if (currentPage === 'home') return '등장인물';
    if (currentPage === 'characters') return '1장';
    if (currentPage === 'chapter1') return '2장';
    if (currentPage === 'chapter2') return '3장';
    if (currentPage === 'chapter3') return '4장';
    if (currentPage === 'chapter4') return '5장';
    return '다음 장';
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* 왼쪽 화살표 - 이전 장 또는 첫 화면 */}
        <button
          onClick={onPrevious}
          className="flex items-center justify-center w-24 h-12 text-white hover:text-white/80 transition-colors duration-200"
          aria-label={isFirstPage ? "표지로 이동" : "이전 장으로 이동"}
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-bold font-d2coding whitespace-nowrap">
            {getLeftButtonText()}
          </span>
        </button>
        
        {/* 오른쪽 화살표 - 다음 장 (마지막 장이 아닐 때만 표시) */}
        {!isLastPage && (
          <button
            onClick={onNext}
            className="flex items-center justify-center w-24 h-12 text-white hover:text-white/80 transition-colors duration-200"
            aria-label="다음 장으로 이동"
          >
            <span className="text-sm font-bold mr-2 font-d2coding whitespace-nowrap">{getRightButtonText()}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </footer>
  );
}
