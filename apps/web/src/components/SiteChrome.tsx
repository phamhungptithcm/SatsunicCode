import AccountMenu from "./AccountMenu";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguage, text } from "../i18n";
const links = [
  ["/roadmaps", text("Lộ trình", "Roadmaps")],
  ["/practice", text("Luyện tập", "Practice")],
  ["/projects", text("Dự án & bài thực hành", "Projects & Labs")],
  ["/interview-board", text("Phỏng vấn", "Interviews")],
] as const;
export function SiteHeader({
  dark,
  onTheme,
}: {
  dark: boolean;
  onTheme: () => void;
}) {
  const { t, locale, toggle } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () =>
      setCompact((previous) =>
        window.scrollY > 72 ? true : window.scrollY < 24 ? false : previous,
      );
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`site-header clean-header${compact ? " is-compact" : ""}`}
    >
      <Link
        className="brand"
        to="/"
        aria-label={t(
          text("SatsunicCode — trang chủ", "SatsunicCode — homepage"),
        )}
      >
        <span className="brand-icon" aria-hidden="true">
          <img src="/satsunic-mark.svg" width="26" height="26" alt="" />
        </span>
        <span>
          Satsunic<span className="blue">Code</span>
        </span>
      </Link>
      <nav
        className="primary-nav"
        aria-label={t(text("Điều hướng sản phẩm", "Product navigation"))}
      >
        {links.map(([to, label]) => (
          <NavLink key={to} to={to}>
            <span className="nav-symbol" aria-hidden="true">
              {to === "/roadmaps"
                ? "⌘"
                : to === "/practice"
                  ? "‹/›"
                  : to === "/projects"
                    ? "◇"
                    : "▱"}
            </span>
            {t(label)}
          </NavLink>
        ))}
        <details className="more-nav" key={location.pathname}>
          <summary>
            {t(text("Cộng đồng", "Community"))}
            <svg
              className="community-chevron"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 6 L8 10 L12 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div>
            <Link to="/companies">
              {t(text("Đánh giá công ty", "Company Reviews"))}
            </Link>
            <Link to="/salaries">
              {t(text("Chia sẻ thu nhập", "Salary Sharing"))}
            </Link>
            <Link to="/progress">
              {t(text("Tiến độ của tôi", "My Progress"))}
            </Link>
          </div>
        </details>
      </nav>
      <div className="header-tools">
        <button
          onClick={toggle}
          aria-label={t(text("Đổi ngôn ngữ", "Change language"))}
        >
          {locale === "vi" ? "EN" : "VI"}
        </button>
        <button
          onClick={onTheme}
          aria-label={t(
            text("Đổi giao diện sáng/tối", "Toggle light/dark theme"),
          )}
        >
          {dark ? "☀" : "☾"}
        </button>
        <AccountMenu />
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
          aria-label={t(text("Mở menu điều hướng", "Open navigation menu"))}
        >
          ☰
        </button>
      </div>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        hidden={!open}
        aria-label={t(text("Điều hướng di động", "Mobile navigation"))}
      >
        {[
          ...links,
          ["/companies", text("Đánh giá công ty", "Company Reviews")],
          ["/salaries", text("Thu nhập", "Salaries")],
          ["/progress", text("Tiến độ", "My Progress")],
        ].map(([to, label]) => (
          <NavLink
            key={to as string}
            to={to as string}
            onClick={() => setOpen(false)}
          >
            {t(label as ReturnType<typeof text>)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-icon" aria-hidden="true">
              <img src="/satsunic-mark.svg" width="26" height="26" alt="" />
            </span>
            <span>Satsunic<span className="blue">Code</span></span>
          </Link>
          <span className="labs-credit">
            by <strong>HunpeoLabs</strong>
          </span>
        </div>
        <nav
          className="footer-links"
          aria-label={t(text("Điều hướng cuối trang", "Footer navigation"))}
        >
          <Link to="/roadmaps">{t(text("Lộ trình", "Roadmaps"))}</Link>
          <Link to="/practice">{t(text("Luyện tập", "Practice"))}</Link>
          <Link to="/projects">
            {t(text("Dự án & bài thực hành", "Projects & Labs"))}
          </Link>
          <Link to="/interview-board">
            {t(text("Phỏng vấn", "Interviews"))}
          </Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HunpeoLabs</span>
        <span>
          {t(
            text(
              "Học bằng thực hành. Tiến bộ bằng bằng chứng.",
              "Learn through practice. Progress through evidence.",
            ),
          )}
        </span>
      </div>
    </footer>
  );
}
