# Company detail alignment correction

Approval: user explicitly requests correction of uneven item alignment in the attached company-detail screenshot. Existing production/main release approval persists. Mandatory intelligence refreshed: DEGRADED; current source fallback used.

Observed: the inline CompanyLogo follows an inline-block back link, so it shares the wrong row. Hero has a separate decorative icon despite the company logo. The review toolbar centers a44px button against a taller label+select group, offsetting the controls.

Scoped plan: CompanyDetail.tsx owns a semantic company identity header: real logo beside company title/industry/source, back navigation on a separate44px row. Remove redundant decorative building hero on this detail surface only. Scoped CSS gives header consistent grid/gaps and makes the review filter/select and action align at their bottom edges; on narrow screens each fills its row. Preserve strings, data, actions, auth and forms. Keep Home/Roadmap tokens/shape and original logo colors/aspect ratio. No backend/database changes.

Validate production-mode candidate with real public FPT data, VI/EN,360/390/768/1280 light/dark: geometry for back/header/title/logo/filter/action,44px controls,no overflow,Axe, image decode. TypeScript/build; fresh scoped source/content/final review. Deploy Hosting-only, hashes/read-only production geometry, commit/push scoped files. Preserve all unrelated and synthetic screenshot WIP. Full private backend readiness and missing2logo assets remain outside this correction.
