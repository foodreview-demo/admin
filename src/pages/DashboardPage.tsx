import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import { Users, FileText, Store, Flag } from 'lucide-react';
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
    { label: '대기 중 신고', value: stats?.pendingReports || 0, icon: Flag, color: 'red', link: '/reports' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
