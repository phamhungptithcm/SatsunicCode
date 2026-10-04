import { useState } from "react";
import { Link } from "react-router-dom";
import { dsaNodes } from "../../../../packages/domain/src/catalog";
import { useLanguage, text } from "../i18n";
export default function RoadmapCanvas({
  preview = false,
  selected,
  onSelect,
}: {
  preview?: boolean;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  return (
    <div
      className={preview ? "graph-preview" : "graph-canvas"}
      aria-label={t(
        text("Sơ đồ lộ trình DSA đang phát triển", "DSA roadmap graph — Work in progress"),
      )}
    >
      <div className="graph-content" style={{ transform: `scale(${zoom})` }}>
        <svg
          viewBox="0 0 600 440"
          preserveAspectRatio="none"
          className="graph-edges"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={preview ? "preview-arrow" : "graph-arrow"}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6" fill="currentColor" />
            </marker>
          </defs>
          <path
            d="M300 112 C300 145 300 145 300 178"
            markerEnd={`url(#${preview ? "preview-arrow" : "graph-arrow"})`}
          />
          <path
            d="M300 244 C300 277 300 277 300 310"
            markerEnd={`url(#${preview ? "preview-arrow" : "graph-arrow"})`}
          />
        </svg>
        {dsaNodes.map((n, i) => {
          const content = (
            <>
              <span className="graph-step">0{i + 1}</span>
              <strong>{t(n.title)}</strong>
              <small>{t(text("Đang phát triển", "Work in progress"))}</small>
            </>
          );
          return preview ? (
            <Link
              key={n.id}
              className="graph-node"
              style={{ top: 52 + i * 132 }}
              to={`/roadmaps/dsa?node=${n.id}`}
            >
              {content}
            </Link>
          ) : (
            <button
              key={n.id}
              className={`graph-node ${selected === n.id ? "selected" : ""}`}
              style={{ top: 52 + i * 132 }}
              onClick={() => onSelect?.(n.id)}
              aria-pressed={selected === n.id}
            >
              {content}
            </button>
          );
        })}
      </div>
      {!preview && (
        <div
          className="canvas-controls"
          aria-label={t(text("Điều khiển sơ đồ", "Graph controls"))}
        >
          <button
            aria-label={t(text("Phóng to", "Zoom in"))}
            disabled={zoom >= 1.4}
            onClick={() => setZoom((x) => Math.min(1.4, x + 0.1))}
          >
            +
          </button>
          <button
            aria-label={t(text("Thu nhỏ", "Zoom out"))}
            disabled={zoom <= 0.6}
            onClick={() => setZoom((x) => Math.max(0.6, x - 0.1))}
          >
            −
          </button>
          <button
            aria-label={t(text("Đặt lại sơ đồ", "Reset graph"))}
            onClick={() => setZoom(1)}
          >
            ↺
          </button>
        </div>
      )}
    </div>
  );
}
