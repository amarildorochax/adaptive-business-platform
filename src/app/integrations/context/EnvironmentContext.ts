// EnvironmentContext.ts
//
// Responsabilidade:
// Ambiente de execução — preparado para middlewares que precisem se
// comportar diferente em desenvolvimento/produção/teste (ex.: um futuro
// `CircuitBreakerMiddleware` mais tolerante em `development`). Nenhum
// middleware desta Sprint consulta este valor para decisão real.

export type EnvironmentMode = 'development' | 'production' | 'test';

export interface EnvironmentContext {
  mode: EnvironmentMode;
}
