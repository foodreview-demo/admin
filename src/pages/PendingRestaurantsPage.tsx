import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import type { PendingRestaurant } from '../types';
import {
  Store,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MapPin,
} from 'lucide-react';

export function PendingRestaurantsPage() {
  const [page, setPage] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState<PendingRestaurant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-restaurants', page],
    queryFn: () => adminApi.getPendingRestaurants(page, 10),
  });

  const approveMutation = useMutation({
    mutationFn: (restaurantId: number) => adminApi.approveRestaurant(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowModal(false);
      setSelectedRestaurant(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminApi.rejectRestaurant(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowModal(false);
      setShowRejectModal(false);
      setSelectedRestaurant(null);
      setRejectReason('');
    },
  });

  const restaurants: PendingRestaurant[] = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleReject = () => {
    if (!selectedRestaurant || !rejectReason.trim()) return;
    rejectMutation.mutate({ id: selectedRestaurant.id, reason: rejectReason });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">음식점 승인</h1>
          <p className="text-gray-500 mt-1">
            {totalElements > 0 ? `${totalElements}건의 승인 대기 중` : '승인 대기 중인 음식점이 없습니다'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">승인 대기 중인 음식점이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 간판 이미지 */}
                <div className="aspect-video bg-gray-100 relative">
                  {restaurant.signboardImageUrl ? (
                    <img
                      src={restaurant.signboardImageUrl}
                      alt="간판"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setShowModal(true);
                    }}
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <Eye className="w-8 h-8 text-white" />
                  </button>
                </div>

                {/* 음식점 정보 */}
                <div className="p-4">
                  <p className="font-medium text-gray-800 truncate">{restaurant.name}</p>
                  <p className="text-sm text-gray-500">{restaurant.categoryDisplay}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    등록자: {restaurant.registeredByName || '알 수 없음'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(restaurant.createdAt).toLocaleDateString('ko-KR')}
                  </p>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveMutation.mutate(restaurant.id)}
                      disabled={isPending}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      승인
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        setShowRejectModal(true);
                      }}
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
      {showModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">음식점 상세 정보</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* 간판 이미지 */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">간판 이미지</h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  {selectedRestaurant.signboardImageUrl ? (
                    <img
                      src={selectedRestaurant.signboardImageUrl}
                      alt="간판"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="aspect-video flex items-center justify-center">
                      <Store className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* 음식점 정보 */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">음식점 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <span className="text-gray-500">음식점명:</span>{' '}
                      <span className="font-medium">{selectedRestaurant.name}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">카테고리:</span>{' '}
                      {selectedRestaurant.categoryDisplay}
                    </p>
                    <p>
                      <span className="text-gray-500">주소:</span>{' '}
                      {selectedRestaurant.address}
                    </p>
                    <p>
                      <span className="text-gray-500">지역:</span>{' '}
                      {selectedRestaurant.region} {selectedRestaurant.district} {selectedRestaurant.neighborhood}
                    </p>
                    {selectedRestaurant.latitude && selectedRestaurant.longitude && (
                      <p>
                        <span className="text-gray-500">좌표:</span>{' '}
                        {selectedRestaurant.latitude.toFixed(6)}, {selectedRestaurant.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">등록 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <span className="text-gray-500">등록자:</span>{' '}
                      {selectedRestaurant.registeredByName || '알 수 없음'}
                    </p>
                    <p>
                      <span className="text-gray-500">등록일:</span>{' '}
                      {new Date(selectedRestaurant.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
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
                onClick={() => {
                  setShowModal(false);
                  setShowRejectModal(true);
                }}
                disabled={isPending}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                거부
              </button>
              <button
                onClick={() => approveMutation.mutate(selectedRestaurant.id)}
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

      {/* Reject Modal */}
      {showRejectModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">음식점 거부</h2>
              <p className="text-gray-500 mt-1">{selectedRestaurant.name}</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거부 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거부 사유를 입력해주세요"
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                거부
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
