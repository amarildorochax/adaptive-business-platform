import type { IModule } from '@/shared/interfaces';

/**
 * Registro central dos módulos de negócio da plataforma (`src/modules/*`),
 * indexado por `id` (IModule).
 *
 * Responsabilidade: manter o cadastro dos módulos já carregados por
 * ModuleLoader e permitir sua consulta genérica — o mesmo papel que
 * AgentRegistry cumpre para Agent.
 *
 * Objetivo (Sprint 0B): ser o destino do carregamento realizado por
 * InitializeRuntimeStep durante o boot da plataforma.
 *
 * Dependências: IModule (tipo, `@/shared/interfaces`).
 */
export class ModuleRegistry {
  private modules = new Map<string, IModule>();

  /** Registra (ou substitui, se já existir o mesmo `id`) um módulo. */
  register(module: IModule): void {
    this.modules.set(module.id, module);
  }

  /** Remove o módulo de `id` do registro, se existir. */
  unregister(id: string): void {
    this.modules.delete(id);
  }

  /** Retorna o módulo de `id`, ou `undefined` se não estiver registrado. */
  get(id: string): IModule | undefined {
    return this.modules.get(id);
  }

  /** Retorna todos os módulos já registrados. */
  getAll(): IModule[] {
    return Array.from(this.modules.values());
  }

  /** Remove todos os módulos do registro. */
  clear(): void {
    this.modules.clear();
  }

  /** Quantidade total de módulos registrados. */
  count(): number {
    return this.modules.size;
  }
}
