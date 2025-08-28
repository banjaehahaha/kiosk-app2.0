# Kiosk App 2.0

북한 물품 구매 키오스크 애플리케이션

## 🌍 새로운 기능: 글로벌 배송 트래커

### 지구본 뷰어
- **3D 지구본**: Three.js를 사용한 인터랙티브한 3D 지구본
- **실시간 핀 표시**: 각 물품의 출발 도시에 핑크색 핀으로 표시
- **결제 시 화살표**: 결제 완료 시 출발지에서 서울까지 곡선 화살표로 배송 경로 표시
- **자동 회전**: 지구본이 천천히 자동으로 회전

### 실시간 결제 추적
- **WebSocket 연결**: 실시간으로 결제 상태 모니터링
- **결제 알림**: 새로운 결제 발생 시 즉시 지구본에 화살표 표시
- **결제 히스토리**: 사이드바에서 모든 결제 내역 확인

## 🚀 실행 방법

### 1. 기본 실행 (Next.js만)
```bash
npm run dev
```

### 2. 전체 기능 실행 (Next.js + WebSocket 서버)
```bash
npm run dev:all
```

### 3. WebSocket 서버만 실행
```bash
npm run websocket
```

## 📁 프로젝트 구조

```
kiosk-app2.0/
├── src/
│   ├── app/
│   │   ├── globe-viewer/          # 🌍 지구본 뷰어 페이지
│   │   └── api/
│   │       ├── payment-notification/  # 결제 알림 API
│   │       └── websocket/             # WebSocket 연결 API
│   ├── components/
│   │   ├── GlobeViewer.tsx           # 3D 지구본 컴포넌트
│   │   └── PaymentTracker.tsx        # 결제 추적 컴포넌트
│   └── services/
│       └── globeNotificationService.ts # 지구본 알림 서비스
├── websocket-server.js               # WebSocket 서버
└── package.json
```

## 🌐 접속 방법

- **메인 키오스크**: `http://localhost:3000`
- **지구본 뷰어**: `http://localhost:3000/globe-viewer`
- **WebSocket 서버**: `ws://localhost:3001`

## 🔧 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Graphics**: Three.js
- **Real-time**: WebSocket
- **Styling**: Tailwind CSS
- **Database**: Supabase

## 📱 사용법

### 지구본 뷰어 사용
1. 메인 페이지 우상단의 🌍 버튼 클릭
2. 3D 지구본에서 핑크색 핀으로 표시된 도시들 확인
3. 결제 발생 시 출발지에서 서울까지 화살표 표시
4. 사이드바에서 실시간 결제 현황 모니터링

### 테스트 결제
- 개발 환경에서 "테스트 결제 추가" 버튼으로 모의 결제 생성
- 실제 결제 시스템과 연동하여 자동으로 지구본에 표시

## 🎯 주요 기능

- **자동 회전**: 지구본이 천천히 자동으로 회전
- **인터랙티브**: 마우스로 지구본을 드래그하여 회전, 확대/축소
- **실시간 업데이트**: WebSocket을 통한 실시간 결제 알림
- **반응형 디자인**: 다양한 화면 크기에 최적화
- **핀 애니메이션**: 도시 핀이 깜빡이는 효과

## 🔄 연동 시스템

### 기존 결제 시스템과 연동
- PayApp 결제 완료 시 자동으로 지구본에 알림
- 결제 정보에서 상품의 출발지 정보 추출
- props.json의 origin 데이터 활용

### WebSocket 통신
- 클라이언트와 서버 간 실시간 양방향 통신
- 자동 재연결 및 오류 처리
- 브로드캐스트를 통한 다중 클라이언트 지원

## 🚧 개발 환경 설정

### 필수 의존성
```bash
npm install three @types/three ws concurrently
```

### 환경 변수
```env
NODE_ENV=development
PORT=3001  # WebSocket 서버 포트
```

## 📊 성능 최적화

- **Three.js 최적화**: 효율적인 렌더링 및 메모리 관리
- **WebSocket 연결 풀링**: 안정적인 실시간 통신
- **컴포넌트 지연 로딩**: 필요한 시점에만 3D 컴포넌트 로드

## 🔮 향후 계획

- [ ] 더 정교한 지구본 텍스처 및 조명
- [ ] 배송 경로 애니메이션 개선
- [ ] 다국어 지원
- [ ] 모바일 최적화
- [ ] 히트맵 및 통계 시각화

---

## 📝 기존 기능

### 키오스크 기능
- 북한 물품 전시 및 구매
- 관객 정보 수집
- 결제 시스템 연동
- 예매 관리

### 스토리텔링
- 5개 챕터로 구성된 인터랙티브 스토리
- 물품 선택에 따른 스토리 분기
- 비디오 콘텐츠 통합

---

**🌍 글로벌 배송 트래커로 전 세계 물품의 여정을 실시간으로 추적해보세요!**
