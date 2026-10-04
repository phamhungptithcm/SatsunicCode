import { Link } from "react-router-dom";
import { tracks } from "../../../../packages/domain/src/catalog";
import { useLanguage, text } from "../i18n";
const names = ["DSA", "AI Engineer", "Cybersecurity", "Web", "Mobile", "Game"];
const paths = [
  "M8 4H4v16h4M16 4h4v16h-4M9 9l-3 3 3 3M15 9l3 3-3 3",
  "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6",
  "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01M9 12l-2 2 2 2M15 12l2 2-2 2",
  "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10 5h4M11 19h2",
  "M7 8h10c3 0 5 9 3 11-1 1-3-2-4-3H8c-1 1-3 4-4 3-2-2 0-11 3-11zM7 10v4M5 12h4M16 11h.01M18 13h.01",
];
export default function TrackSwitcher({
  slug,
  onChange,
}: {
  slug: string;
  onChange: (slug: string) => void;
}) {
  const { t, locale } = useLanguage();
  return (
    <div className="track-switcher">
      <fieldset>
        <legend>
          {t(text("Chọn hướng đi của bạn", "Choose your direction"))}
        </legend>
        <div className="track-options">
          {tracks.map((x, i) => (
            <label className="track-option" key={x.slug}>
              <input
                type="radio"
                name="hero-track"
                value={x.slug}
                checked={slug === x.slug}
                onChange={() => onChange(x.slug)}
                aria-label={t(x.title)}
              />
              <span className="track-tile">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={paths[i]} />
                </svg>
                <span>
                  {locale === "en"
                    ? names[i]
                    : [
                        "DSA",
                        "Kỹ sư AI",
                        "An ninh mạng",
                        "Web",
                        "Di động",
                        "Trò chơi",
                      ][i]}
                </span>
                <span className="track-check" aria-hidden="true">
                  ✓
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="actions">
        <Link className="button primary" to={`/roadmaps/${slug}`}>
          {t(text("Khám phá lộ trình", "Explore roadmap"))}
          <span aria-hidden="true">↗</span>
        </Link>
        <Link className="practice-text-link" to="/practice">
          {t(text("Vào luyện tập", "Open Practice"))}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </div>
  );
}
