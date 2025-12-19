import { AxiosResponse } from "axios";
import { apiClient } from "./axios-client";
import { ApiResponse, ReadTaskItemDto } from "@/types/dtos";

export async function get<T>(url: string) {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data.data;
}

export async function post<T>(url: string, payload: any) {
  const { data } = await apiClient.post<ApiResponse<T>>(url, payload);
  return data.data;
}

export async function put<T>(url: string, payload: any) {
  const { data } = await apiClient.put<ApiResponse<T>>(url, payload);
  return data.data;
}

export async function patch<T>(url: string, payload: any) {
  const { data } = await apiClient.patch<ApiResponse<T>>(url, payload);
  return data.data;
}

export async function del(url: string) {
  await apiClient.delete(url);
}

export async function del_1<T>(url: string) {
  const { data }: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url);
  return data.data;
}