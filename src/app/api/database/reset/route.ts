import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    console.log('데이터베이스 리셋 시작...');
    
    const db = await getDatabase();
    
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');
    
    try {
      // 모든 테이블의 데이터 삭제
      await db.run('DELETE FROM payment_logs');
      console.log('✅ payment_logs 테이블 리셋 완료');
      
      await db.run('DELETE FROM booking_info');
      console.log('✅ booking_info 테이블 리셋 완료');
      
      await db.run('DELETE FROM audience_info');
      console.log('✅ audience_info 테이블 리셋 완료');
      
      // AUTOINCREMENT 값도 리셋
      await db.run('DELETE FROM sqlite_sequence WHERE name IN ("audience_info", "booking_info", "payment_logs")');
      console.log('✅ AUTOINCREMENT 값 리셋 완료');
      
      // 트랜잭션 커밋
      await db.run('COMMIT');
      
      console.log('🎉 데이터베이스 리셋 완료!');
      
      return NextResponse.json({
        success: true,
        message: '데이터베이스가 성공적으로 리셋되었습니다.',
        resetTables: ['audience_info', 'booking_info', 'payment_logs']
      });
      
    } catch (error) {
      // 트랜잭션 롤백
      await db.run('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('데이터베이스 리셋 오류:', error);
    
    return NextResponse.json(
      { 
        error: '데이터베이스 리셋에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
