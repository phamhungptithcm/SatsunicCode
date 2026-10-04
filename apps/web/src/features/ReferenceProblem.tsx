import { useActionNotice } from "../hooks/useToastNotice";
import WorkspaceIcon from "./workspace/WorkspaceIcon";
import GoogleAction from "../components/GoogleAction";
import AccountMenu from "../components/AccountMenu";
import BookmarkButton from "../components/BookmarkButton";
import { useState, lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  dsaProblems,
  type DsaProblem,
} from "../../../../packages/domain/src/dsa-catalog";
import { duplicateCheck } from "../../../../content/original/duplicate-check";
import { useLanguage, text } from "../i18n";
import { useSession, useAccountControls } from "../session";
import { draftKey } from "./workspace/drafts";
import { useLocalDraft } from "./workspace/useLocalDraft";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import SubmissionHistory from "./workspace/SubmissionHistory";
import CloudDraftControls from "./workspace/CloudDraftControls";
const Editor = lazy(() => import("./CodeEditor"));
export default function ReferenceProblem({ problem }: { problem: DsaProblem }) {
  const user = useSession();
  const [language, setLanguage] = useState("python");
  return (
    <ReferenceWorkspace
      key={`${user?.uid ?? "guest"}:${problem.slug}:${language}`}
      problem={problem}
      language={language}
      setLanguage={setLanguage}
      owner={user?.uid ?? "guest"}
    />
  );
}
function ReferenceWorkspace({
  problem,
  language,
  setLanguage,
  owner,
}: {
  problem: DsaProblem;
  language: string;
  setLanguage: (language: string) => void;
  owner: string;
}) {
  const { t, locale } = useLanguage();
  const { status, transient, setStatus } = useActionNotice();
  const { ready } = useAccountControls();
  const user = useSession();
  const userAuthenticated = !!user && !user.isAnonymous;
  const authored = problem.slug === "contains-duplicate";
  const draft = useLocalDraft(
    draftKey(owner, `${problem.slug}-v1`, language),
    authored ? (duplicateCheck.starters[language] ?? "") : "",
  );
  const source = draft.source,
    setSource = draft.edit;
  const [tab, setTab] = useState("question"),
    [consoleOpen, setConsole] = useState(false),
    [wide, setWide] = useState(false);
  const [mobileView, setMobileView] = useState("question");
  const [hint, setHint] = useState(0),
    [caseIndex, setCaseIndex] = useState(0),
    [custom, setCustom] = useState("[]"),
    [busy, setBusy] = useState(false),
    [split, setSplit] = useState(45);
  const [plain, setPlain] = useState(
    localStorage.getItem("satsuniccode.editor") === "textarea",
  );
  useEffect(() => {
    setStatus("");
  }, [locale]);
  const index = dsaProblems.findIndex((p) => p.slug === problem.slug);
  async function execute(mode: "run" | "submit") {
    if (busy) return;
    setConsole(true);
    setMobileView("code");
    if (!authored) {
      setStatus(
        t(
          text(
            "Bài chưa có nội dung và bộ kiểm thử được duyệt.",
            "This reference has no approved content and tests.",
          ),
        ),
       "warning");
      return;
    }
    if (mode === "run" && caseIndex === -1) {
      try {
        const input = JSON.parse(custom);
        if (
          !Array.isArray(input) ||
          input.length > 100000 ||
          input.some(
            (x) => !Number.isInteger(x) || x < -2147483648 || x > 2147483647,
          )
        )
          throw new Error();
      } catch {
        setStatus(
          t(
            text(
              "Nhập mảng số nguyên 32 bit hợp lệ, tối đa 100.000 phần tử.",
              "Enter a valid array of 32-bit integers, up to 100,000 items.",
            ),
          ),
         "error");
        return;
      }
    }
    setBusy(true);
    try {
      const response = await httpsCallable(
        functions,
        "getExecutionCapabilities",
      )({});
      const available = (response.data as { available?: boolean }).available;
      setStatus(
        t(
          text(
            available
              ? "Chưa có adapter thực thi được xác minh cho bài này. Mã chưa được chạy hoặc chấm."
              : "Runner chưa được kết nối. Mã chưa được chạy hoặc chấm.",
            available
              ? "No verified execution adapter exists for this problem. Code was not run or graded."
              : "Runner is not connected. Code was not run or graded.",
          ),
        ),
       "warning");
    } catch {
      setStatus(
        t(
          text(
            "Không kết nối được dịch vụ thực thi. Mã chưa được chạy hoặc chấm; bản nháp được giữ lại.",
            "Execution service could not be reached. Code was not run or graded; your draft is preserved.",
          ),
        ),
       "error");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        if (!busy && source.trim()) void execute(e.shiftKey ? "submit" : "run");
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [busy, source, custom, caseIndex, locale]);
  return (
    <section
      className={`reference-workspace ${wide ? "expanded" : ""}`}
      data-mobile-view={mobileView}
    >
      <header className="workspace-topbar">
        <Link to="/roadmaps/dsa">
          <WorkspaceIcon name="back" />
          DSA
        </Link>
        <strong>{problem.title}</strong>
        <BookmarkButton slug={problem.slug} workspace />
        <Link
          to={`/practice/${dsaProblems[(index - 1 + dsaProblems.length) % dsaProblems.length]!.slug}`}
          aria-label={t(text("Bài trước", "Previous problem"))}
          title={t(text("Bài trước", "Previous problem"))}
        >
          <WorkspaceIcon name="previous" />
        </Link>
        <Link
          to={`/practice/${dsaProblems[(index + 1) % dsaProblems.length]!.slug}`}
          aria-label={t(text("Bài sau", "Next problem"))}
          title={t(text("Bài sau", "Next problem"))}
        >
          <WorkspaceIcon name="next" />
        </Link>
        {ready &&
          (userAuthenticated ? (
            <AccountMenu />
          ) : (
            <GoogleAction>
              {t(text("Đăng nhập bằng Google", "Sign in with Google"))}
            </GoogleAction>
          ))}
      </header>
      <nav
        className="workspace-mobile-views"
        aria-label={t(text("Khung làm bài", "Workspace view"))}
      >
        <button
          aria-controls="workspace-question"
          aria-pressed={mobileView === "question"}
          onClick={() => setMobileView("question")}
        >
          {t(text("Đề bài", "Question"))}
        </button>
        <button
          aria-controls="workspace-editor"
          aria-pressed={mobileView === "code"}
          onClick={() => setMobileView("code")}
        >
          {t(text("Viết mã", "Code"))}
        </button>
      </nav>
      <div
        className="reference-split"
        style={{ gridTemplateColumns: `${split}% minmax(0, 1fr)` }}
      >
        <article className="reference-question" id="workspace-question">
          <div
            className="workspace-tabs"
            role="tablist"
            aria-label={t(text("Nội dung bài", "Problem content"))}
          >
            {["question", "solution", "submissions"].map((x, i) => (
              <button
                key={x}
                role="tab"
                id={`workspace-tab-${x}`}
                tabIndex={tab === x ? 0 : -1}
                onKeyDown={(e) => {
                  const tabs = ["question", "solution", "submissions"];
                  const index = tabs.indexOf(x);
                  const next =
                    e.key === "ArrowRight"
                      ? (index + 1) % 3
                      : e.key === "ArrowLeft"
                        ? (index + 2) % 3
                        : e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 2
                            : -1;
                  if (next >= 0) {
                    e.preventDefault();
                    setTab(tabs[next]!);
                    document
                      .getElementById(`workspace-tab-${tabs[next]}`)
                      ?.focus();
                  }
                }}
                aria-selected={tab === x}
                aria-controls="reference-panel"
                onClick={() => setTab(x)}
              >
                {t(
                  text(
                    ["Đề bài", "Lời giải", "Bài nộp", "Thảo luận"][i]!,
                    ["Question", "Solution", "Submissions", "Discuss"][i]!,
                  ),
                )}
              </button>
            ))}
            <span
              className="difficulty workspace-difficulty"
              data-difficulty={problem.difficulty}
            >
              {t(
                text(
                  problem.difficulty === "Easy"
                    ? "Dễ"
                    : problem.difficulty === "Medium"
                      ? "Trung bình"
                      : "Khó",
                  problem.difficulty,
                ),
              )}
            </span>
          </div>
          <div
            className="reference-body"
            id="reference-panel"
            role="tabpanel"
            aria-labelledby={`workspace-tab-${tab}`}
            tabIndex={0}
          >
            <h1>{authored ? t(duplicateCheck.title) : problem.title}</h1>

            {!authored && (
              <p>
                {t(
                  text(
                    "Danh mục tham chiếu NeetCode, chưa phải bài Satsunic đã xuất bản.",
                    "NeetCode reference entry, not a published Satsunic assignment.",
                  ),
                )}
              </p>
            )}
            {tab === "question" && authored ? (
              <>
                <p className="notice">
                  {t(
                    text(
                      "Đề Satsunic tự biên soạn · Đang phát triển",
                      "Authored by Satsunic · Work in progress",
                    ),
                  )}
                </p>
                <p>{t(duplicateCheck.statement)}</p>
                <h2>{t(text("Ví dụ", "Examples"))}</h2>
                {duplicateCheck.examples.map((e, i) => (
                  <pre key={i}>
                    {t(text("Đầu vào", "Input"))}: {JSON.stringify(e.input)}
                    {"\n\n"}
                    {t(text("Đầu ra", "Output"))}: {String(e.output)}
                  </pre>
                ))}
                <h2>{t(text("Giới hạn", "Constraints"))}</h2>
                <p>{t(duplicateCheck.constraints)}</p>
                {duplicateCheck.hints.slice(0, hint).map((value, i) => (
                  <p key={i}>{value[locale]}</p>
                ))}
              </>
            ) : tab === "question" ? (
              <>
                <p>
                  {t(
                    text(
                      "Tên bài được đối chiếu từ metadata MIT. Đề, ví dụ, giới hạn và bộ kiểm thử cần được biên soạn hoặc cấp phép trước khi luyện và chấm trên SatsunicCode.",
                      "Title is referenced from MIT metadata. Statements, examples, constraints and test suites must be authored or licensed before SatsunicCode practice and grading.",
                    ),
                  )}
                </p>
                <a
                  className="button"
                  href={problem.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t(text("Đọc đề tại nguồn", "Read the source problem"))} ↗
                </a>
                <p>
                  <Link to="/practice/peak-requests">
                    {t(
                      text(
                        "Thử bài Satsunic đã biên soạn",
                        "Open the Satsunic exercise",
                      ),
                    )}{" "}
                    →
                  </Link>
                </p>
              </>
            ) : tab === "submissions" && authored ? (
              <SubmissionHistory problemRevision="duplicate-check-v1" />
            ) : tab === "solution" && authored ? (
              <>
                <h2>
                  {t(
                    text(
                      "Cách tiếp cận · bản thử nghiệm",
                      "Approach · content preview",
                    ),
                  )}
                </h2>
                <p>
                  {t(
                    text(
                      "Duyệt các mã một lần, lưu mã đã thấy trong tập hợp. Nếu mã đã có trong tập hợp, trả về true; nếu duyệt hết mà không gặp mã lặp, trả về false.",
                      "Scan the codes once, storing previously seen values in a set. Return true when a value is already in the set; return false if the scan completes without a repeat.",
                    ),
                  )}
                </p>
                <p>
                  {t(
                    text(
                      "Thời gian kỳ vọng O(n), bộ nhớ O(n). Giữ nguyên mảng đầu vào.",
                      "Expected O(n) time and O(n) space. Preserve the input array.",
                    ),
                  )}
                </p>
              </>
            ) : (
              <p>{t(text("Sắp ra mắt", "Coming soon"))}</p>
            )}
          </div>
        </article>
        <div
          className="workspace-divider"
          role="separator"
          aria-orientation="vertical"
          aria-label={t(text("Chia hai khung", "Resize panes"))}
          aria-valuemin={30}
          aria-valuemax={65}
          aria-valuenow={split}
          tabIndex={0}
          style={{ left: `calc(${split}% - 6px)` }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              setSplit((value) =>
                Math.min(
                  65,
                  Math.max(30, value + (e.key === "ArrowLeft" ? -1 : 1)),
                ),
              );
            }
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const bounds =
              e.currentTarget.parentElement!.getBoundingClientRect();
            setSplit(
              Math.min(
                65,
                Math.max(
                  30,
                  Math.round(((e.clientX - bounds.left) / bounds.width) * 100),
                ),
              ),
            );
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        />
        <section className="reference-editor" id="workspace-editor">
          <div className="editor-toolbar">
            <label className="sr-only" htmlFor="reference-language">
              {t(text("Ngôn ngữ lập trình", "Programming language"))}
            </label>
            <select
              id="reference-language"
              value={language}
              onChange={(e) => {
                draft.persist();
                setLanguage(e.target.value);
              }}
            >
              {["python", "javascript", "typescript", "java"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <span className="workspace-save-state">
              {t(
                text(
                  draft.state === "saved"
                    ? "Lưu trên thiết bị này"
                    : draft.state === "conflict"
                      ? "Xung đột bản nháp"
                      : draft.state === "error"
                        ? "Chưa lưu được bản nháp"
                        : "Đang chờ lưu…",
                  draft.state === "saved"
                    ? "Stored on this device"
                    : draft.state === "conflict"
                      ? "Draft conflict"
                      : draft.state === "error"
                        ? "Draft could not be saved"
                        : "Waiting to save…",
                ),
              )}
            </span>
            <div className="workspace-editor-actions">
              <button
                className="workspace-icon-control"
                aria-label={t(text("Gợi ý", "Hint"))}
                title={t(text("Gợi ý", "Hint"))}
                data-tooltip={t(text("Gợi ý", "Hint"))}
                disabled={!authored || hint >= duplicateCheck.hints.length}
                onClick={() => {
                  setTab("question");
                  setMobileView("question");
                  setHint((value) =>
                    Math.min(value + 1, duplicateCheck.hints.length),
                  );
                }}
              >
                <WorkspaceIcon name="hint" />
                <span className="sr-only">{t(text("Gợi ý", "Hint"))}</span>
              </button>
              <button
                className="workspace-icon-control"
                aria-label={t(text("Đặt lại mã", "Reset code"))}
                title={t(text("Đặt lại mã", "Reset code"))}
                data-tooltip={t(text("Đặt lại mã", "Reset code"))}
                onClick={() => draft.reset()}
              >
                <WorkspaceIcon name="reset" />
                <span className="sr-only">
                  {t(text("Đặt lại mã", "Reset code"))}
                </span>
              </button>
              <button
                className="workspace-icon-control"
                aria-label={t(text("Khôi phục mã", "Undo reset"))}
                title={t(text("Khôi phục mã", "Undo reset"))}
                data-tooltip={t(text("Khôi phục mã", "Undo reset"))}
                disabled={!draft.canUndo}
                onClick={() => draft.undo()}
              >
                <WorkspaceIcon name="undo" />
                <span className="sr-only">
                  {t(text("Khôi phục mã", "Undo reset"))}
                </span>
              </button>
              <button
                className="workspace-icon-control"
                aria-label={t(
                  text(
                    plain ? "Mở editor" : "Ô nhập mã",
                    plain ? "Open editor" : "Code textarea",
                  ),
                )}
                title={t(
                  text(
                    plain ? "Mở editor" : "Ô nhập mã",
                    plain ? "Open editor" : "Code textarea",
                  ),
                )}
                data-tooltip={t(
                  text(
                    plain ? "Mở editor" : "Ô nhập mã",
                    plain ? "Open editor" : "Code textarea",
                  ),
                )}
                onClick={() => {
                  localStorage.setItem(
                    "satsuniccode.editor",
                    plain ? "monaco" : "textarea",
                  );
                  setPlain(!plain);
                }}
              >
                <WorkspaceIcon name="code" />
                <span className="sr-only">
                  {" "}
                  {t(
                    text(
                      plain ? "Mở editor" : "Ô nhập mã",
                      plain ? "Open editor" : "Code textarea",
                    ),
                  )}
                </span>
              </button>
              {authored && (
                <CloudDraftControls
                  compact
                  revision="duplicate-check-v1"
                  language={language}
                  source={source}
                  restore={setSource}
                />
              )}
              <button
                className="workspace-icon-control"
                data-tooltip={t(
                  text(
                    wide ? "Thu gọn workspace" : "Mở rộng workspace",
                    wide ? "Restore workspace" : "Expand workspace",
                  ),
                )}
                aria-pressed={wide}
                aria-label={t(
                  text(
                    wide ? "Thu gọn workspace" : "Mở rộng workspace",
                    wide ? "Restore workspace" : "Expand workspace",
                  ),
                )}
                title={t(
                  text(
                    wide ? "Thu gọn workspace" : "Mở rộng workspace",
                    wide ? "Restore workspace" : "Expand workspace",
                  ),
                )}
                onClick={() => setWide(!wide)}
              >
                <WorkspaceIcon name={wide ? "restore" : "expand"} />
              </button>
            </div>
          </div>
          <div className="reference-code">
            {plain ? (
              <textarea
                className="code-input"
                aria-label={t(text("Mã của bạn", "Your source code"))}
                spellCheck={false}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            ) : (
              <Suspense
                fallback={
                  <p>
                    {t(text("Đang tải trình soạn thảo…", "Loading editor…"))}
                  </p>
                }
              >
                <Editor
                  height="100%"
                  path={`${owner}/${problem.slug}/${language}`}
                  value={source}
                  language={language}
                  onChange={(v) => {
                    if ((v ?? "").length <= 100000) setSource(v ?? "");
                    else {
                      setConsole(true);
                      setStatus(
                        t(
                          text(
                            "Mã vượt giới hạn 100.000 ký tự; thay đổi chưa được lưu.",
                            "Code exceeds 100,000 characters; the change was not saved.",
                          ),
                        ),
                       "error");
                    }
                  }}
                  readOnly={false}
                />
              </Suspense>
            )}
          </div>
          {(draft.state === "error" || draft.state === "conflict") && (
            <div className="workspace-draft-alert" role="status">
              <p>
                {t(
                  text(
                    "Mã hiện tại vẫn được giữ trong editor. Sao chép trước khi đọc bản mới; có thể khôi phục mã sau khi đọc.",
                    "Your code remains in the editor. Copy it before loading the latest draft; you can restore it afterward.",
                  ),
                )}
              </p>
              <button onClick={draft.reload}>
                {t(text("Đọc bản nháp mới", "Load latest draft"))}
              </button>
            </div>
          )}
          <div className="workspace-console">
            <button
              aria-expanded={consoleOpen}
              onClick={() => setConsole(!consoleOpen)}
            >
              {t(text("Bảng kết quả", "Console"))}
              <WorkspaceIcon name="chevron" />
            </button>
            {consoleOpen && authored && (
              <div className="workspace-testcases">
                <label>
                  {t(text("Test case", "Test case"))}
                  <select
                    aria-label={t(text("Test case", "Test case"))}
                    value={caseIndex}
                    onChange={(e) => setCaseIndex(Number(e.target.value))}
                  >
                    {duplicateCheck.examples.map((_, i) => (
                      <option key={i} value={i}>
                        Case {i + 1}
                      </option>
                    ))}
                    <option value={-1}>{t(text("Tự nhập", "Custom"))}</option>
                  </select>
                </label>
                {caseIndex === -1 ? (
                  <textarea
                    aria-label={t(text("Dữ liệu test", "Test input"))}
                    value={custom}
                    maxLength={1000000}
                    onChange={(e) => setCustom(e.target.value)}
                  />
                ) : (
                  <pre>
                    {JSON.stringify(duplicateCheck.examples[caseIndex]?.input)}
                    {t(text("Kết quả mong đợi", "Expected output"))}:{" "}
                    {String(duplicateCheck.examples[caseIndex]?.output)}
                  </pre>
                )}
              </div>
            )}
            {consoleOpen && (
              <p role={transient ? undefined : "status"}>
                {status || t(text("Chưa có lần chạy.", "No execution yet."))}
              </p>
            )}
            <div className="execution-actions">
              <small className="workspace-runner-state">
                {t(text("Runner chưa kết nối", "Runner not connected"))}
              </small>
              <button
                disabled={busy || !source.trim()}
                title={t(text("Chạy · Ctrl/⌘ + Enter", "Run · Ctrl/⌘ + Enter"))}
                onClick={() => void execute("run")}
              >
                <WorkspaceIcon name="play" />
                {t(
                  text(
                    busy ? "Đang kiểm tra…" : "Chạy",
                    busy ? "Checking…" : "Run",
                  ),
                )}
              </button>
              <button
                className="primary"
                disabled={busy || !source.trim()}
                onClick={() => void execute("submit")}
              >
                <WorkspaceIcon name="send" />
                {t(text("Nộp bài", "Submit"))}
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
