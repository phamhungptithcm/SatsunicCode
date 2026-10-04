import { useToastNotice } from "../hooks/useToastNotice";
import { useEffect, useState } from "react";
import { auth, googleClientId, googleOneTapReady } from "../firebase";
import { startGoogleOneTap } from "../google-one-tap";
import { useAccountControls, useSession } from "../session";
import { text, useLanguage } from "../i18n";
export default function OneTapController() {
  const user = useSession(),
    { ready, failed, promptVersion, suppressed } = useAccountControls(),
    { t } = useLanguage();
  const [error, setError] = useState(false);
  const { notify } = useToastNotice();
  useEffect(() => {
    setError(false);
    if (
      !ready ||
      suppressed ||
      !googleOneTapReady ||
      (user && !user.isAnonymous)
    )
      return;
    const controller = new AbortController();
    let cleanup: (() => void) | undefined;
    void startGoogleOneTap(
      auth,
      googleClientId,
      () => {
        if (!controller.signal.aborted) setError(true);
      },
      controller.signal,
    )
      .then((stop) => {
        if (controller.signal.aborted) stop();
        else cleanup = stop;
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => {
      controller.abort();
      cleanup?.();
    };
  }, [ready, suppressed, user?.uid, promptVersion]);
  useEffect(() => {
    if (error || failed) notify(t(text("Đăng nhập Google chưa hoàn tất. Bạn có thể thử lại khi lưu bài tập.", "Google sign-in did not complete. You can retry when saving a problem.")), "warning");
  }, [error, failed, notify, t]);
  return null;
}
