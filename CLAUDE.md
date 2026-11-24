# Alma Insights mock-up

Demo mock-up of the Alma Insights portfolio-monitoring platform (private equity). Everything is mock data; nothing is connected to a backend.

## Run it
- `npm install`, then `npm run dev` (http://localhost:3000).
- Production check: `npm run build` then `npm run start`. On Windows/OneDrive the `.next` folder can be locked; stop the server and retry.
- Check types with `node_modules/.bin/tsc --noEmit -p .` before building.

## Stack
Next.js 16 (app router), React 19, TypeScript, Tailwind v4 with CSS tokens in `app/globals.css`, shadcn-style components in `components/ui`, lucide-react icons, recharts.
Active theme is `nachtzee` (Nachtzee 12d, set on `<html data-theme>` in `app/layout.tsx`): night blue `#123144` base, logo yellow `#E1B671` only on the sidebar's Data Management button and the avatar (dark text on it), Segoe UI. Positive figures use `text-positive` (the text colour in Nachtzee); green is only the on-track dot (`bg-ok-dot`). Change colours only through the tokens in `globals.css`; tokens that only Nachtzee sets differently (sidebar CTA, avatar, chart bars, card radius and shadow, fonts) have defaults in the first `:root` block.
Older proposals stay beside it for comparison: `goud-light` (previous default), `current` (the live demo.alma-insights.net palette), `current-green`, `goud-calm`, `kobalt-calm`, `volt-calm` and `grafiet`. Their design system is "Alma Refresh" in Claude (https://claude.ai/artifact/Es1A4yi4dpewLue1H5BsqF); it does not have Nachtzee yet. `components/theme-switcher.tsx` switches themes: visible in development, or on any build with `?theme=<id>` in the URL. Text on `--brand` uses `text-on-brand`, never `text-white`.

## Where things live
- `app/portfolio/page.tsx`: Portfolio Performance with tabs Performance / Strategy / Value creation (`components/portfolio/*`). Shared card header: `components/portfolio/card-header.tsx`.
- `app/data-entry/*`: Key Data (with Adjust and history), Upload Data, Data Viewer (Metrics / Cashflows / Capital calls), Valuation Entry (valuations and EXIT scenarios), Report Builder, Portfolio Portal (CFO portal and playbook), Export.
- `lib/mock-data.ts`: funds, companies (Fictus Capital Management is the demo company), KPIs, add-ons and management are generated per company at the bottom of the file.
- `lib/portfolio-performance-data.ts`: monthly series behind the performance tables and charts (last actual month is August 2026).
- Excel performance-sheet intake: `components/monthly-report-intake.tsx`, `lib/monthly-report-intake-data.ts`, test cases `lib/intake-case-a.ts` and `lib/intake-case-b.ts`. There is no mapping step: one standard performance sheet; lines outside it are skipped or a new metric code is requested from Alma. Earlier months are "Historical data".
- CFO portal: `lib/portfolio-portal-config.ts`, `lib/portal-submissions.ts` (demo May upload opens the intake output read-only).
- Reporting Playbook: `lib/playbook-content.ts` and `components/portfolio-portal/playbook-chapter.tsx` (long chapters split into sub-chapters at level-2 headings).
- Demo edits are stored in the browser (localStorage): `alma-company-master:<id>`, `alma-valuations`, `alma-exit-scenarios`, `alma-imported-comments`. "Reset demo data" in Key Data clears them. The chosen theme is kept under `alma-theme`.

## Conventions
- All UI text is in English.
- Names of people are fictional. Do not use real staff names. Surnames Pfennings and Diepenbroek still occur in the sample data and should be replaced.
- Amounts are in EUR m unless a label says otherwise (EXIT scenario inputs are in EUR k).
- Charts use the calm blue-grey palette defined at the top of each component; avoid bright colours.
- Only Alma creates metric codes; a CFO can link to an existing metric or request a new code.
- Valuation: when EBITDA is adjusted a note is mandatory.

## Do not commit
`.claude/` and `package-lock.json` stay local.
