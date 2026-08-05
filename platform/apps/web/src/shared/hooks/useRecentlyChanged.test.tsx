// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRecentlyChanged } from "./useRecentlyChanged";

describe("useRecentlyChanged (UX-002)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("nunca é true no primeiro render — carregar um dado pela primeira vez não é 'mudança'", () => {
    const { result } = renderHook(({ value }) => useRecentlyChanged(value), { initialProps: { value: 5 } });
    expect(result.current).toBe(false);
  });

  it("fica true quando o valor muda entre renders, e volta a false após a janela de tempo", () => {
    const { result, rerender } = renderHook(({ value }) => useRecentlyChanged(value, 1000), { initialProps: { value: 5 } });
    expect(result.current).toBe(false);

    rerender({ value: 6 });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(false);
  });

  it("re-renderizar com o mesmo valor nunca liga o indicador", () => {
    const { result, rerender } = renderHook(({ value }) => useRecentlyChanged(value), { initialProps: { value: 5 } });

    rerender({ value: 5 });
    expect(result.current).toBe(false);
  });
});
