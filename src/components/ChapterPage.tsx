

'use client';

import { useEffect, useRef, useState } from 'react';
import PropsList from './PropsList';

// Vimeo Player API 타입 정의
declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLIFrameElement) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  on(event: string, callback: () => void): void;
  getCurrentTime(): Promise<number>;
}

interface ChapterPageProps {
  chapterNumber: number;
  title: string;
  location: string;
  content: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  completedProps?: number[];
  onCompletedPropsChange?: (props: number[]) => void;
}

export default function ChapterPage({ chapterNumber, title, location, content, videoRef, completedProps: initialCompletedProps, onCompletedPropsChange }: ChapterPageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [completedProps, setCompletedProps] = useState<number[]>(initialCompletedProps || []);
  
  // 디버깅용 로그
  console.log('ChapterPage - chapterNumber:', chapterNumber, 'initialCompletedProps:', initialCompletedProps, 'local completedProps:', completedProps);

  // 장 변경 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterNumber]);

  // 주문 완료된 물품 목록을 로컬 스토리지에서 불러오기
  useEffect(() => {
    if (chapterNumber === 3 || chapterNumber === 4) {
      const savedCompletedProps = localStorage.getItem('completedProps');
      if (savedCompletedProps) {
        try {
          setCompletedProps(JSON.parse(savedCompletedProps));
        } catch (error) {
          console.error('완료된 물품 목록 파싱 오류:', error);
        }
      }
      
      // 4장일 때 바티칸(ID: 31)과 베이징(ID: 32)을 자동으로 주문 완료 상태로 설정
      if (chapterNumber === 4) {
        setCompletedProps(prev => {
          const newCompletedProps = [...prev];
          
          // 바티칸(ID: 31) 추가
          if (!newCompletedProps.includes(31)) {
            newCompletedProps.push(31);
          }
          
          // 베이징(ID: 32) 추가
          if (!newCompletedProps.includes(32)) {
            newCompletedProps.push(32);
          }
          
          // 로컬 스토리지에 저장
          localStorage.setItem('completedProps', JSON.stringify(newCompletedProps));
          
          // 부모 컴포넌트에 변경 알림
          if (onCompletedPropsChange) {
            onCompletedPropsChange(newCompletedProps);
          }
          
          return newCompletedProps;
        });
      }
    }
  }, [chapterNumber, onCompletedPropsChange]);

  // 물품 선택 이벤트 리스너
  useEffect(() => {
    if (chapterNumber === 3) {
      const handlePropSelected = (event: CustomEvent) => {
        const prop = event.detail;
        console.log('물품 선택됨:', prop);
        // 여기서 모달을 열거나 다른 처리를 할 수 있습니다
      };

      window.addEventListener('propSelected', handlePropSelected as EventListener);
      
      return () => {
        window.removeEventListener('propSelected', handlePropSelected as EventListener);
      };
    }
  }, [chapterNumber]);

  // 주문 완료 처리 함수 (외부에서 호출할 수 있도록)
  const handlePropCompleted = (propId: number) => {
    setCompletedProps(prev => {
      const newCompletedProps = [...prev, propId];
      // 로컬 스토리지에 저장
      localStorage.setItem('completedProps', JSON.stringify(newCompletedProps));
      
      // 부모 컴포넌트에 변경 알림
      if (onCompletedPropsChange) {
        onCompletedPropsChange(newCompletedProps);
      }
      
      return newCompletedProps;
    });
  };

  // 전역 함수로 등록 (다른 컴포넌트에서 호출할 수 있도록)
  useEffect(() => {
    if (chapterNumber === 3 || chapterNumber === 4) {
      (window as unknown as { handlePropCompleted: typeof handlePropCompleted }).handlePropCompleted = handlePropCompleted;
      
      // 물품 리셋 함수도 등록
      (window as unknown as { resetCompletedProps: () => void }).resetCompletedProps = () => {
        localStorage.removeItem('completedProps');
        setCompletedProps([]);
        console.log('완료된 물품 목록이 리셋되었습니다.');
      };
      
      return () => {
        (window as unknown as { handlePropCompleted?: typeof handlePropCompleted }).handlePropCompleted = undefined;
        (window as unknown as { resetCompletedProps?: () => void }).resetCompletedProps = undefined;
      };
    }
  }, [chapterNumber, handlePropCompleted]);

  useEffect(() => {
    // 1장일 때만 3초 후 음성 자동재생
    if (chapterNumber === 1 && audioRef.current) {
      // 3초 후에 음성 재생
      const timer = setTimeout(() => {
        if (audioRef.current) {
          // 페이드인 효과를 위한 볼륨 조절
          const audio = audioRef.current;
          audio.volume = 0; // 시작 볼륨을 0으로 설정
          
          audio.play().then(() => {
            // 페이드인 애니메이션 (3초 동안)
            const fadeInDuration = 3000; // 3초
            const fadeInSteps = 60; // 60단계로 나누어 부드럽게
            const volumeStep = 1 / fadeInSteps; // 각 단계별 볼륨 증가량
            const stepInterval = fadeInDuration / fadeInSteps; // 각 단계 간격
            
            let currentStep = 0;
            const fadeInTimer = setInterval(() => {
              currentStep++;
              if (currentStep <= fadeInSteps) {
                audio.volume = currentStep * volumeStep;
              } else {
                audio.volume = 1; // 최종 볼륨
                clearInterval(fadeInTimer);
              }
            }, stepInterval);
          }).catch(error => {
            console.log('음성 자동재생 실패:', error);
          });
        }
      }, 3000); // 3초 (3000ms)

      return () => clearTimeout(timer);
    }
    
    // 2장일 때는 즉시 음성 자동재생
    if (chapterNumber === 2 && audioRef.current) {
      const audio = audioRef.current;
      audio.volume = 1; // 바로 최대 볼륨으로 설정
      
      audio.play().catch(error => {
        console.log('2장 음성 자동재생 실패:', error);
      });
    }
  }, [chapterNumber]);

  // 2장 오디오 하이라이트 효과 (1장과 동일한 방식)
  useEffect(() => {
    if (chapterNumber === 2 && audioRef.current) {
      const audio = audioRef.current;
      let highlightInterval: NodeJS.Timeout;
      let lastHighlightedElement: HTMLElement | null = null;
      
      const startHighlightInterval = () => {
        console.log('2장 하이라이트 인터벌 시작');
        highlightInterval = setInterval(() => {
          try {
            const currentTime = audio.currentTime;
            console.log('현재 2장 오디오 시간:', currentTime);
            
            // 하이라이트 직접 처리
            const dialogueLines = document.querySelectorAll('.dialogue-line');
            console.log('찾은 dialogue-line 요소들:', dialogueLines.length);
            
            let currentHighlightedElement: HTMLElement | null = null;
            
            dialogueLines.forEach((line) => {
              const timeRange = line.getAttribute('data-time');
              if (timeRange) {
                const [start, end] = timeRange.split('-').map(Number);
                const htmlElement = line as HTMLElement;
                
                if (currentTime >= start && currentTime < end) {
                  currentHighlightedElement = htmlElement;
                  if (lastHighlightedElement !== htmlElement) {
                    // 이전 하이라이트 제거
                    if (lastHighlightedElement) {
                      lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
                      lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
                    }
                    // 새 하이라이트 적용
                    htmlElement.style.setProperty('background-color', '#fce7f3', 'important');
                    htmlElement.style.setProperty('color', '#000000', 'important');
                    lastHighlightedElement = htmlElement;
                    console.log('2장 하이라이트 적용:', timeRange, '요소:', htmlElement.textContent);
                  }
                }
              }
            });
            
            // 현재 하이라이트된 요소가 없으면 이전 하이라이트 제거
            if (!currentHighlightedElement && lastHighlightedElement) {
              lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
              lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
              lastHighlightedElement = null;
            }
          } catch (error) {
            console.log('2장 오디오 시간 가져오기 실패:', error);
          }
        }, 200); // 200ms마다 체크
      };

      // 오디오 이벤트 리스너
      const handlePlay = () => {
        console.log('2장 오디오 재생 시작, 하이라이트 시작');
        startHighlightInterval();
      };

      const handlePause = () => {
        console.log('2장 오디오 일시정지, 하이라이트 정지');
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
      };

      const handleEnded = () => {
        console.log('2장 오디오 종료, 하이라이트 정지');
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        // 마지막 하이라이트 제거
        if (lastHighlightedElement) {
          lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
          lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
          lastHighlightedElement = null;
        }
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [chapterNumber]);

  // 오디오/비디오 시간 업데이트 이벤트 리스너 (1장 하이라이트용)
  useEffect(() => {
    if (chapterNumber === 1 && audioRef.current) {
      const audio = audioRef.current;
      let highlightInterval: NodeJS.Timeout;
      let lastHighlightedElement: HTMLElement | null = null;
      
      const startHighlightInterval = () => {
        console.log('1장 하이라이트 인터벌 시작');
        highlightInterval = setInterval(() => {
          try {
            const currentTime = audio.currentTime;
            console.log('현재 1장 오디오 시간:', currentTime);
            
            // 하이라이트 직접 처리
            const dialogueLines = document.querySelectorAll('.dialogue-line');
            console.log('찾은 dialogue-line 요소들:', dialogueLines.length);
            
            let currentHighlightedElement: HTMLElement | null = null;
            
            dialogueLines.forEach((line) => {
              const timeRange = line.getAttribute('data-time');
              if (timeRange) {
                const [start, end] = timeRange.split('-').map(Number);
                const htmlElement = line as HTMLElement;
                
                if (currentTime >= start && currentTime < end) {
                  currentHighlightedElement = htmlElement;
                  if (lastHighlightedElement !== htmlElement) {
                    // 이전 하이라이트 제거
                    if (lastHighlightedElement) {
                      lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
                      lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
                    }
                    // 새 하이라이트 적용
                    htmlElement.style.setProperty('background-color', '#fce7f3', 'important');
                    htmlElement.style.setProperty('color', '#000000', 'important');
                    lastHighlightedElement = htmlElement;
                    console.log('1장 하이라이트 적용:', timeRange, '요소:', htmlElement.textContent);
                  }
                }
              }
            });
            
            // 현재 하이라이트된 요소가 없으면 이전 하이라이트 제거
            if (!currentHighlightedElement && lastHighlightedElement) {
              lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
              lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
              lastHighlightedElement = null;
            }
          } catch (error) {
            console.log('1장 오디오 시간 가져오기 실패:', error);
          }
        }, 200); // 200ms마다 체크
      };

      // 오디오 이벤트 리스너
      const handlePlay = () => {
        console.log('1장 오디오 재생 시작, 하이라이트 시작');
        startHighlightInterval();
      };

      const handlePause = () => {
        console.log('1장 오디오 일시정지, 하이라이트 정지');
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
      };

      const handleEnded = () => {
        console.log('1장 오디오 종료, 하이라이트 정지');
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        // 마지막 하이라이트 제거
        if (lastHighlightedElement) {
          lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
          lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
          lastHighlightedElement = null;
        }
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [chapterNumber]);

  // 4장에서만 PropsList 렌더링
  if (chapterNumber === 4) {
    return (
      <div className="bg-[#1a1a1a] pt-24 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2d2d2d] p-8 border border-[#404040]">
            {/* 4장 원래 텍스트 내용 */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-left text-lg font-bold mb-6">실내. 챔버 – 2025년 8월 29일 ~ 9월 14일 – 낮 ~ 오후</div>
              
              <div className="text-left text-base mb-8">
                〈부재시 픽션은 문 앞에 놔주세요〉의 키오스크를 보던 관객은 4장에서 물품 리스트를 확인한다. 이 리스트는 10월 30일 퍼포먼스의 소품 후보들이다. 전시장에서 퍼포먼스를 예매하는 관객은 퍼포먼스에서 어떤 소품이 등장할지 선택할 수 있다. 선택된 물품은 곧바로 주문이 들어가고 전시장으로의 배송완료와 동시에 전시된다.
              </div>
            </div>
            
            {/* 상품 리스트 */}
            <PropsList 
              onPropSelect={(prop) => window.dispatchEvent(new CustomEvent('propSelected', { detail: prop }))}
              completedProps={completedProps}
            />
          </div>
        </div>
      </div>
    );
  }

  // 1장, 2장, 5장은 기존 방식으로 렌더링
  return (
    <div className="bg-[#1a1a1a] pt-24 px-8 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#2d2d2d] p-8 border border-[#404040]">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* 1장과 2장일 때 음성 요소 추가 */}
          {(chapterNumber === 1 || chapterNumber === 2) && (
            <audio 
              ref={audioRef}
              src={chapterNumber === 1 ? "/chapter1_1.1.mp3" : "/chapter2_1.0.mp3"}
              preload="auto"
              className="hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
}

