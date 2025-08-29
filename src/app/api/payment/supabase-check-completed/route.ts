import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CompletedPayment {
  id: number;
  goodname: string;
  created_at: string;
  price: string;
  userid: string;
  processed: boolean;
  memo?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 Supabase API 호출 시작...');
    console.log('환경 변수 확인:', {
      url: process.env.SUPABASE_URL ? '설정됨' : '설정되지 않음',
      key: process.env.SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'
    });
    
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않음');
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    console.log('✅ Supabase 클라이언트 확인됨');

    // 완료된 결제 조회
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    console.log('📊 Supabase에서 조회된 결제 데이터:', {
      totalCount: payments?.length || 0,
      sampleData: payments?.slice(0, 2) || []
    });

    // processed_at이 null인 것만 필터링 (아직 처리되지 않은 결제)
    const unprocessedPayments: CompletedPayment[] = payments
      .filter(payment => !payment.processed_at)
      .map(payment => ({
        id: payment.id,
        goodname: payment.goodname,
        created_at: payment.created_at,
        price: payment.price,
        userid: payment.userid,
        processed: false,
        memo: payment.memo
      }));

    console.log('🔍 필터링된 미처리 결제:', {
      unprocessedCount: unprocessedPayments.length,
      sampleUnprocessed: unprocessedPayments.slice(0, 2)
    });

    return NextResponse.json({
      success: true,
      data: unprocessedPayments
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { paymentId } = await request.json();
    
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // 결제를 processed로 마킹
    const { error } = await supabase
      .from('payments')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { success: false, error: 'Database update error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment marked as processed'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
