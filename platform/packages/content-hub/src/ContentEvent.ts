/**
 * Content Event — os dezenove Eventos de domínio do Content Hub, cada um um Fato consumado,
 * publicados exclusivamente pelo módulo produtor já indicado em `CONTENT_HUB_ARCHITECTURE.md`,
 * Capítulo 27 ("Este catálogo é a referência exclusiva de Eventos do Content Hub").
 *
 * Nota de escopo (IMP-004, Content Core): apenas quatro destes dezenove Eventos são de fato
 * emitidos pelo `ContentManager` desta Sprint (`ArticleCreated`, `ArticleUpdated`,
 * `ArticlePublished`, `ArticleArchived`) — os quinze restantes pertencem a módulos ainda não
 * implementados (Landing Page Builder, Form Builder, CTA Manager, Download Center, Newsletter
 * Manager, Web Stories Manager, SEO Manager, Media Library), listados em
 * CONTENT_CORE_MIGRATION_REPORT.md como pendentes de Sprint futura. O catálogo completo é
 * declarado aqui, e não apenas o subconjunto usado, porque é a Entidade de tipo já oficial do
 * domínio — mesmo padrão já aplicado a `CRMEvent.ts` e `CommEvent.ts`.
 */
export type ContentEventType =
  | 'ArticleCreated'
  | 'ArticleUpdated'
  | 'ArticlePublished'
  | 'ArticleFlaggedForUpdate'
  | 'ArticleArchived'
  | 'LandingPagePublished'
  | 'LandingPageArchived'
  | 'FormSubmitted'
  | 'LeadCaptured'
  | 'NewsletterSubscriptionRequested'
  | 'CTAConverted'
  | 'DownloadCompleted'
  | 'NewsletterIssuePublished'
  | 'StoryPublished'
  | 'SEOOptimized'
  | 'ContentClusterUpdated'
  | 'ContentFlaggedOutdated'
  | 'KeywordCanibalizationDetected'
  | 'MediaAssetUploaded';

export interface ContentEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: ContentEventType;

  /** Article ao qual este Evento se refere, quando aplicável. */
  readonly articleId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
