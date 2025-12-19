import { del, get, patch } from "@/lib/service-factory";
import { ApiResponse, NotificationUnreadCount, PaginatedResult, ReadNotificationDto } from "@/types/dtos";

export const notificationService = {
  getAll: (page: number = 1, pageSize: number = 10, unreadOnly: boolean = false) => 
    get<PaginatedResult<ReadNotificationDto>>(`/api/proxy/notifications?page=${page}&pageSize=${pageSize}&unreadOnly=${unreadOnly}`),
  getUnreadCount: () => get<NotificationUnreadCount>("/api/proxy/notifications/unread-count"),
  markAsRead: (id: string) => patch<void>(`/api/proxy/notifications/${id}/read`, {}),
  markAllAsRead: () => patch<void>("/api/proxy/notifications/read-all", {}),
  delete: (id: string) => del(`/api/proxy/notifications/${id}`)
};