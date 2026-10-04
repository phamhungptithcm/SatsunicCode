# ROADMAP-HEADER-V7 — pending human review

Task reference: user screenshot and request to make DSA header clean and integrated, 2026-10-03 America/Chicago. Status: AWAITING_PLAN_APPROVAL; no application edit or rollout authorized by this record.

Observed: DsaRoadmap.tsx has a separate heading, two oversized-looking text links and a long catalog availability line. Styles.css uses standalone top spacing and wraps the heading onto its own mobile row. The visual hierarchy competes with the graph and exposes infrastructure wording in the main learning flow.

Repository intelligence: DEGRADED. CodeGraph health passes but index stale; CocoIndex stale/health failed (daemon log filesystem permission). Bounded source reads establish this change's surface; no graph completeness claim. Current WIP preserved.

Concrete design: a single understated toolbar directly above the canvas. Left: small blue route glyph + 18px DSA Roadmap heading. Right: compact outlined Practice link and native details disclosure labelled About this roadmap. Remove the standalone original-challenge link; retain the same destination within the disclosure. Move attribution/content availability into this disclosure using natural EN/VI copy. Keep a visible Preview badge so availability is not concealed. Thin bottom divider, no card background, no shadows or giant title. Mobile wraps only controls, uses full-width disclosure text and no horizontal overflow. Native details keyboard/touch interaction; focus indicators retained; dark theme variables reused.

Files/functions: DsaRoadmap.tsx return/header markup only; styles.css scoped toolbar/disclosure rules and mobile override; product-content-review.md changed-string/state inventory and eight principles; UI/evidence/checkpoint docs. No schema/backend/rules/auth/provider/dependency change. Enrollment action/status stays functional for eligible existing users.

Risk: low reversible UI scope. Disclosure can accidentally overlap canvas or be clipped; verify open/closed states at390/768/1440 widths, EN/VI, light/dark, keyboard and axe. Validate heading semantics, existing graph/drawer navigation and practice destination, typecheck/build. Reuse current browser regression suite, no mirror implementation unit tests. Remove infrastructure jargon without removing availability meaning.

Proposed strings EN: DSA Roadmap; Preview; Practice; About this roadmap; Problem titles follow the NeetCode reference catalog. Satsunic problem content and grading are still in preparation.; Try a Satsunic challenge. VI: Lộ trình DSA; Bản xem trước; Luyện tập; Về lộ trình này; Tên bài được đối chiếu theo danh mục NeetCode. Nội dung và bộ chấm Satsunic đang được hoàn thiện.; Thử bài thực hành Satsunic.

Reviewable static prototype: docs/design/roadmap-header-v7.html (not application implementation; no requests/login/saves, no claim of functional product).

After plan approval: implement only these changes, verify locally, record fresh scoped review and show screenshots. Hosting rollout requires explicit scope approval for the reviewed candidate; billing remains off. Rollback: restore only modified header JSX/CSS from captured pre-edit patch; preserve unrelated files.

## V7.1 human-approved delta
User task reply approves simpler design: only blue outlined DSA Roadmap label inside canvas top-left. Approval: human user, current task message2026-10-03. Scope JSX/CSS header only, retain availability/practice/enrollment in sidebar disclosure, no deployment included. Local browser/typecheck validation.

V7.2 approved delta: human current task explicitly requests text only, no border/box, inherit Satsunic font. Scoped CSS title decoration removal; preserve position/localization/blue. No deployment.

V7.3 human-approved delta: current user requests softer/translucent title, black glyphs with subtly blurred blue outline. Interpretation: text glow, no restored box. CSS title only; dark uses existing light ink for legibility. Validate build and existing graph browser test; no deployment.

V7.4 human-approved delta: current user requests smooth topic sidebar animation. Scope native dialog CSS only:260ms horizontal entrance/exit,180ms backdrop fade, reduced-motion bypass. Preserve JS URL/dialog close/focus behavior. No dependencies/data/auth/deploy. Browser graph/drawer regression and build verification. Unsupported discrete-transition browsers retain native immediate display.
