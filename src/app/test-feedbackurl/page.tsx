'use client';

export default function TestFeedbackUrlPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const feedbackUrl = `${currentUrl}/api/payment-callback`;
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          PayApp feedbackurl 테스트 페이지
        </h1>
        
        {/* 현재 설정된 feedbackurl */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            현재 설정된 feedbackurl
          </h2>
          <div className="bg-gray-50 p-4 rounded border">
            <code className="text-blue-600 break-all text-lg">
              {feedbackUrl}
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            이 URL이 PayApp 공통 통보 URL과 일치해야 합니다.
          </p>
        </div>

        {/* PayApp API 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            PayApp API 정보
          </h2>
          <div className="space-y-3 text-gray-600">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p><strong>API URL:</strong> https://api.payapp.kr/oapi/apiLoad.html</p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Content-Type:</strong> application/x-www-form-urlencoded</p>
            </div>
            <p className="text-sm">PayApp 공식 문서: <a href="https://www.payapp.kr/dev_center/dev_center01.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.payapp.kr/dev_center/dev_center01.html</a></p>
          </div>
        </div>

        {/* 테스트 방법 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            테스트 방법
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">1. GET 요청 테스트</h4>
              <p className="text-sm text-green-700">위 feedbackurl을 브라우저에서 직접 접속하여 API 엔드포인트가 정상 작동하는지 확인</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">2. POST 요청 테스트</h4>
              <p className="text-sm text-blue-700">Postman이나 curl로 실제 PayApp 결제 완료 데이터를 시뮬레이션하여 전송</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">3. Vercel 로그 확인</h4>
              <p className="text-sm text-yellow-700">Vercel 대시보드에서 함수 호출 로그와 에러 메시지 확인</p>
            </div>
          </div>
        </div>

        {/* curl 테스트 명령어 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            curl 테스트 명령어
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">기본 결제 완료 테스트</h4>
              <div className="bg-gray-50 p-4 rounded border">
                <code className="text-green-600 break-all text-sm">
                  curl -X POST {feedbackUrl} \
                  -H "Content-Type: application/x-www-form-urlencoded" \
                  -d "mul_no=TEST123&state=1&price=20000&goodname=테스트상품&userid=kiosk&shopname=공연예매"
                </code>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">결제 실패 테스트</h4>
              <div className="bg-gray-50 p-4 rounded border">
                <code className="text-red-600 break-all text-sm">
                  curl -X POST {feedbackUrl} \
                  -H "Content-Type: application/x-www-form-urlencoded" \
                  -d "mul_no=TEST456&state=0&errorMessage=결제취소&userid=kiosk&shopname=공연예매"
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* PayApp 필수 파라미터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            PayApp feedbackurl 필수 파라미터
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">파라미터</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">설명</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">예시</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">mul_no</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">결제요청 번호</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">TEST123</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">state</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">결제 상태 (1:성공, 0:실패)</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">1</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">price</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">결제 금액</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">20000</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">goodname</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">상품명</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">테스트상품</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">userid</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">PayApp 사용자 ID</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">kiosk</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">shopname</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">상점명</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">공연예매</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 확인해야 할 것들 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            확인해야 할 것들
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">PayApp 공통 통보 URL 설정</p>
                <p className="text-sm text-gray-600">PayApp 관리자 페이지에서 공통 통보 URL이 위 feedbackurl과 동일하게 설정되어 있는지 확인</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">PayApp 연동 정보</p>
                <p className="text-sm text-gray-600">PAYAPP_USERID, PAYAPP_LINKKEY, PAYAPP_LINKVALUE 환경 변수가 올바르게 설정되어 있는지 확인</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Vercel 환경변수</p>
                <p className="text-sm text-gray-600">Vercel 프로젝트 설정에서 환경변수가 제대로 설정되어 있는지 확인</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">API 응답 확인</p>
                <p className="text-sm text-gray-600">feedbackurl이 'SUCCESS'를 반환하는지 확인 (PayApp 요구사항)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 코드 참고 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            PayApp 주요 에러 코드
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">에러코드</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">설명</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">해결방법</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">70001</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">보안접속(https)으로 호출하지 않을 경우</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">https로 호출하도록 수정</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">70010</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">userid, linkkey값이 정확하지 않을 경우</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">userid, linkkey값을 확인 후 수정</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">70020</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">파라메터값이 정확하지 않을 경우</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">전달한 파라메터값중 공백이나 잘못된 값이 입력된 경우 수정</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">70040</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">cmd값이 정확하지 않은 경우</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">cmd값을 확인 후 연동하고자 하는 api cmd값으로 수정</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">70080</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">고객사 응답 실패일 경우</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">고객사 feedbackurl로 접속하여 SUCCESS 확인</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <a href="https://www.payapp.kr/dev_center/dev_center01.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              전체 에러 코드는 PayApp 공식 문서를 참고하세요
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
