/**
 * Estágio do ciclo de vida de uma CampaignRecord — produzido apenas por
 * `CampaignService.create()`/`start()`/`finish()`, nunca definido
 * livremente pelo chamador.
 */
export type CampaignStatus = "draft" | "active" | "finished";
