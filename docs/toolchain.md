# Toolchain

npm workspace chosen because repository had no app/package manager. Exact manifests + npm lockfile. React 19.3.0, Vite 8.3.2, TypeScript 7.0.2 strict; Firebase JS 12.19.0/Admin 14.5.0/Functions 7.4.0; Genkit and Google GenAI plugin 1.42.0; Vitest 5.0.3, Playwright 1.63.0, Yjs 13.6.33, Monaco 0.55.1 + React wrapper 4.7.0. Registry versions checked live. Genkit schemas use its Zod3 surface; shared schemas import compatible zod/v3 from pinned Zod 4 package. Compiler validated this adapter boundary.

Functions target Node 22; workspace-local node 22.22.2 installed for reproducible local command execution. npm script PATH uses local node; initial checks on host Node 25 are distinguished in evidence. Firebase CLI 14.27.0 retained to use available Java17 for local emulators; CLI15 requires Java21. CLI/dependency vulnerabilities need reviewed remediation before release, not force downgrade of Firebase SDK. skipLibCheck skips third-party declaration checking only; application strict checking remains enabled.

License intentions: React/Vite/TypeScript/Yjs/Monaco MIT; Firebase/Genkit Apache-2.0; exact/transitive inventory and license review pending. No Excalidraw/React Flow dependency yet; native list is current accessible roadmap view. Monaco is lazy, no CDN loader; optional editor JS/worker weight recorded from build. No Genkit code in browser entry.
