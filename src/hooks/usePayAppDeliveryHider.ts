import { useEffect, useRef } from 'react';

// 🚫 PayApp 결제창 배송 필드 숨김 훅
export const usePayAppDeliveryHider = () => {
  const observerRef = useRef<MutationObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 배송 관련 필드만 숨기는 함수
  const hideDeliveryFields = () => {
    try {
      // 배송 관련 필드들만 완전히 숨김
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

      if (hiddenCount > 0) {
        console.log(`🚫 PayApp 배송 필드 ${hiddenCount}개 숨김 완료`);
      }
    } catch (error) {
      console.error('PayApp 배송 필드 숨김 중 오류:', error);
    }
  };

  // 🏠 주소 필드에 자동으로 값 입력하는 함수
  const fillAddressFieldsAutomatically = () => {
    try {
      // 주소 관련 입력 필드들을 찾아서 자동으로 값 입력
      const addressInputs = document.querySelectorAll(`
        input[name*="addr"], input[name*="address"], 
        input[name*="zip"], input[name*="post"],
        input[name*="city"], input[name*="state"]
      `);

      let filledCount = 0;
      addressInputs.forEach((element) => {
        if (element instanceof HTMLInputElement) {
          const fieldName = element.name.toLowerCase();
          
          // 필드명에 따라 적절한 값 입력
          if (fieldName.includes('addr') || fieldName.includes('address')) {
            element.value = '서울특별시 강남구 테헤란로 123';
            filledCount++;
          } else if (fieldName.includes('zip') || fieldName.includes('post')) {
            element.value = '06123';
            filledCount++;
          } else if (fieldName.includes('city')) {
            element.value = '서울특별시';
            filledCount++;
          } else if (fieldName.includes('state')) {
            element.value = '강남구';
            filledCount++;
          }
          
          // 입력 후 이벤트 발생 (PayApp에서 값 변경 감지)
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      if (filledCount > 0) {
        console.log(`🏠 PayApp 주소 필드 ${filledCount}개에 자동 값 입력 완료`);
      }
    } catch (error) {
      console.error('PayApp 주소 필드 자동 값 입력 중 오류:', error);
    }
  };

  // 강제로 배송 필드 숨김 (주기적 실행)
  const forceHideDeliveryFields = () => {
    hideDeliveryFields();
    
    // 추가로 iframe 내부의 배송 필드도 숨김 시도
    const iframes = document.querySelectorAll('iframe[src*="payapp.kr"]');
    iframes.forEach((iframe) => {
      try {
        if (iframe instanceof HTMLIFrameElement && iframe.contentDocument) {
          const iframeDeliveryElements = iframe.contentDocument.querySelectorAll(`
            input[name*="delivery"], input[name*="shipping"],
            select[name*="delivery"], select[name*="shipping"],
            label[for*="delivery"], label[for*="shipping"]
          `);
          
          iframeDeliveryElements.forEach((element) => {
            if (element instanceof HTMLElement) {
              element.style.display = 'none';
              element.style.visibility = 'hidden';
            }
          });
        }
      } catch (error) {
        // iframe 접근 제한으로 인한 오류는 무시
      }
    });
  };

  useEffect(() => {
    console.log('🚫 PayApp 배송 필드 숨김 훅 시작');

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
                console.log('🚫 PayApp 결제창 또는 배송 필드 감지됨');
                // 여러 번에 걸쳐 배송 필드 숨김 (DOM 렌더링 완료 대기)
                setTimeout(hideDeliveryFields, 100);
                setTimeout(hideDeliveryFields, 300);
                setTimeout(hideDeliveryFields, 500);
                setTimeout(hideDeliveryFields, 1000);
                setTimeout(hideDeliveryFields, 2000);
                
                // 🏠 주소 필드에 자동 값 입력 (DOM 렌더링 완료 대기)
                setTimeout(fillAddressFieldsAutomatically, 200);
                setTimeout(fillAddressFieldsAutomatically, 600);
                setTimeout(fillAddressFieldsAutomatically, 1200);
                setTimeout(fillAddressFieldsAutomatically, 2500);
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

    // 2. 주기적 배송 필드 숨김 및 주소 필드 자동 입력 (백업)
    intervalRef.current = setInterval(() => {
      forceHideDeliveryFields();
      fillAddressFieldsAutomatically();
    }, 3000);

    // 3. 초기 실행
    hideDeliveryFields();
    fillAddressFieldsAutomatically();
    
    // 페이지 로드 완료 후 추가 실행
    const handleLoad = () => {
      setTimeout(hideDeliveryFields, 1000);
      setTimeout(fillAddressFieldsAutomatically, 1000);
      setTimeout(hideDeliveryFields, 3000);
      setTimeout(fillAddressFieldsAutomatically, 3000);
    };
    
    window.addEventListener('load', handleLoad);
    document.addEventListener('DOMContentLoaded', handleLoad);

    // 4. PayApp 결제창 로드 감지
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'string' && event.data.includes('payapp')) {
        console.log('🚫 PayApp 메시지 감지, 배송 필드 숨김 및 주소 필드 자동 입력 실행');
        setTimeout(hideDeliveryFields, 500);
        setTimeout(fillAddressFieldsAutomatically, 500);
        setTimeout(hideDeliveryFields, 1000);
        setTimeout(fillAddressFieldsAutomatically, 1000);
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
      console.log('🚫 PayApp 배송 필드 숨김 훅 정리 완료');
    };
  }, []);

  // 수동으로 배송 필드 숨김 및 주소 필드 자동 입력 실행 함수 반환
  return { hideDeliveryFields, forceHideDeliveryFields, fillAddressFieldsAutomatically };
};
