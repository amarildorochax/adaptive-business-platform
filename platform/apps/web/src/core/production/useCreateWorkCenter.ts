import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { appendWorkCenterInCache } from "./productionCache.js";
import type { CreateWorkCenterRequestDto } from "./production.dto.js";

/** Command "CreateWorkCenter" (`POST /work-centers`, IMP-503). */
export function useCreateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkCenterRequestDto) => productionClient.createWorkCenter(payload),
    onSuccess: (workCenter) => appendWorkCenterInCache(queryClient, workCenter),
  });
}
