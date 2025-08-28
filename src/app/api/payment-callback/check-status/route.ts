import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';

// 결제 상태 확인 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mul_no: mulNo, payment_type } = body;
    
    if (!mulNo) {
      return NextResponse.json({ 
        error: 'mul_no가 필요합니다.',
        status: 'error',
        message: '결제 번호가 제공되지 않았습니다.'
      }, { status: 400 });
    }

    console.log('=== 결제 상태 확인 요청 (POST) ===');
    console.log('mul_no:', mulNo);
    console.log('payment_type:', payment_type);
    console.log('요청 시간:', new Date().toISOString());
    console.log('===============================');
    
    // 1. Supabase에서 결제 상태 확인
    const paymentStatus = await PaymentService.getPaymentStatus(mulNo);
    if (paymentStatus) {
      console.log('✅ Supabase에서 결제 상태 확인됨:', mulNo);
      
      let message = '';
      switch (paymentStatus.status) {
        case 'completed':
          message = '결제가 완료되었습니다.';
          break;
        case 'failed':
          message = '결제가 실패했습니다.';
          break;
        case 'pending':
          message = '결제가 진행 중입니다.';
          break;
        default:
          message = '결제 상태를 확인할 수 없습니다.';
      }
      
      return NextResponse.json({
        status: 'success',
        mul_no: mulNo,
        message: message,
        source: 'supabase',
        data: paymentStatus
      });
    }

    // 2. 데이터베이스에서 결제 완료 정보 확인 (백업)
    try {
      const dbResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://kiosk-app2-0.vercel.app'}/api/audience/check-payment?mul_no=${mulNo}`);
      if (dbResponse.ok) {
        const dbResult = await dbResponse.json();
        console.log('데이터베이스 확인 결과:', dbResult);
        if (dbResult.paymentStatus === 'completed') {
          console.log('✅ 데이터베이스에서 결제 완료 확인:', mulNo);
          
          return NextResponse.json({ 
            status: 'success', 
            mul_no: mulNo, 
            message: '결제가 완료되었습니다.', 
            source: 'database_backup' 
          });
        }
      }
    } catch (error) {
      console.error('데이터베이스 확인 오류:', error);
    }

    // 3. 결제 정보가 없는 경우
    console.log('❌ 결제 정보를 찾을 수 없음:', mulNo);
    return NextResponse.json({
      status: 'not_found',
      mul_no: mulNo,
      message: '해당 결제 번호의 정보를 찾을 수 없습니다.',
      source: 'none',
      suggestion: '결제가 아직 진행되지 않았거나 feedbackurl이 아직 호출되지 않았습니다.'
    });

  } catch (error) {
    console.error('❌ 결제 상태 확인 오류:', error);
    return NextResponse.json({
      status: 'error',
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mulNo = searchParams.get('mul_no');
  
  if (mulNo) {
    // 특정 결제 번호의 상태 확인
    const paymentStatus = await PaymentService.getPaymentStatus(mulNo);
    if (paymentStatus) {
      return NextResponse.json({
        message: 'Payment status found in Supabase',
        status: 'success',
        data: paymentStatus
      });
    } else {
      return NextResponse.json({
        message: 'Payment not found in Supabase',
        status: 'not_found',
        mul_no: mulNo,
        suggestion: 'Use POST method for real-time status check'
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
      message: 'Payment status check endpoint', 
      status: 'ready',
      timestamp: new Date().toISOString(),
      url: `${request.nextUrl.origin}/api/payment-callback/check-status`,
      stats: stats,
      totalPayments: stats.total,
      note: 'Use POST method with mul_no for real-time status check'
    });
  } catch (error) {
    console.error('결제 통계 조회 오류:', error);
    return NextResponse.json({ 
      message: 'Payment status check endpoint', 
      status: 'ready',
      timestamp: new Date().toISOString(),
      url: `${request.nextUrl.origin}/api/payment-callback/check-status`,
      error: '통계 조회 실패'
    });
  }
}
