/**
 * Analytics Event Ingestion — o registro declarativo de que um Evento público, publicado por outro
 * Business Hub, foi consumido e consolidado em um Dataset pelo Dataset Manager, através de uma
 * Anti-Corruption Layer dedicada a cada integração (`ANALYTICS_HUB.md`, Capítulo 12).
 *
 * Esta é a integração central deste Hub: `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 15, é explícito —
 * "o Analytics é o primeiro domínio cuja razão de existir é consumir Evento de todos [os demais]
 * simultaneamente, sem jamais originar, em contrapartida, uma mudança de estado de volta a nenhum
 * desses domínios." A direção de dependência é estritamente unidirecional: de todo domínio
 * operacional em direção ao Analytics, nunca o inverso.
 *
 * `sourceHub` e `sourceEventType` são ambos `string` opacos — nunca `CRMEventType`, `CommEventType`,
 * ou `FinEventType` importados de `@abp/crm-hub`, `@abp/communication-hub`, ou `@abp/finance-hub`.
 * Nenhum tipo de nenhum outro Business Hub é importado por este arquivo, preservando a ausência
 * total de dependência estrutural exigida por esta Sprint.
 */
export type AnalyticsSourceHub = "CRM" | "Communication" | "Finance" | "Growth";

export interface AnalyticsEventIngestion {
  /** Hub de origem do Evento consumido — identificador opaco, nunca um import de outro pacote. */
  readonly sourceHub: AnalyticsSourceHub;

  /** Tipo do Evento consumido, como publicado pelo Hub de origem — valor opaco (ex.: "OpportunityWon"). */
  readonly sourceEventType: string;

  /** Dataset no qual este Evento foi consolidado. */
  readonly datasetId: string;

  /** Momento da ingestão. */
  readonly ingestedAt: Date;
}
