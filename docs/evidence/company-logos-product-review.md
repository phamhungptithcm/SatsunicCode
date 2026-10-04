# Product content review — official directory logos

Scope: React web CompanyLogo, company list and detail; VI/EN audiences identifying employers. Source authority: company-official-logos.json (official website headers/structured data); fixed IDs/names/official URLs match published directory. No new strings, accessible image alt remains company name, initials stay the image error/unknown fallback. Logos identify companies; no endorsement or ranking is implied. Human-centered web reference from write-product-content applied; no Apple-platform compliance claim.

| State | Content and behavior | Evidence |
| --- | --- | --- |
| Default/success | Original brand colors/aspect ratio, white44px frame, actual company name alt | Local8 locale/viewport/theme cases, screenshots,9 list/detail image decodes |
| Loading | Fixed frame prevents layout shift; Firebase Storage branch unchanged | Code review and uploaded-logo workflow |
| Empty/unknown/partial | Initials retained when official asset unavailable or identity mismatch | Two unavailable companies retained; identity tests |
| Error/offline | Image failure resolves to initials without broken image | Browser aborted FPT image test |
| Hover/focus/selected | Existing link/card focus and keyboard behavior unchanged | Source review/Axe |
| Unauthorized | Public curated local assets require no account; private Storage ownership unchanged | Existing uploaded-logo regression; no auth/rules modifications |
| Destructive/confirmation | Not applicable: no new action or data mutation | Source diff |

| Principle | Status | In-context evidence |
| --- | --- | --- |
| Purpose | PASS | Company marks next to exact company names aid identification |
| Agency | PASS | List/detail navigation unchanged; image is not an extra action |
| Responsibility | PASS |9provenance hashes;2blocked sources disclosed rather than fabricated assets |
| Familiarity | PASS | Existing44px Roadmap/Home shapes; real brand marks |
| Flexibility | PASS | VI/EN,390/1280 light/dark, company name alternative text |
| Simplicity | PASS | Same-origin assets and no extra controls/text |
| Craft | PASS | contain preserves aspect ratio; TMA white-header contrast defect corrected to official blue structured-data logo |
| Delight | PASS | Fixed frame avoids jump and brand colors remain recognizable |

Unknowns: KMS and Rikkeisoft official asset downloads return Cloudflare403. Full11logo coverage is NOT_READY;9verified assets can ship. Hardware screen readers/Safari/Firefox not tested. Existing private backend production blockers unchanged.
