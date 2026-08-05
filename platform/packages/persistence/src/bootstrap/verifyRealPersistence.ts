import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createManagerRegistry } from "../composition/createManagerRegistry.js";
import { createDatabase } from "../db/client.js";
import { runMigrations } from "../db/migrate.js";

/**
 * Script executável (`pnpm verify`) — a validação exigida por esta Sprint de que "a aplicação
 * inicia utilizando persistência real": aplica as migrations, constrói os três Managers
 * priorizados sobre SQLite real, executa uma sequência de Commands real (o mesmo tipo de sequência
 * que `apps/web` já executa via `seedDemoData.ts`, aqui contra um banco de arquivo real em vez de
 * Fakes), fecha a conexão, abre uma conexão **nova** contra o mesmo arquivo, e confirma que o dado
 * criado pela primeira conexão é lido de volta pela segunda — a prova de que a persistência
 * atravessa o processo, o que nenhum FakeRepository jamais poderia demonstrar.
 */
async function main(): Promise<void> {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-verify-real-persistence-"));
  const databasePath = path.join(tempDir, "verify.sqlite3");

  try {
    const firstConnection = createDatabase({ environment: "development", databasePath });
    runMigrations(firstConnection);

    const firstRegistry = createManagerRegistry("real", firstConnection);

    const profile = await firstRegistry.businessProfile.createBusinessProfile({
      tenantId: "tenant-verify",
      segment: "Floricultura",
      maturity: "elevada",
    });
    await firstRegistry.businessProfile.validateProfile(profile.result.profileId);
    await firstRegistry.businessProfile.finalizeInitialProfile(profile.result.profileId);

    await firstRegistry.branding.generateInitialBrandIdentity({
      tenantId: "tenant-verify",
      primaryColorHex: "#2E7D32",
      backgroundHex: "#FFFFFF",
      titleFont: "Poppins",
      bodyFont: "Inter",
    });

    const organization = await firstRegistry.crm.createOrganization(
      { tenantId: "tenant-verify", name: "Floricultura Bela Vista", tradeName: "Bela Vista", taxId: "12.345.678/0001-90", segment: "Floricultura", phone: "+55 11 4000-0000", email: "contato@belavista.example", website: "https://belavista.example" },
      "identity-verify",
    );
    await firstRegistry.crm.createOpportunity(
      { tenantId: "tenant-verify", title: "Contrato anual", value: 48000, pipelineId: "pipeline-padrao", stageId: "stage-qualificacao", partnerId: undefined },
      organization.result.relationship.relationshipId,
    );

    firstConnection.close();

    const secondConnection = createDatabase({ environment: "development", databasePath });
    const secondRegistry = createManagerRegistry("real", secondConnection);

    const rehydratedProfile = await secondRegistry.businessProfile.findProfile("tenant-verify");
    if (rehydratedProfile.result?.profileId !== profile.result.profileId) {
      throw new Error("Falha de verificação: Business Profile não sobreviveu ao reabrir a conexão.");
    }

    const rehydratedStage = await secondRegistry.businessProfile.currentStage(profile.result.profileId);
    if (rehydratedStage.result !== "Perfil Inicial") {
      throw new Error(`Falha de verificação: estágio esperado "Perfil Inicial", obtido "${rehydratedStage.result}".`);
    }

    const rehydratedTheme = await secondRegistry.branding.currentTheme("tenant-verify");
    if (rehydratedTheme.result?.version !== 1) {
      throw new Error("Falha de verificação: Brand Theme não sobreviveu ao reabrir a conexão.");
    }

    const rehydratedOrganization = await secondRegistry.crm.createOrganization(
      { tenantId: "tenant-verify", name: "segunda organização, apenas para confirmar que o CRM aceita nova escrita na segunda conexão", tradeName: undefined, taxId: undefined, segment: undefined, phone: undefined, email: undefined, website: undefined },
      "identity-verify",
    );
    if (!rehydratedOrganization.result.organization.organizationId) {
      throw new Error("Falha de verificação: segunda conexão não conseguiu escrever no CRM.");
    }

    secondConnection.close();

    console.log("Persistência real verificada com sucesso:");
    console.log(`  banco: ${databasePath}`);
    console.log(`  Business Profile "${rehydratedProfile.result?.profileId}" sobreviveu ao reabrir a conexão, estágio "${rehydratedStage.result}".`);
    console.log(`  Brand Theme versão ${rehydratedTheme.result?.version} sobreviveu ao reabrir a conexão.`);
    console.log("  CRM aceitou nova escrita na segunda conexão.");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error("Verificação de persistência real falhou:", error);
  process.exitCode = 1;
});
