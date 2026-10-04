import type { ReactNode } from "react";
import { useAccountControls } from "../session";
import { googleOneTapReady } from "../firebase";
import { useToastNotice } from "../hooks/useToastNotice";
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
  const { notify } = useToastNotice();
  return (
    <>
      <button
        className={className}
        onClick={() => {
          if (googleOneTapReady) requestGoogle();
          else notify(t(text("Đăng nhập Google chưa khả dụng ở môi trường này.", "Google sign-in is unavailable in this environment.")), "warning");
        }}
      >
        {children}
      </button>

    </>
  );
}
