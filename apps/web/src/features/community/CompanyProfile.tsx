import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { httpsCallable } from "firebase/functions";
import {
  companyInput,
  companyProfileInput,
  type Company,
} from "../../../../../packages/contracts/src/community";
import { companyKey } from "../../../../../packages/domain/src/community";
import { functions } from "../../firebase";
import { useLanguage, text } from "../../i18n";
import Autocomplete from "./Autocomplete";
import FormStepper, { useFormSteps } from "./FormStepper";
import {
  AccountRequired,
  Dialog,
  Field,
  ErrorNotice,
  useAction,
} from "./shared";
import { changeCommunity } from "./api";
import Icon from "./Icon";
async function prepareLogo(file: File) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024 ||
    !file.size
  )
    throw new Error("INVALID_LOGO");
  const bytes = new Uint8Array(await file.arrayBuffer()),
    view = new DataView(bytes.buffer);
  let width = 0,
    height = 0;
  if (
    file.type === "image/png" &&
    bytes.length >= 24 &&
    view.getUint32(0) === 0x89504e47 &&
    view.getUint32(4) === 0x0d0a1a0a
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (
    file.type === "image/jpeg" &&
    bytes[0] === 255 &&
    bytes[1] === 216
  ) {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 255) break;
      const marker = bytes[offset + 1]!,
        len = view.getUint16(offset + 2);
      if (len < 2 || offset + 2 + len > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2].includes(marker) && len >= 8) {
        height = view.getUint16(offset + 5);
        width = view.getUint16(offset + 7);
        break;
      }
      offset += 2 + len;
    }
  } else if (
    file.type === "image/webp" &&
    bytes.length >= 30 &&
    view.getUint32(0) === 0x52494646 &&
    view.getUint32(8) === 0x57454250
  ) {
    const type = view.getUint32(12);
    if (type === 0x56503858) {
      width = 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16);
      height = 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16);
    } else if (type === 0x5650384c && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true);
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
    } else if (
      type === 0x56503820 &&
      bytes[23] === 0x9d &&
      bytes[24] === 1 &&
      bytes[25] === 0x2a
    ) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    }
  }
  if (
    !width ||
    !height ||
    width > 8192 ||
    height > 8192 ||
    width * height > 16_000_000
  )
    throw new Error("INVALID_LOGO");
  const bitmap = await createImageBitmap(file);
  try {
    if (
      bitmap.width * bitmap.height > 16_000_000 ||
      bitmap.width > 8192 ||
      bitmap.height > 8192
    )
      throw new Error("INVALID_LOGO");
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height)),
      canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("INVALID_LOGO"))),
        "image/png",
      ),
    );
    return blob;
  } finally {
    bitmap.close();
  }
}
async function base64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]!);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
export function CompanySuggestion({
  initialName = "",
  knownCompanies = [],
  open,
  onClose,
  onSaved,
}: {
  initialName?: string;
  knownCompanies?: Company[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage(),
    a = useAction(),
    { step, setStep, formRef, validStep } = useFormSteps(open);
  const [name, setName] = useState(initialName),
    [industry, setIndustry] = useState(""),
    [country, setCountry] = useState<"VN" | "US">("VN"),
    [headquarters, setHeadquarters] = useState(""),
    [phone, setPhone] = useState(""),
    [website, setWebsite] = useState(""),
    [ack, setAck] = useState(false),
    [logo, setLogo] = useState<Blob | null>(null),
    [preview, setPreview] = useState(""),
    [invalid, setInvalid] = useState(false),
    [preparing, setPreparing] = useState(false);
  const upload = useRef<string | null>(null),
    submitted = useRef(false),
    generation = useRef(0);
  const busy = a.busy || preparing;
  const discard = () => {
    const id = upload.current;
    upload.current = null;
    if (id && !submitted.current)
      void httpsCallable(functions, "discardCompanyLogo", { timeout: 10000 })({
        uploadId: id,
      }).catch(() => {});
  };
  useLayoutEffect(() => {
    if (open) {
      setName(initialName);
      setStep(0);
      setAck(false);
      setInvalid(false);
      a.clear();
    }
  }, [open, initialName]);
  useEffect(() => {
    if (!logo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);
  useEffect(
    () => () => {
      generation.current++;
      discard();
    },
    [],
  );
  const existing = knownCompanies.some(
    (c) => companyKey(c.name, c.country) === companyKey(name, country),
  );
  function close() {
    if (busy) return;
    generation.current++;
    discard();
    setLogo(null);
    setAck(false);
    onClose();
  }
  async function choose(file?: File) {
    const version = ++generation.current;
    setPreparing(true);
    setInvalid(false);
    try {
      if (!file) return;
      const prepared = await prepareLogo(file);
      if (version !== generation.current) return;
      discard();
      submitted.current = false;
      setLogo(prepared);
    } catch {
      if (version === generation.current) {
        setLogo(null);
        setInvalid(true);
      }
    } finally {
      if (version === generation.current) setPreparing(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || existing) return;
    if (step === 0) {
      const valid =
        companyInput.safeParse({ name, industry, country }).success &&
        validStep();
      setInvalid(!valid);
      if (valid) setStep(1);
      return;
    }
    const id = upload.current ?? crypto.randomUUID(),
      parsed = companyProfileInput.safeParse({
        name,
        industry,
        country,
        headquarters,
        phone,
        website,
        logoUploadId: id,
        acknowledged: true,
      });
    if (!parsed.success || !logo || !validStep()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (step === 1) {
      setStep(2);
      return;
    }
    if (!ack) return;
    upload.current = id;
    if (
      await a.run(
        async () => {
          await httpsCallable(functions, "uploadCompanyLogo", {
            timeout: 30000,
          })({ uploadId: id, data: await base64(logo) });
          await changeCommunity({
            action: "suggestCompanyProfile",
            input: parsed.data,
          });
          submitted.current = true;
        },
        t(
          text(
            "Đã gửi hồ sơ công ty, đang chờ duyệt.",
            "Company profile sent and awaiting moderation.",
          ),
        ),
      )
    ) {
      setLogo(null);
      upload.current = null;
      setIndustry("");
      setHeadquarters("");
      setPhone("");
      setWebsite("");
      onSaved();
      onClose();
    }
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title={t(text("Tạo hồ sơ công ty", "Create company profile"))}
    >
      <AccountRequired>
        <form
          ref={formRef}
          className="community-form"
          noValidate
          onSubmit={submit}
        >
          <FormStepper
            step={step}
            onStep={setStep}
            disabled={busy}
            labels={[
              t(text("Công ty", "Company")),
              t(text("Thông tin", "Details")),
              t(text("Xem lại", "Review")),
            ]}
          />
          <fieldset data-step="0" hidden={step !== 0} disabled={busy}>
            <legend tabIndex={-1} data-step-title>
              <span>01</span>
              {t(text("Thông tin công ty", "Company information"))}
            </legend>
            <div className="community-fields">
              <Autocomplete
                wide
                label={t(text("Tên công ty", "Company name"))}
                value={name}
                onChange={setName}
                required
                allowCustom
                maxLength={100}
                options={knownCompanies
                  .filter((c) => c.country === country)
                  .map((c) => ({ value: c.name, label: c.name }))}
              />
              <Autocomplete
                label={t(text("Ngành", "Industry"))}
                value={industry}
                onChange={setIndustry}
                required
                allowCustom
                maxLength={100}
                options={[
                  ...new Set(knownCompanies.map((c) => c.industry)),
                ].map((i) => ({ value: i, label: i }))}
              />
              <Field label={t(text("Quốc gia hoạt động", "Operating country"))}>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as "VN" | "US")}
                >
                  <option value="VN">{t(text("Việt Nam", "Vietnam"))}</option>
                  <option value="US">
                    {t(text("Hoa Kỳ", "United States"))}
                  </option>
                </select>
              </Field>
            </div>
          </fieldset>
          <fieldset data-step="1" hidden={step !== 1} disabled={busy}>
            <legend tabIndex={-1} data-step-title>
              <span>02</span>
              {t(
                text(
                  "Logo và liên hệ doanh nghiệp",
                  "Logo and business contact",
                ),
              )}
            </legend>
            <div className="community-fields">
              <Field wide label={t(text("Logo công ty", "Company logo"))}>
                <div className="community-logo-upload">
                  {preview && (
                    <img
                      src={preview}
                      alt={t(text("Logo xem trước", "Logo preview"))}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => void choose(e.target.files?.[0])}
                  />
                </div>
              </Field>
              <p className="community-hint community-wide">
                {t(
                  text(
                    "PNG, JPEG hoặc WebP · Tối đa 2 MB. Chỉ tải logo bạn có quyền sử dụng.",
                    "PNG, JPEG or WebP · Up to 2 MB. Upload a logo you have permission to use.",
                  ),
                )}
              </p>
              <Field
                wide
                label={t(text("Địa chỉ trụ sở chính", "Headquarters address"))}
              >
                <textarea
                  required
                  minLength={10}
                  maxLength={300}
                  autoComplete="street-address"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                />
              </Field>
              <Field
                label={t(text("Điện thoại doanh nghiệp", "Business phone"))}
              >
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={25}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field
                label={t(
                  text("Website · Không bắt buộc", "Website · Optional"),
                )}
              >
                <input
                  type="url"
                  placeholder="https://"
                  maxLength={200}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </Field>
            </div>
            <p className="community-hint">
              {t(
                text(
                  "Dùng địa chỉ và số điện thoại công khai của doanh nghiệp, không nhập thông tin cá nhân.",
                  "Use the company’s public address and phone number. Do not enter personal contact information.",
                ),
              )}
            </p>
          </fieldset>
          <section data-step="2" hidden={step !== 2}>
            <div className="community-preview">
              <h3 tabIndex={-1} data-step-title>
                {t(
                  text(
                    "Kiểm tra hồ sơ trước khi gửi",
                    "Review before submitting",
                  ),
                )}
              </h3>
              <div className="community-company-preview">
                {preview && (
                  <img
                    src={preview}
                    alt={t(text("Logo xem trước", "Logo preview"))}
                  />
                )}
                <div>
                  <strong>{name}</strong>
                  <p>
                    {industry} ·{" "}
                    {country === "VN"
                      ? t(text("Việt Nam", "Vietnam"))
                      : t(text("Hoa Kỳ", "United States"))}
                  </p>
                </div>
              </div>
              <dl>
                <dt>{t(text("Trụ sở chính", "Headquarters"))}</dt>
                <dd>{headquarters}</dd>
                <dt>{t(text("Điện thoại", "Phone"))}</dt>
                <dd>{phone}</dd>
                {website && (
                  <>
                    <dt>Website</dt>
                    <dd>{website}</dd>
                  </>
                )}
              </dl>
              <p>
                {t(
                  text(
                    "Hồ sơ và logo chỉ xuất hiện công khai sau khi được duyệt.",
                    "The profile and logo appear publicly only after moderation.",
                  ),
                )}
              </p>
            </div>
            <label className="community-ack">
              <input
                type="checkbox"
                required
                checked={ack}
                disabled={busy}
                onChange={(e) => setAck(e.target.checked)}
              />
              {t(
                text(
                  "Thông tin này chính xác, công khai và tôi có quyền sử dụng logo.",
                  "This information is accurate and public, and I have permission to use the logo.",
                ),
              )}
            </label>
          </section>
          {existing && (
            <p role="alert">
              {t(
                text(
                  "Công ty đã có trong danh mục. Chọn công ty từ ô tìm kiếm.",
                  "This company is already listed. Select it from the search field.",
                ),
              )}
            </p>
          )}
          {invalid && (
            <p role="alert">
              {t(
                text(
                  "Kiểm tra tên, ngành, logo, địa chỉ và điện thoại. Website cần bắt đầu bằng https://.",
                  "Check the name, industry, logo, address and phone. Website must start with https://.",
                ),
              )}
            </p>
          )}
          <ErrorNotice error={a.error} />
          <div className="community-form-footer">
            <button
              type="button"
              disabled={busy}
              onClick={() => (step > 0 ? setStep(step - 1) : close())}
            >
              {step > 0
                ? t(text("Quay lại", "Back"))
                : t(text("Để sau", "Later"))}
            </button>
            <button
              className="primary"
              disabled={busy || existing || (step === 2 && !ack)}
            >
              {busy
                ? t(text("Đang xử lý…", "Processing…"))
                : step === 2
                  ? t(text("Gửi duyệt", "Send for review"))
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
