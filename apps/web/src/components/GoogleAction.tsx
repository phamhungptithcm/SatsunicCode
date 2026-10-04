import type { ReactNode } from "react";
import { useAccountControls } from "../session";
import { googleOneTapReady } from "../firebase";
import { useState } from "react";
import { useLanguage, text } from "../i18n";
export default function GoogleAction({
  children,
  className = "button",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { requestGoogle } = useAccountControls(),
    { t } = useLanguage();
  const [unavailable, setUnavailable] = useState(false);
  return (
    <>
      <button
        className={className}
        onClick={() => {
          if (googleOneTapReady) requestGoogle();
          else setUnavailable(true);
        }}
      >
        {children}
      </button>
      {unavailable && (
        <p role="status">
          {t(
            text(
              "Đăng nhập Google chưa khả dụng ở môi trường này.",
              "Google sign-in is unavailable in this environment.",
            ),
          )}
        </p>
      )}
    </>
  );
}
