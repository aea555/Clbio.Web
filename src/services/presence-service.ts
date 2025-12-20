import { post } from "@/lib/service-factory";

export const presenceService = {
  heartbeat: () => post("/api/proxy/presence/heartbeat", {}),

  check: (userIds: string[]) => post<string[]>("/api/proxy/presence/check", userIds)
};