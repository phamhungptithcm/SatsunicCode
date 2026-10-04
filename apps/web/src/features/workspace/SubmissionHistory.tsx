import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  where,
  query,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSession } from "../../session";
import { text, useLanguage } from "../../i18n";
const verdicts: Record<string, [string, string]> = {
  ACCEPTED: ["Đúng", "Accepted"],
  WRONG_ANSWER: ["Sai kết quả", "Wrong answer"],
  COMPILE_ERROR: ["Lỗi biên dịch", "Compile error"],
  RUNTIME_ERROR: ["Lỗi thực thi", "Runtime error"],
  TIME_LIMIT: ["Quá thời gian", "Time limit"],
  MEMORY_LIMIT: ["Quá bộ nhớ", "Memory limit"],
};
export default function SubmissionHistory({
  problemRevision,
}: {
  problemRevision: string;
}) {
  const user = useSession(),
    { t } = useLanguage();
  const [rows, setRows] = useState<QueryDocumentSnapshot[]>([]),
    [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null),
    [state, setState] = useState<"loading" | "ready" | "error">("loading"),
    [more, setMore] = useState(false);
  useEffect(() => {
    let live = true;
    setRows([]);
    setCursor(null);
    setMore(false);
    setState("loading");
    if (!user || user.isAnonymous) return;
    getDocs(
      query(
        collection(db, `users/${user.uid}/submissions`),
        where("problemRevision", "==", problemRevision),
        orderBy("createdDate", "desc"),
        limit(20),
      ),
    )
      .then((snapshot) => {
        if (live) {
          setRows(snapshot.docs);
          setCursor(snapshot.docs.at(-1) ?? null);
          setMore(snapshot.size === 20);
          setState("ready");
        }
      })
      .catch(() => {
        if (live) setState("error");
      });
    return () => {
      live = false;
    };
  }, [user?.uid, problemRevision]);
  async function next() {
    if (!user || !cursor || state === "loading") return;
    setState("loading");
    try {
      const snapshot = await getDocs(
        query(
          collection(db, `users/${user.uid}/submissions`),
          where("problemRevision", "==", problemRevision),
          orderBy("createdDate", "desc"),
          startAfter(cursor),
          limit(20),
        ),
      );
      setRows((old) => [...old, ...snapshot.docs]);
      setCursor(snapshot.docs.at(-1) ?? null);
      setMore(snapshot.size === 20);
      setState("ready");
    } catch {
      setState("error");
    }
  }
  if (!user || user.isAnonymous)
    return (
      <p>
        {t(
          text(
            "Đăng nhập để xem bài nộp đã lưu.",
            "Sign in to view stored submissions.",
          ),
        )}
      </p>
    );
  const visible = rows.filter(
    (row) => row.data().problemRevision === problemRevision,
  );
  return (
    <section>
      <h2>{t(text("Bài nộp", "Submissions"))}</h2>
      {state === "loading" && (
        <p role="status">
          {t(text("Đang đọc bài nộp…", "Loading submissions…"))}
        </p>
      )}
      {state === "error" && (
        <p role="alert">
          {t(
            text(
              "Không đọc được lịch sử. Tải lại để thử lại.",
              "History could not be loaded. Reload to try again.",
            ),
          )}
        </p>
      )}
      {state === "ready" && visible.length === 0 && (
        <p>{t(text("Chưa có bài nộp.", "No submissions yet."))}</p>
      )}
      <ul>
        {visible.map((row) => {
          const data = row.data(),
            label = verdicts[data.verdict];
          return (
            <li key={row.id}>
              {label
                ? t(text(...label))
                : t(
                    text("Chưa có kết quả đã xác minh", "No verified result"),
                  )}{" "}
              · {typeof data.language === "string" ? data.language : "—"}
            </li>
          );
        })}
      </ul>
      {more && (
        <button disabled={state === "loading"} onClick={() => void next()}>
          {t(text("Đọc thêm lịch sử", "Load more history"))}
        </button>
      )}
    </section>
  );
}
