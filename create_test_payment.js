const Database = require('sqlite3').Database;
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kiosk.db');
const db = new Database(dbPath);

console.log('테스트 결제 데이터 생성 시작...');

db.serialize(() => {
  // 먼저 테스트용 관객 정보 생성
  db.run(`
    INSERT INTO audience_info (name, phone, bus_service, privacy_agreement) 
    VALUES (?, ?, ?, ?)
  `, ['테스트 사용자', '010-1234-5678', false, true], function(err) {
    if (err) {
      console.error('관객 정보 생성 오류:', err);
      return;
    }
    
    const audienceId = this.lastID;
    console.log(`✅ 관객 정보 생성 완료 (ID: ${audienceId})`);
    
    // 테스트용 결제 완료 데이터 생성
    const testPayments = [
      {
        prop_name: 'Vintage North Korea badge ZENLAM Space programm',
        payment_amount: 50000,
        payapp_mul_no: 'TEST_001'
      },
      {
        prop_name: 'North Korean Army Airborne Glider Infantry Badge Pin',
        payment_amount: 75000,
        payapp_mul_no: 'TEST_002'
      }
    ];
    
    let completedCount = 0;
    
    testPayments.forEach((payment, index) => {
      db.run(`
        INSERT INTO booking_info (
          audience_id, prop_id, prop_name, payment_status, 
          payment_amount, payapp_mul_no, booking_status, processed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        audienceId, 
        index + 1, 
        payment.prop_name, 
        'completed', 
        payment.payment_amount, 
        payment.payapp_mul_no, 
        'confirmed',
        false
      ], function(err) {
        if (err) {
          console.error(`결제 데이터 ${index + 1} 생성 오류:`, err);
        } else {
          console.log(`✅ 결제 데이터 ${index + 1} 생성 완료 (ID: ${this.lastID})`);
        }
        
        completedCount++;
        if (completedCount === testPayments.length) {
          console.log('🎉 모든 테스트 데이터 생성 완료!');
          console.log('\n테스트 방법:');
          console.log('1. kioskapp2.vercel.app/globe-viewer 접속');
          console.log('2. 5초 후 결제 완료 이벤트 발생 확인');
          console.log('3. 주문 완료 모달과 애니메이션 확인');
          db.close();
        }
      });
    });
  });
});
