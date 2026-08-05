import type { Logo } from "./Logo.js";
import type { LogoRepository } from "./LogoRepository.js";

/**
 * Logo Service — implementa o "Logo Manager" (`BRANDING_HUB.md`, Capítulo 7): "administra o ativo de
 * logo enviado por uma empresa... garante que a versão correta seja servida a cada contexto de uso."
 * Restrito à referência do ativo — nenhuma geração de variação (clara/escura/ícone/horizontal/
 * vertical) é processada nesta Sprint, explicitamente fora de escopo ("geração automática de logos").
 */
export class LogoService {
  constructor(private readonly repository: LogoRepository) {}

  async submit(tenantId: string, assetReference: string): Promise<Logo> {
    const logo: Logo = { logoId: crypto.randomUUID(), tenantId, assetReference, uploadedAt: new Date() };
    return this.repository.create(logo);
  }

  async current(tenantId: string): Promise<Logo | undefined> {
    const logos = await this.repository.listByTenant(tenantId);
    return logos[logos.length - 1];
  }
}
