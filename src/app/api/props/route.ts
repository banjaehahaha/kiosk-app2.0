import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // props.json 파일 경로
    const filePath = join(process.cwd(), 'src', 'data', 'props.json');
    
    // 파일 읽기
    const fileContent = readFileSync(filePath, 'utf-8');
    const props = JSON.parse(fileContent);
    
    return NextResponse.json(props);
  } catch (error) {
    console.error('props.json 파일을 읽는 중 오류 발생:', error);
    return NextResponse.json(
      { error: '물품 데이터를 가져오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
