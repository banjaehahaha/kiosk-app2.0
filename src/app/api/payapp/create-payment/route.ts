import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('PayApp 결제 요청 받음:', body);
    console.log('현재 NODE_ENV:', process.env.NODE_ENV);
    
    // 환경 변수에서 PayApp 계정 정보 가져오기
    const userid = process.env.PAYAPP_USERID || 'jiwonnnnnn';
    const linkkey = process.env.PAYAPP_LINKKEY || '';
    const linkvalue = process.env.PAYAPP_LINKVALUE || '';
    
    console.log('=== 환경 변수 확인 ===');
    console.log('PAYAPP_USERID:', userid);
    console.log('PAYAPP_LINKKEY:', linkkey ? '설정됨 (길이: ' + linkkey.length + ')' : '설정안됨');
    console.log('PAYAPP_LINKVALUE:', linkvalue ? '설정됨 (길이: ' + linkvalue.length + ')' : '설정안됨');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('=====================');
    
    // 필수 환경 변수 검증
    if (!linkkey || !linkvalue) {
      console.error('PayApp 연동 정보가 설정되지 않음');
      return NextResponse.json({
        state: '0',
        errorMessage: 'PayApp 연동 정보가 설정되지 않았습니다. 환경 변수를 확인해주세요.',
        errorCode: 'CONFIG_ERROR'
      });
    }
    
    // 실제 PayApp API 호출 (테스트 모드 제거)
    console.log('실제 PayApp API 호출 시작');
    
    console.log('운영 환경: 실제 PayApp API 호출');
    console.log('사용자 ID:', userid);
    
    // 실제 운영 환경에서만 PayApp API 호출
    console.log('PayApp API 호출 시작...');
    
    const requestBody = new URLSearchParams({
      cmd: 'payrequest', // 결제 요청 명령 (필수) - PayApp 공식 문서에 따름
      userid: userid,
      linkkey: linkkey,
      linkvalue: linkvalue,
      shopname: body.shopname,
      goodname: body.goodname,
      price: body.price.toString(),
      recvphone: body.recvphone,
      memo: body.memo || '',
      reqaddr: body.reqaddr || '요청안함',
      vccode: body.vccode || '82',
      redirecturl: body.redirecturl,
      redirect: body.redirect || 'opener',
      feedbackurl: body.feedbackurl || '',
      checkretry: body.checkretry || 'n',
      var1: body.var1 || '',
      var2: body.var2 || '',
    });
    
    // PayApp API 요청 전 모든 파라미터 로깅
    console.log('=== PayApp API 요청 정보 ===');
    console.log('URL:', 'https://api.payapp.kr/oapi/apiLoad.html');
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log('Body 파라미터:', Object.fromEntries(requestBody.entries()));
    console.log('==========================');
    
    console.log('PayApp API 요청 파라미터:', Object.fromEntries(requestBody.entries()));
    
    const payAppResponse = await fetch('https://api.payapp.kr/oapi/apiLoad.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!payAppResponse.ok) {
      console.error('PayApp API 응답 오류:', payAppResponse.status, payAppResponse.statusText);
      
      // 응답 본문도 확인
      try {
        const errorBody = await payAppResponse.text();
        console.error('PayApp API 오류 응답 본문:', errorBody);
      } catch (e) {
        console.error('오류 응답 본문 읽기 실패:', e);
      }
      
      throw new Error(`PayApp API 호출 실패: ${payAppResponse.status} ${payAppResponse.statusText}`);
    }

          const responseText = await payAppResponse.text();
      console.log('PayApp API 응답 (raw):', responseText);
      
      // URL 인코딩된 응답을 파싱
      const responseParams = new URLSearchParams(responseText);
      
      // 모든 파라미터 로깅
      const allParams: Record<string, string> = {};
      responseParams.forEach((value, key) => {
        allParams[key] = value;
      });
      console.log('PayApp API 응답 파라미터:', allParams);
      
      const result = {
        state: responseParams.get('state'),
        errorMessage: responseParams.get('errorMessage'),
        mul_no: responseParams.get('mul_no'),
        payurl: responseParams.get('payurl'),
        errorCode: responseParams.get('errorCode'),
        var1: body.var1,
        var2: body.var2,
      };

      console.log('파싱된 결과:', result);
      
      // 응답 검증
      if (!result.state) {
        console.error('PayApp API 응답에 state가 없음');
        return NextResponse.json({
          state: '0',
          errorMessage: 'PayApp API 응답 형식 오류',
          errorCode: 'RESPONSE_ERROR'
        });
      }
      
      return NextResponse.json(result);
  } catch (error) {
    console.error('PayApp 결제 요청 오류:', error);
    
    return NextResponse.json(
      { 
        state: '0', 
        errorMessage: '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
