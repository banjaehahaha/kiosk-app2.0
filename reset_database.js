// 데이터베이스 리셋 스크립트
// 브라우저 콘솔에서 실행하세요

async function resetDatabase() {
  try {
    console.log('데이터베이스 리셋 시작...');
    
    // 1. localStorage 리셋
    localStorage.removeItem('completedProps');
    console.log('✅ localStorage 리셋 완료');
    
    // 2. 데이터베이스 테이블 리셋 (API 호출)
    const resetResponse = await fetch('/api/database/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (resetResponse.ok) {
      console.log('✅ 데이터베이스 리셋 완료');
    } else {
      console.log('⚠️ 데이터베이스 리셋 실패 (API 없음)');
    }
    
    console.log('🎉 모든 리셋이 완료되었습니다!');
    console.log('페이지를 새로고침하면 초기 상태로 돌아갑니다.');
    
  } catch (error) {
    console.error('❌ 리셋 중 오류 발생:', error);
  }
}

// 실행
resetDatabase();
