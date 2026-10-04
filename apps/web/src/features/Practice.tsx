import GoogleAction from "../components/GoogleAction";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { challenge } from "../../../../packages/domain/src/catalog";
import { db, functions } from "../firebase";
import { useSession } from "../session";
import { useLanguage, text } from "../i18n";
import type { Draft } from "../../../../packages/contracts/src";
import { dsaProblems } from "../../../../packages/domain/src/dsa-catalog";
import ReferenceProblem from "./ReferenceProblem";
import PracticeCatalog from "./PracticeCatalog";
import { useLocalDraft } from "./workspace/useLocalDraft";
import { draftKey } from "./workspace/drafts";
const CodeEditor = lazy(() => import("./CodeEditor"));
type Language = Draft["language"];
function Workspace({ language }: { language: Language }) {
  const user = useSession();
  const { t, locale } = useLanguage();
  const localDraft = useLocalDraft(
    draftKey(user?.uid ?? "guest", challenge.revision, language),
    challenge.starters[language],
  );
  const source = localDraft.source,
    setSource = localDraft.edit;
  const [revision, setRevision] = useState<number | null>(null),
    [ready, setReady] = useState(false),
    [cloudLoaded, setCloudLoaded] = useState(false),
    [status, setStatus] = useState(""),
    [saving, setSaving] = useState(false),
    [editor, setEditor] = useState(() =>
      localStorage.getItem("satsuniccode.editor") === "textarea" ? false : true,
    ),
    [hint, setHint] = useState(0);
  useEffect(() => {
    setStatus("");
  }, [locale]);
  const [contentTab, setContentTab] = useState("question"),
    [consoleOpen, setConsoleOpen] = useState(true),
    [split, setSplit] = useState(45);
  const key = `${challenge.revision}-${language}-learning`;
  useEffect(() => {
    let live = true;
    if (!user || user.isAnonymous) {
      setReady(true);
      return () => {
        live = false;
      };
    }
    setStatus(t(text("Đang đọc bản nháp…", "Loading draft…")));
    getDoc(doc(db, `users/${user.uid}/drafts/${key}`))
      .then((s) => {
        if (!live) return;
        if (s.exists()) {
          if (!localDraft.hasStored) setSource(s.data().source);
          setRevision(s.data().revision);
        }
        setReady(true);
        setCloudLoaded(true);
        setStatus(
          s.exists()
            ? t(
                text(
                  localDraft.hasStored
                    ? "Đã đọc trạng thái đồng bộ; giữ bản nháp trên thiết bị."
                    : "Đã đọc bản nháp đã đồng bộ.",
                  localDraft.hasStored
                    ? "Sync state loaded; your device draft is preserved."
                    : "Synced draft loaded.",
                ),
              )
            : "",
        );
      })
      .catch(() => {
        if (live) {
          setReady(true);
          setStatus(
            t(
              text(
                "Chưa đọc được bản nháp. Tải lại trước khi sửa để tránh ghi đè.",
                "Draft could not be loaded. Reload before editing to avoid overwriting it.",
              ),
            ),
          );
        }
      });
    return () => {
      live = false;
    };
  }, [user?.uid, key]);
  async function save() {
    if (!user || !ready || !cloudLoaded) return;
    const immutable = source;
    setSaving(true);
    setStatus(t(text("Đang lưu…", "Saving…")));
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, `users/${user.uid}/drafts/${key}`);
        const snapshot = await tx.get(ref);
        if ((snapshot.exists() ? snapshot.data().revision : null) !== revision)
          throw new Error("CONFLICT");
        tx.set(ref, {
          source: immutable,
          language,
          challengeRevision: challenge.revision,
          context: "learning",
          revision: revision === null ? 0 : revision + 1,
          createdBy: user.uid,
          changedBy: user.uid,
          createdDate: snapshot.exists()
            ? snapshot.data().createdDate
            : serverTimestamp(),
          changedDate: serverTimestamp(),
          schemaVersion: 1,
        });
      });
      setRevision(revision === null ? 0 : revision + 1);
      setStatus(t(text("Đã đồng bộ bản nháp.", "Draft synced.")));
    } catch {
      setStatus(
        t(
          text(
            "Bản nháp chưa đồng bộ. Có thể có thay đổi ở thẻ khác hoặc mất kết nối. Giữ mã và tải lại bản mới trước khi ghi đè.",
            "Draft was not synced. Another tab may have changed it or the connection failed. Keep your code and reload the latest version before overwriting.",
          ),
        ),
      );
    } finally {
      setSaving(false);
    }
  }
  async function submit() {
    setStatus(
      t(
        text(
          "Đang kiểm tra khả năng chấm…",
          "Checking execution availability…",
        ),
      ),
    );
    try {
      await httpsCallable(
        functions,
        "createSubmission",
      )({
        problemRevision: challenge.revision,
        source,
        language,
        requestId: crypto.randomUUID(),
        mode: "submit",
      });
    } catch {
      setStatus(
        t(
          text(
            "Chưa có môi trường thực thi được duyệt. Mã chưa được chạy hoặc chấm; không có kết quả hoặc bằng chứng mới.",
            "No approved sandbox is configured. Code was not executed or graded; no verdict or evidence was created.",
          ),
        ),
      );
    }
  }
  return (
    <div
      className="workspace coding-workspace"
      style={{ gridTemplateColumns: `${split}% minmax(0,1fr)` }}
    >
      <article className="problem">
        <div
          className="workspace-tabs"
          role="tablist"
          aria-label={t(text("Nội dung bài", "Problem content"))}
        >
          {["question", "solution", "submissions", "discussion"].map((x, i) => (
            <button
              key={x}
              role="tab"
              aria-selected={contentTab === x}
              aria-controls="authored-problem-panel"
              onClick={() => setContentTab(x)}
            >
              {t(
                text(
                  ["Đề bài", "Lời giải", "Bài nộp", "Thảo luận"][i]!,
                  ["Question", "Solution", "Submissions", "Discuss"][i]!,
                ),
              )}
            </button>
          ))}
        </div>
        <div
          id="authored-problem-panel"
          role="tabpanel"
          tabIndex={0}
          className="authored-problem-body"
        >
          {contentTab === "question" ? (
            <>
              <p className="eyebrow">DSA · {challenge.difficulty}</p>
              <h1>{t(challenge.title)}</h1>
              <p className="notice">
                {t(
                  text(
                    "Đang phát triển · Chưa thể chạy mã.",
                    "Work in progress · Code execution is unavailable.",
                  ),
                )}
              </p>
              <p>{t(challenge.statement)}</p>
              <h2>{t(text("Giới hạn", "Constraints"))}</h2>
              <p>
                <code>{challenge.constraints}</code>
              </p>
              <h2>{t(text("Ví dụ công khai", "Public examples"))}</h2>
              {challenge.examples.map((e, i) => (
                <pre key={i}>{JSON.stringify(e, null, 2)}</pre>
              ))}
              <button
                onClick={() => setHint((x) => Math.min(x + 1, 3))}
                disabled={hint === 3}
              >
                {t(text("Mở thêm gợi ý", "Show next hint"))}
              </button>
              {challenge.hints.vi.slice(0, hint).map((_, i) => (
                <p key={i}>{challenge.hints[locale][i]}</p>
              ))}
              <Link to="/learn/request-window">
                {t(text("Quay lại bài học", "Back to lesson"))}
              </Link>
            </>
          ) : (
            <>
              <h2>
                {t(
                  text(
                    "Chưa có nội dung được công bố",
                    "No published content yet",
                  ),
                )}
              </h2>
              <p>{t(text("Đang phát triển", "Work in progress"))}</p>
            </>
          )}
        </div>
      </article>
      <section className="editor-pane">
        <div className="editor-header">
          <strong>{language}</strong>
          <label className="split-control">
            {t(text("Tỷ lệ hai khung", "Pane split"))}
            <input
              type="range"
              min="30"
              max="65"
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
            />
          </label>
          <button
            disabled={!ready}
            onClick={() =>
              setEditor((x) => {
                localStorage.setItem(
                  "satsuniccode.editor",
                  x ? "textarea" : "monaco",
                );
                return !x;
              })
            }
          >
            {editor
              ? t(text("Dùng ô nhập mã", "Use code textarea"))
              : t(text("Mở Monaco Editor", "Open Monaco Editor"))}
          </button>
        </div>
        <label htmlFor="source">
          {t(text("Mã của bạn", "Your source code"))}
        </label>
        {editor ? (
          <Suspense
            fallback={
              <p>{t(text("Đang tải trình soạn thảo…", "Loading editor…"))}</p>
            }
          >
            <CodeEditor
              value={source}
              language={language}
              readOnly={saving || !ready}
              onChange={(v) => {
                setSource(v ?? "");
                setStatus(
                  t(
                    text(
                      "Thay đổi trong tab này; chưa đồng bộ.",
                      "Changes in this tab; not synced.",
                    ),
                  ),
                );
              }}
            />
          </Suspense>
        ) : (
          <textarea
            id="source"
            className="code-input"
            spellCheck={false}
            disabled={!ready || saving}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setStatus(
                t(
                  text(
                    "Thay đổi trong tab này; chưa đồng bộ.",
                    "Changes in this tab; not synced.",
                  ),
                ),
              );
            }}
          />
        )}
        <div className="workspace-console authored-console">
          <button
            onClick={() => setConsoleOpen(!consoleOpen)}
            aria-expanded={consoleOpen}
          >
            {t(text("Bảng kết quả", "Console"))} {consoleOpen ? "⌄" : "⌃"}
          </button>
          <div className="actions">
            {user && !user.isAnonymous ? (
              <button
                className="primary"
                disabled={!ready || !cloudLoaded || saving}
                onClick={() => void save()}
              >
                {t(text("Lưu bản nháp", "Save draft"))}
              </button>
            ) : (
              <GoogleAction className="button">
                {t(text("Đăng nhập để lưu", "Sign in to save"))}
              </GoogleAction>
            )}
            <button
              onClick={() => void submit()}
              disabled={!user || user.isAnonymous || !ready || saving}
            >
              {t(text("Kiểm tra khả năng chấm", "Check grading availability"))}
            </button>
          </div>
          <button
            onClick={() => void submit()}
            disabled={!user || user.isAnonymous || !ready || saving}
          >
            {t(text("Chạy", "Run"))}
          </button>
          <button
            onClick={() => void submit()}
            disabled={!user || user.isAnonymous || !ready || saving}
          >
            {t(text("Nộp bài", "Submit"))}
          </button>
        </div>
        <p role="status" className="draft-status" hidden={!consoleOpen}>
          {status}
        </p>
        <p className="muted">
          {t(
            text(
              "Bản nháp tự lưu trên thiết bị này. Đồng bộ tài khoản bằng Lưu bản nháp. Môi trường thực thi chưa được xác minh.",
              "Drafts autosave on this device. Use Save draft to sync your account. Execution runtimes are not verified.",
            ),
          )}
        </p>
      </section>
    </div>
  );
}
export default function Practice() {
  const { challengeSlug } = useParams();
  const { t } = useLanguage();
  const [language, setLanguage] = useState<Language>("javascript");
  if (!challengeSlug) return <PracticeCatalog />;
  if (
    challengeSlug !== challenge.slug &&
    dsaProblems.some((p) => p.slug === challengeSlug)
  )
    return (
      <ReferenceProblem
        key={challengeSlug}
        problem={dsaProblems.find((p) => p.slug === challengeSlug)!}
      />
    );
  if (challengeSlug !== challenge.slug)
    return <h1>{t(text("Không tìm thấy bài tập", "Challenge not found"))}</h1>;
  return (
    <>
      <label className="language-select">
        {t(
          text(
            "Ngôn ngữ lập trình (chưa thể thực thi)",
            "Editing language (runtime unavailable)",
          ),
        )}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          {Object.keys(challenge.starters).map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      <Workspace key={language} language={language} />
    </>
  );
}
