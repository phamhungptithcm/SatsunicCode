const paths = {
  back: "m14 6-6 6 6 6M8 12h12",
  previous: "m14 6-6 6 6 6",
  next: "m10 6 6 6-6 6",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  restore: "M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5",
  hint: "M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  undo: "m8 4-5 5 5 5M3 9h10a7 7 0 0 1 7 7v4",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
  sync: "M4 16a5 5 0 0 1 1-10 7 7 0 0 1 13-1 5 5 0 0 1 2 10M12 12v9m-3-6 3-3 3 3",
  load: "M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4",
  play: "m8 5 11 7-11 7Z",
  send: "m21 3-7 18-4-7-7-4Z M10 14 21 3",
  chevron: "m6 9 6 6 6-6",
  star: "m12 3 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2-4.5-4.4 6.3-.9Z",
};
export default function WorkspaceIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      className={`workspace-icon icon-${name}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
