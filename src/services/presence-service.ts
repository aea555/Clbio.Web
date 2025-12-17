import { post } from "@/lib/service-factory";

export const presenceService = {
  heartbeat: () => post("/api/proxy/presence/heartbeat", {}),
};