const { createClient } = require('@supabase/supabase-js');

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('환경 변수 설정 방법:');
  console.log('export SUPABASE_URL="your_supabase_url"');
  console.log('export SUPABASE_ANON_KEY="your_supabase_anon_key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Supabase 테스트 데이터 생성 시작...');

async function createTestData() {
  try {
    // 테스트 결제 데이터 생성
    const testPayments = [
      {
        mul_no: 'TEST_001',
        state: 'completed',
        price: '50000',
        goodname: 'Vintage North Korea badge ZENLAM Space programm',
        userid: 'test_user_1',
        shopname: 'Test Shop',
        memo: '테스트 결제 1',
        status: 'completed',
        source: 'manual_check'
      },
      {
        mul_no: 'TEST_002',
        state: 'completed',
        price: '75000',
        goodname: 'North Korean Army Airborne Glider Infantry Badge Pin',
        userid: 'test_user_2',
        shopname: 'Test Shop',
        memo: '테스트 결제 2',
        status: 'completed',
        source: 'manual_check'
      }
    ];

    for (const payment of testPayments) {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select();

      if (error) {
        console.error(`❌ 결제 데이터 생성 실패:`, error);
      } else {
        console.log(`✅ 결제 데이터 생성 성공:`, data[0]);
      }
    }

    // 생성된 데이터 확인
    const { data: allPayments, error: selectError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed');

    if (selectError) {
      console.error('❌ 데이터 조회 실패:', selectError);
    } else {
      console.log(`\n📊 현재 완료된 결제 수: ${allPayments.length}`);
      allPayments.forEach(payment => {
        console.log(`- ID: ${payment.id}, 상품: ${payment.goodname}, 상태: ${payment.status}`);
      });
    }

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 중 오류:', error);
  }
}

createTestData();
