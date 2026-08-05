import type { Logo } from "./Logo.js";

/** Logo Repository — cada envio é um fato imutável; nunca `update` nem `remove`. O Logo vigente é sempre o último em ordem de inserção. */
export interface LogoRepository {
  create(logo: Logo): Promise<Logo>;
  listByTenant(tenantId: string): Promise<readonly Logo[]>;
}
