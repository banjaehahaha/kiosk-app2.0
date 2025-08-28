import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propId, propName, fromCity, fromCountry, amount } = body;

    // 결제 정보 검증
    if (!propId || !propName || !fromCity || !fromCountry || !amount) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 결제 알림 데이터 생성
    const paymentNotification = {
      id: `payment-${Date.now()}`,
      propName,
      fromCity,
      fromCountry,
      amount,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // 여기서 실제로는 WebSocket 서버나 다른 실시간 통신 방식으로
    // 연결된 클라이언트들에게 알림을 보내야 합니다.
    // 현재는 로그만 출력
    console.log('결제 알림:', paymentNotification);

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '결제 알림이 전송되었습니다.',
      data: paymentNotification
    });

  } catch (error) {
    console.error('결제 알림 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
