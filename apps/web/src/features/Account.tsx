import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  collection,
  query,
  limit,
  orderBy,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import { useSession } from "../session";
import { text, useLanguage } from "../i18n";
import { Avatar } from "../components/AccountMenu";
import GoogleAction from "../components/GoogleAction";
import BookmarkButton from "../components/BookmarkButton";
import {
  dsaProblems,
} from "../../../../packages/domain/src/dsa-catalog";
export default function Account({
  dark,
  onTheme,
}: {
  dark: boolean;
  onTheme: () => void;
}) {
  const user = useSession(),
    { t, locale, toggle } = useLanguage(),
    location = useLocation();
  const page =
    location.pathname === "/settings"
      ? "settings"
      : location.pathname.endsWith("/saved")
        ? "saved"
        : location.pathname.endsWith("/submissions")
          ? "submissions"
          : "profile";
  const [rows, setRows] = useState<{ id: string; data: DocumentData }[]>([]),
    [state, setState] = useState("loading"),
    [filter, setFilter] = useState("");
  const [editor, setEditor] = useState(() => {
      try {
        return localStorage.getItem("satsuniccode.editor") === "textarea"
          ? "textarea"
          : "monaco";
      } catch {
        return "monaco";
      }
    }),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    setRows([]);
    setState("loading");
    if (!user || user.isAnonymous || !["saved", "submissions"].includes(page))
      return;
    return onSnapshot(
      query(
        collection(
          db,
          `users/${user.uid}/${page === "saved" ? "bookmarks" : "submissions"}`,
        ),
        orderBy(page === "saved" ? "changedDate" : "createdDate", "desc"),
        limit(50),
      ),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        setRows(snapshot.docs.map((d) => ({ id: d.id, data: d.data() })));
        setState("ready");
      },
      () => setState("error"),
    );
  }, [user?.uid, page]);
  const title = t(
    page === "settings"
      ? text("Cài đặt", "Settings")
      : page === "saved"
        ? text("Bài đã lưu", "Saved problems")
        : page === "submissions"
          ? text("Bài đã nộp", "My submissions")
          : text("Hồ sơ của tôi", "My profile"),
  );
  return (
    <section className="narrow user-content">
      <h1>{title}</h1>
      <nav
        className="account-page-tabs"
        aria-label={t(text("Quản lý tài khoản", "Account pages"))}
      >
        {[
          ["/account", text("Hồ sơ", "Profile")],
          ["/progress", text("Tiến độ", "Progress")],
          ["/account/saved", text("Bài đã lưu", "Saved problems")],
          ["/account/submissions", text("Bài đã nộp", "Submissions")],
          ["/settings", text("Cài đặt", "Settings")],
        ].map(([href, label]) => (
          <Link
            key={href as string}
            to={href as string}
            aria-current={location.pathname === href ? "page" : undefined}
          >
            {t(label as { vi: string; en: string })}
          </Link>
        ))}
      </nav>
      {page === "settings" ? (
        <>
          <p className="muted">
            {t(
              text(
                "Tùy chọn được lưu trên trình duyệt này.",
                "Preferences are stored in this browser.",
              ),
            )}
          </p>
          <div className="account-setting-row">
            <span>{t(text("Ngôn ngữ", "Language"))}</span>
            <button onClick={toggle}>
              {locale === "en" ? "English" : "Tiếng Việt"}
            </button>
          </div>
          <div className="account-setting-row">
            <span>{t(text("Giao diện", "Appearance"))}</span>
            <button onClick={onTheme}>
              {t(dark ? text("Tối", "Dark") : text("Sáng", "Light"))}
            </button>
          </div>
          <div className="account-setting-row">
            <label htmlFor="account-editor">
              {t(text("Trình soạn thảo", "Code editor"))}
            </label>
            <select
              id="account-editor"
              value={editor}
              onChange={(e) => {
                try {
                  localStorage.setItem("satsuniccode.editor", e.target.value);
                  setEditor(e.target.value);
                  setStorageError(false);
                } catch {
                  setStorageError(true);
                }
              }}
            >
              <option value="monaco">Monaco</option>
              <option value="textarea">
                {t(text("Văn bản thuần", "Plain text"))}
              </option>
            </select>
          </div>
          {storageError && (
            <p role="status">
              {t(
                text(
                  "Chưa lưu được tùy chọn. Trình duyệt có thể đang chặn bộ nhớ.",
                  "The preference was not saved. Browser storage may be blocked.",
                ),
              )}
            </p>
          )}
        </>
      ) : !user || user.isAnonymous ? (
        <>
          <p>
            {t(
              text(
                "Dùng tài khoản Google để xem dữ liệu của bạn.",
                "Use your Google account to view your data.",
              ),
            )}
          </p>
          <GoogleAction>
            {t(text("Tiếp tục với Google", "Continue with Google"))}
          </GoogleAction>
        </>
      ) : page === "profile" ? (
        <>
          <div className="google-profile">
            <Avatar large />
            <div>
              <h2>
                {user.displayName ||
                  t(text("Tài khoản Google", "Google account"))}
              </h2>
              {user.email && <p>{user.email}</p>}
            </div>
          </div>
          <div className="account-setting-row">
            <span>{t(text("Phương thức đăng nhập", "Sign-in method"))}</span>
            <strong>Google One Tap</strong>
          </div>
          <p className="muted">
            {t(
              text(
                "Tên và ảnh được lấy từ hồ sơ Google của bạn.",
                "Your name and photo come from your Google profile.",
              ),
            )}
          </p>
        </>
      ) : (
        <>
          {page === "saved" && (
            <label className="account-filter">
              {t(text("Tìm bài đã lưu", "Find saved problems"))}
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </label>
          )}
          {state === "loading" ? (
            <p role="status">{t(text("Đang tải…", "Loading…"))}</p>
          ) : state === "error" ? (
            <p role="alert">
              {t(
                text(
                  "Chưa tải được dữ liệu. Kiểm tra kết nối và thử tải lại trang.",
                  "Your data could not be loaded. Check your connection and reload the page.",
                ),
              )}
            </p>
          ) : (
            <>
              {rows
                .filter((r) => page !== "saved" || r.data.starred === true)
                .filter(
                  (r) =>
                    page !== "saved" ||
                    (dsaProblems.find((p) => p.slug === r.id)?.title ?? r.id)
                      .toLowerCase()
                      .includes(filter.toLowerCase()),
                ).length === 0 ? (
                <p>
                  {t(
                    page === "saved"
                      ? filter
                        ? text("Không có bài phù hợp.", "No matching problems.")
                        : text(
                            "Bạn chưa lưu bài nào.",
                            "You have no saved problems yet.",
                          )
                      : text(
                          "Bạn chưa có bài nộp được lưu.",
                          "You have no stored submissions yet.",
                        ),
                  )}
                </p>
              ) : (
                <div className="account-data-list">
                  {rows
                    .filter((r) => page !== "saved" || r.data.starred === true)
                    .filter(
                      (r) =>
                        page !== "saved" ||
                        (dsaProblems.find((p) => p.slug === r.id)?.title ?? r.id)
                          .toLowerCase()
                          .includes(filter.toLowerCase()),
                    )
                    .map((r) => (
                      <div className="account-data-row" key={r.id}>
                        {page === "saved" ? (
                          <>
                            <Link to={`/practice/${r.id}`}>
                              {(dsaProblems.find((p) => p.slug === r.id)?.title ?? r.id)}
                            </Link>
                            <BookmarkButton slug={r.id} />
                          </>
                        ) : (
                          <>
                            <span>
                              {String(
                                r.data.problemRevision ??
                                  r.data.challengeRevision ??
                                  r.id,
                              )}
                            </span>
                            <span>
                              {t(
                                (
                                  {
                                    ACCEPTED: text("Đúng", "Accepted"),
                                    WRONG_ANSWER: text(
                                      "Sai kết quả",
                                      "Wrong answer",
                                    ),
                                    COMPILE_ERROR: text(
                                      "Lỗi biên dịch",
                                      "Compile error",
                                    ),
                                    RUNTIME_ERROR: text(
                                      "Lỗi thực thi",
                                      "Runtime error",
                                    ),
                                    TIME_LIMIT: text(
                                      "Quá thời gian",
                                      "Time limit",
                                    ),
                                    MEMORY_LIMIT: text(
                                      "Quá bộ nhớ",
                                      "Memory limit",
                                    ),
                                  } as Record<
                                    string,
                                    { vi: string; en: string }
                                  >
                                )[r.data.verdict] ??
                                  text(
                                    "Chưa có kết quả chấm",
                                    "No graded result",
                                  ),
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {rows.length === 50 && (
                <p className="muted">
                  {t(
                    text(
                      "Hiển thị 50 mục gần nhất.",
                      "Showing the 50 most recent items.",
                    ),
                  )}
                </p>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
