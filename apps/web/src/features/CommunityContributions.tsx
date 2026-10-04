import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, text } from "../i18n";
import { useSession } from "../session";
import type {
  Company,
  Contribution,
  ReviewInput,
} from "../../../../packages/contracts/src/community";
import {
  changeCommunity,
  loadCompany,
  loadContributions,
} from "./community/api";
import { ReviewForm, SalaryForm } from "./community/Forms";
import {
  Hero,
  AccountRequired,
  Dialog,
  ErrorNotice,
  errorText,
  statusLabel,
  useAction,
} from "./community/shared";
import Icon from "./community/Icon";
export default function CommunityContributions() {
  const { t, locale } = useLanguage(),
    user = useSession(),
    [items, setItems] = useState<Contribution[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null),
    [cursor, setCursor] = useState<string | null>(null),
    [edit, setEdit] = useState<{ item: Contribution; company: Company } | null>(
      null,
    ),
    [withdraw, setWithdraw] = useState<Contribution | null>(null),
    [appeal, setAppeal] = useState<Contribution | null>(null),
    [reason, setReason] = useState(""),
    a = useAction();
  async function load(after?: string) {
    if (!user || user.isAnonymous) return;
    setLoading(true);
    setError(null);
    try {
      const r = await loadContributions(false, after);
      setItems((prev) => (after ? [...prev, ...r.items] : r.items));
      setCursor(r.nextCursor);
    } catch (e) {
      setError(errorText(e, locale === "vi"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [user?.uid]);
  return (
    <section className="community">
      <Hero
        label={t(text("CỘNG ĐỒNG", "COMMUNITY"))}
        title={t(text("Đóng góp của tôi", "My contributions"))}
        description={t(
          text(
            "Bản nháp, nội dung đang chờ duyệt và các bài đã công khai.",
            "Your drafts, moderation decisions and published contributions.",
          ),
        )}
      />
      <AccountRequired>
        <ErrorNotice error={error} retry={() => void load()} />
        {loading && (
          <p role="status">
            {t(text("Đang tải đóng góp…", "Loading contributions…"))}
          </p>
        )}
        {!loading && !error && !items.length && (
          <div className="community-empty">
            <Icon name="edit" />
            <h2>{t(text("Chưa có đóng góp", "No contributions yet"))}</h2>
            <Link className="button primary" to="/companies">
              {t(text("Khám phá công ty", "Explore companies"))}
            </Link>
          </div>
        )}
        <div className="community-contributions">
          {items.map((item) => (
            <article className="community-panel" key={item.kind + item.id}>
              <div className="community-panel-title">
                <h2>
                  {item.companyName ??
                    t(
                      item.kind === "company"
                        ? text("Đề xuất công ty", "Company suggestion")
                        : item.kind === "report"
                          ? text("Báo cáo nội dung", "Content report")
                          : text("Đóng góp", "Contribution"),
                    )}
                </h2>
                <span className="community-pill">
                  {t(statusLabel[item.status]!)}
                </span>
              </div>
              <p>
                {item.kind === "review"
                  ? (item.input as ReviewInput).headline
                  : item.kind === "salary"
                    ? t(
                        text(
                          "Thông tin thu nhập · Chi tiết riêng",
                          "Compensation · Private details",
                        ),
                      )
                    : item.kind === "company"
                      ? (item.input as { name: string }).name
                      : null}
              </p>
              {item.reason && (
                <p>
                  {t(text("Lý do duyệt", "Moderation reason"))}: {item.reason}
                </p>
              )}
              <div className="community-inline-actions">
                {(item.kind === "review" || item.kind === "salary") && (
                  <>
                    <button
                      disabled={a.busy}
                      onClick={() =>
                        void a.run(async () => {
                          const c = await loadCompany(
                            (item.input as { companyId: string }).companyId,
                          );
                          if (!c) throw new Error("company unavailable");
                          setEdit({ item, company: c });
                        }, "")
                      }
                    >
                      <Icon name="edit" />
                      {t(text("Sửa", "Edit"))}
                    </button>
                    {item.status !== "REMOVED" && (
                      <button
                        disabled={a.busy}
                        onClick={() => setWithdraw(item)}
                      >
                        {t(text("Rút đóng góp", "Withdraw"))}
                      </button>
                    )}
                    {item.kind === "review" &&
                      ["REJECTED", "CHANGES_REQUESTED"].includes(
                        item.status,
                      ) && (
                        <button
                          onClick={() => {
                            setReason("");
                            setAppeal(item);
                          }}
                        >
                          {t(text("Yêu cầu xem xét lại", "Appeal decision"))}
                        </button>
                      )}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        {cursor && (
          <button disabled={loading} onClick={() => void load(cursor)}>
            {t(text("Tải thêm", "Load more"))}
          </button>
        )}
        <ErrorNotice error={a.error} />
        {a.success && <p role="status">{a.success}</p>}
        {edit && edit.item.kind === "review" && (
          <ReviewForm
            open
            company={edit.company}
            existing={edit.item}
            onClose={() => setEdit(null)}
            onSaved={() => void load()}
          />
        )}{" "}
        {edit && edit.item.kind === "salary" && (
          <SalaryForm
            open
            company={edit.company}
            existing={edit.item}
            onClose={() => setEdit(null)}
            onSaved={() => void load()}
          />
        )}
        <Dialog
          open={!!withdraw}
          onClose={() => setWithdraw(null)}
          title={t(text("Rút đóng góp?", "Withdraw this contribution?"))}
        >
          <div className="community-form">
            <p>
              {t(
                text(
                  "Nội dung sẽ ngừng hiển thị công khai và số liệu liên quan được cập nhật. Không thu hồi được bản sao người khác đã giữ.",
                  "Public access will stop and related statistics will be updated. Copies already retained by others cannot be recalled.",
                ),
              )}
            </p>
            <ErrorNotice error={a.error} />
            <div className="community-form-footer">
              <button onClick={() => setWithdraw(null)}>
                {t(text("Giữ lại", "Keep contribution"))}
              </button>
              <button
                className="primary"
                disabled={a.busy}
                onClick={() =>
                  void a.run(async () => {
                    await changeCommunity({
                      action: "withdraw",
                      kind: withdraw!.kind,
                      id: withdraw!.id,
                      revision: withdraw!.revision,
                    });
                    setWithdraw(null);
                    await load();
                  })
                }
              >
                {t(text("Rút đóng góp", "Withdraw contribution"))}
              </button>
            </div>
          </div>
        </Dialog>
        <Dialog
          open={!!appeal}
          onClose={() => setAppeal(null)}
          title={t(text("Yêu cầu xem xét lại", "Appeal decision"))}
        >
          <form
            className="community-form"
            onSubmit={(e) => {
              e.preventDefault();
              void a.run(async () => {
                await changeCommunity({
                  action: "appeal",
                  id: appeal!.id,
                  revision: appeal!.revision,
                  reason,
                });
                setAppeal(null);
                await load();
              });
            }}
          >
            <label className="community-field">
              <span>{t(text("Lý do xem xét lại", "Appeal reason"))}</span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <ErrorNotice error={a.error} />
            <div className="community-form-footer">
              <button className="primary" disabled={a.busy}>
                {t(text("Gửi yêu cầu", "Send appeal"))}
              </button>
            </div>
          </form>
        </Dialog>
      </AccountRequired>
    </section>
  );
}
