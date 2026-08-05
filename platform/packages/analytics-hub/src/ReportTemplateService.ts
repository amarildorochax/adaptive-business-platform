import type { ReportTemplate } from './ReportTemplate';
import type { ReportTemplateRepository } from './ReportTemplateRepository';

/** ReportTemplateService — nenhum precedente legado equivalente foi encontrado (`src/core/analytics` gera Report diretamente a partir de uma Snapshot, sem Template reutilizável intermediário). Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Report Template isoladamente. */
export class ReportTemplateService {
  constructor(private readonly repository: ReportTemplateRepository) {}

  async create(tenantId: string, name: string): Promise<ReportTemplate> {
    const reportTemplate: ReportTemplate = { reportTemplateId: crypto.randomUUID(), tenantId, name };
    return this.repository.create(reportTemplate);
  }

  async get(reportTemplateId: string): Promise<ReportTemplate | undefined> {
    return this.repository.get(reportTemplateId);
  }

  async list(tenantId: string): Promise<readonly ReportTemplate[]> {
    return this.repository.list(tenantId);
  }
}
