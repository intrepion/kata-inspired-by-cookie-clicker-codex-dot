# Verification evidence — 2026-10-11

## Automated domain checks
11 public-boundary domain tests pass. Covered gathering, fractional production, upgrades, price escalation, atomic repeated purchases, invalid indexes, bounded offline time, clock rollback recovery, save roundtrip and no repeated elapsed reward, malformed/unsupported saves, prestige cancel/confirm/repetition, preview consistency, keepsake persistence, large values and caps. Time and extreme-value cases use simulated timestamps/state fixtures; no four-hour wall-clock wait or browser clock change was performed. `npm run typecheck`, `npm run build`, `npm audit --audit-level=high` (zero vulnerabilities), and `git diff --check` passed.

## Actual Mac Chrome gameplay
Used the user's installed Chrome, production build at http://127.0.0.1:5188/, through visible buttons and normal keyboard controls. Repeated ordinary gather clicks earned resources; Copper wick changed taps from 1 to 2. A purchased firefly jar showed 0.5/sec and balance increased with real elapsed time. Moss cradles and lantern groves purchased from earned glow. Dew lenses and Night choir visibly increased production (Night choir doubled approximately 49/sec to 98/sec). Save orchard followed by reload retained tenders, improvements and balance and reported a small offline award. First light, Warm hands, company and thousand-glow keepsakes unlocked.

Reached over 5,000 season glow using real production and ordinary clicks (no injected resources or accelerated clock). Preview showed exactly one ember and +10%. Keep growing canceled; reopening and confirming reset to season 02, zero glow/tenders/improvements, one ember, +10%, 1.1 per tap and five retained keepsakes. Repeated purchases of an owned upgrade are disabled. Gather remains safe under repeated clicking and keyboard activation. A held Enter key produced one activation via this automation API; no rapid-key-repeat claim is made.

Captured and visually inspected desktop and 390×844 Chrome viewport screenshots. Mobile layout stacks sections, keeps controls legible and has no horizontal overflow (innerWidth 390, document scrollWidth 375). Responsive viewport is Chrome emulation, not physical phone testing. Viewport override reset afterward. Screenshot files: `screenshots/desktop.jpg`, `screenshots/mobile.jpg`, `screenshots/rekindle.jpg`. Console inspection found no application errors; existing third-party Chrome extension emitted listener/multiplex warnings.

A long batch of visible clicks timed out in the automation tool; progress was retained. Continued in a fresh game tab and closed only the duplicate game tab via normal Chrome controls. No earlier game tab/server was stopped. Use one game tab at a time (documented limitation).

## Reviews
Independent Standards and Spec agents rechecked all fixes and reported no remaining actionable findings. Their verification used source and domain tests; the browser evidence above belongs to the main execution.

## Local server
5188 was unused when selected. Used the prior game's detached Node spawn pattern with ignored stdin and a log file. Preview PID 60888, PPID 1, PGID 60888 after launcher completion. HTTP 200 and actual Chrome load/reload verified after detachment. No boot/login startup or security changes. Restart with `npm start` from repo (build first after source changes); stop only this game with `kill 60888`. Previous ports untouched. Local checkout is not claimed as a Codex sidebar registration.

## Prestige regression and final narrow-screen check
Earned a second eligible season via normal controls and real automation. Without reloading since the prior confirmation, opened the new prestige preview and pressed Escape. Season remained 02, five tenders remained, one ember/+10% remained, and glow continued growing; no accidental reset occurred. Saved and reloaded the final build afterward. Final 320×740 Chrome viewport also had no horizontal overflow (innerWidth 320, scrollWidth 305); screenshot `screenshots/narrow.jpg` captured and inspected. Viewport reset. No browser state injection was used for these tests.
