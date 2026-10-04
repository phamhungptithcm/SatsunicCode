import GoogleAction from "../components/GoogleAction";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import { useSession } from "../session";
import { useLanguage, text } from "../i18n";
export default function Progress() {
  const user = useSession();
  const { t } = useLanguage();
  const [plan, setPlan] = useState<string | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(false),
    [next, setNext] = useState<string | null>(null);
  useEffect(() => {
    setPlan(null); setLoaded(false); setError(false); setNext(null);
    if (!user || user.isAnonymous) return;
    return onSnapshot(
      doc(db, `users/${user.uid}`),
      (s) => {
        setPlan(s.data()?.activePlan ?? null);
        setLoaded(true);
      },
      () => setError(true),
    );
  }, [user?.uid]);
  useEffect(() => {
    let live = true;
    if (plan)
      httpsCallable<unknown, { actions: { challenge: string }[] }>(
        functions,
        "getNextActions",
      )({})
        .then((r) => {
          if (live) setNext(r.data.actions[0]?.challenge ?? null);
        })
        .catch(() => {
          if (live) setError(true);
        });
    return () => {
      live = false;
    };
  }, [plan]);
  return (
    <section className="narrow">
      <p className="eyebrow">{t(text("TIẾN ĐỘ CỦA TÔI", "MY PROGRESS"))}</p>
      <h1>{t(text("Bước tiếp theo của bạn", "Your next step"))}</h1>
      {!user || user.isAnonymous ? (
        <GoogleAction className="button primary">
          {t(text("Đăng nhập để xem tiến độ", "Sign in to view progress"))}
        </GoogleAction>
      ) : error ? (
        <p role="alert">
          {t(
            text(
              "Chưa đọc được tiến độ. Kiểm tra kết nối Firebase.",
              "Progress could not be loaded. Check your connection.",
            ),
          )}
        </p>
      ) : !loaded ? (
        <p>{t(text("Đang đọc lộ trình…", "Loading plan…"))}</p>
      ) : !plan ? (
        <>
          <p>
            {t(
              text(
                "Bạn chưa có lộ trình đang theo.",
                "You have no active plan yet.",
              ),
            )}
          </p>
          <Link to="/roadmaps/dsa">
            {t(text("Khám phá DSA", "Explore DSA"))}
          </Link>
        </>
      ) : (
        <>
          <h2>DSA · v1</h2>
          <p>
            {t(
              text(
                "Chưa có bằng chứng được chấm/xác minh. Bản nháp và việc đọc bài không phải accepted evidence.",
                "No evaluated or verified evidence yet. Drafts and reading do not count as accepted evidence.",
              ),
            )}
          </p>
          {next && (
            <>
              <p>
                {t(
                  text(
                    "Đề xuất: luyện duyệt mảng vì chưa có kiến thức tiên quyết cần xác minh.",
                    "Suggested: practice array iteration because no prior prerequisites need verification.",
                  ),
                )}
              </p>
              <Link className="button primary" to={`/practice/${next}`}>
                {t(text("Tiếp tục học", "Continue learning"))}
              </Link>
            </>
          )}
        </>
      )}
    </section>
  );
}
