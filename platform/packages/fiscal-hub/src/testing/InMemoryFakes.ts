import type { FiscalDocument } from '../FiscalDocument';
import type { FiscalDocumentRepository } from '../FiscalDocumentRepository';
import type { FiscalObligation } from '../FiscalObligation';
import type { FiscalObligationRepository } from '../FiscalObligationRepository';
import { isTaxRuleApplicable } from '../FiscalPolicy';
import type { TaxClassification } from '../TaxClassification';
import type { TaxRegime } from '../TaxRegime';
import type { TaxRegimeRepository } from '../TaxRegimeRepository';
import type { TaxRule } from '../TaxRule';
import type { TaxRuleRepository } from '../TaxRuleRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-601, mesmo padrão de
 * `packages/production-hub/src/testing/InMemoryFakes.ts`). Nunca exportados pelo barrel do pacote
 * (`index.ts`) — apenas pelo subpath `@abp/fiscal-hub/testing`, per `package.json`, `exports`. O
 * pacote de produção expõe apenas o contrato de Repository, nunca uma implementação de persistência
 * real — essa é escopo de uma Sprint futura (IMP-602).
 */

export class FakeTaxRegimeRepository implements TaxRegimeRepository {
  private readonly rows = new Map<string, TaxRegime>();

  async findByTenant(tenantId: string) {
    return [...this.rows.values()].find((regime) => regime.tenantId === tenantId);
  }

  async save(regime: TaxRegime) {
    this.rows.set(regime.taxRegimeId, regime);
    return regime;
  }
}

export class FakeTaxRuleRepository implements TaxRuleRepository {
  private readonly rows = new Map<string, TaxRule>();

  async findApplicable(taxRegimeId: string, classification: TaxClassification, date: Date) {
    return [...this.rows.values()].find(
      (rule) =>
        rule.taxRegimeId === taxRegimeId &&
        rule.classification.code === classification.code &&
        isTaxRuleApplicable(rule, date),
    );
  }

  async findById(taxRuleId: string) {
    return this.rows.get(taxRuleId);
  }

  async save(rule: TaxRule) {
    this.rows.set(rule.taxRuleId, rule);
    return rule;
  }
}

export class FakeFiscalDocumentRepository implements FiscalDocumentRepository {
  private readonly rows = new Map<string, FiscalDocument>();

  async findById(fiscalDocumentId: string) {
    return this.rows.get(fiscalDocumentId);
  }

  async findByOrigin(orderId: string) {
    return [...this.rows.values()].filter((document) => document.orderId === orderId);
  }

  async save(document: FiscalDocument) {
    this.rows.set(document.fiscalDocumentId, document);
    return document;
  }
}

export class FakeFiscalObligationRepository implements FiscalObligationRepository {
  private readonly rows = new Map<string, FiscalObligation>();

  async findPending() {
    return [...this.rows.values()].filter((obligation) => obligation.status === 'Pending');
  }

  async findOverdue() {
    return [...this.rows.values()].filter((obligation) => obligation.status === 'Overdue');
  }

  async findById(fiscalObligationId: string) {
    return this.rows.get(fiscalObligationId);
  }

  async save(obligation: FiscalObligation) {
    this.rows.set(obligation.fiscalObligationId, obligation);
    return obligation;
  }
}
