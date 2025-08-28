import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { globeNotificationService } from '@/services/globeNotificationService';

// PayApp에서 결제 완료 후 호출하는 feedbackurl
export async function POST(request: NextRequest) {
  try {
    console.log('=== PayApp feedbackurl 호출됨 ===');
    console.log('호출 시간:', new Date().toISOString());
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()));
    
    const formData = await request.formData();
    const formDataKeys = Array.from(formData.keys());
    console.log('전송된 formData 키들:', formDataKeys);
    
    // PayApp feedbackurl에서 전송되는 모든 파라미터 수집
    const allFormData = Object.fromEntries(formData.entries());
    console.log('전체 formData 내용:', allFormData);
    
    // PayApp 매뉴얼 기준 필수 파라미터들
    const paymentResult = {
      mul_no: formData.get('mul_no') || formData.get('mulno') || 'N/A',
      state: formData.get('state') || 'N/A',
      price: formData.get('price') || formData.get('goodPrice') || 'N/A',
      goodname: formData.get('goodname') || formData.get('goodName') || 'N/A',
      userid: formData.get('userid') || 'N/A',
      shopname: formData.get('shopname') || formData.get('shopName') || 'N/A',
      memo: formData.get('memo') || 'N/A',
      // 추가 파라미터들
      errorMessage: formData.get('errorMessage') || null,
      errorCode: formData.get('errorCode') || null,
      payurl: formData.get('payurl') || null,
      csturl: formData.get('csturl') || null,
      cardName: formData.get('cardName') || null,
      cardNum: formData.get('cardNum') || null,
      date: formData.get('date') || null,
      installment: formData.get('installment') || formData.get('cardinst') || null,
      hasTax: formData.get('hasTax') || null,
      var1: formData.get('var1') || null,
      var2: formData.get('var2') || null,
      timestamp: new Date().toISOString()
    };
    
    console.log('=== PayApp 결제 결과 파싱 완료 ===');
    console.log('결제 번호 (mul_no):', paymentResult.mul_no);
    console.log('결제 상태 (state):', paymentResult.state);
    console.log('결제 금액 (price):', paymentResult.price);
    console.log('상품명 (goodname):', paymentResult.goodname);
    console.log('사용자 ID (userid):', paymentResult.userid);
    console.log('상점명 (shopname):', paymentResult.shopname);
    console.log('메모 (memo):', paymentResult.memo);
    console.log('에러 메시지:', paymentResult.errorMessage);
    console.log('에러 코드:', paymentResult.errorCode);
    console.log('=====================================');
    
    // 결제 상태 확인 (PayApp 매뉴얼 기준: state=1 성공, state=0 실패)
    if (paymentResult.state === '1') {
      console.log('✅ 결제 성공:', paymentResult.mul_no);
      
      // Supabase에 결제 완료 정보 저장
      const savedPayment = await PaymentService.savePayment({
        mul_no: paymentResult.mul_no.toString(),
        state: paymentResult.state.toString(),
        price: paymentResult.price.toString(),
        goodname: paymentResult.goodname.toString(),
        userid: paymentResult.userid.toString(),
        shopname: paymentResult.shopname.toString(),
        memo: paymentResult.memo?.toString(),
        status: 'completed',
        source: 'payapp_feedback',
        processed_at: new Date().toISOString(),
        payapp_response: {
          ...paymentResult,
          // 카드 정보가 있는 경우 추가
          card_info: paymentResult.cardName ? {
            cardName: paymentResult.cardName,
            cardNum: paymentResult.cardNum,
            date: paymentResult.date,
            installment: paymentResult.installment
          } : null,
          // URL 정보
          urls: {
            payurl: paymentResult.payurl,
            csturl: paymentResult.csturl
          }
        }
      });
      
      if (savedPayment) {
        console.log('📝 Supabase에 결제 완료 상태 저장됨:', paymentResult.mul_no);
        
        // 지구본에 결제 완료 알림 전송
        try {
          // 상품 정보에서 출발지 정보 추출 (memo에서 prop_id 파싱)
          const memo = paymentResult.memo?.toString() || '';
          const propIdMatch = memo.match(/prop_id:(\d+)/);
          
          if (propIdMatch) {
            const propId = parseInt(propIdMatch[1]);
            // props.json에서 상품 정보 조회
            const propsData = await import('@/data/props.json');
            const prop = propsData.default.props.find((p: any) => p.id === propId);
            
            if (prop && prop.origin) {
              await globeNotificationService.notifyPaymentCompleted(
                {
                  prop_id: propId,
                  prop_name: prop.name,
                  payment_amount: parseInt(paymentResult.price.toString()),
                  payment_status: 'completed',
                  booking_status: 'confirmed',
                  audience_id: 0, // 실제로는 booking에서 가져와야 함
                  payapp_mul_no: paymentResult.mul_no.toString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                {
                  city: prop.origin.city,
                  country: prop.origin.country
                }
              );
              console.log('🌍 지구본 알림 전송 완료');
            }
          }
        } catch (error) {
          console.error('지구본 알림 전송 실패:', error);
        }
      } else {
        console.error('❌ Supabase 저장 실패:', paymentResult.mul_no);
      }
      
      // PayApp 요구사항: SUCCESS 응답 반환
      return new Response('SUCCESS', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    } else {
      console.log('❌ 결제 실패:', paymentResult);
      console.log('실패 사유:', paymentResult.errorMessage || '알 수 없는 오류');
      console.log('오류 코드:', paymentResult.errorCode || 'N/A');
      
      // Supabase에 결제 실패 정보 저장
      const savedPayment = await PaymentService.savePayment({
        mul_no: paymentResult.mul_no.toString(),
        state: paymentResult.state.toString(),
        price: paymentResult.price.toString(),
        goodname: paymentResult.goodname.toString(),
        userid: paymentResult.userid.toString(),
        shopname: paymentResult.shopname.toString(),
        memo: paymentResult.memo?.toString(),
        status: 'failed',
        source: 'payapp_feedback',
        processed_at: new Date().toISOString(),
        payapp_response: {
          ...paymentResult,
          error_details: {
            errorMessage: paymentResult.errorMessage,
            errorCode: paymentResult.errorCode
          }
        }
      });
      
      if (savedPayment) {
        console.log('📝 Supabase에 결제 실패 상태 저장됨:', paymentResult.mul_no);
      } else {
        console.error('❌ Supabase 저장 실패:', paymentResult.mul_no);
      }
      
      // PayApp 요구사항: 실패해도 SUCCESS 응답 반환 (재시도 방지)
      return new Response('SUCCESS', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }
  } catch (error) {
    console.error('❌ PayApp feedbackurl 처리 오류:', error);
    console.error('오류 상세:', error instanceof Error ? error.stack : error);
    
    // PayApp 요구사항: 오류가 발생해도 SUCCESS 응답 반환 (재시도 방지)
    return new Response('SUCCESS', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

// 결제 상태 확인 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mulNo = searchParams.get('mul_no');
  
  if (mulNo) {
    // 특정 결제 번호의 상태 확인
    const paymentStatus = await PaymentService.getPaymentStatus(mulNo);
    if (paymentStatus) {
      return NextResponse.json({
        message: 'PayApp payment status found',
        status: 'success',
        data: paymentStatus
      });
    } else {
      return NextResponse.json({
        message: 'Payment not found',
        status: 'not_found',
        mul_no: mulNo
      });
    }
  }
  
  // 전체 결제 상태 목록 및 통계 반환
  try {
    const [allPayments, stats] = await Promise.all([
      PaymentService.getAllPayments(),
      PaymentService.getPaymentStats()
    ]);
    
    return NextResponse.json({ 
      message: 'PayApp feedbackurl endpoint', 
      status: 'ready',
      timestamp: new Date().toISOString(),
      url: `${request.nextUrl.origin}/api/payment-callback`,
      stats: stats,
      totalPayments: stats.total,
      documentation: 'https://www.payapp.kr/dev_center/dev_center01.html'
    });
  } catch (error) {
    console.error('결제 통계 조회 오류:', error);
    return NextResponse.json({ 
      message: 'PayApp feedbackurl endpoint', 
      status: 'ready',
      timestamp: new Date().toISOString(),
      url: `${request.nextUrl.origin}/api/payment-callback`,
      error: '통계 조회 실패'
    });
  }
}
