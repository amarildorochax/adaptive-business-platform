import { describe, expect, it } from "vitest";
import { hashPassword } from "./passwordHashing.js";

const TEST_ENV = { ABP_AUTH_PEPPER: "pepper-de-teste" } as NodeJS.ProcessEnv;

describe("hashPassword — hashing real na fronteira HTTP (CredentialService nunca hasheia nada)", () => {
  it("nunca devolve a senha em texto plano", () => {
    const hash = hashPassword("identity-1", "senha-super-secreta", TEST_ENV);
    expect(hash).not.toContain("senha-super-secreta");
  });

  it("é determinístico — mesma Identity/senha sempre produz o mesmo hash (exigência de CredentialService.matches, que compara por igualdade simples)", () => {
    const first = hashPassword("identity-1", "senha-1", TEST_ENV);
    const second = hashPassword("identity-1", "senha-1", TEST_ENV);
    expect(first).toBe(second);
  });

  it("Identities diferentes produzem hashes diferentes para a mesma senha (salt derivado por Identity, nunca um salt global único)", () => {
    const a = hashPassword("identity-a", "mesma-senha", TEST_ENV);
    const b = hashPassword("identity-b", "mesma-senha", TEST_ENV);
    expect(a).not.toBe(b);
  });

  it("senhas diferentes para a mesma Identity produzem hashes diferentes", () => {
    const a = hashPassword("identity-1", "senha-a", TEST_ENV);
    const b = hashPassword("identity-1", "senha-b", TEST_ENV);
    expect(a).not.toBe(b);
  });

  it("um pepper diferente produz um hash diferente para o mesmo par Identity/senha", () => {
    const withPepperA = hashPassword("identity-1", "senha-1", { ABP_AUTH_PEPPER: "pepper-a" } as NodeJS.ProcessEnv);
    const withPepperB = hashPassword("identity-1", "senha-1", { ABP_AUTH_PEPPER: "pepper-b" } as NodeJS.ProcessEnv);
    expect(withPepperA).not.toBe(withPepperB);
  });
});
