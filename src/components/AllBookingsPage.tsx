'use client';

import { useState, useEffect } from 'react';

interface BookingData {
  audience_id: number;
  name: string;
  phone: string;
  bus_service: number;
  bus_details: string;
  prop_name: string;
  booking_status: string;
  booking_date: string;
}

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 페이지 로드 시 모든 예매 내역 가져오기
  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    setError('');

    try {
      // 모든 예매 내역을 가져오는 새로운 API 엔드포인트 사용
      const response = await fetch('/api/audience/save');
      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
        if (result.data.length === 0) {
          setError('아직 예매 내역이 없습니다.');
        }
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBusDetails = (busDetails: string) => {
    if (!busDetails) return '없음';
    try {
      const details = JSON.parse(busDetails);
      return `${details.attendeeCount}명`;
    } catch {
      return busDetails;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">전체 예매 내역</h1>
          <p className="text-gray-600">모든 예매 정보를 한눈에 확인하세요</p>
        </div>

        {/* 새로고침 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={fetchAllBookings}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* 검색 결과 */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                예매 내역 ({bookings.length}건)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예매 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관객 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      버스 이용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예매 상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">선택 소품: {booking.prop_name}</p>
                          <p className="text-gray-500">예매일: {formatDate(booking.booking_date)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{booking.name}</p>
                          <p className="text-gray-500">{booking.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {booking.bus_service ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              이용 ({formatBusDetails(booking.bus_details)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              미이용
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {booking.booking_status === 'confirmed' ? '확정' : booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">📊 표시 정보</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>예매 정보</strong>: 선택된 소품, 예매 일시</li>
            <li>• <strong>관객 정보</strong>: 이름, 전화번호</li>
            <li>• <strong>버스 이용</strong>: 대절버스 이용 여부 및 탑승 인원</li>
            <li>• <strong>예매 상태</strong>: 예매 확정 여부</li>
            <li>• <strong>새로고침</strong>: 최신 예매 정보를 불러옵니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
