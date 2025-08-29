import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PaymentRecord {
  id: string;
  goodname: string;
  created_at: string;
  price: number;
  userid: string;
  processed_at: string | null;
  memo: string;
  status: string;
}

interface CompletedPayment {
  id: string;
  goodname: string;
  created_at: string;
  price: number;
  userid: string;
  processed: boolean;
  memo: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 GlobeViewer 결제 모니터링 API 호출...');
    
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않음');
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Supabase에서 status='completed'이고 processed_at이 null인 결제 조회
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .is('processed_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    console.log('📊 GlobeViewer 모니터링 - 조회된 결제:', {
      totalCount: payments?.length || 0,
      sampleData: payments?.slice(0, 2) || []
    });

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

    console.log('🔍 GlobeViewer 모니터링 - 미처리 결제:', {
      unprocessedCount: unprocessedPayments.length,
      sampleUnprocessed: unprocessedPayments.slice(0, 2)
    });

    return NextResponse.json({
      success: true,
      data: unprocessedPayments
    });
  } catch (error) {
    console.error('GlobeViewer 모니터링 API error:', error);
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

    // 결제를 processed로 표시 (GlobeViewer에서 처리 완료)
    const { error } = await supabase
      .from('payments')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (error) {
      console.error('GlobeViewer 모니터링 - Supabase update error:', error);
      return NextResponse.json(
        { success: false, error: 'Database update error' },
        { status: 500 }
      );
    }

    console.log('✅ GlobeViewer 모니터링 - 결제 처리 완료:', paymentId);

    return NextResponse.json({
      success: true,
      message: 'Payment marked as processed by GlobeViewer'
    });
  } catch (error) {
    console.error('GlobeViewer 모니터링 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
