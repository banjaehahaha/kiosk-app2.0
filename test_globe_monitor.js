// GlobeViewer 모니터링 시스템 테스트 스크립트
// 이 스크립트는 새로운 결제 모니터링 API가 제대로 작동하는지 확인합니다.

const testGlobeMonitorAPI = async () => {
  console.log('🧪 GlobeViewer 모니터링 API 테스트 시작...');
  
  try {
    // 1. GET 요청 테스트 (새로운 결제 조회)
    console.log('\n1️⃣ GET /api/globe-payment-monitor 테스트...');
    const getResponse = await fetch('/api/globe-payment-monitor');
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET 요청 성공:', getResult);
      console.log('📊 조회된 결제 수:', getResult.data?.length || 0);
    } else {
      console.error('❌ GET 요청 실패:', getResponse.status);
    }
    
    // 2. POST 요청 테스트 (결제 처리 완료 표시)
    console.log('\n2️⃣ POST /api/globe-payment-monitor 테스트...');
    const postResponse = await fetch('/api/globe-payment-monitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId: 'test-123' }),
    });
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST 요청 성공:', postResult);
    } else {
      console.error('❌ POST 요청 실패:', postResponse.status);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
};

// 브라우저에서 실행할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  window.testGlobeMonitorAPI = testGlobeMonitorAPI;
  console.log('🧪 테스트 함수가 등록되었습니다. 브라우저 콘솔에서 testGlobeMonitorAPI()를 실행하세요.');
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGlobeMonitorAPI };
}

console.log('🧪 GlobeViewer 모니터링 테스트 스크립트 로드 완료');
console.log('📝 사용법:');
console.log('   - 브라우저: testGlobeMonitorAPI()');
console.log('   - Node.js: node test_globe_monitor.js');
