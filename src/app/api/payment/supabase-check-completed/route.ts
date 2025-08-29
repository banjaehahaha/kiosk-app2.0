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
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // 완료된 결제 조회
    const { data: payments, error } = await supabase
      .from('status')
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
      .from('status')
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
