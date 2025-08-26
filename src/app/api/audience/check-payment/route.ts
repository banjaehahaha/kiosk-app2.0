import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database/connection";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mulNo = searchParams.get("mul_no");

    if (!mulNo) {
      return NextResponse.json(
        { error: "mul_no가 필요합니다." },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // payment_logs 테이블에서 결제 상태 확인
    const paymentLog = await db.get(
      "SELECT * FROM payment_logs WHERE payapp_mul_no = ? ORDER BY created_at DESC LIMIT 1",
      [mulNo]
    );

    if (paymentLog) {
      return NextResponse.json({
        paymentStatus: "completed",
        mul_no: mulNo,
        paymentData: paymentLog,
      });
    }

    // audience_info 테이블에서도 확인
    const audienceInfo = await db.get(
      "SELECT * FROM audience_info WHERE payapp_mul_no = ? ORDER BY created_at DESC LIMIT 1",
      [mulNo]
    );

    if (audienceInfo) {
      return NextResponse.json({
        paymentStatus: "completed",
        mul_no: mulNo,
        audienceData: audienceInfo,
      });
    }

    // 결제 정보가 없음
    return NextResponse.json({
      paymentStatus: "pending",
      mul_no: mulNo,
      message: "결제 정보를 찾을 수 없습니다.",
    });
  } catch (error) {
    console.error("결제 상태 확인 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
