import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import {
  Receipt,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

interface ReceiptReview {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  restaurantId: number;
  restaurantName: string;
  content: string;
  receiptImageUrl: string;
  verificationStatus: string;
  verificationScore: number | null;
  ocrText: string | null;
  createdAt: string;
}

export function ReceiptReviewsPage() {
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState<ReceiptReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['receipt-reviews', page],
    queryFn: () => adminApi.getPendingReceiptReviews(page, 10),
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId: number) => adminApi.approveReceipt(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowModal(false);
      setSelectedReview(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reviewId: number) => adminApi.rejectReceipt(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowModal(false);
      setSelectedReview(null);
    },
  });

  const reviews: ReceiptReview[] = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">영수증 검토</h1>
          <p className="text-gray-500 mt-1">
            {totalElements > 0 ? `${totalElements}건의 검토 대기 중` : '검토 대기 중인 영수증이 없습니다'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">검토 대기 중인 영수증이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 영수증 이미지 */}
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={review.receiptImageUrl}
                    alt="영수증"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowModal(true);
                    }}
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <Eye className="w-8 h-8 text-white" />
                  </button>
                </div>

                {/* 리뷰 정보 */}
                <div className="p-4">
                  <p className="font-medium text-gray-800 truncate">{review.restaurantName}</p>
                  <p className="text-sm text-gray-500 truncate">{review.userName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </p>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={isPending}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      승인
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(review.id)}
                      disabled={isPending}
                      className="flex-1 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      거부
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Detail Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">영수증 상세 검토</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* 영수증 이미지 */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">영수증 이미지</h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedReview.receiptImageUrl}
                    alt="영수증"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* 리뷰 정보 */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">리뷰 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <span className="text-gray-500">음식점:</span>{' '}
                      <span className="font-medium">{selectedReview.restaurantName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">작성자:</span>{' '}
                      {selectedReview.userName} ({selectedReview.userEmail})
                    </p>
                    <p>
                      <span className="text-gray-500">작성일:</span>{' '}
                      {new Date(selectedReview.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">리뷰 내용</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedReview.content}</p>
                  </div>
                </div>

                {selectedReview.verificationScore !== null && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">자동 검증 점수</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-orange-500">
                        {selectedReview.verificationScore}점
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => rejectMutation.mutate(selectedReview.id)}
                disabled={isPending}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                거부
              </button>
              <button
                onClick={() => approveMutation.mutate(selectedReview.id)}
                disabled={isPending}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
