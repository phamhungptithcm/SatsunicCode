import { useActionNotice } from "../hooks/useToastNotice";
import GoogleAction from "../components/GoogleAction";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { tracks, dsaNodes } from "../../../../packages/domain/src/catalog";
import { functions } from "../firebase";
import { useSession } from "../session";
import { useLanguage, text } from "../i18n";
import RoadmapCanvas from "./RoadmapCanvas";
export default function Roadmap() {
  const { trackSlug = "dsa" } = useParams();
  const { t, locale } = useLanguage();
  const user = useSession();
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState(false);
  const selected =
    dsaNodes.find((n) => n.id === params.get("node")) ?? dsaNodes[0]!;
  const { status, transient, setStatus } = useActionNotice();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setStatus("");
  }, [locale]);
  const track = tracks.find((x) => x.slug === trackSlug);
  async function enroll() {
    setBusy(true);
    setStatus(t(text("Đang lưu lộ trình…", "Saving plan…")), "info", true);
    try {
      await httpsCallable(
        functions,
        "enrollRoadmap",
      )({
        trackSlug: "dsa",
        roadmapVersion: "dsa-v1",
        requestId: crypto.randomUUID(),
      });
      setStatus(t(text("Đã lưu lộ trình DSA.", "DSA plan saved.")), "success");
    } catch {
      setStatus(
        t(
          text(
            "Chưa lưu được lộ trình. Kiểm tra kết nối và thử lại.",
            "The plan was not saved. Check your connection and try again.",
          ),
        ),
       "error");
    } finally {
      setBusy(false);
    }
  }
  if (!track)
    return <h1>{t(text("Không tìm thấy lộ trình", "Roadmap not found"))}</h1>;
  return (
    <section>
      <p className="eyebrow">ROADMAP / {track.slug.toUpperCase()}</p>
      <h1>{t(track.title)}</h1>
      <p className="lede">{t(track.description)}</p>
      <p className="notice">
        {t(
          text(
            "Đang phát triển",
            "Work in progress",
          ),
        )}
      </p>
      {track.version ? (
        <>
          <div className="actions">
            {user && !user.isAnonymous ? (
              <button
                className="primary"
                disabled={busy}
                onClick={() => void enroll()}
              >
                {t(text("Theo học DSA", "Start DSA plan"))}
              </button>
            ) : (
              <GoogleAction className="button primary">
                {t(
                  text(
                    "Đăng nhập để lưu lộ trình",
                    "Sign in to save your plan",
                  ),
                )}
              </GoogleAction>
            )}
            <Link className="button" to="/progress">
              {t(text("Xem tiến độ của tôi", "View my progress"))}
            </Link>
          </div>
          <p role={transient ? undefined : "status"}>{transient ? "" : status}</p>
          <div className="roadmap-toolbar">
            <button onClick={() => setList((x) => !x)}>
              {list
                ? t(text("Xem sơ đồ", "Graph view"))
                : t(text("Xem danh sách", "List view"))}
            </button>
            <span>
              {t(
                text(
                  "Chọn một chủ đề để mở bài học và bài tập.",
                  "Select a topic to open its lesson and challenge.",
                ),
              )}
            </span>
          </div>
          {!list ? (
            <div className="roadmap-layout">
              <RoadmapCanvas
                selected={selected.id}
                onSelect={(id) => setParams({ node: id })}
              />
              <aside
                className="topic-panel"
                aria-label={t(text("Chi tiết chủ đề", "Topic details"))}
              >
                <p className="eyebrow">{t(text("CHỦ ĐỀ", "TOPIC"))}</p>
                <h2>{t(selected.title)}</h2>
                <p>{t(selected.outcome)}</p>
                <p className="muted">
                  {selected.prerequisites.length
                    ? t(
                        text(
                          "Kiến thức tiên quyết: cần bằng chứng của bước trước; bạn vẫn có thể xem trước nội dung.",
                          "Prerequisite: previous-step evidence required; content preview remains available.",
                        ),
                      )
                    : t(
                        text(
                          "Không có kiến thức tiên quyết.",
                          "No prerequisites.",
                        ),
                      )}
                </p>
                <Link className="lesson-link" to={`/learn/${selected.lesson}`}>
                  {t(text("Đọc bài học", "Read lesson"))} ↗
                </Link>
                <h3>
                  {t(text("Bài thực hành liên quan", "Related challenge"))}
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th>{t(text("Bài tập", "Challenge"))}</th>
                      <th>{t(text("Trạng thái", "Status"))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Link to={`/practice/${selected.challenge}`}>
                          {t(
                            text(
                              "Đỉnh lưu lượng yêu cầu",
                              "Peak request window",
                            ),
                          )}
                        </Link>
                      </td>
                      <td>{t(text("Chưa chấm", "Not graded"))}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="muted">
                  {t(
                    text(
                      "Đang phát triển · 3 chủ đề và 1 bài tập.",
                      "Work in progress · 3 topics and 1 challenge.",
                    ),
                  )}
                </p>
              </aside>
            </div>
          ) : (
            <ol className="roadmap-list">
              {dsaNodes.map((n, i) => (
                <li key={n.id}>
                  <span className="node-number">{i + 1}</span>
                  <div>
                    <h2>{t(n.title)}</h2>
                    <p>{t(n.outcome)}</p>
                    <small>
                      {t(
                        text("Ước lượng học thử:", "Preview effort estimate:"),
                      )}{" "}
                      {n.effortMinutes} {t(text("phút", "minutes"))} ·{" "}
                      {n.prerequisites.length
                        ? t(
                            text(
                              "Cần bằng chứng cho bước trước; vẫn có thể xem bài.",
                              "Previous-step evidence required; preview remains available.",
                            ),
                          )
                        : t(
                            text(
                              "Không có kiến thức tiên quyết",
                              "No prerequisites",
                            ),
                          )}
                    </small>
                    <div className="actions">
                      <Link to={`/learn/${n.lesson}`}>
                        {t(text("Đọc bài học", "Read lesson"))}
                      </Link>
                      <Link to={`/practice/${n.challenge}`}>
                        {t(text("Mở bài thực hành", "Open challenge"))}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <p>
          {t(track.practice)}{" "}
          {t(
            text("Chưa có bài được công bố.", "No published assignments yet."),
          )}
        </p>
      )}
    </section>
  );
}
