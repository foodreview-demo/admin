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
  | 'FAKE_REVIEW'
  | 'NO_RECEIPT'
  | 'HARASSMENT'
  | 'COPYRIGHT'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  totalRestaurants: number;
  pendingReports: number;
  pendingChatReports: number;
}

export interface ChatReport {
  id: number;
  reporterId: number;
  reporterName: string;
  reporterEmail: string;
  reportedUserId: number;
  reportedUserName: string;
  reportedUserEmail: string;
  chatRoomId: number;
  chatRoomUuid: string;
  messageId?: number;
  messageContent?: string;
  reason: ChatReportReason;
  reasonDescription: string;
  description?: string;
  status: ReportStatus;
  statusDescription: string;
  adminNote?: string;
  processedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatReportReason =
  | 'HARASSMENT'
  | 'SPAM'
  | 'SEXUAL_HARASSMENT'
  | 'FRAUD'
  | 'INAPPROPRIATE'
  | 'OTHER';

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
