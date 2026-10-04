export type Locale = "vi" | "en";
export type Text = Record<Locale, string>;
export type Track = {
  slug: string;
  title: Text;
  description: Text;
  practice: Text;
  version: string | null;
};
export const tracks: Track[] = [
  {
    slug: "dsa",
    title: { vi: "DSA & Phỏng vấn lập trình", en: "DSA & Coding Interviews" },
    description: {
      vi: "Từ cấu trúc dữ liệu đến cách giải quyết vấn đề rõ ràng.",
      en: "Build a foundation in data structures and problem solving.",
    },
    practice: {
      vi: "Thuật toán, phân tích độ phức tạp, bài lập trình.",
      en: "Algorithms, complexity analysis, coding challenges.",
    },
    version: "dsa-v1",
  },
  {
    slug: "ai-engineer",
    title: { vi: "Kỹ sư AI", en: "AI Engineer" },
    description: {
      vi: "Chuẩn bị dữ liệu, đánh giá mô hình và xây hệ thống AI.",
      en: "Prepare data, evaluate models and build AI systems.",
    },
    practice: {
      vi: "Phân tích rò rỉ dữ liệu, mô hình cơ sở, truy xuất và đánh giá.",
      en: "Leakage analysis, baselines, retrieval and evaluation.",
    },
    version: null,
  },
  {
    slug: "cybersecurity",
    title: { vi: "An ninh mạng", en: "Cybersecurity" },
    description: {
      vi: "Hiểu rủi ro và bảo vệ hệ thống bằng bằng chứng.",
      en: "Understand risks and defend systems with evidence.",
    },
    practice: {
      vi: "Phân tích nhật ký, mô hình đe dọa và kiểm thử bản vá.",
      en: "Log analysis, threat models and defensive patch testing.",
    },
    version: null,
  },
  {
    slug: "web-developer",
    title: { vi: "Lập trình web", en: "Web Developer" },
    description: {
      vi: "Xây ứng dụng web dễ dùng, có phân quyền và kiểm thử.",
      en: "Build accessible web applications with authorization and tests.",
    },
    practice: {
      vi: "Biểu mẫu, xung đột xử lý, phân trang và quy tắc Firebase.",
      en: "Forms, race conditions, pagination and Firebase Rules.",
    },
    version: null,
  },
  {
    slug: "mobile-developer",
    title: { vi: "Lập trình di động", en: "Mobile Developer" },
    description: {
      vi: "Thiết kế trải nghiệm di động và đồng bộ khi mất mạng.",
      en: "Design mobile experiences and reliable offline synchronization.",
    },
    practice: {
      vi: "Vòng đời, thử lại, máy trạng thái và đánh giá sản phẩm.",
      en: "Lifecycle, retries, state machines and artifact review.",
    },
    version: null,
  },
  {
    slug: "game-developer",
    title: { vi: "Lập trình trò chơi", en: "Game Developer" },
    description: {
      vi: "Xây vòng lặp trò chơi, xử lý tương tác và tối ưu tài nguyên.",
      en: "Build game loops, interactions and efficient resource lifecycles.",
    },
    practice: {
      vi: "Thời gian khung hình, va chạm và máy trạng thái trên trình duyệt.",
      en: "Delta time, collisions and browser state machines.",
    },
    version: null,
  },
];
export type Node = {
  id: string;
  title: Text;
  outcome: Text;
  prerequisites: string[];
  lesson: string;
  challenge: string;
  effortMinutes: number;
};
export const dsaNodes: Node[] = [
  {
    id: "arrays",
    title: { vi: "Mảng & duyệt dữ liệu", en: "Arrays & iteration" },
    outcome: {
      vi: "Duyệt mảng đúng giới hạn và mô tả chi phí theo kích thước đầu vào.",
      en: "Iterate safely and explain cost as input size grows.",
    },
    prerequisites: [],
    lesson: "request-window",
    challenge: "peak-requests",
    effortMinutes: 30,
  },
  {
    id: "two-pointers",
    title: { vi: "Hai con trỏ", en: "Two pointers" },
    outcome: {
      vi: "Duy trì hai vị trí trong dữ liệu đã sắp xếp.",
      en: "Maintain two positions in sorted data.",
    },
    prerequisites: ["arrays"],
    lesson: "request-window",
    challenge: "peak-requests",
    effortMinutes: 45,
  },
  {
    id: "sliding-window",
    title: { vi: "Cửa sổ trượt", en: "Sliding window" },
    outcome: {
      vi: "Tìm khoảng liên tục tối ưu bằng một cửa sổ có bất biến rõ.",
      en: "Find an optimal interval with a clear window invariant.",
    },
    prerequisites: ["two-pointers"],
    lesson: "request-window",
    challenge: "peak-requests",
    effortMinutes: 45,
  },
];
export const challenge = {
  slug: "peak-requests",
  revision: "peak-requests-v1",
  title: { vi: "Đỉnh lưu lượng yêu cầu", en: "Peak request window" },
  difficulty: "Easy",
  statement: {
    vi: "Cho mảng thời điểm yêu cầu tăng dần (giây) và độ rộng w > 0. Trả về số yêu cầu lớn nhất nằm trong một khoảng [t, t + w). Yêu cầu ở đúng t + w không thuộc khoảng. Mảng có thể rỗng; thời điểm có thể trùng nhau.",
    en: "Given sorted request timestamps in seconds and a width w > 0, return the greatest number of requests in any interval [t, t + w). A request exactly at t + w is excluded. The array may be empty and timestamps may repeat.",
  },
  constraints:
    "0 ≤ timestamps.length ≤ 100,000; 0 ≤ timestamp ≤ 1,000,000,000; 1 ≤ w ≤ 1,000,000,000.",
  examples: [
    { timestamps: [1, 2, 3, 10], width: 3, output: 3 },
    { timestamps: [1, 4], width: 3, output: 1 },
    { timestamps: [], width: 5, output: 0 },
  ],
  starters: {
    javascript:
      "function peakRequests(timestamps, width) {\n  // Return the largest number in [t, t + width).\n}\n",
    typescript:
      "function peakRequests(timestamps: number[], width: number): number {\n  return 0;\n}\n",
    python: "def peak_requests(timestamps, width):\n    pass\n",
    java: "class Solution {\n    public int peakRequests(int[] timestamps, int width) {\n        return 0;\n    }\n}\n",
  },
  hints: {
    vi: [
      "Thử bắt đầu một khoảng ở từng thời điểm trong mảng.",
      "Với mỗi vị trí trái, tăng vị trí phải trong khi hiệu thời điểm nhỏ hơn w.",
      "Con trỏ phải không cần quay lại; mỗi con trỏ đi qua mảng tối đa một lần.",
    ],
    en: [
      "Start an interval at each timestamp.",
      "For each left position, move right while the timestamp difference is less than w.",
      "The right pointer never needs to go back; each pointer crosses the array once.",
    ],
  },
};
