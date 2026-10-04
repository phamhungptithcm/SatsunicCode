import { beforeEach, afterEach, expect, test, vi } from "vitest";
import type { Auth } from "firebase/auth";
const mocks = vi.hoisted(() => ({
  exchange: vi.fn(),
  credential: vi.fn((value: string) => ({ idToken: value })),
}));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: { credential: mocks.credential },
  signInWithCredential: mocks.exchange,
}));
import {
  startGoogleOneTap,
  stopGoogleAutoSignIn,
} from "../../apps/web/src/google-one-tap";
const auth = {
  app: { options: { projectId: "satsuniccode" } },
  emulatorConfig: null,
} as unknown as Auth;
const client = "295420145391-unit-test.apps.googleusercontent.com";
let callback: (r: { credential: string }) => void;
const gis = {
  initialize: vi.fn((o: { callback: typeof callback }) => {
    callback = o.callback;
  }),
  prompt: vi.fn(),
  cancel: vi.fn(),
  disableAutoSelect: vi.fn(),
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchange.mockResolvedValue({ user: { uid: "unit-only" } });
  vi.stubGlobal("window", { google: { accounts: { id: gis } } });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
test("rejects emulator, unrelated project and foreign public client before loading GIS", async () => {
  for (const [a, c] of [
    [{ app: { options: { projectId: "demo-satsuniccode" } } }, client],
    [auth, "123-foreign.apps.googleusercontent.com"],
  ] as const)
    await expect(startGoogleOneTap(a as Auth, c, vi.fn())).rejects.toThrow(
      "BLOCKED_EXTERNAL",
    );
  expect(gis.initialize).not.toHaveBeenCalled();
});
test("exchanges a unit-only credential once and suppresses callback after cleanup", async () => {
  const stop = await startGoogleOneTap(auth, client, vi.fn());
  callback({ credential: "synthetic-unit-token" });
  callback({ credential: "synthetic-unit-token" });
  expect(mocks.exchange).toHaveBeenCalledTimes(1);
  stop();
  callback({ credential: "synthetic-unit-token" });
  expect(mocks.exchange).toHaveBeenCalledTimes(1);
  expect(gis.cancel).toHaveBeenCalledOnce();
});
test("abort before activation prevents prompt and credentials", async () => {
  const abort = new AbortController();
  abort.abort();
  await startGoogleOneTap(auth, client, vi.fn(), abort.signal);
  expect(gis.prompt).not.toHaveBeenCalled();
});
test("abort while active cancels prompt and rejects late credential callback", async () => {
  const abort = new AbortController();
  await startGoogleOneTap(auth, client, vi.fn(), abort.signal);
  abort.abort();
  callback({ credential: "synthetic-unit-token" });
  expect(mocks.exchange).not.toHaveBeenCalled();
  expect(gis.cancel).toHaveBeenCalledOnce();
});
test("exchange failure reports safe error and allows retry without leaking token", async () => {
  mocks.exchange.mockRejectedValue(new Error("unit provider failure"));
  const error = vi.fn();
  const stop = await startGoogleOneTap(auth, client, error);
  callback({ credential: "synthetic-unit-token" });
  await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
  stop();
});
test("sign-out cancels Google prompt and disables automatic re-selection", () => {
  stopGoogleAutoSignIn();
  expect(gis.cancel).toHaveBeenCalledOnce();
  expect(gis.disableAutoSelect).toHaveBeenCalledOnce();
});

test("single loader survives cancelled mount without activating stale prompt", async () => {
  const appended: {
    onload: null | (() => void);
    onerror: null | (() => void);
  }[] = [];
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", {
    createElement: () => ({ onload: null, onerror: null, remove: vi.fn() }),
    head: { appendChild: (s: (typeof appended)[number]) => appended.push(s) },
  });
  const aborted = new AbortController();
  const stale = startGoogleOneTap(auth, client, vi.fn(), aborted.signal);
  const fresh = startGoogleOneTap(auth, client, vi.fn());
  expect(appended).toHaveLength(1);
  aborted.abort();
  vi.stubGlobal("window", { google: { accounts: { id: gis } } });
  appended[0]!.onload!();
  await stale;
  const stop = await fresh;
  expect(gis.initialize).toHaveBeenCalledOnce();
  expect(gis.prompt).toHaveBeenCalledOnce();
  stop();
});

test('GIS load timeout is bounded and next attempt creates a fresh script', async()=>{
 vi.resetModules();vi.useFakeTimers();
 try {
  const adapter=await import('../../apps/web/src/google-one-tap');
  const scripts:{onerror:null|(()=>void);remove:ReturnType<typeof vi.fn>}[]=[];
  vi.stubGlobal('window',{});
  vi.stubGlobal('document',{createElement:()=>({onload:null,onerror:null,remove:vi.fn()}),head:{appendChild:(s:typeof scripts[number])=>scripts.push(s)}});
  const first=adapter.startGoogleOneTap(auth,client,vi.fn());
  const rejected=expect(first).rejects.toThrow('timed out');
  await vi.advanceTimersByTimeAsync(15000);await rejected;expect(scripts[0]!.remove).toHaveBeenCalledOnce();
  const second=adapter.startGoogleOneTap(auth,client,vi.fn());
  const retry=expect(second).rejects.toThrow('unavailable');
  expect(scripts).toHaveLength(2);scripts[1]!.onerror!();await retry;
 } finally {vi.useRealTimers();}
});
