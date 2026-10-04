import {
  GoogleAuthProvider,
  signInWithCredential,
  type Auth,
} from "firebase/auth";
type Moment = {
  isDismissedMoment: () => boolean;
};
type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (result: { credential: string }) => void;
    auto_select: boolean;
  }) => void;
  prompt: (callback?: (moment: Moment) => void) => void;
  cancel: () => void;
  disableAutoSelect: () => void;
};
const identity = () =>
  (window as Window & { google?: { accounts: { id: GoogleIdentity } } }).google
    ?.accounts.id;
let loader: Promise<void> | undefined;
function loadIdentity(): Promise<void> {
  if (identity()) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    let timeout: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
      } else resolve();
    };
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () =>
      finish(identity() ? undefined : new Error("Google identity unavailable"));
    script.onerror = () => finish(new Error("Google identity unavailable"));
    timeout = setTimeout(
      () => finish(new Error("Google identity timed out")),
      15000,
    );
    document.head.appendChild(script);
  }).catch((error) => {
    loader = undefined;
    throw error;
  });
  return loader;
}
export function stopGoogleAutoSignIn() {
  identity()?.cancel();
  identity()?.disableAutoSelect();
}
/** GIS ID token is exchanged only with this project's Firebase Auth. Never log it. */
export async function startGoogleOneTap(
  auth: Auth,
  clientId: string,
  onError: () => void,
  signal?: AbortSignal,
  onDismissed?: () => void,
): Promise<() => void> {
  if (
    auth.app.options.projectId !== "satsuniccode" ||
    auth.emulatorConfig ||
    !/^295420145391-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(
      clientId,
    )
  )
    throw new Error(
      "BLOCKED_EXTERNAL: satsuniccode Google OAuth configuration required",
    );
  if (signal?.aborted) return () => {};
  await loadIdentity();
  if (signal?.aborted) return () => {};
  const gis = identity();
  if (!gis) throw new Error("Google identity unavailable");
  let active = true,
    exchanging = false;
  const stop = () => {
    if (!active) return;
    active = false;
    gis.cancel();
    signal?.removeEventListener("abort", stop);
  };
  signal?.addEventListener("abort", stop, { once: true });
  gis.initialize({
    client_id: clientId,
    auto_select: false,
    callback: ({ credential }) => {
      if (!active || exchanging || !credential) return;
      exchanging = true;
      void signInWithCredential(
        auth,
        GoogleAuthProvider.credential(credential),
      ).catch(() => {
        exchanging = false;
        if (active) onError();
      });
    },
  });
  gis.prompt((moment) => {
    // FedCM may omit display notifications. Do not infer success from prompt().
    if (active && !exchanging && moment.isDismissedMoment()) onDismissed?.();
  });
  return stop;
}
