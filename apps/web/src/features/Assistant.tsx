import { useActionNotice } from "../hooks/useToastNotice";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { httpsCallable } from "firebase/functions";
import { auth, authReady, functions } from "../firebase";
import { useLanguage, text } from "../i18n";
import styles from "./Assistant.module.css";

function Icon({ kind }: { kind: "send" | "close" | "chat" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={
          kind === "send"
            ? "M12 19V5m-6 6 6-6 6 6"
            : kind === "close"
              ? "m6 6 12 12M18 6 6 18"
              : "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 5h10M7 13h6"
        }
      />
    </svg>
  );
}

export default function Assistant({ collapsed = false, routeKey = "/" }: { collapsed?: boolean; routeKey?: string }) {
  const { locale, t } = useLanguage();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(collapsed);
  const [closing, setClosing] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [hint, setHint] = useState(false);
  const shell = useRef<HTMLElement>(null);
  const motion = useRef<Animation | null>(null);
  const idleMotion = useRef<Animation | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const { status, transient, setStatus } = useActionNotice();
  const dialog = useRef<HTMLDialogElement>(null);
  const idleInput = useRef<HTMLTextAreaElement>(null);
  const chatInput = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const outside = useRef(false);
  const request = useRef(0);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      motion.current?.cancel();
      idleMotion.current?.cancel();
      clearTimeout(timer.current);
      request.current++;
      pending.current = false;
    };
  }, []);
  useEffect(() => {
    request.current++;
    pending.current = false;
    setBusy(false);
    setStatus("");
  }, [locale]);
  useEffect(() => {
    clearTimeout(timer.current);
    motion.current?.cancel();idleMotion.current?.cancel();
    request.current++;pending.current=false;
    setBusy(false);setOpen(false);setClosing(false);setHiding(false);setHidden(collapsed);
  }, [collapsed, routeKey]);
  function capsuleMask(element: HTMLDialogElement) {
    const box = element.querySelector("form")!.getBoundingClientRect();
    const panel = element.getBoundingClientRect();
    return {
      clipPath: `inset(${box.top - panel.top}px ${panel.right - box.right}px ${panel.bottom - box.bottom}px ${box.left - panel.left}px round 40px)`,
      transform: `translateY(${panel.bottom - box.bottom}px)`,
    };
  }
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      motion.current = element.animate(
        [
          capsuleMask(element),
          {
            clipPath: "inset(0px 0px 0px 0px round 28px)",
            transform: "translateY(0)",
          },
        ],
        { duration: 360, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    }
    chatInput.current?.focus({ preventScroll: true });
    return () => {
      motion.current?.cancel();
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    if (!hidden && !open) idleInput.current?.focus({ preventScroll: true });
  }, [hidden, open]);
  useEffect(() => {
    if (
      !hidden ||
      open ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let revealTimer: ReturnType<typeof setTimeout>;
    let clearTimer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      if (document.visibilityState === "visible") {
        setHint(true);
        clearTimer = setTimeout(() => setHint(false), 2800);
      }
      revealTimer = setTimeout(reveal, 22000);
    };
    revealTimer = setTimeout(reveal, 5000);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(clearTimer);
      setHint(false);
    };
  }, [hidden, open]);
  function hide() {
    if (hiding) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHidden(true);
      return;
    }
    setHiding(true);
    const element = shell.current;
    if (element) {
      const box = element.getBoundingClientRect();
      const deltaX = innerWidth - 24 - 28 - (box.left + box.width / 2);
      const deltaY = box.bottom - 28 - (box.top + box.height / 2);
      idleMotion.current = element.animate(
        [
          { opacity: 1, transform: "translate(-50%,0) scale(1)" },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${deltaX}px),${deltaY}px) scale(${56 / box.width})`,
          },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "forwards",
        },
      );
    }
    timer.current = setTimeout(() => {
      setHidden(true);
      setHiding(false);
      idleMotion.current?.cancel();
    }, 320);
  }
  function collapse() {
    if (closing) return;
    request.current++;
    pending.current = false;
    setBusy(false);
    setClosing(true);
    const finish = () => {
      if (mounted.current) {
        setOpen(false);
        setClosing(false);
      }
    };
    const element = dialog.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const current = getComputedStyle(element);
    const start = {
      clipPath:
        current.clipPath === "none"
          ? "inset(0px 0px 0px 0px round 28px)"
          : current.clipPath,
      transform: current.transform,
    };
    motion.current?.cancel();
    const animation = element.animate([start, capsuleMask(element)], {
      duration: 320,
      easing: "cubic-bezier(.22,1,.36,1)",
      fill: "forwards",
    });
    motion.current = animation;
    void animation.finished.then(finish, () => {});
  }
  async function send() {
    if (
      pending.current ||
      !draft.trim() ||
      composing.current ||
      closing ||
      hiding
    )
      return;
    const id = ++request.current;
    pending.current = true;
    setOpen(true);
    setBusy(true);
    setStatus(t(text("Đang kết nối…", "Connecting…")), "info", true);
    try {
      await authReady;
      if (id !== request.current) return;
      if (!auth.currentUser) throw new Error("Sign-in required");
      await httpsCallable(
        functions,
        "sendAssistantMessage",
      )({ message: draft, clientRequestId: crypto.randomUUID(), locale });
      if (id === request.current)
        setStatus(
          t(
            text("Không có nội dung được trả về.", "No response was returned."),
          ),
         "warning");
    } catch {
      if (id === request.current)
        setStatus(
          t(
            text(
              "Ask Satsunic chưa khả dụng. Câu hỏi vẫn được giữ; chưa có câu trả lời hoặc lịch sử được lưu.",
              "Ask Satsunic is currently unavailable. Your draft is preserved; no answer or history was saved.",
            ),
          ),
         "warning");
    } finally {
      if (id === request.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  function backdrop(e: React.PointerEvent<HTMLDialogElement>) {
    const bounds = e.currentTarget.getBoundingClientRect();
    return (
      e.clientX < bounds.left ||
      e.clientX > bounds.right ||
      e.clientY < bounds.top ||
      e.clientY > bounds.bottom
    );
  }
  function composer(expanded: boolean) {
    const closeLabel = expanded
      ? t(text("Thu gọn hội thoại", "Collapse conversation"))
      : t(text("Ẩn Ask Satsunic", "Hide Ask Satsunic"));
    return (
      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          ref={expanded ? chatInput : idleInput}
          aria-label={t(text("Hỏi Ask Satsunic", "Ask Satsunic a question"))}
          rows={1}
          maxLength={8000}
          placeholder={t(text("Hỏi bất cứ điều gì…", "Ask anything…"))}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              !composing.current
            ) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button
          className={styles.send}
          disabled={!draft.trim() || busy || closing}
          aria-label={t(text("Gửi câu hỏi", "Send question"))}
          title={t(text("Gửi câu hỏi", "Send question"))}
        >
          <Icon kind="send" />
        </button>
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          title={closeLabel}
          onClick={() => (expanded ? collapse() : hide())}
        >
          <Icon kind="close" />
        </button>
      </form>
    );
  }
  return createPortal(
    <>
      {!open && (hidden || hiding) && (
        <button
          className={styles.launcher}
          data-emerging={hiding || undefined}
          data-hint={hint || undefined}
          disabled={hiding}
          aria-label={t(text("Mở Ask Satsunic", "Open Ask Satsunic"))}
          title="Ask Satsunic"
          onClick={() => { if (collapsed) setOpen(true); else setHidden(false); }}
        >
          <Icon kind="chat" />
          <span className={styles.hint} aria-hidden="true">
            {Array.from("Ask Anything").map((letter, index) => (
              <span key={index} style={{ animationDelay: `${index * 35}ms` }}>
                {letter === " " ? "\u00a0" : letter}
              </span>
            ))}
          </span>
        </button>
      )}
      {!open && !hidden && (
        <aside
          ref={shell}
          data-hiding={hiding || undefined}
          className={styles.idle}
          aria-label="Ask Satsunic"
        >
          {composer(false)}
        </aside>
      )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        data-closing={closing || undefined}
        aria-labelledby="ask-satsunic-title"
        onCancel={(e) => {
          e.preventDefault();
          collapse();
        }}
        onPointerDown={(e) => {
          outside.current = backdrop(e);
        }}
        onPointerUp={(e) => {
          if (outside.current && backdrop(e)) collapse();
          outside.current = false;
        }}
        onPointerCancel={() => {
          outside.current = false;
        }}
      >
        <div className={styles.header}>
          <strong id="ask-satsunic-title">
            Ask <span>Satsunic</span>
          </strong>
          <span>{t(text("Trợ lý học tập", "Learning assistant"))}</span>
        </div>
        <div className={styles.conversation}>
          <p className={styles.empty}>
            {t(
              text(
                "Ask Satsunic đang phát triển.",
                "Ask Satsunic is in development.",
              ),
            )}
          </p>
          <p role={transient ? undefined : "status"} aria-live={transient ? "off" : "polite"} className={styles.status}>
            {status}
          </p>
        </div>
        <div className={styles.bottom}>{composer(true)}</div>
      </dialog>
    </>,
    document.body,
  );
}
