'use client';

type PageType = 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';

interface TableOfContentsProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
  currentPage: PageType;
}

const tocItems: { id: PageType; title: string; label: string }[] = [
  { id: 'home' as PageType, title: '표지', label: '' },
  { id: 'characters' as PageType, title: '등장인물', label: '' },
  { id: 'chapter1' as PageType, title: '1장', label: '1장 2025년 5월 26일' },
  { id: 'chapter2' as PageType, title: '2장', label: '2장 2025년 6월 1일' },
  { id: 'chapter3' as PageType, title: '3장', label: '3장 2025년 7월 15일' },
  { id: 'chapter4' as PageType, title: '4장', label: '4장 2025년 8월 29일 ~ 9월 14일' },
  { id: 'chapter5' as PageType, title: '5장', label: '5장 2025년 10월 30일' },
];

export default function TableOfContents({ 
  isVisible, 
  onClose, 
  onNavigate, 
  currentPage 
}: TableOfContentsProps) {
  if (!isVisible) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* 목차 패널 */}
      <div className="fixed right-0 top-0 h-full w-1/2 bg-[#2d2d2d]/95 backdrop-blur-sm z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-8 h-full overflow-y-auto">
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-8">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-[#e5e5e5] hover:text-[#b3b3b3] transition-colors duration-200"
              aria-label="목차 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 메뉴 아이템들 */}
          <nav className="space-y-6">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full text-left p-4 transition-all duration-200 touch-manipulation relative"
              >
                {/* 현재 페이지 표시 - 왼쪽 어두운 회색 오른쪽 화살표 */}
                {currentPage === item.id && (
                  <svg className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#F8D1E7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                
                {/* 메뉴 텍스트 */}
                <div className={`pl-6 ${currentPage === item.id ? 'text-[#F8D1E7] font-bold' : 'text-[#e5e5e5]'}`}>
                  <div className="text-xl mb-1">{item.title}</div>
                  <div className="text-base text-[#b3b3b3]">{item.label}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
