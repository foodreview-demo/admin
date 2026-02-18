import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import { Users, FileText, Store, Flag, MessageSquare, Receipt, Building2, UsersRound, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const stats = data?.data;

  const statCards = [
    { label: '전체 사용자', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
    { label: '전체 리뷰', value: stats?.totalReviews || 0, icon: FileText, color: 'green' },
    { label: '등록된 음식점', value: stats?.totalRestaurants || 0, icon: Store, color: 'purple' },
    { label: '대기 중 리뷰 신고', value: stats?.pendingReports || 0, icon: Flag, color: 'red', link: '/reports' },
    { label: '대기 중 채팅 신고', value: stats?.pendingChatReports || 0, icon: MessageSquare, color: 'orange', link: '/chat-reports' },
    { label: '대기 중 영수증 검토', value: stats?.pendingReceiptReviews || 0, icon: Receipt, color: 'yellow', link: '/receipt-reviews' },
    { label: '대기 중 음식점 승인', value: stats?.pendingRestaurants || 0, icon: Building2, color: 'cyan', link: '/pending-restaurants' },
    { label: '진행 중 번개모임', value: stats?.activeGatherings || 0, icon: UsersRound, color: 'indigo', link: '/gatherings' },
    { label: '환금 실패 건', value: stats?.failedRefunds || 0, icon: AlertTriangle, color: 'pink', link: '/failed-refunds' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => {
          const content = (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    colorClasses[card.color as keyof typeof colorClasses]
                  }`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );

          return card.link ? (
            <Link key={card.label} to={card.link}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
}
