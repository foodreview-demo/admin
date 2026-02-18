import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import {
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Store,
  Calendar,
  User,
  Coins,
} from 'lucide-react';

interface Gathering {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  status: string;
  statusDisplay: string;
  refundType: string;
  refundTypeDisplay: string;
  targetTime: string;
  maxParticipants: number;
  currentParticipants: number;
  depositAmount: number;
  chatRoomUuid: string | null;
  restaurant: {
    id: number;
    name: string;
    address: string;
    category: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  RECRUITING: 'bg-green-100 text-green-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function GatheringsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['gatherings', page, statusFilter],
    queryFn: () => adminApi.getGatherings(statusFilter || undefined, page, 10),
  });

  const gatherings: Gathering[] = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">번개모임 관리</h1>
          <p className="text-gray-500 mt-1">
            {totalElements > 0 ? `총 ${totalElements}개의 모임` : '등록된 모임이 없습니다'}
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">전체 상태</option>
          <option value="RECRUITING">모집중</option>
          <option value="CONFIRMED">확정</option>
          <option value="IN_PROGRESS">진행중</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELLED">취소됨</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : gatherings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 모임이 없습니다</p>
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
                    음식점
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호스트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참여/보증금
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gatherings.map((gathering) => (
                  <tr key={gathering.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{gathering.title}</p>
                        {gathering.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {gathering.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(gathering.targetTime).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Store className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{gathering.restaurant.name}</p>
                          <p className="text-xs text-gray-500">{gathering.restaurant.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{gathering.creator.name}</p>
                          <p className="text-xs text-gray-500">{gathering.creator.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {gathering.currentParticipants}/{gathering.maxParticipants}명
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {gathering.depositAmount.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400">{gathering.refundTypeDisplay}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[gathering.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {gathering.statusDisplay}
                      </span>
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
    </div>
  );
}
