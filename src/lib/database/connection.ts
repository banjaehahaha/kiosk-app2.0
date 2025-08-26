import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // 데이터베이스 파일 경로 (프로젝트 루트의 data 폴더)
  const dbPath = path.join(process.cwd(), 'data', 'kiosk.db');
  
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // 데이터베이스 초기화 (테이블 생성)
    await initializeDatabase(db);
    
    console.log('데이터베이스 연결 성공:', dbPath);
    return db;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    throw error;
  }
}

async function initializeDatabase(db: Database) {
  try {
    // 스키마 파일 읽기
    const fs = await import('fs');
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // SQL 실행
    await db.exec(schema);
    console.log('데이터베이스 스키마 초기화 완료');
  } catch (error) {
    console.error('스키마 초기화 실패:', error);
    // 기본 테이블 생성
    await createBasicTables(db);
  }
}

async function createBasicTables(db: Database) {
  try {
    // 관객 정보 테이블
    await db.exec(`
      CREATE TABLE IF NOT EXISTS audience_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        bus_service INTEGER DEFAULT 0,
        bus_details TEXT,
        privacy_agreement INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 예매 정보 테이블
    await db.exec(`
      CREATE TABLE IF NOT EXISTS booking_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audience_id INTEGER NOT NULL,
        prop_id INTEGER NOT NULL,
        prop_name TEXT NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        payment_amount INTEGER NOT NULL,
        payapp_mul_no TEXT,
        booking_status TEXT DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('기본 테이블 생성 완료');
  } catch (error) {
    console.error('기본 테이블 생성 실패:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log('데이터베이스 연결 종료');
  }
}
