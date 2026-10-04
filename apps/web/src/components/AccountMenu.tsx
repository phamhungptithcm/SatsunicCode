import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession, useAccountControls } from "../session";
import { useLanguage, text } from "../i18n";
export function Avatar({ large = false }: { large?: boolean }) {
  const user = useSession();
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [user?.photoURL]);
  const photo = user?.photoURL;
  let safe = false;
  try {
    const url = new URL(photo ?? "");
    safe =
      url.protocol === "https:" &&
      (url.hostname === "googleusercontent.com" ||
        url.hostname.endsWith(".googleusercontent.com"));
  } catch {}
  return (
    <span className={`user-avatar${large ? " large" : ""}`}>
      {safe && !broken ? (
        <img
          src={photo!}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden="true">
          {(user?.displayName ?? "").trim().slice(0, 1).toUpperCase() || "•"}
        </span>
      )}
    </span>
  );
}
export default function AccountMenu() {
  const user = useSession(),
    { logout } = useAccountControls(),
    { t } = useLanguage(),
    location = useLocation();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  if (!user || user.isAnonymous) return null;
  const entries = [
    ["/account", text("Hồ sơ của tôi", "My profile")],
    ["/progress", text("Tiến độ của tôi", "My progress")],
    ["/account/saved", text("Bài đã lưu", "Saved problems")],
    ["/account/submissions", text("Bài đã nộp", "My submissions")],
    ["/settings", text("Cài đặt", "Settings")],
  ] as const;
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <div
      className="account-menu"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          const items = Array.from(
            root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ??
              [],
          );
          const index = items.indexOf(document.activeElement as HTMLElement);
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? items.length - 1
                : (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                  items.length;
          items[next]?.focus();
        }
      }}
    >
      <button
        className="account-trigger"
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu-items"
        onClick={() => setOpen((x) => !x)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
            requestAnimationFrame(() => {
              const items =
                root.current?.querySelectorAll<HTMLElement>("[role=menuitem]");
              (e.key === "ArrowUp"
                ? items?.[items.length - 1]
                : items?.[0]
              )?.focus();
            });
          }
        }}
      >
        <Avatar />
        <span className="account-name">
          {user.displayName || t(text("Tài khoản Google", "Google account"))}
        </span>
        <svg className="account-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
          <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className="account-popover"
          id="account-menu-items"
          role="menu"
          aria-label={t(text("Menu tài khoản", "Account menu"))}
        >
          <div className="account-menu-identity">
            {user.displayName || t(text("Tài khoản Google", "Google account"))}
            <small>Google</small>
          </div>
          {entries.map(([to, label]) => (
            <Link role="menuitem" to={to} key={to}>
              {t(label)}
            </Link>
          ))}
          <button
            className="account-signout"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError(false);
              void logout()
                .catch(() => setError(true))
                .finally(() => setBusy(false));
            }}
          >
            {t(text("Đăng xuất", "Sign out"))}
          </button>
          {error && (
            <p role="status">
              {t(
                text(
                  "Chưa đăng xuất được. Thử lại.",
                  "Sign-out did not complete. Try again.",
                ),
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
