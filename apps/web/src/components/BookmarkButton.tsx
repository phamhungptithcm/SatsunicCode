import WorkspaceIcon from "../features/workspace/WorkspaceIcon";
import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAccountControls, useSession } from "../session";
import { useLanguage, text } from "../i18n";
export default function BookmarkButton({
  slug,
  workspace = false,
}: {
  slug: string;
  workspace?: boolean;
}) {
  const user = useSession();
  const { requestGoogle } = useAccountControls();
  const { t } = useLanguage();
  const [starred, setStarred] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    setStarred(false);
    setError(false);
    if (!user || user.isAnonymous) return;
    return onSnapshot(
      doc(db, `users/${user.uid}/bookmarks/${slug}`),
      { includeMetadataChanges: true },
      (s) => {
        if (!s.metadata.hasPendingWrites)
          setStarred(s.exists() && s.data().starred === true);
      },
      () => setError(true),
    );
  }, [user?.uid, slug]);
  async function toggle() {
    if (!user || user.isAnonymous) {
      requestGoogle();
      return;
    }
    setBusy(true);
    setError(false);
    try {
      await setDoc(doc(db, `users/${user.uid}/bookmarks/${slug}`), {
        problemSlug: slug,
        starred: !starred,
        changedBy: user.uid,
        changedDate: serverTimestamp(),
        schemaVersion: 1,
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="bookmark-control">
      <button
        disabled={busy}
        aria-pressed={starred}
        onClick={() => void toggle()}
        aria-label={t(text("Đánh dấu bài tập", "Bookmark problem"))}
        title={
          !user || user.isAnonymous
            ? t(
                text(
                  "Đăng nhập bằng Google để lưu dấu",
                  "Sign in with Google to save a bookmark",
                ),
              )
            : t(
                text(
                  "Dấu chỉ được lưu sau khi Firebase xác nhận",
                  "Saved only after Firebase acknowledges",
                ),
              )
        }
      >
        {workspace ? <WorkspaceIcon name="star" /> : starred ? "★" : "☆"}
      </button>
      {error && (
        <small role="status">
          {t(text("Chưa lưu được dấu", "Bookmark not saved"))}
        </small>
      )}
    </span>
  );
}
