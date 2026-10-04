import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import Autocomplete from "./Autocomplete";
import FormStepper, { useFormSteps } from "./FormStepper";
import { useLanguage, text } from "../../i18n";
import {
  reviewInput,
  salaryInput,
  type Company,
  type Contribution,
  type ReviewInput,
  type SalaryInput,
} from "../../../../../packages/contracts/src/community";
import { normalizeSalary } from "../../../../../packages/domain/src/compensation";
import {
  AccountRequired,
  Dialog,
  ErrorNotice,
  Field,
  useAction,
} from "./shared";
import { changeCommunity, getOwnContribution } from "./api";
import Icon from "./Icon";
import { useSession } from "../../session";
export const roleLabels = {
  SOFTWARE_ENGINEER: text("Kỹ sư phần mềm", "Software engineer"),
  DATA_ENGINEER: text("Kỹ sư dữ liệu", "Data engineer"),
  DESIGNER: text("Thiết kế", "Designer"),
};
export const levelLabels = {
  JUNIOR: text("Junior", "Junior"),
  MID: text("Mid-level", "Mid-level"),
  SENIOR: text("Senior", "Senior"),
  LEAD: text("Lead", "Lead"),
};
export const countryLabels = {
  VN: text("Việt Nam", "Vietnam"),
  US: text("Hoa Kỳ", "United States"),
};
export const typeLabels = {
  FULL_TIME: text("Toàn thời gian", "Full-time"),
  CONTRACT: text("Hợp đồng", "Contract"),
};
export { CompanySuggestion } from "./CompanyProfile";
const blankReview = (companyId: string): ReviewInput => ({
  companyId,
  kind: "EMPLOYEE",
  employment: "CURRENT",
  role: "",
  year: new Date().getFullYear(),
  rating: 4,
  cultureRating: null,
  growthRating: null,
  headline: "",
  pros: "",
  cons: "",
  acknowledged: true,
});
export function ReviewForm({
  company,
  open,
  onClose,
  onSaved,
  existing,
}: {
  company: Company;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: Contribution;
}) {
  const { t } = useLanguage(),
    [input, setInput] = useState<ReviewInput>(blankReview(company.id)),
    [ack, setAck] = useState(false),
    [preview, setPreview] = useState(false),
    [invalid, setInvalid] = useState(false),
    a = useAction(),
    { step, setStep, formRef, validStep } = useFormSteps(open);
  useEffect(() => {
    setInput(
      existing ? (existing.input as ReviewInput) : blankReview(company.id),
    );
    setStep(0);
    setAck(false);
    setPreview(false);
    a.clear();
  }, [company.id, existing?.id, existing?.revision]);
  const user = useSession(),
    [owned, setOwned] = useState<Contribution | null>(null),
    [reading, setReading] = useState(false),
    [readError, setReadError] = useState(false);
  // Lock inputs before paint: reopening must not expose editable stale review text.
  useLayoutEffect(() => {
    let live = true;
    if (!open || existing || !user || user.isAnonymous) return;
    setStep(0);
    setReading(true);
    setReadError(false);
    getOwnContribution({
      kind: "review",
      companyId: company.id,
      experienceKind: input.kind,
    })
      .then((item) => {
        if (!live) return;
        setOwned(item);
        if (item) {
          setInput(item.input as ReviewInput);
          setPreview(false);
        }
      })
      .catch(() => {
        if (live) setReadError(true);
      })
      .finally(() => {
        if (live) setReading(false);
      });
    return () => {
      live = false;
    };
  }, [open, company.id, input.kind, existing?.id, user?.uid]);
  const update = <K extends keyof ReviewInput>(
    key: K,
    value: ReviewInput[K],
  ) => {
    setInput((x) => ({ ...x, [key]: value }));
    setPreview(false);
    setInvalid(false);
  };
  async function save() {
    const p = reviewInput.safeParse({
      ...input,
      acknowledged: ack,
    });
    if (!p.success) {
      setInvalid(true);
      return;
    }
    if (
      await a.run(
        () =>
          changeCommunity({
            action: "saveReview",
            input: p.data,
            draft: false,
            ...((existing ?? owned)
              ? {
                  id: (existing ?? owned)!.id,
                  revision: (existing ?? owned)!.revision,
                }
              : {}),
          }),
        t(
          text(
            "Đã gửi đánh giá, đang chờ duyệt.",
            "Review sent and awaiting moderation.",
          ),
        ),
      )
    ) {
      onSaved();
      onClose();
    }
  }
  function next() {
    if (!validStep()) return;
    if (step === 0) {
      setStep(1);
      return;
    }
    const parsed = reviewInput.safeParse({ ...input, acknowledged: true });
    setInvalid(!parsed.success);
    if (parsed.success) {
      setPreview(true);
      setStep(2);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) next();
    else if (ack) void save();
  }
  return (
    <Dialog
      title={t(text("Chia sẻ trải nghiệm", "Share your experience"))}
      open={open}
      onClose={onClose}
    >
      <AccountRequired>
        <form
          ref={formRef}
          className="community-form"
          onSubmit={submit}
          noValidate
        >
          <FormStepper
            step={step}
            onStep={setStep}
            disabled={reading || a.busy || readError}
            labels={[
              t(text("Bối cảnh", "Context")),
              t(text("Nội dung", "Experience")),
              t(text("Xem lại", "Review")),
            ]}
          />
          <p className="community-selected-company">
            <Icon name="building" />
            {company.name}
          </p>
          <fieldset
            data-step="0"
            hidden={step !== 0}
            disabled={reading || a.busy || readError}
          >
            <legend tabIndex={-1} data-step-title>
              <span>01</span>
              {t(text("Bối cảnh trải nghiệm", "Experience context"))}
            </legend>

            <div className="community-fields">
              <Field label={t(text("Loại trải nghiệm", "Experience type"))}>
                <select
                  disabled={!!existing}
                  value={input.kind}
                  onChange={(e) => {
                    const kind = e.target.value as ReviewInput["kind"];
                    setInput((x) => ({
                      ...x,
                      kind,
                      employment:
                        kind === "INTERVIEW" ? "CANDIDATE" : "CURRENT",
                      cultureRating: null,
                      growthRating: null,
                    }));
                    setPreview(false);
                  }}
                >
                  <option value="EMPLOYEE">
                    {t(text("Làm việc", "Employment"))}
                  </option>
                  <option value="INTERVIEW">
                    {t(text("Phỏng vấn", "Interview"))}
                  </option>
                </select>
              </Field>
              <Field label={t(text("Trạng thái", "Status"))}>
                <select
                  value={input.employment}
                  onChange={(e) =>
                    update(
                      "employment",
                      e.target.value as ReviewInput["employment"],
                    )
                  }
                >
                  {input.kind === "INTERVIEW" ? (
                    <option value="CANDIDATE">
                      {t(text("Ứng viên", "Candidate"))}
                    </option>
                  ) : (
                    <>
                      <option value="CURRENT">
                        {t(text("Đang làm việc", "Current employee"))}
                      </option>
                      <option value="FORMER">
                        {t(text("Đã nghỉ việc", "Former employee"))}
                      </option>
                    </>
                  )}
                </select>
              </Field>
              <Autocomplete
                label={t(
                  text(
                    "Nhóm vị trí · Không bắt buộc",
                    "Role family · Optional",
                  ),
                )}
                value={input.role}
                maxLength={80}
                allowCustom
                disabled={reading || a.busy || readError}
                options={Object.values(roleLabels).map((role) => ({
                  value: role.en,
                  label: t(role),
                }))}
                onChange={(value) => update("role", value)}
              />
              <Field label={t(text("Năm trải nghiệm", "Experience year"))}>
                <input
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  required
                  value={input.year}
                  onChange={(e) => update("year", Number(e.target.value))}
                />
              </Field>
            </div>
          </fieldset>
          <fieldset
            data-step="1"
            hidden={step !== 1}
            disabled={reading || a.busy || readError}
          >
            <legend tabIndex={-1} data-step-title>
              <span>02</span>
              {t(text("Điều bạn muốn chia sẻ", "What you want to share"))}
            </legend>
            <div className="community-fields">
              <Field
                wide
                label={t(
                  input.kind === "INTERVIEW"
                    ? text(
                        "Đánh giá trải nghiệm phỏng vấn",
                        "Interview experience rating",
                      )
                    : text("Đánh giá tổng thể", "Overall rating"),
                )}
              >
                <select
                  value={input.rating}
                  onChange={(e) => update("rating", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} / 5
                    </option>
                  ))}
                </select>
              </Field>
              {input.kind === "EMPLOYEE" &&
                (
                  [
                    [
                      "cultureRating",
                      text("Văn hóa · Không bắt buộc", "Culture · Optional"),
                    ],
                    [
                      "growthRating",
                      text("Phát triển · Không bắt buộc", "Growth · Optional"),
                    ],
                  ] as const
                ).map(([k, l]) => (
                  <Field key={k} label={t(l)}>
                    <select
                      value={input[k] ?? ""}
                      onChange={(e) =>
                        update(
                          k,
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">
                        {t(text("Không đánh giá", "Not rated"))}
                      </option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                ))}
              <Field wide label={t(text("Một câu tóm tắt", "Headline"))}>
                <input
                  required
                  minLength={5}
                  maxLength={140}
                  value={input.headline}
                  onChange={(e) => update("headline", e.target.value)}
                />
              </Field>
              <Field
                wide
                label={t(
                  text(
                    "Điểm tốt / Trải nghiệm tích cực",
                    "Positives / Positive experience",
                  ),
                )}
              >
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  value={input.pros}
                  onChange={(e) => update("pros", e.target.value)}
                />
              </Field>
              <Field
                wide
                label={t(text("Điều có thể cải thiện", "What could improve"))}
              >
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  value={input.cons}
                  onChange={(e) => update("cons", e.target.value)}
                />
              </Field>
            </div>
          </fieldset>
          <section data-step="2" hidden={step !== 2}>
            {preview && (
              <div className="community-preview">
                <p className="community-preview-context">
                  {input.year} ·{" "}
                  {input.kind === "EMPLOYEE"
                    ? t(text("Làm việc", "Employment"))
                    : t(text("Phỏng vấn", "Interview"))}{" "}
                  · {input.rating} / 5{input.role ? ` · ${input.role}` : ""}
                </p>
                <h3 tabIndex={-1} data-step-title>
                  {input.headline}
                </h3>
                <p>{input.pros}</p>
                <p>{input.cons}</p>
                <p>
                  {t(
                    text(
                      "Gửi bài sẽ chuyển sang chờ duyệt. Sửa bài đã công khai sẽ gỡ bản cũ cho tới khi duyệt lại.",
                      "Sending puts the review into moderation. Editing a published review removes the old version until it is reviewed again.",
                    ),
                  )}
                </p>
              </div>
            )}
            <div className="community-privacy">
              <Icon name="shield" />
              <p>
                {t(
                  text(
                    "Tên và email tài khoản không công khai. Nội dung vẫn có thể khiến người khác nhận ra bạn. Tránh tên cá nhân, thông tin liên hệ và tài liệu mật.",
                    "Your name and email are not public. Your content may still identify you. Avoid personal names, contact details and confidential material.",
                  ),
                )}
              </p>
            </div>
            <label className="community-ack">
              <input
                type="checkbox"
                disabled={reading || a.busy || readError}
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                required
              />
              {t(
                text(
                  "Tôi chia sẻ trải nghiệm của mình và tuân thủ hướng dẫn trên.",
                  "I am sharing my own experience and following the guidance above.",
                ),
              )}
            </label>
          </section>
          {invalid && (
            <p role="alert">
              {t(
                text(
                  "Kiểm tra nội dung và độ dài các trường.",
                  "Check your entries and field lengths.",
                ),
              )}
            </p>
          )}
          <ErrorNotice error={a.error} />
          {reading && (
            <p role="status">
              {t(text("Đang đọc đánh giá của bạn…", "Loading your review…"))}
            </p>
          )}
          {readError && (
            <p role="alert">
              {t(
                text(
                  "Chưa đọc được đánh giá. Đóng và mở lại form để thử lại.",
                  "Your review could not be loaded. Close and reopen the form to retry.",
                ),
              )}
            </p>
          )}
          <div className="community-form-footer">
            {step > 0 && (
              <button
                type="button"
                className="community-back-button"
                disabled={reading || a.busy || readError}
                onClick={() => setStep(step - 1)}
                aria-label={t(text("Quay lại bước trước", "Previous step"))}
                title={t(text("Quay lại bước trước", "Previous step"))}
              >
                <Icon name="back" />
              </button>
            )}
            <button
              className="primary"
              disabled={reading || a.busy || readError || (step === 2 && !ack)}
            >
              {a.busy
                ? t(text("Đang gửi…", "Sending…"))
                : step === 2
                  ? t(text("Gửi đánh giá", "Send review"))
                  : step === 1
                    ? t(text("Xem trước", "Preview"))
                    : t(text("Tiếp tục", "Continue"))}
              <Icon name="arrow" />
            </button>
          </div>
        </form>
      </AccountRequired>
    </Dialog>
  );
}
export const blankSalary = (companyId: string): SalaryInput => ({
  companyId,
  country: "VN",
  role: "SOFTWARE_ENGINEER",
  level: "MID",
  experience: "3_5",
  employmentType: "FULL_TIME",
  currency: "VND",
  basis: "GROSS",
  year: new Date().getFullYear(),
  base: 0,
  period: "MONTH",
  payPeriods: 12,
  bonus: null,
  bonusKind: "ACTUAL",
  equity: null,
  equityKind: "ANNUAL_VESTED",
  signOn: null,
  acknowledged: true,
});
export function SalaryForm({
  company,
  open,
  onClose,
  onSaved,
  existing,
}: {
  company: Company;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: Contribution;
}) {
  const { t, locale } = useLanguage(),
    [input, setInput] = useState<SalaryInput>(blankSalary(company.id)),
    [ack, setAck] = useState(false),
    [preview, setPreview] = useState(false),
    [invalid, setInvalid] = useState(false),
    a = useAction(),
    { step, setStep, formRef, validStep } = useFormSteps(open);
  useEffect(() => {
    setInput(
      existing ? (existing.input as SalaryInput) : blankSalary(company.id),
    );
    setStep(0);
    setAck(false);
    setPreview(false);
    a.clear();
  }, [company.id, existing?.id, existing?.revision]);
  const [salaryOwned, setSalaryOwned] = useState<Contribution | null>(null);
  const update = <K extends keyof SalaryInput>(
    key: K,
    value: SalaryInput[K],
  ) => {
    setInput((x) => ({ ...x, [key]: value }));
    setPreview(false);
    setInvalid(false);
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (validStep()) setStep(1);
      return;
    }
    if (step === 1 && !validStep()) return;
    const parsed = salaryInput.safeParse(input);
    setInvalid(!parsed.success);
    if (!parsed.success) return;
    if (step === 1) {
      if (!existing) {
        await a.run(async () => {
          const own = await getOwnContribution({
            kind: "salary",
            input: parsed.data,
          });
          setSalaryOwned(own);
          setPreview(true);
          setStep(2);
        }, "");
      } else {
        setPreview(true);
        setStep(2);
      }
      return;
    }
    if (!ack) return;
    if (
      await a.run(
        () =>
          changeCommunity({
            action: "saveSalary",
            input: parsed.data,
            ...((existing ?? salaryOwned)
              ? {
                  id: (existing ?? salaryOwned)!.id,
                  revision: (existing ?? salaryOwned)!.revision,
                }
              : {}),
          }),
        t(
          text(
            "Đã gửi thông tin thu nhập, đang chờ duyệt.",
            "Compensation sent and awaiting moderation.",
          ),
        ),
      )
    ) {
      onSaved();
      onClose();
    }
  }
  const money = (n: number | null) =>
      n === null
        ? t(text("Chưa đủ thành phần", "Incomplete components"))
        : new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
            style: "currency",
            currency: input.currency,
            maximumFractionDigits: 0,
          }).format(n),
    normalized = normalizeSalary(input);
  return (
    <Dialog
      title={t(text("Chia sẻ thu nhập", "Share compensation"))}
      open={open}
      onClose={onClose}
    >
      <AccountRequired>
        <form
          ref={formRef}
          className="community-form"
          onSubmit={submit}
          noValidate
        >
          <FormStepper
            step={step}
            onStep={setStep}
            disabled={a.busy}
            labels={[
              t(text("Bối cảnh", "Context")),
              t(text("Thu nhập", "Amounts")),
              t(text("Xem lại", "Review")),
            ]}
          />
          <p className="community-selected-company">
            <Icon name="building" />
            {company.name}
          </p>
          <fieldset disabled={a.busy} data-step="0" hidden={step !== 0}>
            <legend tabIndex={-1} data-step-title>
              <span>01</span>
              {t(text("Nhóm công việc", "Job context"))}
            </legend>

            <div className="community-fields">
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
              ).map(([k, labels, label]) => (
                <Field key={k} label={t(label)}>
                  <select
                    disabled={!!existing}
                    value={input[k]}
                    onChange={(e) => update(k, e.target.value as never)}
                  >
                    {Object.entries(labels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {t(l)}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
              <Field label={t(text("Kinh nghiệm (năm)", "Experience (years)"))}>
                <select
                  value={input.experience}
                  onChange={(e) =>
                    update(
                      "experience",
                      e.target.value as SalaryInput["experience"],
                    )
                  }
                >
                  <option value="0_2">0–2</option>
                  <option value="3_5">3–5</option>
                  <option value="6_10">6–10</option>
                  <option value="11_PLUS">11+</option>
                </select>
              </Field>
              <Field label={t(text("Năm dữ liệu", "Reporting year"))}>
                <input
                  disabled={!!existing}
                  required
                  type="number"
                  min={2020}
                  max={new Date().getFullYear()}
                  value={input.year}
                  onChange={(e) => update("year", Number(e.target.value))}
                />
              </Field>
            </div>
          </fieldset>
          <section data-step="1" hidden={step !== 1}>
            <fieldset disabled={a.busy}>
              <legend tabIndex={-1} data-step-title>
                <span>02</span>
                {t(text("Lương cơ bản", "Base salary"))}
              </legend>
              <div className="community-fields">
                <Field
                  label={t(text("Số tiền mỗi kỳ", "Amount per pay period"))}
                >
                  <input
                    required
                    type="number"
                    min={1}
                    max={1e12}
                    value={input.base || ""}
                    onChange={(e) => update("base", Number(e.target.value))}
                  />
                </Field>
                <Field label={t(text("Tiền tệ", "Currency"))}>
                  <select
                    disabled={!!existing}
                    value={input.currency}
                    onChange={(e) =>
                      update("currency", e.target.value as "VND" | "USD")
                    }
                  >
                    <option>VND</option>
                    <option>USD</option>
                  </select>
                </Field>
                <Field label={t(text("Kỳ lương", "Pay period"))}>
                  <select
                    value={input.period}
                    onChange={(e) => {
                      const period = e.target.value as SalaryInput["period"];
                      setInput((x) => ({
                        ...x,
                        period,
                        payPeriods: period === "YEAR" ? 1 : 12,
                      }));
                      setPreview(false);
                    }}
                  >
                    <option value="MONTH">
                      {t(text("Theo tháng", "Monthly"))}
                    </option>
                    <option value="YEAR">
                      {t(text("Theo năm", "Annual"))}
                    </option>
                  </select>
                </Field>
                {input.period === "MONTH" && (
                  <Field
                    label={t(
                      text(
                        "Số kỳ bảo đảm mỗi năm",
                        "Guaranteed pay periods per year",
                      ),
                    )}
                  >
                    <select
                      value={input.payPeriods}
                      onChange={(e) =>
                        update("payPeriods", Number(e.target.value) as 12 | 13)
                      }
                    >
                      <option>12</option>
                      <option>13</option>
                    </select>
                  </Field>
                )}
                <Field label={t(text("Cách tính", "Tax basis"))}>
                  <select
                    disabled={!!existing}
                    value={input.basis}
                    onChange={(e) =>
                      update("basis", e.target.value as "GROSS" | "NET")
                    }
                  >
                    <option value="GROSS">
                      {t(text("Trước thuế", "Gross"))}
                    </option>
                    <option value="NET">{t(text("Sau thuế", "Net"))}</option>
                  </select>
                </Field>
              </div>
            </fieldset>
            <fieldset disabled={a.busy}>
              <legend tabIndex={-1} data-step-title>
                <span>03</span>
                {t(text("Các khoản bổ sung", "Additional components"))}
              </legend>
              <div className="community-fields">
                <Field label={t(text("Thưởng năm", "Annual bonus"))}>
                  <input
                    type="number"
                    min={0}
                    max={1e12}
                    placeholder={t(
                      text("Chưa biết → để trống", "Unknown → leave blank"),
                    )}
                    value={input.bonus ?? ""}
                    onChange={(e) =>
                      update(
                        "bonus",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                </Field>
                <Field label={t(text("Loại thưởng", "Bonus basis"))}>
                  <select
                    value={input.bonusKind}
                    onChange={(e) =>
                      update("bonusKind", e.target.value as "ACTUAL" | "TARGET")
                    }
                  >
                    <option value="ACTUAL">
                      {t(text("Thực nhận", "Actual"))}
                    </option>
                    <option value="TARGET">
                      {t(text("Mục tiêu", "Target"))}
                    </option>
                  </select>
                </Field>
                {(
                  [
                    [
                      "equity",
                      text("Cổ phần nhận trong năm", "Annual vested equity"),
                    ],
                    [
                      "signOn",
                      text(
                        "Thưởng nhận việc · Một lần",
                        "Sign-on bonus · One-time",
                      ),
                    ],
                  ] as const
                ).map(([k, l]) => (
                  <Field key={k} label={t(l)}>
                    <input
                      type="number"
                      min={0}
                      max={1e12}
                      placeholder={t(
                        text("Chưa biết → để trống", "Unknown → leave blank"),
                      )}
                      value={input[k] ?? ""}
                      onChange={(e) =>
                        update(
                          k,
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                ))}
              </div>
            </fieldset>
            <p className="community-hint">
              {t(
                text(
                  "Cổ phần chỉ tính phần nhận trong năm, không phải toàn bộ grant. Nhập 0 nếu chắc chắn không có; để trống nếu chưa biết.",
                  "Equity means the amount vested in the year, not the full grant. Enter 0 if none; leave blank if unknown.",
                ),
              )}
            </p>
          </section>
          <section data-step="2" hidden={step !== 2}>
            {preview && (
              <div className="community-preview">
                {(existing ?? salaryOwned)?.status === "PUBLISHED" && (
                  <p>
                    {t(
                      text(
                        "Sửa đóng góp sẽ chuyển về chờ duyệt; thống kê liên quan có thể tạm ngừng hiển thị.",
                        "Editing returns your contribution to moderation; related statistics may be withheld.",
                      ),
                    )}
                  </p>
                )}
                <h3 tabIndex={-1} data-step-title>
                  {t(text("Xem trước chuẩn hóa", "Normalization preview"))}
                </h3>
                <dl>
                  <dt>{t(text("Lương cơ bản năm", "Annual base"))}</dt>
                  <dd>{money(normalized.annualBase)}</dd>
                  <dt>
                    {t(text("Thu nhập định kỳ", "Recurring compensation"))}
                  </dt>
                  <dd>{money(normalized.recurring)}</dd>
                  <dt>
                    {t(text("Thu nhập năm đầu", "First-year compensation"))}
                  </dt>
                  <dd>{money(normalized.firstYear)}</dd>
                </dl>
                <p>
                  {t(
                    text(
                      "Thông tin chi tiết được lưu riêng. Chỉ thống kê đủ điều kiện được công khai.",
                      "Details stay private. Only eligible aggregates are published.",
                    ),
                  )}
                </p>
              </div>
            )}
            <label className="community-ack">
              <input
                required
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              {t(
                text(
                  "Tôi đồng ý đóng góp cho thống kê theo nhóm sau khi được duyệt.",
                  "I agree to contribute to cohort statistics after moderation.",
                ),
              )}
            </label>
          </section>
          {invalid && (
            <p role="alert">
              {t(
                text(
                  "Kiểm tra số tiền, năm và kỳ lương.",
                  "Check amounts, year and pay periods.",
                ),
              )}
            </p>
          )}
          <ErrorNotice error={a.error} />
          <div className="community-form-footer">
            <button
              type="button"
              disabled={a.busy}
              onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            >
              {step > 0
                ? t(text("Quay lại", "Back"))
                : t(text("Để sau", "Later"))}
            </button>
            <button
              className="primary"
              disabled={a.busy || (step === 2 && !ack)}
            >
              {a.busy
                ? t(text("Đang gửi…", "Sending…"))
                : step === 2
                  ? t(text("Gửi thông tin", "Send compensation"))
                  : step === 1
                    ? t(text("Xem trước", "Preview"))
                    : t(text("Tiếp tục", "Continue"))}
              <Icon name="arrow" />
            </button>
          </div>
        </form>
      </AccountRequired>
    </Dialog>
  );
}
