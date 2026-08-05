import { createHmac, scryptSync } from "node:crypto";
import { resolveAuthConfig } from "./authConfig.js";

const SCRYPT_KEY_LENGTH = 64;

/**
 * Hashing de senha real, adicionado nesta Sprint (FUN-100) na fronteira HTTP — `CredentialService`
 * (`@abp/platform-services`, IMP-011) nunca pode ser alterado ("nunca alterar Managers/Services") e
 * seu contrato já documenta `secretReference` como "sempre um valor opaco... este documento nunca
 * implementa autenticação real, apenas o modelo e o contrato" (`Credential.ts`). `matches()` compara
 * dois `secretReference` por igualdade simples — nunca decodifica nem valida um segredo real. Esta
 * função produz exatamente esse `secretReference`: um hash real, nunca a senha em texto plano.
 *
 * **Decisão técnica deliberada — scrypt com salt determinístico por Identity, não bcrypt/argon2 com
 * salt aleatório por registro.** `CredentialService.matches()` exige que o mesmo par
 * (identity, password) sempre produza o mesmo `secretReference` em toda chamada futura, para que a
 * igualdade simples funcione — um salt verdadeiramente aleatório por registro (o padrão bcrypt)
 * tornaria essa comparação impossível sem que o chamador primeiro leia o salt já armazenado, e
 * `IAMManager` não expõe nenhum método para isso (única leitura pública é `authenticate`/`login`,
 * que já exigem o `secretReference` final resolvido). A alternativa aqui adotada — salt = HMAC-SHA256
 * da própria Identity, com uma chave de servidor (`pepper`, nunca persistida, `authConfig.ts`) — é
 * determinística (resolve o problema acima), mas ainda assim varia por Identity (não um salt global
 * único reaproveitado por todos os Usuários, que permitiria um ataque de rainbow table cruzando
 * contas). `scrypt` (KDF lenta, resistente a força bruta por hardware) é preferível a um HMAC simples
 * pelo mesmo motivo que senhas nunca devem ser hasheadas com uma função rápida.
 *
 * **Limitação documentada** (relatório desta Sprint, Seção "Limitações"): isto ainda não é
 * bcrypt/argon2 com salt aleatório verdadeiro — a próxima evolução real exigiria um método novo em
 * `CredentialService` (ex.: `matchesWithVerifier(identity, kind, verify: (stored) => boolean)`), fora
 * do escopo desta Sprint por alterar Services já aprovados.
 */
export function hashPassword(identity: string, password: string, env: NodeJS.ProcessEnv = process.env): string {
  const { pepper } = resolveAuthConfig(env);
  const salt = createHmac("sha256", pepper).update(identity).digest();
  return scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
}
