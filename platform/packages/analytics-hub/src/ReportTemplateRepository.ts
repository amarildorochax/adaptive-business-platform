import type { ReportTemplate } from './ReportTemplate';

/** Contrato de persistência de Report Template — apenas o contrato. */
export interface ReportTemplateRepository {
  create(reportTemplate: ReportTemplate): Promise<ReportTemplate>;
  get(reportTemplateId: string): Promise<ReportTemplate | undefined>;
  list(tenantId: string): Promise<ReportTemplate[]>;
}
