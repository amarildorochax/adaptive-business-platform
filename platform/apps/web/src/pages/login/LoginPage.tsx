import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@core/auth/useAuth";
import { ApiError } from "@core/http/ApiError";
import { DEMO_TENANT_ID } from "@core/managers/seedDemoData";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";

type Mode = "login" | "register";

function toUserMessage(error: unknown): string {
  return error instanceof ApiError ? error.toUserMessage() : "Não foi possível concluir a operação. Tente novamente.";
}

/**
 * Tela de Login (FUN-100, restilizada na UX-001) — única rota fora de `AppLayout` (sem Sidebar/
 * Topbar, nenhuma sessão ainda existe para exibir). Inclui também Registro, alternado no mesmo
 * formulário — sem essa alternativa nenhum Usuário conseguiria criar a primeira conta pela UI
 * (`POST /auth/register` existe apenas como rota HTTP).
 */
export function LoginPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState(DEMO_TENANT_ID);
  const [error, setError] = useState<string | undefined>(undefined);
  const [info, setInfo] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (auth.status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setInfo(undefined);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await auth.login(identity, password, tenantId);
      } else {
        await auth.register(identity, password);
        setMode("login");
        setInfo("Conta criada — entre com sua senha.");
      }
    } catch (submitError) {
      setError(toUserMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__panel">
        <div className="login-page__brand">
          <span className="sidebar__brand-mark" aria-hidden="true">
            A
          </span>
          <div>
            <strong>Adaptive Business Platform</strong>
            <p className="page-header__description">Acesso autenticado via Identity Hub</p>
          </div>
        </div>

        <h1>{mode === "login" ? "Entrar" : "Criar conta"}</h1>

        <form className="login-page__form" onSubmit={(event) => void handleSubmit(event)}>
          <Field label="Identity (e-mail)" type="email" required value={identity} onChange={(event) => setIdentity(event.target.value)} autoComplete="username" />

          <Field
            label="Senha"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            trailingIcon={<Lock size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-disabled)" }} aria-hidden="true" />}
          />

          {mode === "login" && <Field label="Tenant" type="text" required value={tenantId} onChange={(event) => setTenantId(event.target.value)} />}

          {error && <Alert tone="danger">{error}</Alert>}
          {info && <Alert tone="success">{info}</Alert>}

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          className="login-page__toggle"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(undefined);
            setInfo(undefined);
          }}
        >
          {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
