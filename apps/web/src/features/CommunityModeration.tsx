import CompanyLogo from "./community/CompanyLogo";
import { useEffect, useState } from "react";
import { useLanguage, text } from "../i18n";
import { useSession } from "../session";
import type { Contribution } from "../../../../packages/contracts/src/community";
import {
  roleLabels,
  levelLabels,
  countryLabels,
  typeLabels,
} from "./community/Forms";
import { normalizeSalary } from "../../../../packages/domain/src/compensation";
import type { SalaryInput } from "../../../../packages/contracts/src/community";
import { loadContributions, changeCommunity } from "./community/api";
import {
  Hero,
  ErrorNotice,
  errorText,
  statusLabel,
  useAction,
  Dialog,
} from "./community/shared";
const fieldLabels: Record<string, { vi: string; en: string }> = {
  headquarters: text("Trụ sở chính", "Headquarters"),
  phone: text("Điện thoại doanh nghiệp", "Business phone"),
  website: text("Website", "Website"),
  name: text("Tên công ty", "Company name"),
  industry: text("Ngành", "Industry"),
  country: text("Quốc gia", "Country"),
  companyId: text("Công ty (mã)", "Company reference"),
  kind: text("Loại trải nghiệm", "Experience type"),
  employment: text("Trạng thái làm việc", "Employment status"),
  role: text("Vị trí", "Role"),
  year: text("Năm dữ liệu", "Reporting year"),
  rating: text("Đánh giá tổng thể", "Overall rating"),
  cultureRating: text("Văn hóa", "Culture rating"),
  growthRating: text("Phát triển", "Growth rating"),
  headline: text("Tiêu đề", "Headline"),
  pros: text("Điểm tốt", "Positives"),
  cons: text("Cần cải thiện", "Could improve"),
  level: text("Cấp bậc", "Level"),
  experience: text("Kinh nghiệm (năm)", "Experience (years)"),
  employmentType: text("Hình thức làm việc", "Employment type"),
  currency: text("Tiền tệ", "Currency"),
  basis: text("Cách tính", "Tax basis"),
  base: text("Lương cơ bản mỗi kỳ", "Base per period"),
  period: text("Kỳ lương", "Pay period"),
  payPeriods: text("Số kỳ bảo đảm/năm", "Guaranteed pay periods/year"),
  bonus: text("Thưởng năm", "Annual bonus"),
  bonusKind: text("Loại thưởng", "Bonus basis"),
  equity: text("Cổ phần nhận năm", "Annual equity"),
  equityKind: text("Cách tính cổ phần", "Equity basis"),
  signOn: text("Thưởng nhận việc", "Sign-on bonus"),
  reviewId: text("Đánh giá được báo cáo (mã)", "Reported review reference"),
  reason: text("Lý do báo cáo", "Report reason"),
};
const values: Record<string, { vi: string; en: string }> = {
  ...roleLabels,
  ...levelLabels,
  ...countryLabels,
  ...typeLabels,
  EMPLOYEE: text("Làm việc", "Employment"),
  INTERVIEW: text("Phỏng vấn", "Interview"),
  CURRENT: text("Nhân viên hiện tại", "Current employee"),
  FORMER: text("Nhân viên cũ", "Former employee"),
  CANDIDATE: text("Ứng viên", "Candidate"),
  GROSS: text("Trước thuế", "Gross"),
  NET: text("Sau thuế", "Net"),
  MONTH: text("Theo tháng", "Monthly"),
  YEAR: text("Theo năm", "Annual"),
  ACTUAL: text("Thực nhận", "Actual"),
  TARGET: text("Mục tiêu", "Target"),
  ANNUAL_VESTED: text("Phần nhận trong năm", "Annual vested amount"),
  "0_2": text("0–2", "0–2"),
  "3_5": text("3–5", "3–5"),
  "6_10": text("6–10", "6–10"),
  "11_PLUS": text("11+", "11+"),
};
const kindLabels = {
  company: text("Đề xuất công ty", "Company suggestion"),
  review: text("Đánh giá", "Review"),
  salary: text("Thu nhập", "Compensation"),
  report: text("Báo cáo nội dung", "Content report"),
};
export default function CommunityModeration() {
  const user = useSession(),
    { t, locale } = useLanguage(),
    [items, setItems] = useState<Contribution[]>([]),
    [allowed, setAllowed] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [cursor, setCursor] = useState<string | null>(null),
    [selected, setSelected] = useState<Contribution | null>(null),
    [decision, setDecision] = useState("PUBLISHED"),
    [reason, setReason] = useState(""),
    a = useAction();
  async function load(after?: string) {
    setLoading(true);
    setError(null);
    try {
      const r = await loadContributions(true, after);
      setItems((old) => (after ? [...old, ...r.items] : r.items));
      setCursor(r.nextCursor);
    } catch (e) {
      setError(errorText(e, locale === "vi"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let live = true;
    setAllowed(false);
    if (!user) {
      setLoading(false);
      return;
    }
    user
      .getIdTokenResult()
      .then((r) => {
        if (live) {
          setAllowed(r.claims.communityModerator === true);
          if (r.claims.communityModerator === true) void load();
          else setLoading(false);
        }
      })
      .catch((e) => {
        if (live) {
          setError(errorText(e, locale === "vi"));
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [user?.uid]);
  return (
    <section className="community">
      <Hero
        label={t(text("DUYỆT CỘNG ĐỒNG", "COMMUNITY MODERATION"))}
        title={t(text("Nội dung đang chờ duyệt", "Moderation queue"))}
        description={t(
          text(
            "Kiểm tra nội dung và quyền riêng tư trước khi công khai.",
            "Review content and privacy before publication.",
          ),
        )}
      />
      <ErrorNotice
        error={error}
        retry={allowed ? () => void load() : undefined}
      />
      {loading && (
        <p role="status">{t(text("Đang tải hàng đợi…", "Loading queue…"))}</p>
      )}
      {!loading && !allowed && (
        <p>
          {t(
            text(
              "Trang này chỉ dành cho người duyệt được cấp quyền.",
              "This page is restricted to authorized moderators.",
            ),
          )}
        </p>
      )}
      {allowed && !loading && !error && !items.length && (
        <p>
          {t(
            text(
              "Không có nội dung chờ duyệt.",
              "No items awaiting moderation.",
            ),
          )}
        </p>
      )}
      {allowed &&
        items.map((item) => (
          <article key={item.kind + item.id} className="community-panel">
            {item.logoUploadPath && (
              <CompanyLogo
                path={item.logoUploadPath}
                name={String((item.input as { name?: string }).name ?? "Logo")}
              />
            )}
            <div className="community-panel-title">
              <h2>{item.companyName ?? t(text("Đóng góp", "Contribution"))}</h2>
              <span className="community-pill">
                {t(statusLabel[item.status]!)}
              </span>
            </div>
            <p>{t(kindLabels[item.kind])}</p>
            <dl className="community-moderation-data">
              {Object.entries(item.input)
                .filter(([k]) => k !== "acknowledged" && k !== "logoUploadId")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{t(fieldLabels[k] ?? text(k, k))}</dt>
                    <dd>
                      {v === null
                        ? t(text("Chưa biết", "Unknown"))
                        : typeof v === "string" && values[v]
                          ? t(values[v])
                          : String(v)}
                    </dd>
                  </div>
                ))}
            </dl>
            {item.kind === "company" && (
              <p className="community-hint">
                {t(
                  text(
                    "Kiểm tra quyền sử dụng logo và xác nhận địa chỉ, điện thoại là thông tin công khai của doanh nghiệp trước khi duyệt.",
                    "Check logo permission and confirm that the address and phone are public business information before publishing.",
                  ),
                )}
              </p>
            )}
            {item.kind === "report" && (
              <div className="community-assessment">
                {item.reportedReview ? (
                  <>
                    <strong>{item.reportedReview.headline}</strong>
                    <p>{item.reportedReview.pros}</p>
                    <p>{item.reportedReview.cons}</p>
                  </>
                ) : (
                  <p>
                    {t(
                      text(
                        "Đánh giá hiện không còn công khai. Kiểm tra trạng thái trước khi quyết định.",
                        "This review is no longer public. Check its status before deciding.",
                      ),
                    )}
                  </p>
                )}
              </div>
            )}
            {item.kind === "salary" && (
              <div className="community-assessment">
                <strong>
                  {t(
                    text(
                      "Lương cơ bản chuẩn hóa theo năm",
                      "Normalized annual base",
                    ),
                  )}
                  :{" "}
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: (item.input as SalaryInput).currency,
                    maximumFractionDigits: 0,
                  }).format(
                    normalizeSalary(item.input as SalaryInput).annualBase,
                  )}
                </strong>
                <p>
                  {t(
                    text(
                      "Kiểm tra số bất thường, đơn vị, kỳ lương và nguồn tự khai báo; không tự loại số cao hoặc thấp. Lý do duyệt được lưu trong lịch sử.",
                      "Review unusual values, units, pay periods and self-reported provenance. Do not discard high or low values automatically. Decisions are audited.",
                    ),
                  )}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setSelected(item);
                setReason("");
                setDecision("PUBLISHED");
                a.clear();
              }}
            >
              {t(text("Xem và quyết định", "Review and decide"))}
            </button>
          </article>
        ))}
      {cursor && allowed && (
        <button disabled={loading} onClick={() => void load(cursor)}>
          {t(text("Tải thêm", "Load more"))}
        </button>
      )}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t(text("Quyết định duyệt", "Moderation decision"))}
      >
        <form
          className="community-form"
          onSubmit={(e) => {
            e.preventDefault();
            void a.run(async () => {
              await changeCommunity({
                action: "moderate",
                kind: selected!.kind,
                id: selected!.id,
                revision: selected!.revision,
                decision,
                reason,
              });
              setSelected(null);
              await load();
            });
          }}
        >
          <label className="community-field">
            <span>{t(text("Quyết định", "Decision"))}</span>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="PUBLISHED">
                {t(
                  text("Duyệt / Chấp nhận báo cáo", "Publish / Uphold report"),
                )}
              </option>
              <option value="REJECTED">{t(text("Từ chối", "Reject"))}</option>
              <option value="CHANGES_REQUESTED">
                {t(text("Yêu cầu sửa", "Request changes"))}
              </option>
            </select>
          </label>
          <label className="community-field">
            <span>
              {t(
                text(
                  "Lý do · Người đóng góp sẽ đọc được",
                  "Reason · Visible to the contributor",
                ),
              )}
            </span>
            <textarea
              required
              minLength={5}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <ErrorNotice error={a.error} />
          <div className="community-form-footer">
            <button className="primary" disabled={a.busy}>
              {a.busy
                ? t(text("Đang lưu…", "Saving…"))
                : t(text("Lưu quyết định", "Save decision"))}
            </button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
