import { apiClient } from "@/lib/axios-client";
import { UpdateUserDto } from "@/lib/schemas/schemas";
import { put } from "@/lib/service-factory";
import { ReadUserDto, ApiResponse, UploadAvatarResponse } from "@/types/dtos";

export const userService = {
  /**
   * Update the current user's profile (DisplayName, Avatar, etc.)
   * PUT /api/proxy/users/profile
   */
  updateProfile: (data: UpdateUserDto) =>
    put<ReadUserDto>(`/api/proxy/users/me`, data),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("File", file);

    const { data } = await apiClient.post<ApiResponse<UploadAvatarResponse>>(
      "/api/proxy/users/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        } as any,
      }
    );

    return data.data!;
  },

  deleteAvatar: async () => {
    const { data } = await apiClient.delete<ApiResponse<string>>(
      "/api/proxy/users/me/avatar"
    );

    return data;
  },
};