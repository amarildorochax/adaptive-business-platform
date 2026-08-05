import type { AudienceSegment } from './AudienceSegment';
import type { AudienceSegmentRepository } from './AudienceSegmentRepository';

/**
 * AudienceSegmentService — nenhum precedente legado equivalente foi encontrado:
 * `src/core/marketing/CustomerSegmentation.ts` computa seis segmentos fixos como analítica derivada
 * pontual (`MarketingSegment[]`), sem persistência e sem vínculo com uma Audience específica —
 * conceito e granularidade diferentes do Audience Segment aprovado (ver relatório desta Sprint,
 * "Componentes Fora de Escopo"). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * GrowthManager.
 */
export class AudienceSegmentService {
  constructor(private readonly repository: AudienceSegmentRepository) {}

  /**
   * Recalcula a composição de um Audience Segment por critério — cria na primeira chamada para um
   * dado `criterion`, atualiza `updatedAt` nas chamadas seguintes. `UpdateSegment` (o único Command
   * aprovado para esta Entidade) cobre ambos os casos — não existe um Command "CreateSegment"
   * separado no catálogo já Frozen.
   */
  async recompute(audienceId: string, criterion: string): Promise<AudienceSegment> {
    const existing = await this.repository.findByCriterion(audienceId, criterion);

    if (existing) {
      return this.repository.update({ ...existing, updatedAt: new Date() });
    }

    return this.repository.create({
      audienceSegmentId: crypto.randomUUID(),
      audienceId,
      criterion,
      updatedAt: new Date(),
    });
  }

  async get(audienceSegmentId: string): Promise<AudienceSegment | undefined> {
    return this.repository.get(audienceSegmentId);
  }

  async list(audienceId: string): Promise<readonly AudienceSegment[]> {
    return this.repository.list(audienceId);
  }
}
