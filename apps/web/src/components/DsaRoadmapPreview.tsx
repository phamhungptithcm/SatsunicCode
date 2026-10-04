import { dsaGraph, topicLabels } from "../../../../packages/domain/src/dsa-catalog";
import { useLanguage, text } from "../i18n";

export default function DsaRoadmapPreview() {
  const { t } = useLanguage();
  return (
    <div className="home-dsa-preview">
      <svg viewBox="60 0 1020 1100" className="home-dsa-graph" role="img"
        aria-label={t(text("Sơ đồ lộ trình DSA", "DSA roadmap graph"))}>
        <desc>{dsaGraph.map(node => t(topicLabels[node.topic]!)).join(", ")}</desc>
        <g className="home-dsa-edges" aria-hidden="true">
          {dsaGraph.flatMap(node => node.parents.map(parent => {
            const from = dsaGraph.find(item => item.topic === parent)!;
            return <path key={`${parent}-${node.topic}`}
              d={`M${from.x + 80} ${from.y + 58} C${from.x + 80} ${from.y + 100},${node.x + 80} ${node.y - 40},${node.x + 80} ${node.y}`} />;
          }))}
        </g>
        {dsaGraph.map(node => (
          <g key={node.topic} className="home-dsa-node" aria-hidden="true">
            <rect x={node.x} y={node.y} width="160" height="58" rx="10" />
            <foreignObject x={node.x + 6} y={node.y + 4} width="148" height="50">
              <div className="home-dsa-label">{t(topicLabels[node.topic]!)}</div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}
