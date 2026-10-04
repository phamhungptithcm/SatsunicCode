import { useToastNotice } from "../../hooks/useToastNotice";
import WorkspaceIcon from "./WorkspaceIcon";
import { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSession } from "../../session";
import { text, useLanguage } from "../../i18n";
export default function CloudDraftControls({
  revision,
  language,
  source,
  restore,
  compact = false,
}: {
  revision: string;
  language: string;
  source: string;
  restore: (source: string) => void;
  compact?: boolean;
}) {
  const user = useSession(),
    { t } = useLanguage();
  const { notify, dismiss } = useToastNotice();
  const pending = useRef<number | null>(null);
  useEffect(() => () => { if (pending.current !== null) dismiss(pending.current); }, [dismiss]);
  const [remote, setRemote] = useState<{
    revision: number | null;
    source: string;
  } | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "saving" | "saved" | "error"
  >("loading");
  useEffect(() => {
    let live = true;
    if (!user || user.isAnonymous) return;
    setRemote(null);
    setStatus("loading");
    getDoc(doc(db, `users/${user.uid}/drafts/${revision}-${language}-learning`))
      .then((snapshot) => {
        if (!live) return;
        const data = snapshot.data();
        if (
          data &&
          (typeof data.source !== "string" ||
            !Number.isSafeInteger(data.revision))
        )
          throw Error("INVALID_DRAFT");
        setRemote({
          revision: data?.revision ?? null,
          source: data?.source ?? "",
        });
        setStatus("ready");
      })
      .catch(() => {
        if (live) setStatus("error");
      });
    return () => {
      live = false;
    };
  }, [user?.uid, revision, language]);
  async function save() {
    if (!user || user.isAnonymous || !remote || status === "saving") return;
    const snapshotSource = source,
      expected = remote.revision;
    setStatus("saving");
    const noticeId = notify(t(text("Đang đồng bộ…", "Syncing…")), "info", { pending: true });
    pending.current = noticeId;
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(
            db,
            `users/${user.uid}/drafts/${revision}-${language}-learning`,
          ),
          snapshot = await tx.get(ref);
        if ((snapshot.data()?.revision ?? null) !== expected)
          throw Error("CONFLICT");
        tx.set(ref, {
          source: snapshotSource,
          language,
          challengeRevision: revision,
          context: "learning",
          revision: expected === null ? 0 : expected + 1,
          createdBy: user.uid,
          changedBy: user.uid,
          createdDate: snapshot.data()?.createdDate ?? serverTimestamp(),
          changedDate: serverTimestamp(),
          schemaVersion: 1,
        });
      });
      setRemote({
        revision: expected === null ? 0 : expected + 1,
        source: snapshotSource,
      });
      setStatus("saved");
      notify(t(text("Đã đồng bộ bản mã tại thời điểm bấm lưu.", "The code snapshot was synced.")), "success");
    } catch {
      setStatus("error");
      notify(t(text("Chưa đồng bộ được. Giữ mã hiện tại và tải lại để kiểm tra bản mới.", "Sync failed. Keep your code and reload to check the latest draft.")), "error");
    } finally {
      dismiss(noticeId);
      pending.current = null;
    }
  }
  if (!user || user.isAnonymous) return null;
  return (
    <div className={`workspace-cloud-draft${compact ? " compact" : ""}`}>
      <button
        className={compact ? "workspace-icon-control" : undefined}
        aria-label={t(text("Đồng bộ bản nháp", "Sync draft"))}
        title={t(text("Đồng bộ bản nháp", "Sync draft"))}
        data-tooltip={t(text("Đồng bộ bản nháp", "Sync draft"))}
        disabled={
          !remote ||
          status === "saving" ||
          status === "error" ||
          source.length > 100000
        }
        onClick={() => void save()}
      >
        <WorkspaceIcon name="sync" />
        <span className={compact ? "sr-only" : undefined}>
          {t(text("Đồng bộ bản nháp", "Sync draft"))}
        </span>
      </button>
      {remote?.revision !== null && remote && (
        <button
          className={compact ? "workspace-icon-control" : undefined}
          aria-label={t(text("Đọc bản đã đồng bộ", "Load synced draft"))}
          title={t(text("Đọc bản đã đồng bộ", "Load synced draft"))}
          data-tooltip={t(text("Đọc bản đã đồng bộ", "Load synced draft"))}
          disabled={status === "saving"}
          onClick={() => {
            if (
              window.confirm(
                t(
                  text(
                    "Thay mã hiện tại bằng bản đã đồng bộ? Hãy sao chép mã hiện tại nếu cần giữ lại.",
                    "Replace current code with the synced draft? Copy your current code first if you need it.",
                  ),
                ),
              )
            )
              restore(remote.source);
          }}
        >
          <WorkspaceIcon name="load" />
          <span className={compact ? "sr-only" : undefined}>
            {t(text("Đọc bản đã đồng bộ", "Load synced draft"))}
          </span>
        </button>
      )}
      <span
        role={status === "saved" || status === "error" ? undefined : "status"}
        className={
          compact
            ? status === "saved" || status === "error"
              ? "workspace-sync-feedback"
              : "sr-only"
            : undefined
        }
      >
        {t(
          text(
            status === "loading"
              ? "Đang đọc trạng thái đồng bộ…"
              : status === "saving"
                ? "Đang đồng bộ…"
                : status === "saved"
                  ? "Đã đồng bộ bản mã tại thời điểm bấm lưu."
                  : status === "error"
                    ? "Chưa đồng bộ được. Giữ mã hiện tại và tải lại để kiểm tra bản mới."
                    : "Đồng bộ sẵn sàng.",
            status === "loading"
              ? "Loading sync state…"
              : status === "saving"
                ? "Syncing…"
                : status === "saved"
                  ? "The code snapshot was synced."
                  : status === "error"
                    ? "Sync failed. Keep your code and reload to check the latest draft."
                    : "Sync ready.",
          ),
        )}
      </span>
    </div>
  );
}
