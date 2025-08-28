'use client';

import { useEffect, useRef, useState } from 'react';
import PropsList from './PropsList';

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
    // 1장일 때만 음성 자동재생
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
  }, [chapterNumber]);

  // 2장 비디오 하이라이트 효과
  useEffect(() => {
    console.log('2장 하이라이트 useEffect 실행, chapterNumber:', chapterNumber, 'videoRef:', videoRef);
    
    if (chapterNumber === 2) {
      console.log('2장 조건 만족, videoRef.current:', videoRef?.current);
      
      // DOM에서 직접 비디오 요소 찾기
      const findVideoElement = () => {
        const videoElement = document.querySelector('video');
        if (videoElement) {
          const video = videoElement as HTMLVideoElement;
          console.log('비디오 요소 찾음:', video);
          
          let highlightInterval: NodeJS.Timeout;
          let lastHighlightedElement: HTMLElement | null = null;
          
          const startHighlightInterval = () => {
            console.log('2장 비디오 하이라이트 시작');
            highlightInterval = setInterval(() => {
              const currentVideoTime = video.currentTime;
              console.log('현재 비디오 시간:', currentVideoTime);
              
              // 하이라이트 직접 처리
              const dialogueLines = document.querySelectorAll('.dialogue-line');
              console.log('찾은 dialogue-line 요소들:', dialogueLines.length);
              
              let currentHighlightedElement: HTMLElement | null = null;
              
              dialogueLines.forEach((line) => {
                const timeRange = line.getAttribute('data-time');
                if (timeRange) {
                  const [start, end] = timeRange.split('-').map(Number);
                  const htmlElement = line as HTMLElement;
                  
                  if (currentVideoTime >= start && currentVideoTime < end) {
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
                      console.log('하이라이트 적용:', timeRange, '요소:', htmlElement.textContent);
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
            }, 200); // 200ms마다 체크
          };

          const handlePlay = () => {
            console.log('2장 비디오 재생 시작, 하이라이트 시작');
            startHighlightInterval();
          };

          const handlePause = () => {
            console.log('2장 비디오 일시정지, 하이라이트 정지');
            if (highlightInterval) {
              clearInterval(highlightInterval);
            }
          };

          const handleEnded = () => {
            console.log('2장 비디오 종료, 하이라이트 정리');
            if (highlightInterval) {
              clearInterval(highlightInterval);
            }
            // 모든 하이라이트 제거
            if (lastHighlightedElement) {
              lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
              lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
              lastHighlightedElement = null;
            }
          };

          video.addEventListener('play', handlePlay);
          video.addEventListener('pause', handlePause);
          video.addEventListener('ended', handleEnded);

          return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            if (highlightInterval) {
              clearInterval(highlightInterval);
            }
            if (lastHighlightedElement) {
              lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
              lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
            }
          };
        } else {
          console.log('비디오 요소를 찾을 수 없음, 100ms 후 재시도');
          setTimeout(findVideoElement, 100);
        }
      };

      // 즉시 실행
      findVideoElement();
    }
  }, [chapterNumber, videoRef]);

  // 오디오/비디오 시간 업데이트 이벤트 리스너 (1장 하이라이트용)
  useEffect(() => {
    if (chapterNumber === 1 && audioRef.current) {
      const audio = audioRef.current;
      let highlightInterval: NodeJS.Timeout;
      let lastHighlightedElement: HTMLElement | null = null;
      
      const startHighlightInterval = () => {
        console.log('1장 하이라이트 인터벌 시작');
        highlightInterval = setInterval(() => {
          const currentTime = audio.currentTime;
          
          // 하이라이트 직접 처리
          const dialogueLines = document.querySelectorAll('.dialogue-line');
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
        }, 200); // 200ms마다 체크 (더 부드럽게)
      };

      const handlePlay = () => {
        console.log('1장 재생 시작, 하이라이트 시작');
        startHighlightInterval();
      };

      const handleEnded = () => {
        console.log('1장 재생 종료, 하이라이트 정리');
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        // 모든 하이라이트 제거
        if (lastHighlightedElement) {
          lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
          lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
          lastHighlightedElement = null;
        }
      };

      // 오디오에 이벤트 리스너 추가
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('ended', handleEnded);

      return () => {
        // 오디오에서 이벤트 리스너 제거
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('ended', handleEnded);
        if (highlightInterval) {
          clearInterval(highlightInterval);
        }
        if (lastHighlightedElement) {
          lastHighlightedElement.style.setProperty('background-color', 'transparent', 'important');
          lastHighlightedElement.style.setProperty('color', '#e5e5e5', 'important');
        }
      };
    }
  }, [chapterNumber]);

  // 대사 하이라이트 기능 - 제거

  return (
    <div className="bg-[#1a1a1a] pt-24 px-8 pb-8 min-h-screen">
      {/* 1장일 때만 음성 요소 추가 */}
      {chapterNumber === 1 && (
        <audio 
          ref={audioRef}
          src="/chapter1_1.1.mp3"
          preload="auto"
          className="hidden"
        />
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* 1장, 3장, 4장, 등장인물 페이지가 아닐 때만 제목과 부제 표시 */}
        {chapterNumber !== 1 && chapterNumber !== 3 && chapterNumber !== 4 && chapterNumber !== 0 && chapterNumber !== 2 && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#e5e5e5] mb-4 font-d2coding-bold">{title}</h1>
            {location && <p className="text-xl text-[#b3b3b3] font-d2coding">{location}</p>}
          </div>
        )}
        
        <div className="bg-[#2d2d2d]/80 backdrop-blur-sm p-8 border border-[#404040]/50">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-[#e5e5e5] leading-relaxed font-d2coding"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {/* 4장일 때 PropsList 컴포넌트 렌더링 */}
            {chapterNumber === 4 && <PropsList onPropSelect={(prop) => window.dispatchEvent(new CustomEvent('propSelected', { detail: prop }))} completedProps={completedProps} />}
          </div>
        </div>
      </div>
    </div>
  );
}
