import { useLearningActivity } from "../hooks/useLearningActivity";
import { Link, useParams } from "react-router-dom";
import { useLanguage, text } from "../i18n";
export default function Lesson() {
  const { lessonSlug } = useParams();
  const { t } = useLanguage();
  useLearningActivity(lessonSlug === "request-window" ? "/learn/request-window" : null);
  if (lessonSlug !== "request-window")
    return <h1>{t(text("Không tìm thấy bài học", "Lesson not found"))}</h1>;
  return (
    <article className="narrow">
      <p className="eyebrow">
        {t(text("DSA · NỘI DUNG THỬ NGHIỆM", "DSA · CONTENT PREVIEW"))}
      </p>
      <h1>
        {t(
          text(
            "Đếm yêu cầu trong một cửa sổ thời gian",
            "Count requests in a time window",
          ),
        )}
      </h1>
      <p>
        {t(
          text(
            "Học xong, bạn có thể duyệt mảng thời điểm, phân biệt biên mở/đóng và giải thích vì sao hai con trỏ chỉ cần đi về phía trước.",
            "After this lesson, you can traverse timestamps, distinguish open and closed interval boundaries, and explain why two pointers only move forward.",
          ),
        )}
      </p>
      <h2>{t(text("Hình dung một hàng chờ", "Imagine a queue"))}</h2>
      <p>
        {t(
          text(
            "Mỗi người đến có một thời điểm. Bạn muốn biết có nhiều nhất bao nhiêu người đến trong bất kỳ ba giây liên tiếp nào. Với [1, 2, 3, 10], khoảng [1, 4) chứa ba người; người đến lúc 4 không thuộc khoảng này.",
            "Each arrival has a timestamp. You want the largest number of arrivals within any three-second interval. For [1, 2, 3, 10], [1, 4) contains three arrivals; an arrival at 4 is excluded.",
          ),
        )}
      </p>
      <h2>
        {t(
          text(
            "Từ cách đơn giản đến hai con trỏ",
            "From a simple scan to two pointers",
          ),
        )}
      </h2>
      <p>
        {t(
          text(
            "Bắt đầu ở mỗi thời điểm, rồi đếm các thời điểm tiếp theo còn trong cửa sổ: cách này có thể duyệt lại nhiều lần, O(n²). Vì dữ liệu đã sắp xếp, khi tăng đầu trái, đầu phải không cần lùi. Mỗi con trỏ đi tối đa n bước, tổng O(n), bộ nhớ phụ O(1).",
            "Starting at each timestamp and counting later timestamps can repeat work: O(n²). Because the data is sorted, advancing the left pointer never requires moving the right pointer backward. Each advances at most n times: O(n) time and O(1) extra space.",
          ),
        )}
      </p>
      <h2>
        {t(
          text(
            "Kiểm tra các biên trước khi nộp",
            "Check boundaries before submitting",
          ),
        )}
      </h2>
      <ul>
        <li>{t(text("Mảng rỗng trả 0.", "An empty array returns 0."))}</li>
        <li>
          {t(
            text(
              "Thời điểm trùng nhau được đếm riêng.",
              "Repeated timestamps count separately.",
            ),
          )}
        </li>
        <li>
          {t(
            text(
              "So sánh hiệu < w, không phải ≤ w.",
              "Compare the difference < w, not ≤ w.",
            ),
          )}
        </li>
      </ul>
      <p className="notice">
        {t(
          text(
            "Bài nguyên bản HunpeoLabs; cần đánh giá chuyên môn. Chỉ đọc bài không tạo bằng chứng đã xác minh.",
            "Original HunpeoLabs lesson; specialist review required. Reading alone does not create verified evidence.",
          ),
        )}
      </p>
      <Link className="button primary" to="/practice/peak-requests">
        {t(
          text(
            "Thực hành: Đỉnh lưu lượng yêu cầu",
            "Practice: Peak request window",
          ),
        )}
      </Link>
    </article>
  );
}
