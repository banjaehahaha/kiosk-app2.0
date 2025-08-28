import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mul_no } = body;
    
    if (!mul_no) {
      return NextResponse.json({
        success: false,
        error: '결제 번호가 필요합니다.'
      }, { status: 400 });
    }

    // 환경 변수에서 PayApp 계정 정보 가져오기
    const userid = process.env.PAYAPP_USERID || 'jiwonnnnnn';
    const linkkey = process.env.PAYAPP_LINKKEY || 'jMfNQEYYsTgXdHGJbMyp7+1DPJnCCRVaOgT+oqg6zaM=';
    const linkvalue = process.env.PAYAPP_LINKVALUE || 'jMfNQEYYsTgXdHGJbMyp76koJ4SX0XviQjrl1foW85k=';

    // PayApp 결제 취소 API 호출
    const requestBody = new URLSearchParams({
      cmd: 'paycancel', // 결제 취소 명령
      userid: userid,
      linkkey: linkkey,
      linkvalue: linkvalue,
      mul_no: mul_no,
    });

    console.log('PayApp 결제 취소 요청:', {
      mul_no,
      userid,
      linkkey: linkkey ? '설정됨' : '설정안됨',
      linkvalue: linkvalue ? '설정됨' : '설정안됨'
    });

    const payAppResponse = await fetch('https://api.payapp.kr/oapi/apiLoad.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!payAppResponse.ok) {
      console.error('PayApp 결제 취소 API 응답 오류:', payAppResponse.status);
      throw new Error(`PayApp API 호출 실패: ${payAppResponse.status}`);
    }

    const responseText = await payAppResponse.text();
    console.log('PayApp 결제 취소 응답:', responseText);

    // URL 인코딩된 응답을 파싱
    const responseParams = new URLSearchParams(responseText);
    const result = {
      state: responseParams.get('state'),
      errorMessage: responseParams.get('errorMessage'),
      errorCode: responseParams.get('errorCode'),
    };

    if (result.state === '1') {
      return NextResponse.json({
        success: true,
        message: '결제가 성공적으로 취소되었습니다.',
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.errorMessage || '결제 취소에 실패했습니다.',
        errorCode: result.errorCode
      }, { status: 400 });
    }

  } catch (error) {
    console.error('결제 취소 처리 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: '결제 취소 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
