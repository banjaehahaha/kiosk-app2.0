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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 - 세로형 모니터에 최적화 */}
      <header className="bg-gray-800 p-3 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-pink-400">
            🌍 글로벌 배송 트래커
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {isConnected ? '실시간 연결됨' : '연결 대기중'}
              </span>
            </div>
            <div className="text-sm">
              총 결제: <span className="text-pink-400 font-bold">{paymentCount}</span>건
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 전체 화면 지구본 */}
      <main className="h-[calc(100vh-4rem)]">
        <GlobeViewerDynamic 
          onConnectionChange={setIsConnected}
          onPaymentCountChange={setPaymentCount}
        />
      </main>
    </div>
  );
}
