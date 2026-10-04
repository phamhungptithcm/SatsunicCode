import { useState } from "react";
import { Link } from "react-router-dom";
import {
  dsaProblems,
  topicLabels,
} from "../../../../packages/domain/src/dsa-catalog";
import { tracks, challenge } from "../../../../packages/domain/src/catalog";
import { useLanguage, text } from "../i18n";
export default function PracticeCatalog() {
  const { t } = useLanguage();
  const [track, setTrack] = useState("dsa"),
    [query, setQuery] = useState(""),
    [difficulty, setDifficulty] = useState("all");
  const visible =
    track === "dsa" &&
    (difficulty === "all" || difficulty === "Easy") &&
    t(challenge.title)
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
  const currentTrack = tracks.find((x) => x.slug === track)!;
  const filteredProblems = dsaProblems.filter((p) =>
    (difficulty === "all" || p.difficulty === difficulty) &&
    p.title.toLowerCase().includes(query.trim().toLowerCase()));
  const difficultyLabel = (value: string) => t(text(
    value === "Easy" ? "Dễ" : value === "Medium" ? "Trung bình" : "Khó", value));
  return (
    <section className="practice-catalog practice-clean">
      <aside
        className="practice-sidebar"
        aria-label={t(text("Chuyên ngành thực hành", "Practice disciplines"))}
      >
        <p className="discipline-label">{t(text("Chuyên ngành", "Discipline"))}</p>
        {tracks.map((x) => (
          <button
            key={x.slug}
            className={track === x.slug ? "active" : ""}
            onClick={() => setTrack(x.slug)}
            aria-pressed={track === x.slug}
          >
            {t(x.title)}
          </button>
        ))}
      </aside>
      <div className="practice-body">
        <div className="catalog-header">
          <div>
            <p className="eyebrow">{t(text("LUYỆN TẬP", "PRACTICE"))}</p>
            <h1>{t(currentTrack.title)}</h1>
            <p>{t(currentTrack.practice)}</p>
          </div>
          <span className="practice-readiness">{track === "dsa"
            ? t(text("Đang phát triển", "Work in progress"))
            : t(text("Sắp ra mắt", "Coming soon"))}</span>
        </div>
        <div className="practice-filters">
          <label>
            {t(text("Tìm bài tập", "Search challenges"))}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(text("Tên bài tập…", "Challenge title…"))}
            />
          </label>
          <label>
            {t(text("Độ khó", "Difficulty"))}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">{t(text("Tất cả", "All"))}</option>
              <option value="Easy">{t(text("Dễ", "Easy"))}</option>
              <option value="Medium">{t(text("Trung bình", "Medium"))}</option>
              <option value="Hard">{t(text("Khó", "Hard"))}</option>
            </select>
          </label>
        </div>
        <div className="problem-group">
          <h2>
            {track === "dsa"
              ? t(text("Cửa sổ trượt", "Sliding window"))
              : t(text("Bài thực hành", "Assignments"))}
          </h2>
          {visible ? (
            <table>
              <thead>
                <tr>
                  <th>{t(text("Trạng thái", "Status"))}</th>
                  <th>{t(text("Bài tập", "Challenge"))}</th>
                  <th>{t(text("Độ khó", "Difficulty"))}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="ungraded">
                      {t(text("Chưa chấm", "Not graded"))}
                    </span>
                  </td>
                  <td>
                    <Link to="/practice/peak-requests">
                      {t(challenge.title)}
                    </Link>
                  </td>
                  <td>
                    <span className="difficulty">{t(text("Dễ", "Easy"))}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="empty" role="status">
              {track === "dsa"
                ? t(
                    text(
                      "Không có bài tập khớp bộ lọc.",
                      "No challenges match these filters.",
                    ),
                  )
                : t(
                    text(
                      "Chuyên ngành này chưa có bài được công bố.",
                      "This discipline has no published challenges yet.",
                    ),
                  )}
            </p>
          )}
        </div>
        {track === "dsa" && (
          <section className="reference-catalog">
            <div className="reference-heading">
              <h2>{t(text("Danh mục tham chiếu NeetCode", "NeetCode reference catalog"))}</h2>
              <span className="catalog-count" aria-live="polite">{filteredProblems.length} / {dsaProblems.length}</span>
            </div>
            <p>
              {t(
                text(
                  "Metadata MIT · Giữ tên bài gốc để đối chiếu. Đề và bộ chấm Satsunic đang phát triển.",
                  "MIT metadata · Original titles retained for reference. Satsunic exercises and evaluators: Work in progress.",
                ),
              )}
            </p>
            {filteredProblems.length === 0 && <p className="empty" role="status">{t(text("Không có bài tập khớp bộ lọc.", "No challenges match these filters."))}</p>}
            <div className="topic-collection">
            {Object.keys(topicLabels).map((topic) => {
              const rows = filteredProblems.filter((p) => p.topic === topic);
              return rows.length ? (
                <details key={topic}>
                  <summary>
                    <span className="topic-chevron" aria-hidden="true">›</span>
                    <span>{t(topicLabels[topic]!)}</span>
                    <small>{rows.length}</small>
                  </summary>
                  <table>
                    <thead>
                      <tr>
                        <th>{t(text("Bài tập", "Problem"))}</th>
                        <th>{t(text("Độ khó", "Difficulty"))}</th>
                        <th>{t(text("Nội dung", "Content"))}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p) => (
                        <tr key={p.slug}>
                          <td>
                            <Link to={`/practice/${p.slug}`}>{p.title}</Link>
                          </td>
                          <td><span className="difficulty" data-difficulty={p.difficulty}>{difficultyLabel(p.difficulty)}</span></td>
                          <td>{t(text("Tham chiếu", "Reference"))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ) : null;
            })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
