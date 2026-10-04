# Local testing

## Real Google One Tap, without deploying

Run `npm run dev:google`, then open http://localhost:5173/. http://127.0.0.1:5173/ redirects to the same localhost origin and preserves the path/query. Stop another Vite instance occupying5173 first; strictPort prevents silently switching ports.

This uses ignored apps/web/.env.production.local with public Firebase web config and the OAuth public client ID. No OAuth client secret or Admin/Gemini secret belongs in VITE variables. Google OAuth client has http://localhost and http://localhost:5173 authorized; Firebase already authorizes localhost. Provider changes may take time to propagate. One Tap starts automatically after Firebase restores auth; Google/browser cooldown and FedCM policy may suppress display. Account selection remains user-driven.

This mode connects to the real satsuniccode Firebase project. Saving bookmarks or other supported actions after authenticating writes real owned data. It does not turn blocked Functions/sandbox/AI features into working integrations. No deployment required, no billing enabled.

## Isolated emulator testing

Stop dev:google, start configured Firebase emulators and run `npm run dev`. This retains demo-satsuniccode and loopback emulator endpoints; Google One Tap is deliberately unavailable. Do not run synthetic emulator identity fixtures against real Google mode.

Default Playwright configuration assumes emulator mode. For configured-GIS-only verification against real local mode:

`GOOGLE_TEST_ORIGIN=http://localhost:5173 npx playwright test tests/e2e/google-one-tap-configured.spec.ts --reporter=list`

That test loads the real Google SDK; it does not select an account or certify successful OAuth.
