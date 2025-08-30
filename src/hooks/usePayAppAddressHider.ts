import { useEffect, useRef } from 'react';

// 🚫 PayApp 결제창 주소 필드 숨김 훅
export const usePayAppAddressHider = () => {
  const observerRef = useRef<MutationObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 주소 필드 읽기 전용으로 설정하는 함수
  const makeAddressFieldsReadOnly = () => {
    try {
      // PayApp 결제창 내부의 주소 관련 입력 필드들을 읽기 전용으로 설정
      const addressInputs = document.querySelectorAll(`
        input[name*="addr"], input[name*="address"], input[name*="zip"], input[name*="post"]
      `);

      let readOnlyCount = 0;
      addressInputs.forEach((element) => {
        if (element instanceof HTMLInputElement) {
          // 입력 필드를 읽기 전용으로 설정
          element.readOnly = true;
          element.disabled = true;
          element.style.cssText = `
            background-color: #f5f5f5 !important;
            color: #666 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            border: 1px solid #ddd !important;
            opacity: 0.7 !important;
          `;
          
          // placeholder 텍스트 변경
          element.placeholder = "자동 입력됨";
          
          readOnlyCount++;
        }
      });

      // 배송 관련 필드들은 완전히 숨김
      const deliveryElements = document.querySelectorAll(`
        input[name*="delivery"], input[name*="shipping"],
        select[name*="delivery"], select[name*="shipping"],
        label[for*="delivery"], label[for*="shipping"],
        .delivery-field, .shipping-field,
        [class*="delivery"], [class*="shipping"],
        [id*="delivery"], [id*="shipping"]
      `);

      let hiddenCount = 0;
      deliveryElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.cssText = `
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            clip: rect(0, 0, 0, 0) !important;
            overflow: hidden !important;
          `;
          hiddenCount++;
        }
      });

      if (readOnlyCount > 0 || hiddenCount > 0) {
        console.log(`🏠 PayApp 주소 필드 ${readOnlyCount}개 읽기 전용, 배송 필드 ${hiddenCount}개 숨김 완료`);
      }
    } catch (error) {
      console.error('PayApp 주소 필드 읽기 전용 설정 중 오류:', error);
    }
  };

  // 강제로 주소 필드 읽기 전용 설정 (주기적 실행)
  const forceMakeAddressFieldsReadOnly = () => {
    makeAddressFieldsReadOnly();
    
    // 추가로 iframe 내부의 주소 필드도 읽기 전용으로 설정 시도
    const iframes = document.querySelectorAll('iframe[src*="payapp.kr"]');
    iframes.forEach((iframe) => {
      try {
        if (iframe.contentDocument) {
          const iframeAddressInputs = iframe.contentDocument.querySelectorAll(`
            input[name*="addr"], input[name*="address"], input[name*="zip"], input[name*="post"]
          `);
          
          iframeAddressInputs.forEach((element) => {
            if (element instanceof HTMLInputElement) {
              element.readOnly = true;
              element.disabled = true;
              element.style.backgroundColor = '#f5f5f5';
              element.style.color = '#666';
              element.style.cursor = 'not-allowed';
            }
          });
        }
      } catch (error) {
        // iframe 접근 제한으로 인한 오류는 무시
      }
    });
  };

  useEffect(() => {
    console.log('🏠 PayApp 주소 필드 읽기 전용 설정 훅 시작');

    // 1. DOM 변경 감지 (MutationObserver)
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 새로운 노드가 추가되었는지 확인
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // PayApp 관련 요소가 추가되었는지 확인
              if (
                node.querySelector?.('[src*="payapp.kr"]') ||
                node.querySelector?.('.payapp') ||
                node.querySelector?.('[class*="payapp"]') ||
                node.querySelector?.('input[name*="addr"]') ||
                node.querySelector?.('input[name*="address"]')
              ) {
                console.log('🏠 PayApp 결제창 또는 주소 필드 감지됨');
                // 여러 번에 걸쳐 주소 필드 읽기 전용 설정 (DOM 렌더링 완료 대기)
                setTimeout(makeAddressFieldsReadOnly, 100);
                setTimeout(makeAddressFieldsReadOnly, 300);
                setTimeout(makeAddressFieldsReadOnly, 500);
                setTimeout(makeAddressFieldsReadOnly, 1000);
                setTimeout(makeAddressFieldsReadOnly, 2000);
              }
            }
          });
        }
      });
    });

    // 전체 문서 모니터링 시작
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class', 'style']
    });

    // 2. 주기적 주소 필드 읽기 전용 설정 (백업)
    intervalRef.current = setInterval(forceMakeAddressFieldsReadOnly, 2000);

    // 3. 초기 실행
    makeAddressFieldsReadOnly();
    
    // 페이지 로드 완료 후 추가 실행
    const handleLoad = () => {
      setTimeout(makeAddressFieldsReadOnly, 1000);
      setTimeout(makeAddressFieldsReadOnly, 3000);
    };
    
    window.addEventListener('load', handleLoad);
    document.addEventListener('DOMContentLoaded', handleLoad);

    // 4. PayApp 결제창 로드 감지
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'string' && event.data.includes('payapp')) {
        console.log('🏠 PayApp 메시지 감지, 주소 필드 읽기 전용 설정 실행');
        setTimeout(makeAddressFieldsReadOnly, 500);
        setTimeout(makeAddressFieldsReadOnly, 1000);
      }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
      // 정리
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('DOMContentLoaded', handleLoad);
      window.removeEventListener('message', handleMessage);
      console.log('🏠 PayApp 주소 필드 읽기 전용 설정 훅 정리 완료');
    };
  }, []);

  // 수동으로 주소 필드 읽기 전용 설정 실행 함수 반환
  return { makeAddressFieldsReadOnly, forceMakeAddressFieldsReadOnly };
};
