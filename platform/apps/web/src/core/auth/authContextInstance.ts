import { createContext } from "react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  readonly status: AuthStatus;
  readonly identity: string | undefined;
  readonly tenantId: string | undefined;
  readonly roles: readonly string[];
}

export interface AuthContextValue extends AuthState {
  readonly login: (identity: string, password: string, tenantId: string) => Promise<void>;
  readonly register: (identity: string, password: string) => Promise<void>;
  readonly logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
