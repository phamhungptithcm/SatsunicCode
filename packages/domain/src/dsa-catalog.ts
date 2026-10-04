import metadata from "../../../content/reference/neetcode-catalog.json";
import type { Text } from "./catalog";
export type DsaProblem = {
  slug: string;
  title: string;
  topic: string;
  difficulty: string;
  neetcode150: boolean;
  blind75: boolean;
  externalUrl: string;
  contentState: string;
};
export const dsaProblems: DsaProblem[] = metadata;
export const topicLabels: Record<string, Text> = {
  "Arrays & Hashing": { en: "Arrays & Hashing", vi: "Mảng & bảng băm" },
  "Two Pointers": { en: "Two Pointers", vi: "Hai con trỏ" },
  Stack: { en: "Stack", vi: "Ngăn xếp" },
  "Binary Search": { en: "Binary Search", vi: "Tìm kiếm nhị phân" },
  "Sliding Window": { en: "Sliding Window", vi: "Cửa sổ trượt" },
  "Linked List": { en: "Linked List", vi: "Danh sách liên kết" },
  Trees: { en: "Trees", vi: "Cây" },
  Tries: { en: "Tries", vi: "Cây tiền tố" },
  "Heap / Priority Queue": {
    en: "Heap / Priority Queue",
    vi: "Heap / Hàng đợi ưu tiên",
  },
  Backtracking: { en: "Backtracking", vi: "Quay lui" },
  Graphs: { en: "Graphs", vi: "Đồ thị" },
  "1-D Dynamic Programming": {
    en: "1-D Dynamic Programming",
    vi: "Quy hoạch động 1 chiều",
  },
  Intervals: { en: "Intervals", vi: "Khoảng" },
  Greedy: { en: "Greedy", vi: "Tham lam" },
  "Advanced Graphs": { en: "Advanced Graphs", vi: "Đồ thị nâng cao" },
  "2-D Dynamic Programming": {
    en: "2-D Dynamic Programming",
    vi: "Quy hoạch động 2 chiều",
  },
  "Bit Manipulation": { en: "Bit Manipulation", vi: "Thao tác bit" },
  "Math & Geometry": { en: "Math & Geometry", vi: "Toán & hình học" },
  JavaScript: { en: "JavaScript", vi: "JavaScript" },
};
export const dsaGraph = [
  { topic: "Arrays & Hashing", x: 430, y: 40, parents: [] },
  { topic: "Two Pointers", x: 335, y: 150, parents: ["Arrays & Hashing"] },
  { topic: "Stack", x: 520, y: 135, parents: ["Arrays & Hashing"] },
  { topic: "Binary Search", x: 180, y: 275, parents: ["Two Pointers"] },
  { topic: "Sliding Window", x: 390, y: 275, parents: ["Two Pointers"] },
  { topic: "Linked List", x: 600, y: 285, parents: ["Two Pointers"] },
  { topic: "Trees", x: 390, y: 405, parents: ["Binary Search", "Linked List"] },
  { topic: "Tries", x: 190, y: 525, parents: ["Trees"] },
  { topic: "Backtracking", x: 555, y: 525, parents: ["Trees"] },
  { topic: "Heap / Priority Queue", x: 320, y: 640, parents: ["Trees"] },
  { topic: "Graphs", x: 555, y: 670, parents: ["Backtracking"] },
  {
    topic: "1-D Dynamic Programming",
    x: 775,
    y: 660,
    parents: ["Backtracking"],
  },
  { topic: "Intervals", x: 100, y: 805, parents: ["Heap / Priority Queue"] },
  { topic: "Greedy", x: 310, y: 850, parents: ["Heap / Priority Queue"] },
  {
    topic: "Advanced Graphs",
    x: 490,
    y: 820,
    parents: ["Heap / Priority Queue", "Graphs"],
  },
  {
    topic: "2-D Dynamic Programming",
    x: 670,
    y: 860,
    parents: ["Graphs", "1-D Dynamic Programming"],
  },
  {
    topic: "Bit Manipulation",
    x: 870,
    y: 825,
    parents: ["1-D Dynamic Programming"],
  },
  {
    topic: "Math & Geometry",
    x: 785,
    y: 990,
    parents: ["2-D Dynamic Programming", "Bit Manipulation"],
  },
];
export type DsaSet = "neetcode150" | "blind75" | "all";
export const problemsFor = (set: DsaSet) =>
  dsaProblems.filter((p) => set === "all" || p[set]);
