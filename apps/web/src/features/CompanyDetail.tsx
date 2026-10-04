import CompanyLogo from "./community/CompanyLogo";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import { useSession } from "../session";
import GoogleAction from "../components/GoogleAction";
import type {
  Company,
  PublicReview,
} from "../../../../packages/contracts/src/community";
import {
  loadCompany,
  loadReviews,
  changeCommunity,
  loadCompanyStats,
} from "./community/api";
import { ReviewForm } from "./community/Forms";
import {
  Dialog,
  ErrorNotice,
  CompanySource,
  companyIndustryLabel,
  errorText,
  useAction,
} from "./community/shared";
import Icon from "./community/Icon";
export default function CompanyDetail() {
  const { companyId } = useParams(),
    { t, locale } = useLanguage(),
    user = useSession(),
    [company, setCompany] = useState<Company | null>(null),
    [reviews, setReviews] = useState<PublicReview[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [more, setMore] = useState(false),
    [report, setReport] = useState<string | null>(null),
    [reason, setReason] = useState(""),
    [kind, setKind] = useState("ALL"),
    [stats, setStats] =
      useState<Awaited<ReturnType<typeof loadCompanyStats>>>(null),
    a = useAction();
  async function load(cursor?: string) {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, r, s] = await Promise.all([
        loadCompany(companyId),
        loadReviews(companyId, cursor),
        loadCompanyStats(companyId),
      ]);
      setCompany(c);
      setStats(s);
      setReviews((old) => (cursor ? [...old, ...r] : r));
      setMore(r.length === 20);
    } catch (e) {
      setError(errorText(e, locale === "vi"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [companyId]);
  return (
    <section className="community community-company-detail">
      <Link className="community-back" to="/companies">
        ← {t(text("Danh mục công ty", "Company directory"))}
      </Link>
      <ErrorNotice error={error} retry={() => void load()} />
      {loading && !company && (
        <p role="status">{t(text("Đang tải công ty…", "Loading company…"))}</p>
      )}
      {!loading && !error && !company && (
        <h1>{t(text("Không tìm thấy công ty", "Company not found"))}</h1>
      )}
      {company && (
        <>
          <header className="community-company-identity">
            <CompanyLogo
              path={company.logoPath}
              name={company.name}
              company={company}
            />
            <div>
              <p className="eyebrow">COMPANY REVIEWS</p>
              <h1>{company.name}</h1>
              <div className="community-company-meta">
                <p>
                  {t(companyIndustryLabel(company.industry))} ·{" "}
                  {t(
                    company.country === "VN"
                      ? text("Việt Nam", "Vietnam")
                      : text("Hoa Kỳ", "United States"),
                  )}
                </p>
                <CompanySource company={company} />
              </div>
            </div>
          </header>
          {company.headquarters && (
            <div className="community-panel">
              <h2>
                {t(text("Thông tin doanh nghiệp", "Business information"))}
              </h2>
              <dl>
                <dt>{t(text("Trụ sở chính", "Headquarters"))}</dt>
                <dd>{company.headquarters}</dd>
                <dt>{t(text("Điện thoại doanh nghiệp", "Business phone"))}</dt>
                <dd>{company.phone}</dd>
                {company.website && /^https:\/\//.test(company.website) && (
                  <>
                    <dt>Website</dt>
                    <dd>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {company.website}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
              <p className="community-hint">
                {t(
                  text(
                    "Thông tin do người đóng góp cung cấp và được duyệt trước khi công khai.",
                    "Submitted information reviewed before publication.",
                  ),
                )}
              </p>
            </div>
          )}
          <div className="community-layout">
            <div>
              {stats && (
                <div className="community-rating-summary">
                  {(
                    [
                      [
                        "employee",
                        text("Trải nghiệm làm việc", "Employment reviews"),
                      ],
                      [
                        "interview",
                        text("Trải nghiệm phỏng vấn", "Interview reviews"),
                      ],
                    ] as const
                  ).map(([k, l]) => (
                    <div key={k}>
                      <p>{t(l)}</p>
                      <strong>
                        {stats[k].count
                          ? new Intl.NumberFormat(locale, {
                              maximumFractionDigits: 1,
                            }).format(stats[k].sum / stats[k].count)
                          : t(text("Chưa có đánh giá", "No ratings yet"))}
                        {stats[k].count > 0 && <small> / 5</small>}
                      </strong>
                      <p>
                        {stats[k].count}{" "}
                        {t(text("đánh giá đã duyệt", "published reviews"))}
                      </p>
                      <div
                        className="community-rating-bars"
                        aria-label={t(
                          text(
                            "Phân bố đánh giá từ 1 đến 5 sao",
                            "Rating distribution from 1 to 5 stars",
                          ),
                        )}
                      >
                        {stats[k].distribution.map((n, i) => (
                          <span key={i}>
                            {i + 1} ★{" "}
                            <i
                              style={{
                                width: `${stats[k].count ? (n / stats[k].count) * 60 : 0}%`,
                              }}
                            />{" "}
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="community-toolbar">
                <label className="community-filter">
                  <span>{t(text("Trải nghiệm", "Experience"))}</span>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    <option value="ALL">
                      {t(text("Tất cả bài đã tải", "All loaded reviews"))}
                    </option>
                    <option value="EMPLOYEE">
                      {t(text("Làm việc", "Employment"))}
                    </option>
                    <option value="INTERVIEW">
                      {t(text("Phỏng vấn", "Interview"))}
                    </option>
                  </select>
                </label>
                <button className="primary" onClick={() => setOpen(true)}>
                  <Icon name="plus" />
                  {t(text("Viết đánh giá", "Write a review"))}
                </button>
              </div>
              <p className="community-hint">
                {t(
                  text(
                    "Đánh giá tự khai báo, được duyệt nội dung; không đồng nghĩa xác minh việc làm.",
                    "Reviews are self-reported and content-moderated; employment is not verified.",
                  ),
                )}
              </p>
              {!loading && !error && !reviews.length && (
                <div className="community-empty">
                  <Icon name="building" />
                  <h2>
                    {t(
                      text(
                        "Chưa có đánh giá được công khai",
                        "No published reviews yet",
                      ),
                    )}
                  </h2>
                  <p>
                    {t(
                      text(
                        "Chia sẻ một trải nghiệm hữu ích.",
                        "Share a useful experience.",
                      ),
                    )}
                  </p>
                </div>
              )}
              {reviews
                .filter((r) => kind === "ALL" || r.kind === kind)
                .map((r) => (
                  <article
                    className="community-panel community-review"
                    key={r.id}
                  >
                    <div className="community-review-meta">
                      <span>
                        {r.role ||
                          t(text("Không nêu vị trí", "Role not shared"))}{" "}
                        · {r.year} ·{" "}
                        {t(
                          r.kind === "INTERVIEW"
                            ? text("Phỏng vấn", "Interview")
                            : r.employment === "CURRENT"
                              ? text("Nhân viên hiện tại", "Current employee")
                              : text("Nhân viên cũ", "Former employee"),
                        )}
                      </span>
                      <span className="community-pill">{r.rating} / 5</span>
                    </div>
                    <h2>{r.headline}</h2>
                    <dl className="community-review-copy">
                      <dt>{t(text("Điểm tốt", "Positives"))}</dt>
                      <dd>{r.pros}</dd>
                      <dt>{t(text("Cần cải thiện", "Could improve"))}</dt>
                      <dd>{r.cons}</dd>
                    </dl>
                    {(r.cultureRating !== null || r.growthRating !== null) && (
                      <p className="community-hint">
                        {t(text("Văn hóa", "Culture"))}:{" "}
                        {r.cultureRating ??
                          t(text("Không đánh giá", "Not rated"))}{" "}
                        · {t(text("Phát triển", "Growth"))}:{" "}
                        {r.growthRating ??
                          t(text("Không đánh giá", "Not rated"))}
                      </p>
                    )}
                    <div className="community-review-footer">
                      {user && !user.isAnonymous ? (
                        <button
                          disabled={a.busy}
                          onClick={() =>
                            void a.run(
                              async () => {
                                await changeCommunity({
                                  action: "vote",
                                  id: r.id,
                                });
                                await load();
                              },
                              t(
                                text(
                                  "Đã ghi nhận bình chọn.",
                                  "Vote recorded.",
                                ),
                              ),
                            )
                          }
                        >
                          <Icon name="like" />
                          {t(text("Hữu ích", "Helpful"))} · {r.helpful}
                        </button>
                      ) : (
                        <GoogleAction>
                          <Icon name="like" />
                          {t(text("Đăng nhập để bình chọn", "Sign in to vote"))}
                        </GoogleAction>
                      )}
                      <button
                        className="community-icon-button"
                        title={t(text("Báo cáo đánh giá", "Report review"))}
                        aria-label={t(
                          text("Báo cáo đánh giá", "Report review"),
                        )}
                        onClick={() => {
                          setReason("");
                          setReport(r.id);
                          a.clear();
                        }}
                      >
                        <Icon name="flag" />
                      </button>
                    </div>
                  </article>
                ))}
              <ErrorNotice error={a.error} />
              {a.success && <p role="status">{a.success}</p>}
              {more && (
                <button
                  disabled={loading}
                  onClick={() => void load(reviews.at(-1)?.id)}
                >
                  {t(text("Tải thêm đánh giá", "Load more reviews"))}
                </button>
              )}
            </div>
            <aside>
              <div className="community-panel">
                <h2>{t(text("Góc nhìn của bạn", "Your experience"))}</h2>
                <p>
                  {t(
                    text(
                      "Nhân viên, cựu nhân viên hoặc ứng viên đều có thể đóng góp.",
                      "Employees, former employees and candidates can contribute.",
                    ),
                  )}
                </p>
                <ol className="community-steps">
                  <li>
                    {t(text("Bối cảnh trải nghiệm", "Experience context"))}
                  </li>
                  <li>
                    {t(text("Điểm tốt và góp ý", "Positives and suggestions"))}
                  </li>
                  <li>{t(text("Xem trước rồi gửi", "Preview and send"))}</li>
                </ol>
                <button onClick={() => setOpen(true)}>
                  <Icon name="edit" />
                  {t(text("Viết đánh giá", "Write a review"))}
                </button>
              </div>
              <Link
                className="community-row-link"
                to={`/salaries?company=${company.id}`}
              >
                <Icon name="wallet" />
                {t(text("Thu nhập tại công ty", "Company compensation"))}
                <Icon name="arrow" />
              </Link>
              <Link
                className="community-row-link"
                to="/community/contributions"
              >
                {t(text("Đóng góp của tôi", "My contributions"))}
                <Icon name="arrow" />
              </Link>
            </aside>
          </div>
          <ReviewForm
            company={company}
            open={open}
            onClose={() => setOpen(false)}
            onSaved={() => {
              void load();
            }}
          />
        </>
      )}
      <Dialog
        title={t(text("Báo cáo đánh giá", "Report review"))}
        open={!!report}
        onClose={() => setReport(null)}
      >
        {user && !user.isAnonymous ? (
          <form
            className="community-form"
            onSubmit={(e) => {
              e.preventDefault();
              void a.run(
                async () => {
                  await changeCommunity({
                    action: "report",
                    id: report,
                    reason,
                  });
                  setReport(null);
                },
                t(
                  text(
                    "Báo cáo đã gửi riêng cho người duyệt.",
                    "Report sent privately to moderators.",
                  ),
                ),
              );
            }}
          >
            <label className="community-field">
              <span>{t(text("Lý do báo cáo", "Report reason"))}</span>
              <textarea
                minLength={10}
                maxLength={500}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <ErrorNotice error={a.error} />
            <div className="community-form-footer">
              <button className="primary" disabled={a.busy}>
                {t(text("Gửi báo cáo", "Send report"))}
              </button>
            </div>
          </form>
        ) : (
          <div className="community-form">
            <GoogleAction>
              {t(text("Đăng nhập để báo cáo", "Sign in to report"))}
            </GoogleAction>
          </div>
        )}
      </Dialog>
    </section>
  );
}
