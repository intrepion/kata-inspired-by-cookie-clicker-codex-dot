# Lantern Orchard

An original, compact incremental game about growing a garden of light. Inspired by the satisfying gathering/automation/prestige loop of Cookie Clicker, with original writing, procedural CSS scenery and hand-authored SVG lantern art. No external fonts, runtime libraries, paid services or public deployment.

**Play on this Mac:** http://127.0.0.1:5188/

Gather glow by clicking the lantern (or focusing it and pressing Space/Enter). Hire five kinds of tenders for automatic production. Rising tender prices encourage investing in six improvements. Unlock seven keepsakes. At 5,000 season glow, preview and confirm a rekindling to keep embers: each grants +10% tap and production strength. Waiting longer yields more embers: floor(sqrt(season glow / 5,000)). Glow, tenders and improvements reset; keepsakes and lifetime glow persist. There is no forced ending.

Progress saves automatically every five seconds, after purchases and when leaving; use **Save orchard** before closing. Saves are local to this browser and origin, so keep using the same URL. Offline production is capped at four hours. Invalid saves start a fresh season with a visible notice. Clock rollback awards nothing and rebases the clock. Local saves are convenience, not cheat-proof security. Use one game tab at a time; there is no cross-tab synchronization.

## Run and restart

Requires Node 24 and npm. From this directory:

```sh
npm ci
npm run build
npm start
```

`npm start` starts a session-only detached Vite production preview on 127.0.0.1:5188. It prints the PID and stop command; log: `/tmp/lantern-orchard-5188.log`. A repeated start reuses an existing Lantern Orchard server. No boot or login autostart is installed. Restart with `npm start`; rebuild first after source changes. `npm run dev` is the foreground alternative on the same port. No earlier game servers are stopped or edited.

## Verification

```sh
npm run check
npm audit --audit-level=high
```

Pure TypeScript economy and save commands are tested through their public boundary with Node's built-in runner. TypeScript checks strict types; Vite builds the production artifact. GitHub Actions repeats these checks on pushes and PRs. See [QA evidence](docs/QA.md), [specification](docs/SPEC.md), [glossary](GLOSSARY.md), and [persistent contract](docs/adr/0001-local-seasons.md). Design choices were delegated by the user; no interactive interview occurred. Matt Pocock's local Grill with Docs, Domain Modeling, Implement, TDD and Code Review skills guided the documentation, domain seam and independent reviews.
