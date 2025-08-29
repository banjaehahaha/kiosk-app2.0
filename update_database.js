const Database = require('sqlite3').Database;
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kiosk.db');
const db = new Database(dbPath);

console.log('데이터베이스 업데이트 시작...');

db.serialize(() => {
  // processed 필드가 있는지 확인
  db.get("PRAGMA table_info(booking_info)", (err, row) => {
    if (err) {
      console.error('테이블 정보 조회 오류:', err);
      return;
    }
    
    // processed 필드 존재 여부 확인
    db.all("PRAGMA table_info(booking_info)", (err, columns) => {
      if (err) {
        console.error('컬럼 정보 조회 오류:', err);
        return;
      }
      
      const hasProcessedField = columns.some(col => col.name === 'processed');
      
      if (!hasProcessedField) {
        console.log('processed 필드 추가 중...');
        
        // processed 필드 추가
        db.run("ALTER TABLE booking_info ADD COLUMN processed BOOLEAN DEFAULT FALSE", (err) => {
          if (err) {
            console.error('processed 필드 추가 오류:', err);
          } else {
            console.log('✅ processed 필드가 성공적으로 추가되었습니다.');
            
            // 인덱스 생성
            db.run("CREATE INDEX IF NOT EXISTS idx_booking_processed ON booking_info(processed)", (err) => {
              if (err) {
                console.error('인덱스 생성 오류:', err);
              } else {
                console.log('✅ processed 인덱스가 생성되었습니다.');
              }
              
              // 기존 레코드들을 processed = false로 설정
              db.run("UPDATE booking_info SET processed = FALSE WHERE processed IS NULL", (err) => {
                if (err) {
                  console.error('기존 레코드 업데이트 오류:', err);
                } else {
                  console.log('✅ 기존 레코드들이 processed = FALSE로 설정되었습니다.');
                }
                
                db.close();
                console.log('데이터베이스 업데이트 완료!');
              });
            });
          }
        });
      } else {
        console.log('✅ processed 필드가 이미 존재합니다.');
        db.close();
      }
    });
  });
});
