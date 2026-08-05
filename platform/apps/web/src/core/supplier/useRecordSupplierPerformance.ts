import { useMutation } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import type { RecordSupplierPerformanceRequestDto } from "./supplier.dto.js";

/** Command "RecordSupplierPerformance" (`POST /supplier-performance-records`, IMP-203). Sem sincronização de cache — nenhuma Query de histórico de desempenho existe ainda nesta camada, mesma razão de `useRegisterSupplierCatalogItem`. */
export function useRecordSupplierPerformance() {
  return useMutation({
    mutationFn: (payload: RecordSupplierPerformanceRequestDto) => supplierClient.recordPerformance(payload),
  });
}
