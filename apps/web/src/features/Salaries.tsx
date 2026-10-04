import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import type {
  Company,
  SalaryInput,
  SalaryStats,
} from "../../../../packages/contracts/src/community";
import { loadCompanies, loadCompany, loadSalaryStats } from "./community/api";
import {
  blankSalary,
  SalaryForm,
  roleLabels,
  levelLabels,
  countryLabels,
  typeLabels,
} from "./community/Forms";
import { Hero, Field, ErrorNotice, errorText } from "./community/shared";
import Autocomplete from "./community/Autocomplete";
import Icon from "./community/Icon";
export default function Salaries() {
  const { t, locale } = useLanguage(),
    [params] = useSearchParams(),
    [companies, setCompanies] = useState<Company[]>([]),
    [filter, setFilter] = useState<SalaryInput>(
      blankSalary(params.get("company") ?? ""),
    ),
    [stats, setStats] = useState<SalaryStats | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [reload, setReload] = useState(0),
    [moreCompanies, setMoreCompanies] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all([
      loadCompanies(),
      params.get("company")
        ? loadCompany(params.get("company")!)
        : Promise.resolve(null),
    ])
      .then(([rows, selected]) => {
        if (!live) return;
        setMoreCompanies(rows.length === 30);
        const all =
          selected && !rows.some((c) => c.id === selected.id)
            ? [selected, ...rows]
            : rows;
        setCompanies(all);
        setFilter((x) => ({
          ...x,
          companyId: selected?.id ?? rows[0]?.id ?? "",
        }));
        setLoading(false);
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
  }, [reload]);
  useEffect(() => {
    let live = true;
    setStats(null);
    if (!filter.companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loadSalaryStats(filter)
      .then((s) => {
        if (live) setStats(s);
      })
      .catch((e) => {
        if (live) setError(errorText(e, locale === "vi"));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [
    filter.companyId,
    filter.role,
    filter.level,
    filter.country,
    filter.currency,
    filter.basis,
    filter.year,
    filter.employmentType,
    reload,
  ]);
  const company = companies.find((c) => c.id === filter.companyId),
    money = (n: number) =>
      new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
        style: "currency",
        currency: filter.currency,
        maximumFractionDigits: 0,
      }).format(n);
  return (
    <section className="community">
      <Hero
        label="SALARY SHARING"
        icon="wallet"
        title={
          <>
            {t(text("Hiểu mức thu nhập.", "Understand compensation."))}
            <br />
            <span className="blue">
              {t(text("So sánh đúng nhóm.", "Compare like with like."))}
            </span>
          </>
        }
        description={t(
          text(
            "Cùng công việc, cùng cách tính. Thống kê từ đóng góp đã được duyệt.",
            "The same job context and compensation basis. Statistics from moderated contributions.",
          ),
        )}
      />
      <div className="community-layout">
        <div className="community-panel">
          <div className="community-panel-title">
            <h2>
              {t(text("Nhóm bạn muốn so sánh", "Your comparison cohort"))}
            </h2>
            <span className="community-pill">
              {t(text("Theo năm", "Annual"))}
            </span>
          </div>
          <div className="community-fields">
            <Autocomplete
              wide
              label={t(text("Công ty", "Company"))}
              value={filter.companyId}
              options={companies.map((c) => ({ value: c.id, label: c.name }))}
              onChange={(companyId) => setFilter((x) => ({ ...x, companyId }))}
            />
            {(
              [
                ["role", roleLabels, text("Vị trí", "Role")],
                ["level", levelLabels, text("Cấp bậc", "Level")],
                ["country", countryLabels, text("Quốc gia", "Country")],
                [
                  "employmentType",
                  typeLabels,
                  text("Hình thức làm việc", "Employment type"),
                ],
              ] as const
            ).map(([key, labels, label]) => (
              <Field label={t(label)} key={key}>
                <select
                  value={filter[key]}
                  onChange={(e) =>
                    setFilter((x) => ({ ...x, [key]: e.target.value }))
                  }
                >
                  {Object.entries(labels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {t(l)}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
            <Field label={t(text("Tiền tệ", "Currency"))}>
              <select
                value={filter.currency}
                onChange={(e) =>
                  setFilter((x) => ({
                    ...x,
                    currency: e.target.value as SalaryInput["currency"],
                  }))
                }
              >
                <option>VND</option>
                <option>USD</option>
              </select>
            </Field>
            <Field label={t(text("Năm dữ liệu", "Reporting year"))}>
              <select
                value={filter.year}
                onChange={(e) =>
                  setFilter((x) => ({ ...x, year: Number(e.target.value) }))
                }
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2019 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label={t(text("Cách tính", "Tax basis"))}>
              <select
                value={filter.basis}
                onChange={(e) =>
                  setFilter((x) => ({
                    ...x,
                    basis: e.target.value as "GROSS" | "NET",
                  }))
                }
              >
                <option value="GROSS">{t(text("Trước thuế", "Gross"))}</option>
                <option value="NET">{t(text("Sau thuế", "Net"))}</option>
              </select>
            </Field>
          </div>
          {moreCompanies && (
            <button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const rows = await loadCompanies(companies.at(-1)?.id);
                  setCompanies((c) => [...c, ...rows]);
                  setMoreCompanies(rows.length === 30);
                } catch (e) {
                  setError(errorText(e, locale === "vi"));
                } finally {
                  setLoading(false);
                }
              }}
            >
              {t(text("Tải thêm công ty", "Load more companies"))}
            </button>
          )}
          <ErrorNotice error={error} retry={() => setReload((x) => x + 1)} />
          {loading ? (
            <p role="status">
              {t(text("Đang đọc thống kê…", "Loading statistics…"))}
            </p>
          ) : (
            !error &&
            (!stats?.available ? (
              <div className="community-empty">
                <Icon name="wallet" />
                <h2>
                  {t(
                    text(
                      "Chưa đủ dữ liệu để hiển thị",
                      "Not enough data to display",
                    ),
                  )}
                </h2>
                <p>
                  {t(
                    text(
                      "Chỉ hiển thị nhóm đủ người đóng góp và đáp ứng điều kiện bảo vệ thông tin.",
                      "Only cohorts with enough contributors and safe publication conditions are shown.",
                    ),
                  )}
                </p>
                {company ? (
                  <button className="primary" onClick={() => setOpen(true)}>
                    <Icon name="plus" />
                    {t(text("Đóng góp thu nhập", "Contribute compensation"))}
                  </button>
                ) : (
                  <Link className="button" to="/companies">
                    {t(
                      text(
                        "Tìm hoặc đề xuất công ty",
                        "Find or suggest a company",
                      ),
                    )}
                  </Link>
                )}
              </div>
            ) : (
              <div className="community-statistics">
                <p className="community-caption">
                  {t(
                    text("LƯƠNG CƠ BẢN NĂM · TRUNG VỊ", "ANNUAL BASE · MEDIAN"),
                  )}
                </p>
                <strong>{money(stats.baseMedian!)}</strong>
                <dl>
                  <dt>{t(text("Phân vị 25–75", "25th–75th percentile"))}</dt>
                  <dd>
                    {money(stats.baseP25!)} – {money(stats.baseP75!)}
                  </dd>
                  <dt>
                    {t(
                      text(
                        "Thu nhập định kỳ · Trung vị",
                        "Recurring compensation · Median",
                      ),
                    )}
                  </dt>
                  <dd>
                    {stats.recurringMedian == null
                      ? t(text("Chưa đủ thành phần", "Incomplete components"))
                      : money(stats.recurringMedian)}
                  </dd>
                  <dt>
                    {t(
                      text(
                        "Số người đóng góp (khoảng)",
                        "Contributor count (band)",
                      ),
                    )}
                  </dt>
                  <dd>{stats.countBand}</dd>
                </dl>
                <p className="community-hint">
                  {t(
                    text(
                      "Tự khai báo · Làm tròn · Không đại diện đầy đủ cho thị trường. Bản chụp dữ liệu theo tuần; thay đổi có thể chưa được công bố.",
                      "Self-reported · Rounded · Not representative of the entire market. Weekly snapshots; changes may not yet be published.",
                    ),
                  )}{" "}
                  {stats.snapshotWeek !== undefined &&
                    new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(stats.snapshotWeek * 7 * 86400000))}{" "}
                  (UTC)
                </p>
              </div>
            ))
          )}
        </div>
        <aside>
          <div className="community-panel">
            <p className="community-caption">
              {t(text("ĐỌC SỐ LIỆU ĐÚNG", "READ THE NUMBERS"))}
            </p>
            <h2>
              {t(
                text("Thu nhập gồm những gì?", "What counts as compensation?"),
              )}
            </h2>
            {[
              [
                "wallet",
                text("Lương cơ bản năm", "Annual base"),
                text(
                  "Lương mỗi kỳ × số kỳ được bảo đảm trong năm.",
                  "Pay per period × guaranteed annual pay periods.",
                ),
              ],
              [
                "plus",
                text("Thưởng & cổ phần", "Bonus & equity"),
                text(
                  "Thưởng thực nhận và cổ phần nhận trong năm, không phải toàn bộ grant.",
                  "Actual annual bonus and vested equity, not the full grant.",
                ),
              ],
              [
                "info",
                text("Thưởng nhận việc", "Sign-on bonus"),
                text(
                  "Khoản một lần, tách khỏi thu nhập định kỳ.",
                  "A one-time amount, separate from recurring compensation.",
                ),
              ],
            ].map(([i, h, d]) => (
              <div className="community-definition" key={i as string}>
                <Icon name={i as string} />
                <div>
                  <h3>{t(h as { vi: string; en: string })}</h3>
                  <p>{t(d as { vi: string; en: string })}</p>
                </div>
              </div>
            ))}
          </div>
          {company && (
            <button onClick={() => setOpen(true)}>
              <Icon name="edit" />
              {t(text("Chia sẻ thu nhập", "Share compensation"))}
            </button>
          )}
          <Link className="community-row-link" to="/community/contributions">
            {t(text("Đóng góp của tôi", "My contributions"))}
            <Icon name="arrow" />
          </Link>
        </aside>
      </div>
      {company && (
        <SalaryForm
          company={company}
          open={open}
          onClose={() => setOpen(false)}
          onSaved={() => setReload((x) => x + 1)}
        />
      )}
    </section>
  );
}
