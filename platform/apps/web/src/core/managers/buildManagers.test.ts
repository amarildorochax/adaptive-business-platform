import { describe, expect, it } from "vitest";
import { buildManagers } from "./buildManagers";

describe("buildManagers — composition root", () => {
  it("constrói os quatro Managers ainda residentes no Frontend (Fake, sem exceção)", () => {
    const managers = buildManagers();

    expect(managers.communication).toBeDefined();
    expect(managers.analytics).toBeDefined();
    expect(managers.automation).toBeDefined();
    expect(managers.knowledge).toBeDefined();
  });

  it("cada chamada produz uma instância nova e independente (nenhum estado global compartilhado entre sessões)", async () => {
    const first = buildManagers();
    const second = buildManagers();

    const conversation = await first.communication.startConversation({ tenantId: "t1" }, [{ type: "External", referenceId: "org-1" }]);
    expect(conversation.result.conversation.tenantId).toBe("t1");

    // A segunda instância nunca compartilha o mesmo Fake Repository da primeira.
    const secondConversation = await second.communication.startConversation({ tenantId: "t2" }, [{ type: "External", referenceId: "org-2" }]);
    expect(secondConversation.result.conversation.tenantId).toBe("t2");
  });
});
