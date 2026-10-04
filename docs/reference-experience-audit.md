# Reference experience audit — 2026-10-03

Actual public pages inspected with Codex in-app browser; screenshot/AX interaction evidence observed in this session. Initial web fetch returned only JavaScript shell, but browser later rendered and enabled a bounded interaction audit. No login/paywall bypass, crawling, source/CSS/assets/problem/editorial copying.

| Pattern | Source/route | Status | Observed behavior | UX goal | Own implementation | Test |
|---|---|---|---|---|---|---|
| Hero + roadmap preview | https://neetcode.io/ | OBSERVED | Hero text next to topic diagram at wide layout; stacked at narrow observed viewport; compact header | Explain learning and enter roadmap quickly | Original Satsunic copy/track selector + actual 3-node preview | learning.spec.ts homepage |
| Topic graph | https://neetcode.io/roadmap | OBSERVED | Dot-grid graph, curved connectors, topic buttons; zoom in/out/reset controls | Understand dependency order | Native independent graph with actual DSA nodes, zoom/reset, list fallback | graph delta browser test |
| Topic details | https://neetcode.io/roadmap | OBSERVED | Clicking Arrays & Hashing opens sidebar with prerequisites and challenge table | Enter practice from selected topic | Own outcome/lesson/challenge panel + URL node selection | graph delta browser test |
| Grouped practice | https://neetcode.io/practice/practice/coreSkills | OBSERVED | /practice redirects to this route; category shortcut rail, topic sections and problem/difficulty table | Browse by discipline/topic | Actual preview catalog discipline filters, search/difficulty + ungraded status | practice filter browser test |
| Solved/star state | Roadmap topic sidebar | OBSERVED controls only | Buttons visible; persistence not exercised | Personal learning state | Not copied as a fake accepted toggle; verified progress remains server-owned | domain/Rules tests |
| Problem editor tabs | Problem detail | NOT_ACCESSIBLE (not inspected) | No behavior audit yet | Focused coding | Own split-pane + bundled Monaco + text fallback; workspace tab expansion pending | draft browser workflow |
| Testimonials/pro/counts | Homepage | OBSERVED | Commercial/social-proof sections exist | Trust/conversion | Omitted until own verified data/entitlements exist; no borrowed company claims or fabricated counts | source review |

User update: clone layout/workflow patterns in Satsunic style, recorded in design-delta-neetcode.md. Palette white/light-gray, royal blue #163cff, navy #111c35, thin borders and compact density; dark accent adjusted for contrast. Existing Auth/enroll/draft contracts retained.

No docs/references images were supplied. These browser observations are distinct from those missing user reference images. Does not claim pixel identity or complete feature parity; preview graph has 3 actual nodes vs NeetCode's larger catalog.
