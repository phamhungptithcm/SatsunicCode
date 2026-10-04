import { useEffect, useRef, useState } from "react";
export type Viewport = { x: number; y: number; scale: number };
type Point = { x: number; y: number };
export function zoomAt(v: Viewport, factor: number, p: Point): Viewport {
  const scale = Math.min(1.6, Math.max(0.3, v.scale * factor));
  const ratio = scale / v.scale;
  return { x: p.x - (p.x - v.x) * ratio, y: p.y - (p.y - v.y) * ratio, scale };
}
const initial = { x: 0, y: 0, scale: 0.6 };
export function useGraphViewport() {
  const canvas = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>(initial);
  const current = useRef(initial);
  const frame = useRef<number | null>(null);
  const reset = useRef(() => {});
  const change = (v: Viewport) => {
    current.current = v;
    if (frame.current === null)
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setViewport(current.current);
      });
  };
  const zoom = (factor: number) => {
    const el = canvas.current;
    if (el)
      change(
        zoomAt(current.current, factor, {
          x: el.clientWidth / 2,
          y: el.clientHeight / 2,
        }),
      );
  };
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const points = new Map<number, Point>();
    let origin: Point | null = null,
      dragged = false,
      suppressClick = false;
    let safariGesture = false,
      safariScale = 1;
    const local = (e: { clientX: number; clientY: number }) => {
      const rect = el.getBoundingClientRect();
      return {
        x: e.clientX - rect.left - el.clientLeft,
        y: e.clientY - rect.top - el.clientTop,
      };
    };
    const pair = () => {
      const [a, b] = [...points.values()] as [Point, Point];
      return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        distance: Math.hypot(a.x - b.x, a.y - b.y),
      };
    };
    const wheel = (e: WheelEvent) => {
      if ((e.target as Element).closest(".canvas-controls")) return;
      e.preventDefault();
      if (safariGesture) return;
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      if (e.ctrlKey || e.metaKey)
        change(
          zoomAt(current.current, Math.exp(-e.deltaY * unit * 0.005), local(e)),
        );
      else
        change({
          ...current.current,
          x:
            current.current.x -
            (e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX) * unit,
          y: current.current.y - (e.shiftKey ? 0 : e.deltaY) * unit,
        });
    };
    const down = (e: PointerEvent) => {
      if (
        (e.target as Element).closest(".canvas-controls") ||
        (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) ||
        points.size >= 2
      )
        return;
      if (!points.size) {
        origin = local(e);
        dragged = false;
        suppressClick = false;
      }
      points.set(e.pointerId, local(e));
      // Keep native node clicks until the movement threshold is crossed.
      if (points.size === 2) {
        dragged = true;
        suppressClick = true;
      }
      if (e.button === 1) e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      const old = points.get(e.pointerId);
      if (!old) return;
      const p = local(e),
        before = points.size === 2 ? pair() : null;
      if (!dragged && origin && Math.hypot(p.x - origin.x, p.y - origin.y) < 5)
        return;
      dragged = true;
      suppressClick = true;
      if (!el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      el.classList.add("is-panning");
      points.set(e.pointerId, p);
      if (before) {
        const after = pair();
        const v = zoomAt(
          current.current,
          after.distance / Math.max(before.distance, 1),
          before,
        );
        change({
          ...v,
          x: v.x + after.x - before.x,
          y: v.y + after.y - before.y,
        });
      } else
        change({
          ...current.current,
          x: current.current.x + p.x - old.x,
          y: current.current.y + p.y - old.y,
        });
    };
    const end = (e: PointerEvent) => {
      points.delete(e.pointerId);
      if (!points.size) {
        origin = null;
        el.classList.remove("is-panning");
      }
    };
    const lostCapture = (e: PointerEvent) => {
      if (e.target === el && !el.hasPointerCapture(e.pointerId)) end(e);
    };
    const click = (e: MouseEvent) => {
      if (
        suppressClick &&
        e.detail !== 0 &&
        !(e.target as Element).closest(".canvas-controls")
      ) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== el || e.ctrlKey || e.metaKey || e.altKey) return;
      const v = current.current;
      let next: Viewport;
      switch (e.key) {
        case "ArrowLeft":
          next = { ...v, x: v.x + 40 };
          break;
        case "ArrowRight":
          next = { ...v, x: v.x - 40 };
          break;
        case "ArrowUp":
          next = { ...v, y: v.y + 40 };
          break;
        case "ArrowDown":
          next = { ...v, y: v.y - 40 };
          break;
        case "+":
        case "=":
          next = zoomAt(v, 1.2, {
            x: el.clientWidth / 2,
            y: el.clientHeight / 2,
          });
          break;
        case "-":
          next = zoomAt(v, 1 / 1.2, {
            x: el.clientWidth / 2,
            y: el.clientHeight / 2,
          });
          break;
        case "0":
          next = initial;
          break;
        default:
          return;
      }
      e.preventDefault();
      change(next);
    };
    type Gesture = Event & { scale: number; clientX: number; clientY: number };
    const gestureStart = (e: Event) => {
      e.preventDefault();
      safariGesture = true;
      safariScale = (e as Gesture).scale || 1;
    };
    const gestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as Gesture;
      if (!safariGesture || !Number.isFinite(g.scale) || g.scale <= 0) return;
      change(zoomAt(current.current, g.scale / safariScale, local(g)));
      safariScale = g.scale;
    };
    const gestureEnd = () => {
      safariGesture = false;
    };
    const clear = () => {
      points.clear();
      origin = null;
      dragged = false;
      suppressClick = false;
      safariGesture = false;
      el.classList.remove("is-panning");
    };
    reset.current = () => {
      clear();
      change(initial);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", lostCapture);
    el.addEventListener("click", click, true);
    el.addEventListener("keydown", key);
    el.addEventListener("gesturestart", gestureStart, { passive: false });
    el.addEventListener("gesturechange", gestureChange, { passive: false });
    el.addEventListener("gestureend", gestureEnd);
    window.addEventListener("blur", clear);
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      el.removeEventListener("lostpointercapture", lostCapture);
      el.removeEventListener("click", click, true);
      el.removeEventListener("keydown", key);
      el.removeEventListener("gesturestart", gestureStart);
      el.removeEventListener("gesturechange", gestureChange);
      el.removeEventListener("gestureend", gestureEnd);
      window.removeEventListener("blur", clear);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, []);
  return { canvas, viewport, zoom, reset: () => reset.current() };
}
