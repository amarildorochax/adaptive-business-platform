import type { Role } from './Role';
import type { RolePermission } from './RolePermission';

/** Contrato de persistência de Role Permission — apenas o contrato. */
export interface RolePermissionRepository {
  grant(rolePermission: RolePermission): Promise<RolePermission>;
  listByRole(role: Role): Promise<RolePermission[]>;
}
