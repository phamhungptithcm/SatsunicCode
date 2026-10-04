import { useState } from "react";
import { Link } from "react-router-dom";
import { tracks } from "../../../../packages/domain/src/catalog";
import { useLanguage, text } from "../i18n";
import TrackSwitcher from "../components/TrackSwitcher";
import DsaRoadmapPreview from "../components/DsaRoadmapPreview";
export default function Homepage() {
  const { t } = useLanguage();
  const [slug, setSlug] = useState("dsa");
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          {t(
            text(
              "LỘ TRÌNH · THỰC HÀNH · PHỎNG VẤN",
              "ROADMAPS · PRACTICE · INTERVIEWS",
            ),
          )}
        </p>
        <h1>
          {t(
            text(
              "Chọn lộ trình.\nLuyện kỹ năng.\nSẵn sàng phỏng vấn.",
              "Choose your path.\nBuild your skills.\nPrepare for interviews.",
            ),
          )}
        </h1>
        <p className="hero-copy">
          {t(
            text(
              "Học có hướng đi. Thực hành đúng chuyên ngành. Tạo bằng chứng từ công việc bạn thực sự làm được.",
              "Learn with direction. Practice your discipline. Build evidence from work you can actually do.",
            ),
          )}
        </p>
        <div className="hero-graph">
          <DsaRoadmapPreview />
        </div>
        <div className="path-picker">
          <TrackSwitcher slug={slug} onChange={setSlug} />
        </div>
      </section>
      <section
        className="track-section paths-editorial"
        aria-labelledby="paths-title"
      >
        <div className="paths-intro">
          <p className="eyebrow">{t(text("LỘ TRÌNH HỌC", "LEARNING PATHS"))}</p>
          <h2 id="paths-title">
            {t(text("Chọn hướng học.", "Find your focus."))}
          </h2>
        </div>
        <div className="paths-composition">
          <Link className="paths-featured" to="/roadmaps/dsa">
            <span className="paths-status">
              {t(text("Đang phát triển", "Work in progress"))}
            </span>
            <h3>
              DSA <span>&amp;</span>
              <br />
              {t(text("Phỏng vấn lập trình", "Coding Interviews"))}
            </h3>
            <p>
              {t(
                text(
                  "Thuật toán, cấu trúc dữ liệu và bài lập trình.",
                  "Algorithms, data structures and coding challenges.",
                ),
              )}
            </p>
            <span className="paths-action">
              {t(text("Xem lộ trình", "Explore roadmap"))}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
          <div
            className="paths-upcoming"
            role="group"
            aria-labelledby="paths-preparation"
          >
            <p id="paths-preparation" className="paths-group-label">
              {t(text("Sắp ra mắt", "Coming soon"))}
            </p>
            {tracks
              .filter((track) => track.slug !== "dsa")
              .map((track) => (
                <Link
                  className="paths-row"
                  key={track.slug}
                  to={`/roadmaps/${track.slug}`}
                  aria-describedby="paths-preparation"
                >
                  <h3>{t(track.title)}</h3>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
