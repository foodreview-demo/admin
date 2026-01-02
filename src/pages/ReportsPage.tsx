import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import type { Report, ReportStatus } from '../types';
import {
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';

const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof Flag }> = {
  PENDING: { label: '대기 중', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  RESOLVED: { label: '처리 완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: '반려', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const reasonLabels: Record<string, string> = {
  SPAM: '스팸/광고',
  INAPPROPRIATE: '부적절한 내용',
  FAKE_REVIEW: '허위 리뷰',
  NO_RECEIPT: '영수증 미첨부',
  HARASSMENT: '비방/욕설',
  COPYRIGHT: '저작권 침해',
  OTHER: '기타',
};

export function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [page, setPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reports', statusFilter, page],
    queryFn: () => adminApi.getReports(statusFilter || undefined, page, 10),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { action: 'RESOLVE' | 'REJECT'; adminNote?: string; deleteReview?: boolean } }) =>
      adminApi.processReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowModal(false);
      setSelectedReport(null);
    },
  });

  const reports: Report[] = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const handleProcess = (action: 'RESOLVE' | 'REJECT', deleteReview = false) => {
    if (!selectedReport) return;
    processMutation.mutate({
      id: selectedReport.id,
      data: { action, deleteReview },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">신고 관리</h1>

        <div className="flex gap-2">
          {['', 'PENDING', 'RESOLVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === '' ? '전체' : statusConfig[status as ReportStatus].label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">신고 내역이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">리뷰 내용</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">신고 사유</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">신고자</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">신고일</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => {
                  const status = statusConfig[report.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">#{report.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 line-clamp-2 max-w-xs">
                          {report.reviewContent}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {report.reviewerName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reasonLabels[report.reason] || report.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.reporterName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">신고 상세 #{selectedReport.id}</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 리뷰 정보 */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">신고된 리뷰</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 mb-2">{selectedReport.reviewContent}</p>
                  <div className="text-sm text-gray-500">
                    <p>작성자: {selectedReport.reviewerName} ({selectedReport.reviewerEmail})</p>
                    <p>음식점: {selectedReport.restaurantName}</p>
                  </div>
                </div>
              </div>

              {/* 신고 정보 */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">신고 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="text-gray-500">신고자:</span>{' '}
                    {selectedReport.reporterName} ({selectedReport.reporterEmail})
                  </p>
                  <p>
                    <span className="text-gray-500">사유:</span>{' '}
                    {reasonLabels[selectedReport.reason]}
                  </p>
                  {selectedReport.description && (
                    <p>
                      <span className="text-gray-500">상세 내용:</span>{' '}
                      {selectedReport.description}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">신고일:</span>{' '}
                    {new Date(selectedReport.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>

              {/* 처리 정보 (이미 처리된 경우) */}
              {selectedReport.status !== 'PENDING' && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">처리 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p>
                      <span className="text-gray-500">상태:</span>{' '}
                      {statusConfig[selectedReport.status].label}
                    </p>
                    {selectedReport.processedByName && (
                      <p>
                        <span className="text-gray-500">처리자:</span>{' '}
                        {selectedReport.processedByName}
                      </p>
                    )}
                    {selectedReport.adminNote && (
                      <p>
                        <span className="text-gray-500">관리자 메모:</span>{' '}
                        {selectedReport.adminNote}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                닫기
              </button>

              {selectedReport.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleProcess('REJECT')}
                    disabled={processMutation.isPending}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => handleProcess('RESOLVE', false)}
                    disabled={processMutation.isPending}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    처리 완료
                  </button>
                  <button
                    onClick={() => handleProcess('RESOLVE', true)}
                    disabled={processMutation.isPending}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    리뷰 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
