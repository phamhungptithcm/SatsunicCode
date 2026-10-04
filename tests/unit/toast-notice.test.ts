import { describe, expect, it } from "vitest";
import {
  reduceToastNotice,
  type ToastNotice,
} from "../../apps/web/src/lib/toast-notice";
describe("single toast arbitration", () => {
  const pending: ToastNotice = {
    id: 1,
    text: "Saving",
    kind: "info",
    pending: true,
  };
  const newer: ToastNotice = { id: 2, text: "Saved", kind: "success" };
  it("replaces the pending notice with its completed outcome", () => {
    expect(reduceToastNotice(pending, { type: "show", notice: newer })).toBe(
      newer,
    );
  });
  it("ignores stale timers and operation cleanup without closing a newer toast", () => {
    expect(reduceToastNotice(newer, { type: "dismiss", id: 1 })).toBe(newer);
    expect(reduceToastNotice(newer, { type: "dismiss", id: 2 })).toBeNull();
  });
  it("accepts repeated identical messages as fresh events and clears empty notices", () => {
    const repeated = { ...newer, id: 3 };
    expect(
      reduceToastNotice(newer, { type: "show", notice: repeated })?.id,
    ).toBe(3);
    expect(
      reduceToastNotice(newer, {
        type: "show",
        notice: { ...repeated, text: "" },
      }),
    ).toBeNull();
  });
});
