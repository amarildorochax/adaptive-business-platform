import type { Report } from './Report';

/** Contrato de persistência de Report — apenas o contrato. */
export interface ReportRepository {
  create(report: Report): Promise<Report>;
  get(reportId: string): Promise<Report | undefined>;
  list(tenantId: string): Promise<Report[]>;
}
