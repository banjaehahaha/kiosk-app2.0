import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('이메일 API 받은 데이터:', body);
    
    const { 
      name: customerName, 
      phone: customerPhone, 
      attendeeCount, 
      propName, 
      busService, 
      busAttendCount: busAttendeeCount 
    } = body;
    
    // totalAmount 계산
    const totalAmount = attendeeCount * 20000; // 1인당 20,000원

    // 환경변수 확인
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('이메일 환경변수가 설정되지 않음 - 이메일 전송 건너뛰기');
      return NextResponse.json({
        success: true,
        message: '이메일 환경변수가 설정되지 않아 이메일 전송을 건너뛰었습니다.'
      });
    }

    // 이메일 전송을 위한 transporter 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Gmail 사용
      auth: {
        user: process.env.EMAIL_USER, // 환경변수에서 이메일 주소 가져오기
        pass: process.env.EMAIL_PASS  // 환경변수에서 앱 비밀번호 가져오기
      }
    });

    // 이메일 내용 구성
    const emailContent = `
      <h2>🎭 새로운 공연 예매가 완료되었습니다!</h2>
      
      <h3>📋 예매 정보</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">고객명</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">연락처</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${customerPhone}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">관람 인원</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${attendeeCount}명</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">선택 소품</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${propName}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">총 결제 금액</td>
          <td style="padding: 12px; border: 1px solid #ddd;">₩${totalAmount.toLocaleString()}</td>
        </tr>
        ${busService ? `
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">대절버스 이용</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${busAttendeeCount}명</td>
        </tr>
        ` : ''}
      </table>
      
      <h3>📅 공연 정보</h3>
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li><strong>공연명:</strong> 부재시 픽션은 문 앞에 놔주세요</li>
        <li><strong>공연일시:</strong> 2024년 10월 30일 오후 7시</li>
        <li><strong>장소:</strong> 합정역 2번 출구 앞 세아타워</li>
      </ul>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        이 이메일은 자동으로 발송되었습니다.
      </p>
    `;

    // 이메일 전송
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // 관리자 이메일 주소
      subject: `🎭 [공연 예매 완료] ${customerName}님 - ${propName}`,
      html: emailContent
    };

    await transporter.sendMail(mailOptions);

    console.log('이메일 전송 성공:', {
      customerName,
      customerPhone,
      propName,
      totalAmount
    });

    return NextResponse.json({
      success: true,
      message: '이메일이 성공적으로 전송되었습니다.'
    });

  } catch (error) {
    console.error('이메일 전송 오류:', error);
    
    return NextResponse.json(
      { 
        error: '이메일 전송에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
