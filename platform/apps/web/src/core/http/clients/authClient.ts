import { apiClient } from "../client.js";
import type {
  AuthorizeRequestDto,
  AuthorizeResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  MeResponseDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from "../dtos/auth.dto.js";

/** Cliente HTTP de autenticação — espelha `apps/api/src/routes/auth.ts` (FUN-100), rota a rota. */
export const authClient = {
  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return apiClient.post("/auth/register", payload);
  },

  login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient.post("/auth/login", payload);
  },

  logout(): Promise<void> {
    return apiClient.post("/auth/logout");
  },

  refresh(): Promise<RefreshResponseDto> {
    return apiClient.post("/auth/refresh");
  },

  me(): Promise<MeResponseDto> {
    return apiClient.get("/auth/me");
  },

  authorize(payload: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
    return apiClient.post("/auth/authorize", payload);
  },
};
