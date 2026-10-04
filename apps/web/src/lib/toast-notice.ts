import type { ToastKind } from "../components/Toast";
export type ToastNotice<T = unknown> = {
  id: number;
  text: string;
  kind: ToastKind;
  pending?: boolean;
  actions?: T;
};
export type ToastAction<T = unknown> =
  { type: "show"; notice: ToastNotice<T> } | { type: "dismiss"; id: number };
export function reduceToastNotice<T>(
  current: ToastNotice<T> | null,
  action: ToastAction<T>,
): ToastNotice<T> | null {
  if (action.type === "show") return action.notice.text ? action.notice : null;
  return current?.id === action.id ? null : current;
}
