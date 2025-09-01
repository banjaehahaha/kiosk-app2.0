"use client";

import { useState, useEffect, useRef } from "react";
import { createPayAppPayment } from "@/services/payappService";

interface AudienceInfo {
  name: string;
  phone: string;
  attendeeCount: number;
  busService: boolean;
  busAttendeeCount: number;
  privacyAgreement: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  attendeeCount?: string;
  busAttendeeCount?: string;
  privacyAgreement?: string;
}

interface AudienceInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (info: AudienceInfo | null) => void; // null을 받을 수 있도록 수정
  onShowPerformanceInfo: () => void;
  propName: string;
  propId: number; // 물품 ID 추가
}

declare global {
  interface Window {
    customKeyboard: {
      show: (options: unknown) => void;
      hide: () => void;
      [key: string]: unknown;
    } | null;
    ReactKeyboardInput?: (text: string) => void;
    ReactKeyboardEnter?: () => void;
    ReactKeyboardEsc?: () => void;
  }
}

export default function AudienceInfoModal({
  isVisible,
  onClose,
  onComplete,
  onShowPerformanceInfo,
  propName,
  propId,
}: AudienceInfoModalProps) {
  const [formData, setFormData] = useState<AudienceInfo>({
    name: "",
    phone: "",
    attendeeCount: 1,
    busService: false,
    busAttendeeCount: 1,
    privacyAgreement: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState<"name" | "phone" | null>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // 결제 관련 상태
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "checking" | "success" | "failed" | "cancelled"
  >("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    payurl: string;
    mul_no: string;
    attendeeCount: number;
  } | null>(null);

  // 키보드 초기화
  useEffect(() => {
    // 스크립트 로드
    const loadScripts = async () => {
      if (typeof window !== "undefined" && !window.customKeyboard) {
        try {
          console.log("스크립트 로딩 시작...");

          // Hangul.js 로드
          const hangulScript = document.createElement("script");
          hangulScript.src = "/hangul.js";
          hangulScript.async = true;

          // Keyboard.js 로드
          const keyboardScript = document.createElement("script");
          keyboardScript.src = "/keyboard.js";
          keyboardScript.async = true;

          // 스크립트 로드 완료 대기
          await new Promise((resolve, reject) => {
            hangulScript.onload = () => {
              console.log("Hangul.js 로드 완료");
            };
            hangulScript.onerror = (e) => {
              console.error("Hangul.js 로드 실패:", e);
              reject(new Error("Hangul.js 로드 실패"));
            };

            keyboardScript.onload = () => {
              console.log("Keyboard.js 로드 완료");
              // 스크립트 로드 후 잠시 대기
              setTimeout(() => {
                console.log(
                  "window.customKeyboard 확인:",
                  typeof window.customKeyboard
                );
                resolve(true);
              }, 100);
            };
            keyboardScript.onerror = (e) => {
              console.error("Keyboard.js 로드 실패:", e);
              reject(new Error("Keyboard.js 로드 실패"));
            };

            document.head.appendChild(hangulScript);
            document.head.appendChild(keyboardScript);
          });

          console.log("모든 스크립트 로드 완료");
        } catch (error) {
          console.error("스크립트 로드 실패:", error);
        }
      } else {
        console.log("이미 스크립트가 로드됨:", typeof window.customKeyboard);
      }
    };

    loadScripts();

    // 전역 콜백 함수 등록
    if (typeof window !== "undefined") {
      window.ReactKeyboardInput = handleKeyboardInput;
      window.ReactKeyboardEnter = handleKeyboardEnter;
      window.ReactKeyboardEsc = handleKeyboardEsc;
    }

    // 클린업
    return () => {
      if (typeof window !== "undefined") {
        window.ReactKeyboardInput = undefined;
        window.ReactKeyboardEnter = undefined;
        window.ReactKeyboardEsc = undefined;
      }
    };
  }, []);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isVisible || showPayment || showConfirmation || showQRCode || showKeyboard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 클린업: 컴포넌트가 언마운트되거나 모달이 닫힐 때 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, showPayment, showConfirmation, showQRCode, showKeyboard]);

  // 키보드 표시 시 초기화
  useEffect(() => {
    if (showKeyboard && keyboardRef.current && window.customKeyboard) {
      const input =
        activeField === "name" ? nameInputRef.current : phoneInputRef.current;

      if (input) {
        try {
          // 기존 키보드 제거
          if (keyboardRef.current.children.length > 0) {
            keyboardRef.current.innerHTML = "";
          }

          // 핸드폰 번호 입력 시 커스텀 숫자 키패드 생성
          if (activeField === "phone") {
            // 기존 키보드 제거
            keyboardRef.current.innerHTML = "";

            // phoneNumber 레이아웃 사용
            if (window.customKeyboard) {
              const keyboard = new (window.customKeyboard as unknown as {
                new (...args: unknown[]): unknown;
              })(
                keyboardRef.current,
                input,
                (text: string) => {
                  console.log("키보드 입력:", text);
                  handleKeyboardInput(text);
                },
                () => {
                  console.log("ESC 키");
                  handleKeyboardEsc();
                },
                (e: unknown) => {
                  console.log("Enter 키");
                  handleKeyboardEnter();
                },
                "phoneNumber"
              );
            }

            console.log("숫자 키패드 생성 완료");
          } else {
            // 이름 입력 시 기존 키보드 사용 (수정된 스크립트로 koNormal 기본값)
            if (window.customKeyboard) {
              const keyboard = new (window.customKeyboard as unknown as {
                new (...args: unknown[]): unknown;
              })(
                keyboardRef.current,
                input,
                (text: string) => {
                  console.log("키보드 입력:", text);
                  handleKeyboardInput(text);
                },
                () => {
                  console.log("ESC 키");
                  handleKeyboardEsc();
                },
                (e: unknown) => {
                  console.log("Enter 키");
                  handleKeyboardEnter();
                },
                null
              );
            }

            console.log("한글 키보드 초기화 완료 (koNormal 기본값)");
          }
        } catch (error) {
          console.error("키보드 초기화 실패:", error);
          if (error instanceof Error) {
            console.error("에러 상세:", error.message);
            console.error("에러 스택:", error.stack);
          }
        }
      }
    }
  }, [showKeyboard, activeField]);

  // 키보드 표시/숨김
  const toggleKeyboard = (field: "name" | "phone") => {
    if (activeField === field) {
      setShowKeyboard(false);
      setActiveField(null);
    } else {
      setActiveField(field);
      setShowKeyboard(true);
    }
  };

  // 키보드 입력 처리
  const handleKeyboardInput = (text: string) => {
    if (activeField === "name") {
      setFormData((prev) => ({ ...prev, name: text }));
    } else if (activeField === "phone") {
      setFormData((prev) => ({ ...prev, phone: text }));
    }
  };

  // 키보드 Enter 처리
  const handleKeyboardEnter = () => {
    setShowKeyboard(false);
    setActiveField(null);
  };

  // 키보드 ESC 처리
  const handleKeyboardEsc = () => {
    setShowKeyboard(false);
    setActiveField(null);
  };

  // 카카오맵 실제 지도퍼가기 HTML 삽입 (이미지 크기에 맞춤)
  useEffect(() => {
    if (isVisible) {
      const mapContainer = document.getElementById(
        "daumRoughmapContainer1755930369777"
      );
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="font-style: normal; font-variant-caps: normal; font-weight: normal; font-width: normal; font-size: 12px; line-height: normal; font-family: AppleSDGothicNeo-Regular, dotum, sans-serif; font-size-adjust: none; font-kerning: auto; font-variant-alternates: normal; font-variant-ligatures: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; font-variant-emoji: normal; font-feature-settings: normal; font-optical-sizing: auto; font-variation-settings: normal; letter-spacing: -1px; width:100%; height:100%; color: rgb(51, 51, 51); position: relative;">
            <div style="height: 208px;">
              <img class="map" src="http://t1.daumcdn.net/roughmap/imgmap/331671cf2e0435f31d45ca2151ec3cceaa3786c64e44608c43b476f962148b88" width="100%" height="100%" style="border: 1px solid rgb(204, 204, 204); object-fit: cover;">
            </div>
            <div style="overflow: hidden; padding: 7px 11px; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 0px 0px 2px 2px; background-color: rgb(249, 249, 249);">
              <a href="https://map.kakao.com" target="_blank" style="float: left;">
                <img src="//t1.daumcdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png" width="72" height="16" alt="카카오맵" style="display:block;width:72px;height:16px">
              </a>
              <div style="float: right; position: relative; top: 1px; font-size: 11px;">
                <a target="_blank" href="https://map.kakao.com/?from=roughmap&amp;srcid=21160542&amp;confirmid=21160542&amp;q=%ED%95%A9%EC%A0%95%EC%97%AD&amp;rv=on" style="float:left;height:15px;padding-top:1px;line-height:15px;color:#000;text-decoration: none;">로드뷰</a>
                <span style="width: 1px;padding: 0;margin: 0 8px 0 9px;height: 11px;vertical-align: top;position: relative;top: 2px;border-left: 1px solid #d0d0d0;float: left;"></span>
                <a target="_blank" href="https://map.kakao.com/?from=roughmap&amp;eName=%ED%95%A9%EC%A0%95%EC%97%AD&amp;eX=481101.6187924985&amp;eY=1125118.3298250008" style="float:left;height:15px;padding-top:1px;line-height:15px;color:#000;text-decoration: none;">길찾기</a>
              </div>
            </div>
          </div>
        `;
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식이 아닙니다";
    }

    if (!formData.privacyAgreement) {
      newErrors.privacyAgreement = "개인정보 이용에 동의해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 확인 모달 표시
      setShowConfirmation(true);
    }
  };

  const handleConfirmPayment = async () => {
    setShowConfirmation(false);
    // 관객 정보 입력 완료 후 결제 시작
    setShowPayment(true);
    await startPayment();
  };

  const startPayment = async () => {
    setIsLoading(true);
    setPaymentStatus("pending");

    try {
      // 인원 수에 따른 결제 금액 계산 (1명당 20,000원)
      const totalPrice = formData.attendeeCount * 20000;

      // PayApp 결제 요청 생성
      const paymentData = {
        userid: "kiosk", // userid를 간단하게 변경
        shopname: "공연 예매", // 상점명을 간단하게 변경
        goodname: `${formData.attendeeCount}인 예매`, // 상품명을 간단하게 변경
        price: totalPrice,
        recvphone: formData.phone, // 핸드폰 번호로 SMS 전송
        memo: `${propName} 공연 예매 - ${formData.attendeeCount}명`, // 메모에 상품 정보 포함
        redirecturl: `${window.location.origin}/payment-success`,
        feedbackurl: `${window.location.origin}/api/payment-callback`,
        var1: formData.attendeeCount.toString(),
        var2: JSON.stringify(formData), // 관객 정보를 var2에 저장
        sendphone: "Y" as const, // SMS 전송 활성화
        sms: "Y" as const, // SMS 파라미터 활성화
        reqaddr: "요청안함" as const, // 주소 요청 안함
        checkretry: "y" as const, // 결제 재시도 설정
        // 주소 입력 완전 차단을 위한 추가 파라미터
        addr: "N" as const, // 주소 입력 비활성화
        addr_required: "N" as const, // 주소 필수 입력 해제
        zipcode: "N" as const, // 우편번호 입력 비활성화
        zipcode_required: "N" as const, // 우편번호 필수 입력 해제
      };

      const response = await createPayAppPayment(paymentData);

      if (response.state === "1" && response.payurl) {
        console.log("결제 요청 성공, SMS 전송 완료");

        // 로딩 상태 해제
        setIsLoading(false);

        // SMS 전송 완료 모달 표시
        setShowQRCode(true);
        setQrCodeData({
          payurl: response.payurl,
          mul_no: response.mul_no || "",
          attendeeCount: formData.attendeeCount,
        });

        // 결제 상태 모니터링 시작
        if (response.mul_no) {
          startPaymentMonitoring(response.mul_no);
        }

        // 여기서 함수 종료 - SMS 전송 완료 모달에서 결제 상태 확인
        return;
      } else {
        throw new Error(response.errorMessage || "결제 요청 실패");
      }
    } catch (error) {
      console.error("결제 시작 오류:", error);
      setPaymentStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentMonitoring = async (mulNo: string) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("=== 결제 상태 모니터링 시작 ===");
    console.log("mul_no:", mulNo);
    console.log("propName:", propName);
    console.log("attendeeCount:", formData.attendeeCount);

    setPaymentStatus("checking");

    const checkInterval = setInterval(async () => {
      try {
        console.log("--- 결제 상태 확인 시도 ---");
        console.log("현재 시간:", new Date().toLocaleString());

        // 1. feedbackurl API에서 직접 결제 상태 확인 (우선순위 1)
        console.log("🔄 feedbackurl API에서 결제 상태 확인...");
        try {
          const statusResponse = await fetch(
            `/api/payment-callback/check-status?mul_no=${mulNo}`
          );

          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            console.log("feedbackurl API 응답:", statusResult);

            if (statusResult.status === "success" && statusResult.data) {
              const paymentData = statusResult.data;
              console.log("결제 데이터:", paymentData);

              if (paymentData.status === "completed") {
                console.log("✅ feedbackurl API에서 결제 완료 감지!");
                setPaymentStatus("success");
                clearInterval(checkInterval);

                // 결제 완료 처리
                await handlePaymentSuccess();
                return;
              } else if (paymentData.status === "failed") {
                console.log("❌ check-status API에서 결제 실패 감지");
                setPaymentStatus("failed");
                clearInterval(checkInterval);
                return;
              }
            }
          }
        } catch (statusError) {
          console.log(
            "feedbackurl API 확인 실패, 다른 방법 시도:",
            statusError
          );
        }

        console.log("⏳ 아직 결제 완료되지 않음, 계속 모니터링...");
      } catch (error) {
        console.error("❌ 결제 상태 확인 전체 오류:", error);
      }
    }, 2000); // 2초마다 확인 (더 빠른 응답)

    // 3분 후 자동으로 모니터링 중단 (더 빠른 타임아웃)
    setTimeout(() => {
      console.log("⏰ 3분 타임아웃 - 모니터링 중단");
      clearInterval(checkInterval);
      if (paymentStatus === "checking") {
        setPaymentStatus("failed");
      }
    }, 180000);
  };

  const handlePaymentSuccess = async () => {
    console.log("handlePaymentSuccess 함수 시작");

    // 데이터 저장 시도 (실패해도 계속 진행)
    try {
      const response = await fetch("/api/audience/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          attendeeCount: formData.attendeeCount,
          busService: formData.busService,
          busDetails: formData.busService
            ? { attendeeCount: formData.busAttendeeCount }
            : null,
          privacyAgreement: formData.privacyAgreement,
          propId: propId,
          propName: propName,
          paymentAmount: formData.attendeeCount * 20000, // 1인당 20,000원
          payappMulNo: qrCodeData?.mul_no || null, // PayApp 결제 번호
        }),
      });

      if (response.ok) {
        console.log("데이터베이스 저장 성공");
      } else {
        console.error("데이터베이스 저장 실패:", response.status);
        // 실패해도 계속 진행
      }
    } catch (error) {
      console.error("데이터베이스 저장 오류:", error);
      // 오류가 발생해도 계속 진행
    }

    // 이메일 전송 시도 (실패해도 계속 진행)
    try {
      console.log("이메일 전송 시도...");
      const emailResponse = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          attendeeCount: formData.attendeeCount,
          busService: formData.busService,
          busAttendeeCount: formData.busAttendeeCount,
          propName: propName,
        }),
      });

      if (emailResponse.ok) {
        console.log("이메일 전송 완료");
      } else {
        console.error(
          "이메일 전송 실패:",
          emailResponse.status,
          emailResponse.statusText
        );
        // 실패해도 계속 진행
      }
    } catch (emailError) {
      console.error("이메일 전송 오류:", emailError);
      // 오류가 발생해도 계속 진행
    }

    // 해당 물품을 주문 완료 상태로 표시
    if (
      typeof window !== "undefined" &&
      (window as unknown as { handlePropCompleted?: (id: number) => void })
        .handlePropCompleted
    ) {
      console.log("handlePropCompleted 호출:", propId);
      (
        window as unknown as { handlePropCompleted: (id: number) => void }
      ).handlePropCompleted(propId);
    }

    // 결제 완료 상태는 유지하되, 모달은 닫지 않음
    // 사용자가 "완료" 버튼을 눌러야 모달이 닫힘
    console.log("결제 완료 - 모달 유지, 사용자 확인 대기");
    
    // 모달을 닫지 않고 결제 완료 상태 유지
    // setShowPayment(false); // 제거
    // setShowQRCode(false); // 제거
    // onComplete(formData); // 제거 - 사용자가 완료 버튼을 눌러야 호출됨
  };

  const handleInputChange = (
    field: keyof AudienceInfo,
    value: string | boolean | number
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // 전체 인원 수가 변경되고, 대절버스 탑승 인원이 전체 인원 수를 초과하는 경우 보정
      if (
        field === "attendeeCount" &&
        typeof value === "number" &&
        newData.busAttendeeCount > value
      ) {
        newData.busAttendeeCount = value;
      }

      return newData;
    });

    // 에러 메시지 제거
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof FormErrors]: undefined,
      }));
    }
  };

  // 결제 모달이 표시되는 경우
  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-5">
        <div className="bg-white shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">결제 진행 중</h3>

            {paymentStatus === "pending" && (
              <>
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400 mx-auto"></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  결제를 진행하고 있습니다...
                </p>
                {isLoading && (
                  <div className="animate-pulse bg-gray-100 p-3 rounded-lg">
                    <p className="text-gray-800 text-sm">결제 요청 중...</p>
                  </div>
                )}
              </>
            )}

            {paymentStatus === "checking" && (
              <>
                <div className="mb-4">
                  <div className="w-16 h-16 bg-[#F8D1E7]/20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="bg-[#F8D1E7]/20 p-4 mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    SMS 결제 링크 전송 완료
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>{formData.phone}</strong> 번호로
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    결제 링크가 전송되었습니다
                  </p>
                  <div className="bg-[#F8D1E7]/30 p-3 border border-[#F8D1E7]/50">
                    <p className="text-sm text-gray-700 font-medium">
                      💳 문자메시지를 확인하여 결제를 완료해주세요
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      결제 완료 후 자동으로 다음 단계로 진행됩니다
                    </p>
                  </div>
                </div>

                {/* 결제 취소 버튼 추가 */}
                <div className="mt-6">
                  <button
                                    onClick={async () => {
                  try {
                    setIsLoading(true);
                    
                    // 결제 취소 처리 (mul_no가 없는 경우를 위한 처리)
                    setPaymentStatus("cancelled");
                    // 물품 리스트로 돌아가지 않고 취소 상태 표시
                  } catch (error) {
                    console.error('결제 취소 오류:', error);
                    setPaymentStatus("failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? '처리중...' : '결제 취소'}
                  </button>
                </div>
              </>
            )}

            {paymentStatus === "success" && (
              <div className="text-center mb-6">
                {/* 성공 아이콘 */}
                <div className="w-20 h-20 bg-[#F8D1E7]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">결제 완료</h3>
                <p className="text-sm text-gray-600 mb-4">예매가 성공적으로 완료되었습니다</p>
                
                {/* 결제 확인 내역 */}
                <div className="bg-[#F8D1E7]/10 p-4 border border-[#F8D1E7]/30 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 text-left">결제 확인 내역</h4>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">퍼포먼스명:</span>
                      <span className="font-medium text-gray-800">뜻밖의 보간과 최근접 이웃 찾기</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">선택 소품:</span>
                      <span className="font-medium text-gray-800">{propName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">관객명:</span>
                      <span className="font-medium text-gray-800">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락처:</span>
                      <span className="font-medium text-gray-800">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">관람 인원:</span>
                      <span className="font-medium text-gray-800">{formData.attendeeCount}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 금액:</span>
                      <span className="font-medium text-gray-800">₩{(formData.attendeeCount * 20000).toLocaleString()}</span>
                    </div>
                    {formData.busService && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">대절버스:</span>
                        <span className="font-medium text-gray-800">이용 ({formData.busAttendeeCount}명)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">퍼포먼스 일시:</span>
                      <span className="font-medium text-gray-800">2025년 10월 30일 오후 7시</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">퍼포먼스 장소: </span>
                      <span className="font-medium text-gray-800">인천아트플랫폼 C동 공연장</span>
                    </div>
                  </div>
                </div>
                

                
                {/* 완료 버튼 */}
                <button
                  onClick={() => {
                    onClose();
                    if (onComplete) {
                      onComplete(formData);
                    }
                  }}
                  className="px-6 py-2 bg-[#F8D1E7] text-gray-800 hover:bg-[#f0c4d8] transition-colors font-medium"
                >
                  완료
                </button>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="text-gray-800 mb-4">
                <p className="text-lg font-bold">결제 실패</p>
                <p className="text-sm text-gray-600 mt-1">다시 시도해주세요</p>
              </div>
            )}

            {paymentStatus === "cancelled" && (
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">결제 취소</h3>
                <p className="text-sm text-gray-600 mb-4">결제가 취소되었습니다</p>
                
                {/* 확인 버튼 */}
                <button
                  onClick={() => {
                    onClose();
                    if (onComplete) {
                      onComplete(null); // null을 전달하여 취소 상태임을 알림
                    }
                  }}
                  className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-medium"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SMS 전송 완료 모달이 표시되는 경우
  if (showQRCode && qrCodeData) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-5 overflow-hidden">
        <div className="bg-[#2d2d2d] w-4/5 max-w-md shadow-2xl relative p-6">
          {/* X 버튼 */}
          <button
            onClick={() => setShowQRCode(false)}
            className="absolute top-2 right-4 text-[#e5e5e5] text-4xl font-light hover:text-[#b3b3b3] transition-colors"
          >
            ×
          </button>

          {/* SMS 전송 완료 내용 */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">
              SMS 결제 링크 전송 완료
            </h3>

            {/* 성공 아이콘 */}
            <div className="w-24 h-24 bg-[#F8D1E7]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* 전송 정보 */}
            <div className="text-[#e5e5e5] space-y-2">
              <p>
                <strong>전송 번호:</strong> {formData.phone}
              </p>
              <p>
                <strong>결제번호:</strong> {qrCodeData.mul_no}
              </p>
              <p>
                <strong>결제링크:</strong> {qrCodeData.payurl}
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="text-[#b3b3b3] text-sm bg-[#404040] p-3">
              <p>📱 문자메시지를 확인하여 결제를 완료해주세요</p>
              <p>💳 결제 완료 후 자동으로 다음 단계로 진행됩니다</p>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    
                    // PayApp 결제 취소 API 호출
                    const cancelResponse = await fetch('/api/payapp/cancel-payment', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        mul_no: qrCodeData.mul_no
                      }),
                    });

                    if (cancelResponse.ok) {
                      const cancelResult = await cancelResponse.json();
                      if (cancelResult.success) {
                        setPaymentStatus("cancelled");
                        // 물품 리스트로 돌아가지 않고 취소 상태 표시
                      } else {
                        alert('결제 취소에 실패했습니다: ' + cancelResult.error);
                      }
                    } else {
                      alert('결제 취소 처리 중 오류가 발생했습니다.');
                    }
                  } catch (error) {
                    console.error('결제 취소 오류:', error);
                    alert('결제 취소 처리 중 오류가 발생했습니다.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '처리중...' : '결제 취소'}
              </button>
              
              <button
                onClick={() => setShowQRCode(false)}
                className="px-4 py-2 bg-[#404040] text-[#e5e5e5] hover:bg-[#505050] transition-colors"
              >
                닫기
              </button>
              
              <button
                onClick={() => {
                  // SMS 재전송 로직 (필요시 구현)
                  console.log("SMS 재전송 요청");
                }}
                className="px-4 py-2 bg-[#F8D1E7] text-[#2d2d2d] hover:bg-[#e8b8d4] transition-colors"
              >
                SMS 재전송
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 영수증 출력 확인 모달이 표시되는 경우
  // if (showReceiptConfirm) { // 제거
  //   return ( // 제거
  //     <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-5"> // 제거
  //       <div className="bg-[#2d2d2d] shadow-2xl max-w-md w-full p-6 relative"> // 제거
  //         {/* 오른쪽 상단 X 버튼 */} // 제거
  //         <button // 제거
  //           onClick={() => { // 제거
  //             setShowReceiptConfirm(false); // 제거
  //             onComplete(formData); // 제거
  //           }} // 제거
  //           className="absolute top-4 right-4 text-[#b3b3b3] hover:text-[#e5e5e5] text-2xl font-bold" // 제거
  //         > // 제거
  //           × // 제거
  //         </button> // 제거
  //          // 제거
  //         <div className="text-center mb-6"> // 제거
  //           <h3 className="text-xl font-bold text-[#e5e5e5]">예매 완료</h3> // 제거
  //           <p className="text-sm text-[#b3b3b3] mt-2"> // 제거
  //             예매가 완료되었습니다!<br /> // 제거
  //             선택하신 소품이 공연에 등장합니다. // 제거
  //           </p> // 제거
  //         </div> // 제거
  //          // 제거
  //         <div className="bg-[#404040] p-4 rounded-lg mb-6"> // 제거
  //           <h4 className="text-sm font-medium text-[#e5e5e5] mb-2">예매 정보 요약</h4> // 제거
  //           <div className="text-sm text-[#b3b3b3] space-y-1"> // 제거
  //             <div className="flex justify-between"> // 제거
  //               <span>공연:</span> // 제거
  //               <span className="font-medium">부재시 픽션은 문 앞에 놔주세요</span> // 제거
  //             </div> // 제거
  //             <div className="flex justify-between"> // 제거
  //               <span>소품:</span> // 제거
  //               <span className="font-medium">{propName}</span> // 제거
  //             </div> // 제거
  //             <div className="flex justify-between"> // 제거
  //               <span>관객:</span> // 제거
  //               <span className="font-medium">{formData.name}</span> // 제거
  //             </div> // 제거
  //             <div className="flex justify-between"> // 제거
  //               <span>인원:</span> // 제거
  //               <span className="font-medium">{formData.attendeeCount}명</span> // 제거
  //             </div> // 제거
  //             <div className="flex justify-between"> // 제거
  //               <span>금액:</span> // 제거
  //               <span className="font-medium">₩{(formData.attendeeCount * 20000).toLocaleString()}</span> // 제거
  //             </div> // 제거
  //           </div> // 제거
  //         </div> // 제거
  //          // 제거
  //         {/* 하단 닫기 버튼 */} // 제거
  //         <div className="text-center mt-6"> // 제거
  //           <button // 제거
  //             onClick={() => { // 제거
  //               setShowReceiptConfirm(false); // 제거
  //               onComplete(formData); // 제거
  //             }} // 제거
  //             className="px-6 py-2 bg-[#404040] text-[#e5e5e5] hover:bg-[#505050] transition-colors" // 제거
  //           > // 제거
  //             닫기 // 제거
  //           </button> // 제거
  //         </div> // 제거
  //       </div> // 제거
  //     </div> // 제거
  //   ); // 제거
  // } // 제거

  // 확인 모달이 표시되는 경우
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-5">
        <div className="bg-[#2d2d2d] shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#e5e5e5]">예매 정보 확인</h3>
            <p className="text-sm text-[#b3b3b3] mt-1">
              입력하신 정보를 확인해주세요
            </p>
          </div>

          {/* 예매 정보 요약 */}
          <div className="space-y-4 mb-6">
            {/* 공연 정보 */}
            <div className="p-4 rounded-lg border border-[#404040]">
              <h4 className="text-sm font-medium text-[#F8D1E7] mb-2">
                퍼포먼스 정보
              </h4>
              <div className="space-y-2 text-sm text-[#e5e5e5]">
                <div className="flex justify-between">
                  <span>퍼포먼스명:</span>
                  <span className="font-medium">
                    뜻밖의 보간과 최근접 이웃 찾기
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>퍼포먼스 일시:</span>
                  <span className="font-medium">2025년 10월 30일 오후 7시</span>
                </div>
                <div className="flex justify-between">
                  <span>장소:</span>
                  <span className="font-medium">
                    인천아트플랫폼 C동 공연장
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>선택 소품:</span>
                  <span className="font-medium">{propName}</span>
                </div>
              </div>
            </div>

            {/* 관객 정보 */}
            <div className="p-4 rounded-lg border border-[#404040]">
              <h4 className="text-sm font-medium text-[#F8D1E7] mb-2">
                관객 정보
              </h4>
              <div className="space-y-2 text-sm text-[#e5e5e5]">
                <div className="flex justify-between">
                  <span>이름:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>연락처:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>관람 인원:</span>
                  <span className="font-medium">
                    {formData.attendeeCount}명
                  </span>
                </div>
              </div>
            </div>

            {/* 대절버스 정보 */}
            {formData.busService && (
              <div className="p-4 rounded-lg border border-[#404040]">
                <h4 className="text-sm font-medium text-[#F8D1E7] mb-2">
                  대절버스 이용
                </h4>
                <div className="space-y-2 text-sm text-[#e5e5e5]">
                  <div className="flex justify-between">
                    <span>탑승 인원:</span>
                    <span className="font-medium">
                      {formData.busAttendeeCount}명
                    </span>
                  </div>
                  <div className="text-xs text-[#b3b3b3]">
                    탑승 위치: 합정역 인근(정확한 위치는 추후 문자로 안내드립니다.)
                  </div>
                  <div className="text-xs text-[#b3b3b3]">
                    탑승 시간: 10월 30일 오후 5시
                  </div>
                </div>
              </div>
            )}

            {/* 결제 정보 */}
            <div className="p-4 rounded-lg border border-[#404040]">
              <h4 className="text-sm font-medium text-[#F8D1E7] mb-2">
                결제 정보
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#e5e5e5]">관람 인원:</span>
                  <span className="font-medium text-[#e5e5e5]">
                    {formData.attendeeCount}명
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e5e5e5]">1인당 가격:</span>
                  <span className="font-medium text-[#e5e5e5]">₩20,000</span>
                </div>
                <div className="border-t border-[#404040] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#F8D1E7] font-semibold">
                      총 결제 금액:
                    </span>
                    <span className="text-[#F8D1E7] font-bold text-lg">
                      ₩{(formData.attendeeCount * 20000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 안내사항 */}
          <div className="p-4 rounded-lg border border-[#404040] mb-6">
            <h4 className="text-sm font-medium text-[#F8D1E7] mb-2">
              안내사항
            </h4>
            <ul className="text-xs text-[#b3b3b3] space-y-1">
              <li>• 예매 완료 시 선택하신 소품이 퍼포먼스에 등장합니다</li>
              <li>• 결제 완료 후 예매가 확정됩니다</li>
              <li>• 대절버스 이용 시 지정된 시간과 장소에서 탑승해주세요</li>
              <li>• 문의사항은 010-7168-6144로 연락주세요</li>
            </ul>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-4 py-2 bg-[#404040] text-[#e5e5e5] hover:bg-[#505050] transition-colors"
            >
              수정하기
            </button>

            <button
              onClick={handleConfirmPayment}
              className="flex-1 px-4 py-2 bg-[#F8D1E7] text-[#1a1a1a] hover:bg-[#f0c4d8] transition-colors font-medium"
            >
              결제 진행
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-[#2d2d2d] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-[#F8D1E7] px-6 py-4 sticky top-0 relative">
          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-[#1a1a1a] text-4xl font-light hover:text-[#404040] transition-colors z-10"
          >
            ×
          </button>

          <h2 className="text-xl font-bold text-center text-[#1a1a1a]">
            퍼포먼스 예매
          </h2>
          <p className="text-sm text-center text-[#1a1a1a] mt-1">
            예매 완료시 선택해주신 &apos;{propName}&apos;이(가) 퍼포먼스에 소품으로
            등장합니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 관객 정보 입력 제목 */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-[#e5e5e5]">관객 정보 입력</h3>
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-[#e5e5e5] mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name-input"
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onFocus={() => toggleKeyboard("name")}
              readOnly
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#404040] text-[#e5e5e5] ${
                errors.name ? "border-red-500" : "border-[#404040]"
              } ${
                showKeyboard && activeField === "name"
                  ? "ring-4 ring-pink-200 shadow-lg"
                  : ""
              }`}
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-[#e5e5e5] mb-1">
              핸드폰 번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone-input"
              ref={phoneInputRef}
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onFocus={() => toggleKeyboard("phone")}
              readOnly
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#404040] text-[#e5e5e5] ${
                errors.phone ? "border-red-500" : "border-[#404040]"
              } ${
                showKeyboard && activeField === "phone"
                  ? "ring-4 ring-pink-200 shadow-lg"
                  : ""
              }`}
              placeholder="010-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 인원 수 선택 */}
          <div>
            <label className="block text-sm font-medium text-[#e5e5e5] mb-1">
              인원 수 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.attendeeCount}
              onChange={(e) =>
                handleInputChange("attendeeCount", parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#404040] text-[#e5e5e5] border-[#404040]"
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}명
                </option>
              ))}
            </select>
            {errors.attendeeCount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.attendeeCount}
              </p>
            )}
          </div>

          {/* 대절버스 이용여부 */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.busService}
                onChange={(e) =>
                  handleInputChange("busService", e.target.checked)
                }
                className="w-4 h-4 text-[#F8D1E7] border-[#404040] focus:ring-[#F8D1E7]"
              />
              <span className="text-sm font-medium text-[#e5e5e5]">
                대절버스 이용(무료)
              </span>
            </label>
          </div>

          {/* 대절버스 이용 인원 선택 */}
          {formData.busService && (
            <div>
              <label className="block text-sm font-medium text-[#e5e5e5] mb-1">
                대절버스 탑승 인원 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.busAttendeeCount}
                onChange={(e) =>
                  handleInputChange(
                    "busAttendeeCount",
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#404040] text-[#e5e5e5] border-[#404040]"
              >
                {Array.from(
                  { length: formData.attendeeCount },
                  (_, i) => i + 1
                ).map((count) => (
                  <option key={count} value={count}>
                    {count}명
                  </option>
                ))}
              </select>
              {errors.busAttendeeCount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.busAttendeeCount}
                </p>
              )}
            </div>
          )}

          {/* 대절버스 위치 정보 */}
          <div className="p-4 rounded-lg">
            <h4 className="text-sm font-medium text-[#e5e5e5] mb-2">
              대절버스 탑승 위치
            </h4>
            <p className="text-sm text-[#b3b3b3] mb-3">
              10월 30일 오후 5시 합정역 인근(정확한 위치는 추후 안내드립니다)
            </p>

            {/* 카카오맵 실제 지도퍼가기 - 세아타워 위치 (이미지 크기에 맞춤) */}
            <div className="w-full h-52 overflow-hidden">
              <div
                id="daumRoughmapContainer1755930369777"
                className="w-full h-full"
              ></div>
            </div>
          </div>

          {/* 개인정보 이용 동의 */}
          <div className="border-t border-[#404040] pt-4">
            <div className="bg-[#404040] p-4 mb-3">
              <h4 className="text-sm font-medium text-[#e5e5e5] mb-2">
                개인정보 이용 내용
              </h4>
              <p className="text-xs text-[#b3b3b3] leading-relaxed">
                입력하신 개인정보는 퍼포먼스 예매 및 안내, 대절버스 서비스 제공을
                위해 이용됩니다. 수집된 정보는 퍼포먼스 종료 직후 폐기됩니다.
              </p>
            </div>

            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacyAgreement}
                onChange={(e) =>
                  handleInputChange("privacyAgreement", e.target.checked)
                }
                className="w-4 h-4 text-[#F8D1E7] border-[#404040] focus:ring-[#F8D1E7] mt-0.5"
              />
              <span className="text-sm text-[#e5e5e5]">
                위 개인정보 이용 내용을 읽고 동의합니다{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.privacyAgreement && (
              <p className="text-red-500 text-sm mt-1">
                {errors.privacyAgreement}
              </p>
            )}
          </div>

          {/* 결제 내용 */}
          <div className="border-t border-[#404040] pt-4">
            <div className="bg-[#F8D1E7]/20 p-4 border border-[#F8D1E7]/30">
              <h4 className="text-sm font-medium text-[#e5e5e5] mb-3">
                결제 내용
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#e5e5e5]">관람 인원:</span>
                  <span className="font-medium text-[#e5e5e5]">
                    {formData.attendeeCount}명
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e5e5e5]">1인당 가격:</span>
                  <span className="font-medium text-[#e5e5e5]">₩20,000</span>
                </div>
                <div className="border-t border-[#F8D1E7]/30 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#F8D1E7] font-semibold">
                      총 결제 금액:
                    </span>
                    <span className="text-[#F8D1E7] font-bold text-lg">
                      ₩{(formData.attendeeCount * 20000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#404040] text-[#e5e5e5] hover:bg-[#505050] transition-colors"
            >
              취소
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#F8D1E7] text-[#1a1a1a] hover:bg-[#f0c4d8] transition-colors font-medium"
            >
              결제하기
            </button>
          </div>
        </form>
      </div>

      {/* 한글 가상 키보드 */}
      {showKeyboard && (
        <div className="fixed inset-0 z-60 flex items-end justify-center">
          {/* 키보드 위쪽 영역은 투명하게 (입력 필드가 보이도록) */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => toggleKeyboard(activeField!)}
          />

          {/* 키보드 컨테이너 */}
          <div className="bg-white w-full max-w-4xl shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1),0_-4px_6px_-2px_rgba(0,0,0,0.05)] relative z-10">
            {/* ko-customKeyboard 컨테이너 */}
            <div
              ref={keyboardRef}
              data-keyboard-zone
              className="w-full bg-gray-100 overflow-hidden"
              style={{
                minHeight: "280px",
                position: "relative",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
