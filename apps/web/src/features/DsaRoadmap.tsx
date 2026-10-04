import { useGraphViewport } from "../hooks/useGraphViewport";
import BookmarkButton from "../components/BookmarkButton";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import {
  dsaGraph,
  topicLabels,
  problemsFor,
  type DsaSet,
} from "../../../../packages/domain/src/dsa-catalog";
import { useLanguage, text } from "../i18n";
import { functions } from "../firebase";
import { useSession } from "../session";
export default function DsaRoadmap() {
  const { t, locale } = useLanguage();
  const user = useSession();
  const [params, setParams] = useSearchParams();
  const selected = params.get("topic");
  const [set, setSet] = useState<DsaSet>("neetcode150"),
    [sort, setSort] = useState(false),
    [status, setStatus] = useState(""),
    [month, setMonth] = useState(
      () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
  const dialog = useRef<HTMLDialogElement>(null);
  const { canvas, viewport, zoom, reset } = useGraphViewport();
  const list = problemsFor(set);
  const topic = dsaGraph.find((n) => n.topic === selected);
  const rows = list
    .filter((p) => p.topic === selected)
    .sort((a, b) =>
      sort
        ? ["Easy", "Medium", "Hard"].indexOf(a.difficulty) -
          ["Easy", "Medium", "Hard"].indexOf(b.difficulty)
        : 0,
    );
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    if (!selected && dialog.current?.open) dialog.current.close();
  }, [selected]);
  async function enroll() {
    try {
      await httpsCallable(
        functions,
        "enrollRoadmap",
      )({
        trackSlug: "dsa",
        roadmapVersion: "dsa-v1",
        requestId: crypto.randomUUID(),
      });
      setStatus(t(text("Đã lưu lộ trình DSA.", "DSA plan saved.")));
    } catch {
      setStatus(
        t(
          text(
            "Chưa lưu được lộ trình. Kiểm tra kết nối và thử lại.",
            "The plan was not saved. Check your connection and try again.",
          ),
        ),
      );
    }
  }
  const close = () => {
    setParams({});
  };
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <section className="dsa-roadmap">
      <p role="status">{status}</p>
      <p id="dsa-gesture-help" className="sr-only">
        {t(
          text(
            "Dùng hai ngón để di chuyển, chụm ngón hoặc Ctrl/Command và cuộn để phóng to thu nhỏ. Kéo chuột để di chuyển. Khi sơ đồ được chọn, dùng phím mũi tên để di chuyển, dấu cộng hoặc trừ để thu phóng và 0 để đặt lại.",
            "Use two fingers to pan, pinch or Ctrl/Command and scroll to zoom. Drag with the mouse to pan. With the graph focused, use arrow keys to pan, plus or minus to zoom, and 0 to reset.",
          ),
        )}
      </p>
      <div className="dsa-layout">
        <div
          className="dsa-canvas"
          ref={canvas}
          tabIndex={0}
          role="region"
          aria-label={t(text("Sơ đồ DSA", "DSA graph"))}
          aria-describedby="dsa-gesture-help"
        >
          <h1 className="dsa-canvas-title">
            {t(text("Lộ trình DSA", "DSA Roadmap"))}
          </h1>
          <div
            className="dsa-graph"
            style={{
              transform: `translate(${viewport.x}px,${viewport.y}px) scale(${viewport.scale})`,
            }}
          >
            <svg
              className="dsa-connectors"
              viewBox="0 0 1060 1100"
              aria-hidden="true"
            >
              {dsaGraph.flatMap((n) =>
                n.parents.map((parent) => {
                  const p = dsaGraph.find((x) => x.topic === parent)!;
                  return (
                    <path
                      key={n.topic + parent}
                      d={`M${p.x + 80} ${p.y + 58} C${p.x + 80} ${p.y + 100},${n.x + 80} ${n.y - 40},${n.x + 80} ${n.y}`}
                    />
                  );
                }),
              )}
            </svg>
            {dsaGraph.map((n) => (
              <button
                key={n.topic}
                className="dsa-topic"
                style={{ left: n.x, top: n.y }}
                onClick={() => setParams({ topic: n.topic })}
              >
                <strong>{t(topicLabels[n.topic]!)}</strong>
                <span className="dsa-topic-line" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="canvas-controls">
            <button
              aria-label={t(text("Phóng to", "Zoom in"))}
              onClick={() => zoom(1.2)}
            >
              +
            </button>
            <button
              aria-label={t(text("Thu nhỏ", "Zoom out"))}
              onClick={() => zoom(1 / 1.2)}
            >
              −
            </button>
            <button
              aria-label={t(text("Đặt lại sơ đồ", "Reset graph"))}
              onClick={reset}
            >
              ⛶
            </button>
          </div>
        </div>
        <aside
          className="dsa-side"
          aria-label={t(text("Tổng quan DSA", "DSA overview"))}
        >
          <section className="dsa-summary">
            <div className="dsa-totals">
              <div>
                {["Easy", "Medium", "Hard"].map((d, i) => (
                  <p key={d}>
                    <span>{t(text(["Dễ", "Trung bình", "Khó"][i]!, d))}</span>
                    <strong>
                      — / {list.filter((p) => p.difficulty === d).length}
                    </strong>
                  </p>
                ))}
              </div>
              <div className="dsa-ring">
                <strong>—</strong>
                <span>/{list.length}</span>
                <small>{t(text("Chưa xác minh", "Not verified"))}</small>
              </div>
            </div>
            <label className="sr-only" htmlFor="dsa-set">
              {t(text("Bộ bài tập", "Problem set"))}
            </label>
            <select
              id="dsa-set"
              value={set}
              onChange={(e) => setSet(e.target.value as DsaSet)}
            >
              <option value="neetcode150">NeetCode 150</option>
              <option value="blind75">Blind 75</option>
              <option value="all">
                {t(text("Tất cả danh mục tham chiếu", "All reference problems"))} (
                {problemsFor("all").length})
              </option>
            </select>
            {user && !user.isAnonymous && (
              <button onClick={() => void enroll()}>{t(text("Theo học DSA", "Start DSA plan"))}</button>
            )}

          </section>

          <section className="dsa-calendar">
            <div className="calendar-head">
              <button
                aria-label={t(text("Tháng trước", "Previous month"))}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                ‹
              </button>
              <h2>
                {month.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                aria-label={t(text("Tháng sau", "Next month"))}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                ›
              </button>
            </div>
            <div className="calendar-grid">
              {(locale === "vi"
                ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
                : ["S", "M", "T", "W", "T", "F", "S"]
              ).map((d, i) => (
                <span key={"d" + i}>{d}</span>
              ))}
              {Array.from({ length: month.getDay() }, (_, i) => (
                <span key={"empty" + i} />
              ))}
              {Array.from({ length: days }, (_, i) => (
                <span
                  className={
                    month.getMonth() === new Date().getMonth() &&
                    month.getFullYear() === new Date().getFullYear() &&
                    i + 1 === new Date().getDate()
                      ? "today"
                      : ""
                  }
                  key={i}
                >
                  {i + 1}
                </span>
              ))}
            </div>

            <div className="streaks">
              <span>
                {t(text("Chuỗi hiện tại", "Current streak"))}
                <strong>—</strong>
              </span>
              <span>
                {t(text("Chuỗi tốt nhất", "Best streak"))}
                <strong>—</strong>
              </span>
            </div>
          </section>
        </aside>
      </div>
      <dialog
        aria-label={t(text("Chi tiết chủ đề DSA", "DSA topic details"))}
        ref={dialog}
        className="dsa-dialog"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const bounds = e.currentTarget.getBoundingClientRect();
          if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) close();
        }}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <button
          className="dialog-close"
          onClick={close}
          aria-label={t(text("Đóng chủ đề", "Close topic"))}
        >
          ×
        </button>
        <h2>
          {selected && topicLabels[selected]
            ? t(topicLabels[selected]!)
            : selected}
        </h2>
        <p className="topic-count">
          {rows.length}{" "}
          {t(
            text("bài tham chiếu · Tiến độ chưa xác minh", "reference problems · Progress unverified"),
          )}
        </p>
        <h3>{t(text("Kiến thức tiên quyết", "Prerequisites"))}</h3>
        <div className="prerequisite-cards">
          {topic?.parents.length ? (
            topic.parents.map((p) => (
              <button key={p} onClick={() => setParams({ topic: p })}>
                {t(topicLabels[p]!)}
                <small>{t(text("Chủ đề trước", "Previous topic"))} →</small>
              </button>
            ))
          ) : (
            <Link to="/learn/request-window">
              {t(
                text(
                  "Duyệt mảng & ranh giới cửa sổ",
                  "Array iteration & window boundaries",
                ),
              )}
              <small>
                {t(
                  text(
                    "Bài Satsunic · Đang phát triển",
                    "Satsunic lesson · Work in progress",
                  ),
                )}{" "}
                →
              </small>
            </Link>
          )}
        </div>
        <div className="dsa-table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t(text("Trạng thái", "Status"))}</th>
                <th>{t(text("Dấu", "Star"))}</th>
                <th>{t(text("Bài tập", "Problem"))}</th>
                <th>
                  <button onClick={() => setSort(!sort)}>
                    {t(text("Độ khó", "Difficulty"))} ↕
                  </button>
                </th>
                <th>{t(text("Nguồn", "Source"))}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.slug}>
                  <td
                    title={t(
                      text("Chưa có kết quả được chấm", "No graded result"),
                    )}
                  >
                    ○
                  </td>
                  <td>
                    <BookmarkButton slug={p.slug} />
                  </td>
                  <td>
                    <Link to={`/practice/${p.slug}`}>{p.title}</Link>
                  </td>
                  <td>
                    <span className="difficulty">
                      {t(
                        text(
                          p.difficulty === "Easy"
                            ? "Dễ"
                            : p.difficulty === "Medium"
                              ? "Trung bình"
                              : "Khó",
                          p.difficulty,
                        ),
                      )}
                    </span>
                  </td>
                  <td>{t(text("Bản thử nghiệm", "Preview"))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </section>
  );
}
