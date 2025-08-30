

'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TableOfContents from '@/components/TableOfContents';
import HomePage from '@/components/HomePage';
import ChapterPage from '@/components/ChapterPage';
import CharactersPage from '@/components/CharactersPage';
import PropsModal from '@/components/PropsModal';
import AudienceInfoModal from '@/components/AudienceInfoModal';
import { usePayAppDeliveryHider } from '@/hooks/usePayAppDeliveryHider';


interface Prop {
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
}



interface PageConfig {
  id: 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';
  title: string;
  showNavigation: boolean;
}

  const pageConfigs: Record<'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5', PageConfig> = {
    home: { id: 'home', title: '부재시 픽션은 문 앞에 놔주세요', showNavigation: false },
    characters: { id: 'characters', title: '등장인물', showNavigation: true },
    chapter1: { id: 'chapter1', title: '2025년 5월 26일', showNavigation: true },
    chapter2: { id: 'chapter2', title: '2025년 6월 1일', showNavigation: true },
    chapter3: { id: 'chapter3', title: '2025년 7월 15일', showNavigation: true },
    chapter4: { id: 'chapter4', title: '2025년 8월 29일 ~ 9월 14일', showNavigation: true },
    chapter5: { id: 'chapter5', title: '2025년 10월 30일', showNavigation: true },
  };

  const pageOrder: ('home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5')[] = ['home', 'characters', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5'];

export default function KioskApp() {
  const [currentPage, setCurrentPage] = useState<'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'>('home');
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [completedProps, setCompletedProps] = useState<number[]>([]);
  const [showAudienceInfo, setShowAudienceInfo] = useState(false);
  const [selectedPropForBooking, setSelectedPropForBooking] = useState<Prop | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 🚫 PayApp 배송 필드 숨김 훅 사용
  usePayAppDeliveryHider();
  
  // localStorage에서 completedProps 로드
  useEffect(() => {
    const savedCompletedProps = localStorage.getItem('completedProps');
    if (savedCompletedProps) {
      try {
        const parsedProps = JSON.parse(savedCompletedProps);
        console.log('page.tsx - localStorage에서 로드된 completedProps:', parsedProps);
        setCompletedProps(parsedProps);
      } catch (error) {
        console.error('completedProps 파싱 오류:', error);
      }
    }
  }, []);
  
  // 디버깅용 로그
  useEffect(() => {
    console.log('page.tsx - completedProps changed:', completedProps);
  }, [completedProps]);

  // 페이지 변경 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // 간단한 5분 자동 리셋
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // 홈 페이지가 아닐 때만 타이머 시작
    if (currentPage !== 'home') {
              timer = setTimeout(() => {
          setCurrentPage('home');
          setSelectedProp(null);
          setShowToc(false);
          setShowAudienceInfo(false);
          setSelectedPropForBooking(null);
          console.log('5분 비활성으로 인한 자동 리셋');
        }, 5 * 60 * 1000); // 5분
    }
    
    // 클린업
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentPage]);

  const currentConfig = pageConfigs[currentPage];
  const currentIndex = pageOrder.indexOf(currentPage);
  


  const handleNavigation = (page: 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5') => {
    setCurrentPage(page);
    setShowToc(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentPage(pageOrder[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < pageOrder.length - 1) {
      setCurrentPage(pageOrder[currentIndex + 1]);
    }
  };

  const handleTocToggle = () => {
    setShowToc(!showToc);
  };

  const handleTocClose = () => {
    setShowToc(false);
  };

  const handleTocItemClick = (page: 'home' | 'characters' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5') => {
    setCurrentPage(page);
    setShowToc(false);
  };

  // PropsModal 이벤트 리스너
  useEffect(() => {
    const handlePropSelect = (event: CustomEvent) => {
      setSelectedProp(event.detail);
    };

    window.addEventListener('propSelected', handlePropSelect as EventListener);
    return () => {
      window.removeEventListener('propSelected', handlePropSelect as EventListener);
    };
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;

      case 'characters':
        return <CharactersPage />;

      case 'chapter1':
        return (
          <ChapterPage
            chapterNumber={1}
            title="2025년 5월 26일"
            location="서울 영등포구, 차 안"
            content={`<div class="text-left text-lg font-bold mb-6">실내. 인천국제공항 – 2025년 5월 26일 – 새벽</div>

<div class="text-left text-base mb-8">
  중국 리서치 트립을 떠나기 직전, 북한 물건의 흐름을 알고싶은 반재하는 핸드폰을 꺼낸다. 오래 알고 지낸 박연희에게 전화를 건다.
</div>

<div class="text-center text-lg mb-8">(중략)</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line inline" data-time="0.3-1.3">아니 제가</span> <span class="text-base dialogue-line inline" data-time="1.3-3.1">연변을 가게 돼 가지고.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="3.1-4.5">어떤 일 때문에 갈까요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="4.5-6">
      제가 이제</span>
      <span class="text-base dialogue-line" data-time="6-9">
       북한 쪽에 관심이 있다 보니까</span>
      <span class="text-base dialogue-line" data-time="9-10.3"> 
      막 단둥 갔다가</span> 
      <span class="text-base dialogue-line" data-time="10.3-13">
      연변을 가게 됐어요.</span>
      <span class="text-base dialogue-line" data-time="13-15"> 
      그래서 약간 그쪽에서</span> 
      <span class="text-base dialogue-line" data-time="15-17.5">
      북한 물건이 유통하는 거라든가</span> 
      <span class="text-base dialogue-line" data-time="17.5-20">
      북한 식당 이런 것도 있긴 있잖아요.</span>
      <span class="text-base dialogue-line" data-time="20-22.5">
       요즘 뭐 남한 사람들 안 받는다고 하지만.</span>
      <span class="text-base dialogue-line" data-time="22.5-24.25">
       그래서 그런 데를 좀</span> 
       <span class="text-base dialogue-line" data-time="24.25-26.25">
      이렇게 조사하고 싶어서.</span>
    </div>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="27-28.15">
      그 저기</span> 
      <span class="text-base dialogue-line" data-time="28.15-31.5">
      우선 물건 파는 곳은</span> 
      <span class="text-base dialogue-line" data-time="31.5-33.25">
      도문에 있어요.</span>
    </div>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="33.3-34.1">
      도문?
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="34.5-36.1">
      네 도문에</span>
      <span class="text-base dialogue-line" data-time="36.1-39.1">
      중국하고 북한 변경이 있잖아요.
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="39-40.25">
      투먼, 투먼시
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="40.3-42">
      예, 투먼시.</span>
      <span class="text-base dialogue-line" data-time="42-44.1">
      투먼시 그쪽에 가면</span> 
      <span class="text-base dialogue-line" data-time="44.1-47">
      여러 개 쭉 상점이 있어요.</span>
      <span class="text-base dialogue-line" data-time="47-49.1">
      거기 가면 물건 다 살 수 있어요.
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="49.1-50.8">
      북한 물건을 거기서 팔고 있어요?
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="51-52.5">
      어 다 팔아요, 뭐나.</span> 
      <span class="text-base dialogue-line" data-time="54.5-56.5">
      뭐나 다 사요. 담배 술</span> 
      <span class="text-base dialogue-line" data-time="57-58.1">
      기타 그림</span>
      <span class="text-base dialogue-line" data-time="58.45-59.5">
      다 살 수 있어요.</span><br>
      <span class="text-base dialogue-line" data-time="61.1-64.3">
      그거 제한을 안 해요, 아무도 제한 안 하고.</span> 
      <span class="text-base dialogue-line" data-time="64.3-66.5">
      그냥 내 마음대로 볼 수도 있고.</span> 
      <span class="text-base dialogue-line" data-time="68.5-70.5">
      그림이라든지, 그림.</span> 
      <span class="text-base dialogue-line" data-time="70.5-73.5">
      이렇게 북한 그림들이 많이 들어왔더라고요.</span>
    </div>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="73.5-75">
      아 신기하다.
    </span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">박연희(V.O., 전화)</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="75-76.5">
      응 다 팔아요.</span> 
      <span class="text-base dialogue-line" data-time="77-79.3">
      너무너무 많아서</span> 
      <span class="text-base dialogue-line" data-time="79.3-81.5">
      우리는 그렇게 신경 안 쓰지.
    </span>
  </div>
</div>`}
          />
        );
      case 'chapter2':
        return (
          <ChapterPage
            chapterNumber={2}
            title=""
            location=""
            videoRef={videoRef}
            content={`<div class="text-left text-lg font-bold mb-6">실내. 도문 중심시장 – 2025년 6월 1일 – 오전</div>

<div class="text-left text-base mb-8">
  반재하와 일행은 도문 중심시장으로 들어선다.
</div>
<div class="text-left text-base mb-8">
(최가영 시점 숏)
</div>

        <div class="text-center mb-8 sticky top-[25%] z-10 transition-all duration-300">
          <div class="w-full max-w-2xl mx-auto rounded-lg shadow-lg overflow-hidden">
            <audio 
              ref={audioRef}
              src="/chapter2_1.0.mp3"
              preload="auto"
              className="hidden"
            />
          </div>
        </div>


<div class="text-center mb-8">
  <div class="text-lg">이혜원</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="5.5-6.5">안녕하세요.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="7-9">어 한국에서 왔어?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="9-9.5">네.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="12-13.3">어떻게 볼게 많아요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">이혜원</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="13.5-15.5">네, 너무 재밌어요.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="15-15.8">어, 언제왔길래?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">최가영</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="16.4-18.1">저희 여기 연변에 어제 왔어요.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="18.3-20.3">연변에. 연변이 살기 좋아.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="21.2-22.2">너무 좋더라구요.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">최가영</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="23-24.25">얼마나 사셨어요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="24.5-26">우리 여기 도문 토박이야.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="28-30">여기 이렇게 식자재 말고</span> <span class="text-base dialogue-line" data-time="30-32.2">공산품 같은거 파는 데도 있어요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="32.1-34.3">있어요. 공산품. 뭘 사려고요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="38-41.25">그냥 북조선에서 온 물건들 구경하고 싶어가지고.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="41.3-44.25">북조선에서 오는 물건은 없는데, 지금.</span> <span class="text-base dialogue-line" data-time="44.3-46.3">지금 북조선 문이 닫겨가지고.</span> <span class="text-base dialogue-line" data-time="47.15-48.3">맘대로 못 들어와.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">이혜원</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="48.3-50.15">그럼 물건은 못 사요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="50.15-53.1">이층부터 지금 문이 닫겼어요.</span> <span class="text-base dialogue-line" data-time="53.3-55">지금 맘대로 못 다녀요.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="56.25-58.3">예전에는 북조선 물건도 많았어요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="58.3-59.3">아이 많이 들어왔지.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="59.3-60.25">어느 시장에 많았어요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="60.25-61.5">예전에 남시장이라고 있었어.</span> <span class="text-base dialogue-line" data-time="61.5-63.1">지금 남시장 다 문닫고 없어.</span> <span class="text-base dialogue-line" data-time="63.1-66">거긴 좀만 보면 북조선 물건 팔았거든.</span> <span class="text-base dialogue-line" data-time="66-66.5">지금은 없어.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="67-68.25">그럼 북시장에도 없어요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="68.25-69.5">북시장에도 없어, 지금.</span> <span class="text-base dialogue-line" data-time="70-73.3">북조선 물건은 전혀. 그걸 들어오질 못하니까.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="73.5-75.15">들어오는게 없으니까.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="75.3-76.15">그렇구나.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">최가영</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="76.15-77.4">사람들도 안 와요?</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">상인</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="77.45-80.25">못 와. 북조선 사람들 많이 못 봤어. 오래 못 봤어.</span> <span class="text-base dialogue-line" data-time="80.25-83.25"> 예전에는 조선에 해관에서 이리로 많이 건너오잖아.</span> <span class="text-base dialogue-line" data-time="83.25-85.3">지금은 못 봤어. 몇 년 째. 못 들어와 지금.</span>
  </div>
</div>

<div class="text-center mb-8">
  <div class="text-lg">이혜원</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base dialogue-line" data-time="88.25-89.25">그렇구나.</span>
  </div>
</div>`}
          />
        );
      case 'chapter3':
        return (
          <ChapterPage
            chapterNumber={3}
            title="2025년 7월 15일"
            location="연변, 도문 중심시장"
            content={`<div class="text-left text-lg font-bold mb-6">실내. 반재하 작업실 – 2025년 6월 3일 – 오후</div>

<div class="text-left text-base mb-8">
  컴퓨터 화면에는 온라인 쇼핑몰 창이 여러 개 떠있다. 유심히 화면을 보고 있는 반재하. 그 쇼핑몰에서 판매하는 상품들은 전부 리서치 트립에서 구하지 못한 북한 물건들이다.
</div>

<div class="text-center mb-8">
  <div class="text-lg">반재하</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base">(깊은 한숨)</span>
  </div>
</div>

<div class="text-left text-base mb-8">
  반재하는 구매 버튼에 마우스 커서를 올려두고 머뭇거린다. 
</div>
`}
          />
        );
      case 'chapter4':
        return (
          <ChapterPage
            chapterNumber={4}
            title=""
            location=""
            content={`<div class="text-left text-lg font-bold mb-6">실내. 챔버 – 2025년 8월 29일 ~ 9월 14일 – 낮 ~ 오후</div>

<div class="text-left text-base mb-8">
  〈부재시 픽션은 문 앞에 놔주세요〉의 키오스크를 보던 관객은 4장에서 물품 리스트를 확인한다. 이 리스트는 10월 30일 퍼포먼스의 소품 후보들이다. 전시장에서 퍼포먼스를 예매하는 관객은 퍼포먼스에서 어떤 소품이 등장할지 선택할 수 있다. 선택된 물품은 곧바로 주문이 들어가고 전시장으로의 배송완료와 동시에 전시된다.
</div>

<div id="props-list" class="grid grid-cols-3 gap-6 auto-rows-max">
  <!-- props.json에서 데이터를 가져와서 동적으로 생성됨 -->
</div>`}
            completedProps={completedProps}
            onCompletedPropsChange={setCompletedProps}
          />
        );
      case 'chapter5':
        return (
          <ChapterPage
            chapterNumber={5}
            title=""
            location=""
            content={`<div class="text-left text-lg font-bold mb-6">실내. 인천아트플랫폼 C동 공연장 – 2025년 10월 30일 – 저녁</div>

<div class="text-left text-base mb-8">
  전시 이후 본 프로젝트의 리서치-기반 퍼포먼스, 〈뜻밖의 보간과 최근접 이웃 찾기〉가 인천아트플랫폼에서 진행될 예정입니다. 전시에서 두 작가가 각자의 리서치와 연계된 물건과 그 물건을 쫓게 된 과정에 집중했다면, 퍼포먼스에서는 해당 물건이 유통되는 더 넓은 맥락과 리서치 트립 과정에서 겪은 사건들을 서사화하여 관객과 직접 소통할 계획입니다. 
</div>

<div class="text-left text-base mb-8">
  제목: 뜻밖의 보간과 최근접 이웃 찾기
</div>

<div class="text-left text-base mb-8">
  퍼포먼스가 시작된다. 조명이 켜지고 테이블 위에 놓인 물건들이 보인다. 전시《방금 전의 소문과 오래된 증거로부터》중에 〈부재시 픽션은 문 앞에 놔주세요〉에서 관객들이 선택한 소품들이다. 곧 경쾌한 음악이 흐르고, 백스테이지에서 한 남성이 걸어 나온다. 북한 물건 콜렉터다. 그는 북한 물건 감정사로 퍼포먼스에 출연한다.
</div>

<div class="text-center mb-8">
  <div class="text-lg">북한 물건 콜렉터</div>
  <div class="max-w-md mx-auto p-4 mt-2 text-left">
    <span class="text-base">"90년대 이전 물건들은 희귀해요. 고난의 행군 때 많은 물건들이 땔감 등으로 쓰였거든요. 이 물건을 보면…"</span>
  </div>
</div>

<div class="text-center text-base mb-8">
  (후략)
</div>`}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* 헤더 - 홈 페이지가 아닐 때만 표시 */}
      {currentPage !== 'home' && currentConfig && (
        <Header
          currentPage={currentConfig.title}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onShowToc={handleTocToggle}
          showNavigation={currentConfig.showNavigation}
        />
      )}
      

      

      
      {/* 메인 콘텐츠 */}
      <main>
        {renderCurrentPage()}
      </main>
      
      {/* 푸터 - 홈 페이지가 아닐 때만 표시 */}
      {currentPage !== 'home' && currentConfig && (
        <Footer
          onPrevious={handlePrevious}
          onNext={handleNext}
          onShowToc={handleTocToggle}
          showNavigation={currentConfig.showNavigation}
          currentPage={currentPage}
        />
      )}
      
      {/* 목차 사이드 메뉴 */}
      <TableOfContents
        isVisible={showToc}
        onClose={handleTocClose}
        onNavigate={handleTocItemClick}
        currentPage={currentPage}
      />
      
      {/* PropsModal */}
      {selectedProp && (
        <PropsModal
          isVisible={!!selectedProp}
          prop={selectedProp}
          onClose={() => setSelectedProp(null)}
          onNavigateToChapter4={() => {
            setSelectedProp(null);
            setCurrentPage('chapter4');
          }}
          onNavigateToChapter5={() => {
            setSelectedProp(null);
            setCurrentPage('chapter5');
          }}
          onStartBooking={(prop) => {
            setSelectedProp(null); // PropsModal 닫기
            setShowAudienceInfo(true); // AudienceInfoModal 열기
            setSelectedPropForBooking(prop); // 예매할 상품 정보 저장
          }}
          completedProps={completedProps}
        />
      )}

      {/* AudienceInfoModal */}
      {showAudienceInfo && selectedPropForBooking && (
        <AudienceInfoModal
          isVisible={showAudienceInfo}
          onClose={() => setShowAudienceInfo(false)}
          onComplete={(audienceInfo) => {
            if (audienceInfo === null) {
              // 결제 취소된 경우
              console.log('결제가 취소되었습니다.');
              setShowAudienceInfo(false);
              // 물품 리스트로 돌아가기 (별도 처리 불필요)
            } else {
              // 예매 완료된 경우
              console.log('예매 완료:', audienceInfo);
              setShowAudienceInfo(false);
              // 예매 완료 처리
              const handlePropCompleted = (window as unknown as { handlePropCompleted?: (id: number) => void }).handlePropCompleted;
              if (handlePropCompleted) {
                handlePropCompleted(selectedPropForBooking.id);
              }
            }
          }}
          onShowPerformanceInfo={() => {
            setShowAudienceInfo(false);
            setCurrentPage('chapter4');
          }}
          propName={selectedPropForBooking.name}
          propId={selectedPropForBooking.id}
        />
      )}
    </div>
  );
}

