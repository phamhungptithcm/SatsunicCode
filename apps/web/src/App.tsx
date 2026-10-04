import OneTapController from "./components/OneTapController";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  matchPath,
} from "react-router-dom";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import DsaRoadmap from "./features/DsaRoadmap";
import Homepage from "./features/Homepage";
import Roadmap from "./features/Roadmap";
import Assistant from "./features/Assistant";
import { SessionProvider } from "./session";
import { LanguageProvider, useLanguage, text } from "./i18n";
const Practice = lazy(() => import("./features/Practice")),
  Account = lazy(() => import("./features/Account")),
  Progress = lazy(() => import("./features/Progress")),
  Lesson = lazy(() => import("./features/Lesson"));
function Pending({ type }: { type: string }) {
  const { t } = useLanguage();
  const title: Record<string, { vi: string; en: string }> = {
    projects: text("Dự án & bài thực hành", "Projects & Labs"),
    companies: text("Đánh giá công ty", "Company Reviews"),
    salaries: text("Chia sẻ thu nhập", "Salary Sharing"),
    "interview-board": text("Phòng phỏng vấn", "Interview Board"),
    org: text("Tổ chức", "Organization"),
    admin: text("Quản trị", "Admin Console"),
  };
  return (
    <section className="narrow">
      {type !== "404" && (
        <p className="eyebrow">{t(text("Sắp ra mắt", "Coming soon"))}</p>
      )}
      <h1>
        {t(title[type] ?? text("Không tìm thấy trang", "Page not found"))}
      </h1>
      <Link to="/roadmaps/dsa">
        {t(text("Xem lộ trình DSA", "View DSA roadmap"))}
      </Link>
    </section>
  );
}
function Shell() {
  const { t } = useLanguage();
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("satsuniccode.theme") === "dark";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const isCodeWorkspace = !!matchPath("/practice/:challengeSlug", location.pathname);
  useEffect(() => {
    document.body.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("satsuniccode.theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  return (
    <div
      className={`${dark ? "app dark" : "app"}${location.pathname === "/" ? " has-assistant" : ""}`}
    >
      <a className="skip" href="#main">
        {t(text("Đến nội dung chính", "Skip to content"))}
      </a>
      <OneTapController />
      {!isCodeWorkspace && <SiteHeader dark={dark} onTheme={() => setDark((x) => !x)} />}
      <main id="main" key={location.pathname}>
        <Suspense
          fallback={<p role="status">{t(text("Đang tải…", "Loading…"))}</p>}
        >
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/roadmaps" element={<DsaRoadmap />} />
            <Route path="/roadmaps/dsa" element={<DsaRoadmap />} />
            <Route path="/roadmaps/:trackSlug" element={<Roadmap />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:challengeSlug" element={<Practice />} />
            <Route path="/learn/:lessonSlug" element={<Lesson />} />
            <Route
              path="/settings"
              element={
                <Account dark={dark} onTheme={() => setDark((x) => !x)} />
              }
            />
            <Route
              path="/account/*"
              element={
                <Account dark={dark} onTheme={() => setDark((x) => !x)} />
              }
            />
            <Route path="/progress" element={<Progress />} />
            {[
              "projects",
              "companies",
              "salaries",
              "interview-board",
              "org",
              "admin",
            ].map((x) => (
              <Route key={x} path={`/${x}`} element={<Pending type={x} />} />
            ))}
            <Route path="*" element={<Pending type="404" />} />
          </Routes>
        </Suspense>
      </main>
      {!isCodeWorkspace && <SiteFooter />}
      {location.pathname === "/" && <Assistant />}
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SessionProvider>
          <Shell />
        </SessionProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
