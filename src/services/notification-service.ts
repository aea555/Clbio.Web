import { get, put } from "@/lib/service-factory";
import { ReadNotificationDto } from "@/types/dtos";

export const notificationService = {
  getAll: () => get<ReadNotificationDto[]>("/api/proxy/notifications"),
  markAsRead: (id: string) => put<void>(`/api/proxy/notifications/${id}/read`, {}),
  markAllAsRead: () => put<void>("/api/proxy/notifications/read-all", {}),
};