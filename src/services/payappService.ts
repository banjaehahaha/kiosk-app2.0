// PayApp API 연동 서비스
// https://www.payapp.kr/dev_center/dev_center01.html 참고

export interface PayAppPaymentRequest {
  userid: string;
  shopname: string;
  goodname: string;
  price: number;
  recvphone: string;
  memo: string;
  redirecturl: string;
  feedbackurl: string;
  var1?: string;
  var2?: string;
  sendphone?: "Y" | "N";
  sms?: "Y" | "N";
  // 주소 입력 관련 파라미터들은 서버에서 고정값으로 설정
  checkretry?: "y" | "n";
}

export interface PayAppPaymentResponse {
  state: "1" | "0"; // 1: 성공, 0: 실패
  errorMessage?: string;
  mul_no?: string; // 결제요청 번호
  payurl?: string; // 결제창 URL
  errorCode?: string;
  var1?: string;
  var2?: string;
}

// PayApp 결제 요청 생성
export const createPayAppPayment = async (
  paymentData: PayAppPaymentRequest
): Promise<PayAppPaymentResponse> => {
  try {
    // 실제 구현에서는 서버 사이드에서 API 호출
    // 클라이언트에서는 결제창 URL만 반환하도록 시뮬레이션

    const response = await fetch("/api/payapp/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("결제 요청 생성 실패");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("PayApp 결제 요청 오류:", error);

    // 개발 환경에서는 테스트 QR 코드 사용
    if (process.env.NODE_ENV === "development") {
      return {
        state: "1",
        mul_no: "DEV_" + Date.now(),
        payurl: "https://www.payapp.kr/L/z31r63",
        var1: paymentData.var1,
        var2: paymentData.var2,
      };
    }

    throw error;
  }
};

// 결제 상태 확인 (feedbackurl에서 호출됨)
export const verifyPayment = async (mulNo: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/payapp/verify-payment?mul_no=${mulNo}`);

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("결제 상태 확인 오류:", error);
    return false;
  }
};

// QR 코드 생성 (실제로는 PayApp에서 제공하는 QR 코드 사용)
export const generatePaymentQR = (paymentUrl: string): string => {
  // 실제 구현에서는 PayApp의 QR 코드 생성 API 사용
  // 여기서는 QR 코드 이미지 URL을 반환하는 것으로 가정
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    paymentUrl
  )}`;
};
