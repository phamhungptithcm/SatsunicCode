import CompanyLogo from "./community/CompanyLogo";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import type { Company } from "../../../../packages/contracts/src/community";
import { loadCompanies } from "./community/api";
import { isEmulator } from "../firebase";
import { CompanySuggestion } from "./community/Forms";
import { Hero, ErrorNotice, companyIndustryLabel } from "./community/shared";
import Icon from "./community/Icon";
import Autocomplete from "./community/Autocomplete";
export default function Companies() {
  const navigate = useNavigate();
  const { t } = useLanguage(),
    [companies, setCompanies] = useState<Company[]>([]),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [newCompanyName, setNewCompanyName] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [more, setMore] = useState(false),
    request = useRef(0);
  async function load(cursor?: string) {
    const version = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const rows = await loadCompanies(cursor);
      if (request.current !== version) return;
      setCompanies((old) => (cursor ? [...old, ...rows] : rows));
      setMore(rows.length === 30);
    } catch {
      if (request.current === version) setError("load_failed");
    } finally {
      if (request.current === version) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      request.current++;
    };
  }, []);
  const shown = companies;
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
            <Autocomplete
              hideLabel
              label={t(text("Tìm công ty", "Find a company"))}
              placeholder={t(
                text("Tìm và chọn công ty…", "Find and select a company…"),
              )}
              value={query}
              allowCustom
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              onChange={setQuery}
              onSelect={(id) => navigate(`/companies/${id}`)}
              onCreate={
                isEmulator && !loading && !more && !error
                  ? (name) => {
                      setNewCompanyName(name);
                      setOpen(true);
                    }
                  : undefined
              }
            />
          </div>
          {submitted && (
            <p role="status" className="community-hint">
              {t(
                text(
                  "Đã gửi hồ sơ công ty, đang chờ duyệt.",
                  "Company profile sent and awaiting moderation.",
                ),
              )}
            </p>
          )}
          <ErrorNotice
            error={
              error
                ? t(
                    text(
                      "Chưa tải được danh mục công ty. Thử lại để tiếp tục.",
                      "The company directory could not be loaded. Try again to continue.",
                    ),
                  )
                : null
            }
            retry={() => void load()}
          />
          {loading && !companies.length && (
            <div className="community-directory-loading" role="status">
              <p className="sr-only">
                {t(text("Đang tải công ty…", "Loading companies…"))}
              </p>
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
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
              {isEmulator && (
                <p>
                  {t(
                    text(
                      "Tạo hồ sơ công ty để gửi duyệt.",
                      "Create a company profile for review.",
                    ),
                  )}
                </p>
              )}
            </div>
          )}
          <div className="community-company-list">
            {shown.map((c) => (
              <Link
                key={c.id}
                className="community-company-card"
                to={`/companies/${c.id}`}
              >
                <CompanyLogo path={c.logoPath} name={c.name} />
                <div>
                  <h2>{c.name}</h2>
                  <p>
                    {t(companyIndustryLabel(c.industry))} ·{" "}
                    {c.country === "VN"
                      ? t(text("Việt Nam", "Vietnam"))
                      : t(text("Hoa Kỳ", "United States"))}
                  </p>
                  <small>
                    {t(
                      c.source === "OFFICIAL_DIRECTORY"
                        ? text(
                            "Thông tin từ nguồn chính thức",
                            "Official company information",
                          )
                        : text(
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
                  isEmulator
                    ? text(
                        "Tìm hoặc tạo hồ sơ công ty",
                        "Find or create a company profile",
                      )
                    : text("Tìm và chọn công ty", "Find and select a company"),
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
        initialName={newCompanyName}
        knownCompanies={companies}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => setSubmitted(true)}
      />
    </section>
  );
}
