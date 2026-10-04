import type { ReactNode } from "react";
const paths: Record<string, ReactNode> = {
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v11H6a3 3 0 0 1-3-3V6" />
      <path d="M20 12h-5v4h5" />
    </>
  ),
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: <path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-3-3L5 16z" />,
  flag: <path d="M5 21V3m0 1c5-4 8 4 14 0v9c-6 4-9-4-14 0" />,
  like: (
    <path d="M7 10v10H3V10zm0 0 5-7c2 0 2 2 1 6h6a2 2 0 0 1 2 2l-2 7a3 3 0 0 1-3 2H7" />
  ),
  book: (
    <path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v1" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  route: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M6 7v5a4 4 0 0 0 4 4h4M18 17v-5a4 4 0 0 0-4-4h-4" />
    </>
  ),
};
export default function Icon({ name }: { name: string }) {
  return (
    <svg
      className="community-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.info}
    </svg>
  );
}
