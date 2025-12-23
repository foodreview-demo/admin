export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  tasteScore: number;
  region: string;
}

export interface Report {
  id: number;
  reviewId: number;
  reviewContent: string;
  reviewerName: string;
  reviewerEmail: string;
  restaurantName: string;
  reporterName: string;
  reporterEmail: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  processedByName?: string;
  createdAt: string;
  processedAt?: string;
}

export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'FALSE_INFO'
  | 'COPYRIGHT'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  totalRestaurants: number;
  pendingReports: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
