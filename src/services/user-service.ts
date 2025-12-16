import { apiClient } from "@/lib/axios-client";
import { UpdateUserDto } from "@/lib/schemas/schemas"; 
import { put } from "@/lib/service-factory";
import { ReadUserDto, ApiResponse } from "@/types/dtos";

export const userService = {
  /**
   * Update the current user's profile (DisplayName, Avatar, etc.)
   * PUT /api/proxy/users/profile
   */
  updateProfile: (data: UpdateUserDto) =>
    put<ReadUserDto>(`/api/proxy/users`, data),
};