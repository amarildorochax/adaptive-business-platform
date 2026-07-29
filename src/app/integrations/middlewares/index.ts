// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos 13 Middlewares do Integration
// Pipeline, mais `allPipelineMiddlewares` (a lista completa, na ordem
// de `priority`, consumida por `registry/PipelineFactory`).

import { correlationIdMiddleware } from './CorrelationIdMiddleware';
import { requestIdMiddleware } from './RequestIdMiddleware';
import { authenticationMiddleware } from './AuthenticationMiddleware';
import { authorizationMiddleware } from './AuthorizationMiddleware';
import { permissionsMiddleware } from './PermissionsMiddleware';
import { featureFlagsMiddleware } from './FeatureFlagsMiddleware';
import { validationMiddleware } from './ValidationMiddleware';
import { circuitBreakerMiddleware } from './CircuitBreakerMiddleware';
import { cacheMiddleware } from './CacheMiddleware';
import { retryMiddleware } from './RetryMiddleware';
import { timeoutMiddleware } from './TimeoutMiddleware';
import { telemetryMiddleware } from './TelemetryMiddleware';
import { loggingMiddleware } from './LoggingMiddleware';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';

export * from './CorrelationIdMiddleware';
export * from './RequestIdMiddleware';
export * from './AuthenticationMiddleware';
export * from './AuthorizationMiddleware';
export * from './PermissionsMiddleware';
export * from './FeatureFlagsMiddleware';
export * from './ValidationMiddleware';
export * from './CircuitBreakerMiddleware';
export * from './CacheMiddleware';
export * from './RetryMiddleware';
export * from './TimeoutMiddleware';
export * from './TelemetryMiddleware';
export * from './LoggingMiddleware';

export const allPipelineMiddlewares: PipelineMiddleware[] = [
  correlationIdMiddleware,
  requestIdMiddleware,
  authenticationMiddleware,
  authorizationMiddleware,
  permissionsMiddleware,
  featureFlagsMiddleware,
  validationMiddleware,
  circuitBreakerMiddleware,
  cacheMiddleware,
  retryMiddleware,
  timeoutMiddleware,
  telemetryMiddleware,
  loggingMiddleware,
];
