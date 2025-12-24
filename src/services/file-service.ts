import { get } from "@/lib/service-factory";
import { ViewPresignedUrlDto } from "@/types/dtos";

export const fileService = {
    view: async (workspaceId: string, key: string) => {
        var resp = await get<ViewPresignedUrlDto>(`/api/proxy/workspaces/${workspaceId}/files/view/${key}`)
        return resp?.url
    },
}