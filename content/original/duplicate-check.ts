import type { Text } from "../../packages/domain/src/catalog";
// Independently authored task; no NeetCode statement, solution or tests copied.
export const duplicateCheck: {
  title: Text;
  statement: Text;
  constraints: Text;
  examples: { input: number[]; output: boolean }[];
  hints: Text[];
  starters: Record<string, string>;
} = {
  title: { en: "Contains Duplicate", vi: "Kiểm tra phần tử trùng" },
  statement: {
    en: "A telemetry batch contains integer event codes. Determine whether any code is repeated in the batch. Return true when at least one code appears more than once; otherwise return false. Input order does not affect the result.",
    vi: "Một lô dữ liệu chứa các mã sự kiện dạng số nguyên. Xác định có mã nào bị lặp trong lô hay không. Trả về true nếu có ít nhất một mã xuất hiện nhiều lần; nếu không trả về false. Thứ tự đầu vào không làm thay đổi kết quả.",
  },
  constraints: {
    en: "0 ≤ batch size ≤ 100,000. Each code is a signed 32-bit integer. Do not change the caller’s input.",
    vi: "0 ≤ kích thước lô ≤ 100.000. Mỗi mã là số nguyên có dấu 32 bit. Không thay đổi dữ liệu đầu vào của bên gọi.",
  },
  examples: [
    { input: [42, 7, 42, 19], output: true },
    { input: [-8, 0, 13, 27], output: false },
    { input: [], output: false },
  ],
  hints: [
    {
      en: "What do you need to remember while reading each code?",
      vi: "Bạn cần nhớ điều gì khi đọc từng mã?",
    },
    {
      en: "Track previously seen codes in a set. A repeat can be detected before reading the rest.",
      vi: "Lưu các mã đã đọc trong một tập hợp. Có thể phát hiện mã lặp trước khi đọc hết dữ liệu.",
    },
  ],
  starters: {
    python:
      "def contains_duplicate(event_codes: list[int]) -> bool:\n    # Implement your solution\n    pass\n",
    javascript:
      "function containsDuplicate(eventCodes) {\n  // Implement your solution\n}\n",
    typescript:
      'function containsDuplicate(eventCodes: number[]): boolean {\n  // Implement your solution\n  throw new Error("Not implemented");\n}\n',
    java: "class Solution {\n  boolean containsDuplicate(int[] eventCodes) {\n    // Implement your solution\n    throw new UnsupportedOperationException();\n  }\n}\n",
  },
};
