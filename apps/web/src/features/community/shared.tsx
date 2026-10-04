import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage, text } from "../../i18n";
import { useSession } from "../../session";
import GoogleAction from "../../components/GoogleAction";
import Icon from "./Icon";
import "./community.css";
export function Hero({
  label,
  title,
  description,
  icon = "building",
}: {
  label: string;
  title: ReactNode;
  description: string;
  icon?: string;
}) {
  return (
    <div className="community-hero">
      <div>
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="community-hero-icon">
        <Icon name={icon} />
      </span>
    </div>
  );
}
export function AccountRequired({ children }: { children: ReactNode }) {
  const user = useSession(),
    { t } = useLanguage();
  return user && !user.isAnonymous ? (
    <>{children}</>
  ) : (
    <div className="community-panel">
      <h2>{t(text("Đăng nhập để đóng góp", "Sign in to contribute"))}</h2>
      <p>
        {t(
          text(
            "Đọc nội dung công khai không cần đăng nhập.",
            "You can browse public content without signing in.",
          ),
        )}
      </p>
      <GoogleAction className="button primary">
        {t(text("Đăng nhập bằng Google", "Sign in with Google"))}
      </GoogleAction>
    </div>
  );
}
export function Dialog({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    frame = useRef<number | null>(null),
    { t } = useLanguage();
  function revealControl() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const dialog = ref.current,
        control = document.activeElement;
      if (
        !dialog?.open ||
        !(control instanceof HTMLElement) ||
        !dialog.contains(control) ||
        !control.matches("input,select,textarea")
      )
        return;
      const bounds = control.getBoundingClientRect(),
        head = dialog
          .querySelector(".community-dialog-head")
          ?.getBoundingClientRect(),
        footer = dialog
          .querySelector(".community-form-footer")
          ?.getBoundingClientRect();
      if (footer && bounds.bottom > footer.top - 10)
        dialog.scrollTop += bounds.bottom - footer.top + 10;
      else if (head && bounds.top < head.bottom + 10)
        dialog.scrollTop -= head.bottom - bounds.top + 10;
    });
  }
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", revealControl);
    window.visualViewport?.addEventListener("resize", revealControl);
    const observer = new ResizeObserver(revealControl),
      form = ref.current?.querySelector("form");
    if (form) observer.observe(form);
    return () => {
      window.removeEventListener("resize", revealControl);
      window.visualViewport?.removeEventListener("resize", revealControl);
      observer.disconnect();
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="community-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onFocusCapture={revealControl}
      onClose={onClose}
    >
      <div className="community-dialog-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="community-icon-button"
          onClick={onClose}
          aria-label={t(text("Đóng form", "Close form"))}
          title={t(text("Đóng form", "Close form"))}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "community-field wide" : "community-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error: string | null;
  retry?: () => void;
}) {
  const { t } = useLanguage();
  return error ? (
    <div className="community-error" role="alert">
      <p>{error}</p>
      {retry && (
        <button onClick={retry}>{t(text("Thử lại", "Try again"))}</button>
      )}
    </div>
  ) : null;
}
export function errorText(error: unknown, vi: boolean) {
  const code = (error as { code?: string })?.code;
  if (code?.includes("unauthenticated"))
    return vi
      ? "Phiên đăng nhập đã hết. Đăng nhập lại để tiếp tục."
      : "Your session expired. Sign in again to continue.";
  if (code?.includes("permission-denied"))
    return vi
      ? "Tài khoản không có quyền thực hiện thao tác này."
      : "Your account does not have permission for this action.";
  if (code?.includes("aborted"))
    return vi
      ? "Nội dung đã thay đổi. Tải lại trước khi sửa."
      : "This item changed. Reload before editing.";
  if (code?.includes("resource-exhausted"))
    return vi
      ? "Bạn đã thực hiện nhiều thao tác. Hãy thử lại sau."
      : "You have made many changes. Try again later.";
  if (code?.includes("already-exists"))
    return vi
      ? "Thông tin đã tồn tại hoặc đang chờ duyệt."
      : "This item already exists or is awaiting review.";
  if (code?.includes("unavailable") || code?.includes("not-found"))
    return vi
      ? "Dịch vụ chưa khả dụng. Nội dung chưa được lưu."
      : "This service is unavailable. Your changes were not saved.";
  return vi
    ? "Thao tác chưa hoàn tất. Kiểm tra kết nối và thử lại."
    : "The action did not complete. Check your connection and try again.";
}
export function useAction() {
  const { locale, t } = useLanguage(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [success, setSuccess] = useState<string | null>(null),
    lock = useRef(false);
  async function run(work: () => Promise<unknown>, message?: string) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await work();
      setSuccess(message ?? t(text("Đã lưu thay đổi.", "Changes saved.")));
      return true;
    } catch (e) {
      setError(errorText(e, locale === "vi"));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    run,
    busy,
    error,
    success,
    clear: () => {
      setError(null);
      setSuccess(null);
    },
  };
}
export const statusLabel: Record<string, { vi: string; en: string }> = {
  DRAFT: text("Bản nháp", "Draft"),
  PENDING_MODERATION: text("Đang chờ duyệt", "Pending review"),
  PUBLISHED: text("Đã duyệt", "Published"),
  REJECTED: text("Không được duyệt", "Rejected"),
  CHANGES_REQUESTED: text("Cần chỉnh sửa", "Changes requested"),
  REMOVED: text("Đã rút", "Withdrawn"),
  APPEALED: text("Đang xem xét lại", "Appeal pending"),
};

/** Provenance refers to company metadata, never to contributed reviews or salary. */
export function CompanySource({
  company,
}: {
  company: import("../../../../../packages/contracts/src/community").Company;
}) {
  const { t } = useLanguage();
  if (company.source === "OFFICIAL_DIRECTORY") {
    let url: URL | null = null;
    try {
      url = new URL(company.sourceUrl ?? "");
    } catch {
      /* Missing provenance remains plain text. */
    }
    return url?.protocol === "https:" ? (
      <a
        href={url.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {t(text("Nguồn chính thức", "Official source"))} ↗
      </a>
    ) : (
      <>
        {t(
          text("Thông tin từ nguồn chính thức", "Official company information"),
        )}
      </>
    );
  }
  return (
    <>
      {t(
        text(
          "Thông tin từ đề xuất cộng đồng",
          "Community-suggested information",
        ),
      )}
    </>
  );
}

export function companyIndustryLabel(industry: string) {
  const labels: Record<string, ReturnType<typeof text>> = {
    "Software services": text("Dịch vụ phần mềm", "Software services"),
    "Digital platforms": text("Nền tảng số", "Digital platforms"),
    "Business software": text("Phần mềm doanh nghiệp", "Business software"),
    "Software engineering": text("Phát triển phần mềm", "Software engineering"),
    "Digital transformation": text("Chuyển đổi số", "Digital transformation"),
    "Financial technology": text("Công nghệ tài chính", "Financial technology"),
  };
  return labels[industry] ?? text(industry, industry);
}
