import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database/connection";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      attendeeCount,
      busService,
      busDetails,
      privacyAgreement,
      propId,
      propName,
      paymentAmount,
      payappMulNo,
    } = body;

    // 필수 필드 검증
    if (!name || !phone || !attendeeCount || !privacyAgreement) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // 트랜잭션 시작
    await db.run("BEGIN TRANSACTION");

    try {
      // 1. 관객 정보 저장
      const audienceResult = await db.run(
        `
        INSERT INTO audience_info (name, phone, bus_service, bus_details, privacy_agreement)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          name,
          phone,
          busService ? 1 : 0,
          busDetails ? JSON.stringify(busDetails) : null,
          privacyAgreement ? 1 : 0,
        ]
      );

      const audienceId = audienceResult.lastID;

      if (!audienceId) {
        throw new Error("관객 정보 저장 실패");
      }

      // 2. 예매 정보 저장
      const bookingResult = await db.run(
        `
        INSERT INTO booking_info (
          audience_id, prop_id, prop_name, payment_status, 
          payment_amount, payapp_mul_no, booking_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          audienceId,
          propId || 0,
          propName || "Unknown",
          "completed",
          paymentAmount || 1000,
          payappMulNo || null,
          "confirmed",
        ]
      );

      const bookingId = bookingResult.lastID;

      if (!bookingId) {
        throw new Error("예매 정보 저장 실패");
      }

      // 3. 결제 로그 저장
      await db.run(
        `
        INSERT INTO payment_logs (booking_id, payapp_response, payment_status)
        VALUES (?, ?, ?)
      `,
        [
          bookingId,
          JSON.stringify({
            mul_no: payappMulNo,
            status: "success",
            attendeeCount: attendeeCount,
            totalAmount: paymentAmount,
          }),
          "completed",
        ]
      );

      // 트랜잭션 커밋
      await db.run("COMMIT");

      console.log("관객 정보 저장 성공:", {
        audienceId,
        bookingId,
        name,
        phone,
        attendeeCount,
      });

      return NextResponse.json({
        success: true,
        message: "예매가 성공적으로 완료되었습니다.",
        data: {
          audienceId,
          bookingId,
          name,
          phone,
          attendeeCount,
        },
      });
    } catch (error) {
      // 트랜잭션 롤백
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("관객 정보 저장 오류:", error);

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 예매 정보 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    if (!phone && !name) {
      return NextResponse.json(
        { error: "전화번호 또는 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    let query = `
      SELECT 
        ai.id as audience_id,
        ai.name,
        ai.phone,
        ai.bus_service,
        ai.bus_details,
        bi.prop_name,
        bi.booking_status,
        bi.created_at as booking_date
      FROM audience_info ai
      LEFT JOIN booking_info bi ON ai.id = bi.audience_id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (phone) {
      query += " AND ai.phone = ?";
      params.push(phone);
    }

    if (name) {
      query += " AND ai.name = ?";
      params.push(name);
    }

    query += " ORDER BY bi.created_at DESC";

    const bookings = await db.all(query, params);

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("예매 정보 조회 오류:", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
