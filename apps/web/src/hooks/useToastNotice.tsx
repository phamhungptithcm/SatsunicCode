import { reduceToastNotice, type ToastNotice } from "../lib/toast-notice";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastKind } from "../components/Toast";
import { useLanguage } from "../i18n";

type Options = { pending?: boolean; actions?: ReactNode };
type Notice = ToastNotice<ReactNode>;
type Notify = (text: string, kind?: ToastKind, options?: Options) => number;
const Context = createContext<{
  notify: Notify;
  dismiss: (id: number) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const sequence = useRef(0);
  const [notice, dispatch] = useReducer(reduceToastNotice<ReactNode>, null);
  const notify = useCallback<Notify>((text, kind = "info", options = {}) => {
    const id = ++sequence.current;
    const notice: Notice = { id, text, kind, ...options };
    dispatch({ type: "show", notice });
    return id;
  }, []);
  // A stale operation or timer cannot close a more recent notice.
  const dismiss = useCallback(
    (id: number) => dispatch({ type: "dismiss", id }),
    [],
  );
  return (
    <Context.Provider value={{ notify, dismiss }}>
      {children}
      {notice && (
        <Toast
          key={notice.id}
          text={notice.text}
          kind={notice.kind}
          pending={notice.pending}
          actions={notice.actions}
          language={locale}
          onClose={() => dismiss(notice.id)}
        />
      )}
    </Context.Provider>
  );
}
export function useToastNotice() {
  const context = useContext(Context);
  if (!context) throw new Error("ToastProvider is required");
  const { notify: show, dismiss: close } = context;
  const pendingIds = useRef(new Set<number>());
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      for (const id of pendingIds.current) close(id);
      pendingIds.current.clear();
    };
  }, [close]);
  const notify = useCallback<Notify>(
    (message, kind, options) => {
      if (!active.current) return -1;
      const id = show(message, kind, options);
      if (options?.pending) pendingIds.current.add(id);
      return id;
    },
    [show],
  );
  const dismiss = useCallback(
    (id: number) => {
      pendingIds.current.delete(id);
      close(id);
    },
    [close],
  );
  return { notify, dismiss };
}

/** Durable console feedback stays local; only explicitly typed action outcomes toast. */
export function useActionNotice() {
  const { notify, dismiss } = useToastNotice();
  const [status, update] = useState("");
  const [transient, setTransient] = useState(false);
  const pendingId = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (pendingId.current !== null) dismiss(pendingId.current);
    },
    [dismiss],
  );
  const setStatus = useCallback(
    (message: string, kind?: ToastKind, pending = false) => {
      update(message);
      setTransient(!!kind);
      if (pendingId.current !== null) {
        dismiss(pendingId.current);
        pendingId.current = null;
      }
      if (kind && message) {
        const id = notify(message, kind, { pending });
        if (pending) pendingId.current = id;
      }
    },
    [notify, dismiss],
  );
  return { status, transient, setStatus };
}
