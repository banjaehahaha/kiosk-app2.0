'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// 동적 임포트로 클라이언트 사이드에서만 로드
const GlobeViewerDynamic = dynamic(() => import('@/components/GlobeViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">🌍</div>
        <div className="text-xl text-pink-400">지구본을 로딩중입니다...</div>
      </div>
    </div>
  )
});



export default function GlobeViewerPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [paymentCount, setPaymentCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // DOM 마운트 후 직접 스타일 적용 + CSS 클래스 추가
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      
      // CSS 클래스 추가
      container.classList.add('globe-viewer-container');
      
      // 직접 스타일 적용 (백업)
      container.style.transform = 'rotate(90deg)';
      container.style.transformOrigin = 'center center';
      container.style.width = '100vh';
      container.style.height = '100vw';
      container.style.position = 'fixed';
      container.style.top = '50%';
      container.style.left = '50%';
      container.style.marginTop = '-50vw';
      container.style.marginLeft = '-50vh';
      
      // 강제 적용을 위한 추가 스타일
      container.style.setProperty('transform', 'rotate(90deg)', 'important');
      container.style.setProperty('position', 'fixed', 'important');
      
      // 추가 강제 스타일
      container.style.setProperty('width', '100vh', 'important');
      container.style.setProperty('height', '100vw', 'important');
      container.style.setProperty('top', '50%', 'important');
      container.style.setProperty('left', '50%', 'important');
      container.style.setProperty('margin-top', '-50vw', 'important');
      container.style.setProperty('margin-left', '-50vh', 'important');
      
      // 헤더 요소 강제 숨김
      const headers = document.querySelectorAll('header, .header, [class*="header"], [id*="header"]');
      headers.forEach(header => {
        if (header instanceof HTMLElement) {
          header.style.display = 'none';
          header.style.visibility = 'hidden';
          header.style.opacity = '0';
          header.style.height = '0';
          header.style.width = '0';
          header.style.position = 'absolute';
          header.style.left = '-9999px';
        }
      });
      
      // 상단 요소들 강제 숨김
      const topElements = container.querySelectorAll(':scope > *:not(main)');
      topElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'none';
        }
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-900 text-white"
    >
      {/* 메인 컨텐츠 - 전체 화면 지구본 */}
      <main className="h-screen">
        <GlobeViewerDynamic 
          onConnectionChange={setIsConnected}
          onPaymentCountChange={setPaymentCount}
        />
      </main>
    </div>
  );
}
