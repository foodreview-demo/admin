import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Store,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface FailedRefund {
  id: number;
  gatheringId: number;
  gatheringUuid: string;
  gatheringTitle: string;
  restaurantName: string;
  userId: number;
  userName: string;
  userEmail: string;
  depositAmount: number;
  impUid: string;
  merchantUid: string;
  refundReason: string | null;
  createdAt: string;
  gatheringTargetTime: string;
}

export function FailedRefundsPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['failed-refunds', page],
    queryFn: () => adminApi.getFailedRefunds(page, 10),
  });

  const completeMutation = useMutation({
    mutationFn: (participantId: number) => adminApi.markRefundCompleted(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failed-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const refunds: FailedRefund[] = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">환금 실패 관리</h1>
          <p className="text-gray-500 mt-1">
            {totalElements > 0
              ? `${totalElements}건의 환금 실패 건이 있습니다`
              : '환금 실패 건이 없습니다'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : refunds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">환금 실패 건이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모임 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{refund.gatheringTitle}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {refund.restaurantName}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(refund.gatheringTargetTime).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{refund.userName}</p>
                          <p className="text-sm text-gray-500">{refund.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {refund.depositAmount.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400">IMP: {refund.impUid}</p>
                        <p className="text-xs text-gray-400">주문: {refund.merchantUid}</p>
                        {refund.refundReason && (
                          <p className="text-xs text-red-500">실패 사유: {refund.refundReason}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(refund.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => completeMutation.mutate(refund.id)}
                        disabled={completeMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        수동 환금 완료
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">환금 실패 처리 안내</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 아임포트 관리자 페이지에서 직접 환금 처리를 진행해주세요.</li>
          <li>• 환금 완료 후 "수동 환금 완료" 버튼을 클릭하여 상태를 업데이트해주세요.</li>
          <li>• IMP UID와 주문번호를 참고하여 아임포트에서 해당 결제를 찾을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
