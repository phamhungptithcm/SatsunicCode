import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import type { Company } from "../../../../packages/contracts/src/community";
import { loadCompanies } from "./community/api";
import { CompanySuggestion } from "./community/Forms";
import { Hero, ErrorNotice, errorText } from "./community/shared";
import Icon from "./community/Icon";
export default function Companies() {
  const { t, locale } = useLanguage(),
    [companies, setCompanies] = useState<Company[]>([]),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [more, setMore] = useState(false);
  async function load(cursor?: string) {
    setLoading(true);
    setError(null);
    try {
      const rows = await loadCompanies(cursor);
      setCompanies((old) => (cursor ? [...old, ...rows] : rows));
      setMore(rows.length === 30);
    } catch (e) {
      setError(errorText(e, locale === "vi"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const shown = companies.filter((c) =>
    c.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <section className="community">
      <Hero
        label="COMPANY REVIEWS"
        title={
          <>
            {t(text("Hiểu công ty.", "Know the company."))}
            <br />
            <span className="blue">
              {t(text("Chọn nơi phù hợp.", "Find your fit."))}
            </span>
          </>
        }
        description={t(
          text(
            "Góc nhìn từ người đã làm việc và phỏng vấn. Để quyết định tiếp theo có thêm cơ sở.",
            "Experiences from employees and interview candidates, to inform your next decision.",
          ),
        )}
      />
      <div className="community-layout">
        <div>
          <div className="community-toolbar">
            <label className="community-search">
              <Icon name="search" />
              <span className="sr-only">
                {t(text("Tìm trong công ty đã tải", "Search loaded companies"))}
              </span>
              <input
                placeholder={t(
                  text("Tìm trong công ty đã tải…", "Search loaded companies…"),
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button onClick={() => setOpen(true)} className="primary">
              <Icon name="plus" />
              {t(text("Đề xuất công ty", "Suggest company"))}
            </button>
          </div>
          <ErrorNotice error={error} retry={() => void load()} />
          {loading && (
            <p role="status">
              {t(text("Đang tải công ty…", "Loading companies…"))}
            </p>
          )}
          {!loading && !error && !shown.length && (
            <div className="community-empty">
              <Icon name="building" />
              <h2>
                {t(
                  companies.length
                    ? text(
                        "Không có kết quả trong danh sách đã tải",
                        "No matches in the loaded list",
                      )
                    : text(
                        "Chưa có công ty trong danh mục",
                        "No companies in the directory yet",
                      ),
                )}
              </h2>
              <p>
                {t(
                  text(
                    "Bạn có thể đề xuất công ty để được duyệt.",
                    "Suggest a company for review.",
                  ),
                )}
              </p>
            </div>
          )}
          <div className="community-company-list">
            {shown.map((c) => (
              <Link
                key={c.id}
                className="community-company-card"
                to={`/companies/${c.id}`}
              >
                <span className="community-avatar">{c.name.slice(0, 1)}</span>
                <div>
                  <h2>{c.name}</h2>
                  <p>
                    {c.industry} · {c.country}
                  </p>
                  <small>
                    {t(
                      text(
                        "Thông tin từ đề xuất cộng đồng",
                        "Community-suggested information",
                      ),
                    )}
                  </small>
                </div>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          {more && (
            <button
              disabled={loading}
              onClick={() => void load(companies.at(-1)?.id)}
            >
              {t(text("Tải thêm công ty", "Load more companies"))}
            </button>
          )}
        </div>
        <aside>
          <div className="community-panel">
            <p className="community-caption">
              {t(text("GÓC NHÌN CỦA BẠN", "YOUR EXPERIENCE"))}
            </p>
            <h2>{t(text("Một đóng góp hữu ích", "A useful contribution"))}</h2>
            <ol className="community-steps">
              <li>
                {t(
                  text("Tìm hoặc đề xuất công ty", "Find or suggest a company"),
                )}
              </li>
              <li>
                {t(
                  text(
                    "Viết trải nghiệm của bạn",
                    "Write about your experience",
                  ),
                )}
              </li>
              <li>
                {t(
                  text(
                    "Xem trước rồi gửi duyệt",
                    "Preview and submit for moderation",
                  ),
                )}
              </li>
            </ol>
            <div className="community-privacy">
              <Icon name="shield" />
              <p>
                {t(
                  text(
                    "Không đưa tên cá nhân hoặc thông tin mật vào bài. Nội dung vẫn có thể nhận diện bạn.",
                    "Avoid personal names and confidential details. Your content may still identify you.",
                  ),
                )}
              </p>
            </div>
          </div>
          <Link className="community-row-link" to="/community/contributions">
            <Icon name="edit" />
            {t(text("Đóng góp của tôi", "My contributions"))}
            <Icon name="arrow" />
          </Link>
        </aside>
      </div>
      <CompanySuggestion
        knownCompanies={companies}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {}}
      />
    </section>
  );
}
