import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import { useSession } from "../session";
import type {
  ProgressSummary,
  LearningStatus,
} from "../../../../packages/contracts/src/progress";
import { learningTopics } from "../../../../packages/domain/src/progress";
import { topicLabels } from "../../../../packages/domain/src/dsa-catalog";
import { getProgress, changeProgress } from "./community/api";
import {
  Hero,
  AccountRequired,
  ErrorNotice,
  errorText,
  useAction,
} from "./community/shared";
import Icon from "./community/Icon";
const labels: Record<LearningStatus, { vi: string; en: string }> = {
  NOT_STARTED: text("Chưa bắt đầu", "Not started"),
  LEARNING: text("Đang học", "Learning"),
  REVIEWED: text("Đã xem lại", "Reviewed"),
  NEEDS_REVIEW: text("Cần ôn lại", "Needs review"),
};
export default function Progress() {
  const user = useSession(),
    { t, locale } = useLanguage(),
    [data, setData] = useState<ProgressSummary | null>(null),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(false),
    a = useAction();
  async function load() {
    if (!user || user.isAnonymous) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getProgress());
    } catch (e) {
      setError(errorText(e, locale === "vi"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setData(null);
    void load();
  }, [user?.uid]);
  return (
    <section className="community">
      <Hero
        label="MY PROGRESS"
        icon="route"
        title={
          <>
            {t(text("Giữ nhịp học.", "Keep learning."))}
            <br />
            <span className="blue">
              {t(text("Tiếp tục từng bước.", "One step at a time."))}
            </span>
          </>
        }
        description={t(
          text(
            "Bài đang học, điều cần ôn và bản nháp của bạn. Tập trung vào bước tiếp theo.",
            "Your learning topics, review needs and drafts. Focus on your next step.",
          ),
        )}
      />
      <AccountRequired>
        <ErrorNotice error={error} retry={() => void load()} />
        {loading && !data && (
          <p role="status">
            {t(text("Đang đọc tiến độ…", "Loading progress…"))}
          </p>
        )}
        {data && (
          <div className="community-layout">
            <div>
              <div className="community-panel community-resume">
                <span className="community-pill">
                  {data.activePlan
                    ? "DSA · v1"
                    : t(text("DSA · Tự ghi nhận", "DSA · Self-reported"))}
                </span>
                <h2>
                  {data.resume
                    ? t(
                        text(
                          "Tiếp tục từ nơi bạn dừng lại",
                          "Continue where you left off",
                        ),
                      )
                    : t(text("Bắt đầu một bài học", "Start a lesson"))}
                </h2>
                <p>
                  {t(
                    text(
                      "Mở bài không đồng nghĩa đã hoàn thành.",
                      "Opening a lesson does not mean it is completed.",
                    ),
                  )}
                </p>
                <div className="community-learning-map" aria-hidden="true">
                  <span>{t(text("Mảng", "Arrays"))}</span>
                  <i />
                  <span>{t(text("Bảng băm", "Hashing"))}</span>
                  <i />
                  <span>{t(text("Hai con trỏ", "Two pointers"))}</span>
                </div>
                <Link
                  className="button primary"
                  to={
                    data.resume ??
                    (data.activePlan === "dsa-v1"
                      ? "/practice/peak-requests"
                      : "/learn/request-window")
                  }
                >
                  {t(text("Tiếp tục học", "Continue learning"))}
                  <Icon name="arrow" />
                </Link>
              </div>
              <div className="community-panel">
                <div className="community-panel-title">
                  <h2>{t(text("Việc học của tôi", "My learning"))}</h2>
                  <span className="community-pill">
                    {t(text("Tự ghi nhận", "Self-reported"))}
                  </span>
                </div>
                {learningTopics.map((topic, i) => (
                  <div className="community-topic-row" key={topic.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <Link
                      to={`/roadmaps/dsa?topic=${encodeURIComponent(topic.topic)}`}
                    >
                      {t(
                        topicLabels[topic.topic] ??
                          text(topic.topic, topic.topic),
                      )}
                    </Link>
                    <label>
                      <span className="sr-only">
                        {t(
                          text(
                            "Trạng thái tự ghi nhận",
                            "Self-reported status",
                          ),
                        )}{" "}
                        · {topic.topic}
                      </span>
                      <select
                        disabled={a.busy}
                        value={data.statuses[topic.id] ?? "NOT_STARTED"}
                        onChange={(e) => {
                          const status = e.target.value as LearningStatus;
                          void a.run(async () => {
                            await changeProgress({
                              action: "status",
                              topicId: topic.id,
                              status,
                            });
                            setData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    statuses: {
                                      ...prev.statuses,
                                      [topic.id]: status,
                                    },
                                  }
                                : prev,
                            );
                          });
                        }}
                      >
                        {Object.entries(labels).map(([v, l]) => (
                          <option key={v} value={v}>
                            {t(l)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
                <ErrorNotice error={a.error} />
                {a.success && <p role="status">{a.success}</p>}
                <p className="community-hint">
                  {t(
                    text(
                      "Bạn có thể đổi lại trạng thái. Việc tự ghi nhận không tạo bằng chứng được chấm.",
                      "You can change a status again. Self-reported learning does not create graded evidence.",
                    ),
                  )}
                </p>
              </div>
            </div>
            <aside>
              <div className="community-panel">
                <h2>{t(text("Mở lại nhanh", "Quick access"))}</h2>
                {data.drafts.map((d) => (
                  <Link
                    className="community-row-link"
                    key={d.id}
                    to={`/practice/${d.challengeRevision.replace(/-v\d+$/, "")}`}
                  >
                    <Icon name="edit" />
                    <span>
                      {d.challengeRevision.replace(/-v\d+$/, "")}
                      <small>
                        {t(text("Bản nháp", "Draft"))} · {d.language}
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </Link>
                ))}
                {data.saved.map((s) => (
                  <Link
                    className="community-row-link"
                    key={s.id}
                    to={`/practice/${s.id}`}
                  >
                    <Icon name="bookmark" />
                    <span>
                      {s.id}
                      <small>{t(text("Bài đã lưu", "Saved problem"))}</small>
                    </span>
                    <Icon name="arrow" />
                  </Link>
                ))}
                {!data.drafts.length && !data.saved.length && (
                  <p>
                    {t(
                      text(
                        "Chưa có bản nháp hoặc bài đã lưu.",
                        "No drafts or saved problems yet.",
                      ),
                    )}
                  </p>
                )}
                <Link className="community-row-link" to="/account/saved">
                  {t(text("Tất cả bài đã lưu", "All saved problems"))}
                  <Icon name="arrow" />
                </Link>
              </div>
              <div className="community-panel">
                <h2>{t(text("Kết quả được chấm", "Graded results"))}</h2>
                <div className="community-assessment">
                  <strong>
                    {t(
                      text(
                        "Chấm code chưa khả dụng",
                        "Code grading is unavailable",
                      ),
                    )}
                  </strong>
                  <p>
                    {t(
                      text(
                        "Đọc bài hoặc lưu bản nháp không tạo kết quả đã giải.",
                        "Reading or saving a draft does not create a solved result.",
                      ),
                    )}
                  </p>
                </div>
              </div>
              <Link className="community-row-link" to="/roadmaps/dsa">
                {t(text("Khám phá lộ trình DSA", "Explore DSA roadmap"))}
                <Icon name="arrow" />
              </Link>
            </aside>
          </div>
        )}
      </AccountRequired>
    </section>
  );
}
