import { NextRequest, NextResponse } from 'next/server';
import { Database } from 'sqlite3';
import path from 'path';

interface CompletedPayment {
  id: number;
  prop_name: string;
  created_at: string;
  payment_amount: number;
  audience_name: string;
  processed: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'kiosk.db');
    const db = new Database(dbPath);

    return new Promise<NextResponse>((resolve) => {
      const query = `
        SELECT 
          b.id,
          b.prop_name,
          b.created_at,
          b.payment_amount,
          a.name as audience_name,
          COALESCE(b.processed, 0) as processed
        FROM booking_info b
        JOIN audience_info a ON b.audience_id = a.id
        WHERE b.payment_status = 'completed' 
        AND b.booking_status = 'confirmed'
        ORDER BY b.created_at DESC
      `;

      db.all(query, [], (err, rows: CompletedPayment[]) => {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
          ));
          return;
        }

        resolve(NextResponse.json({
          success: true,
          data: rows
        }));
      });
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

    const dbPath = path.join(process.cwd(), 'data', 'kiosk.db');
    const db = new Database(dbPath);

    return new Promise<NextResponse>((resolve) => {
      const query = `
        UPDATE booking_info 
        SET processed = 1 
        WHERE id = ?
      `;

      db.run(query, [paymentId], function(err) {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
          ));
          return;
        }

        resolve(NextResponse.json({
          success: true,
          message: 'Payment marked as processed'
        }));
      });
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
