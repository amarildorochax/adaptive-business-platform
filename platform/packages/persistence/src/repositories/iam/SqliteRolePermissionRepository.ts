import type { Role, RolePermission, RolePermissionRepository } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";

interface RolePermissionRow {
  role: string;
  permission: string;
}

/** Implementação real de `RolePermissionRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. `grant` nunca deduplica — mesma tolerância a concessões repetidas já presente em `FakeRolePermissionRepository`. */
export class SqliteRolePermissionRepository implements RolePermissionRepository {
  constructor(private readonly db: DatabaseSync) {}

  async grant(rolePermission: RolePermission): Promise<RolePermission> {
    this.db.prepare("INSERT INTO role_permissions (role, permission) VALUES (?, ?)").run(rolePermission.role, rolePermission.permission);
    return rolePermission;
  }

  async listByRole(role: Role): Promise<RolePermission[]> {
    const rows = this.db.prepare("SELECT role, permission FROM role_permissions WHERE role = ? ORDER BY id ASC").all(role) as unknown as RolePermissionRow[];
    return rows.map((row) => ({ role: row.role, permission: row.permission }));
  }
}
