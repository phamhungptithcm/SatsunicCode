const paths: Record<string, string> = {
  comment: "M21 4H3v13h5v4l5-4h8z",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  warning: "M12 3 1 21h22zM12 9v5m0 3h.01",
};
export default function ToastIcon({
  name,
  size,
}: {
  name: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
