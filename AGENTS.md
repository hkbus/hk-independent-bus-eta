# AGENTS.md — hk-independent-bus-eta

Guidance for AI coding agents working in this repository. Humans: see `README.md`
and `docker.md`.

## What this repo is

The [hkbus.app](https://hkbus.app) front end: an ad-free, offline-capable PWA
showing arrival times (ETAs) for KMB/LWB, CTB, NLB, green minibus, Light Rail,
MTR and ferries in Hong Kong. React 18 + TypeScript + MUI v5, bundled by Vite,
deployed to GitHub Pages. Also packaged for desktop/mobile via Tauri
(`src-tauri/`) and Docker (`docker/`).

**This repo renders data it does not produce.** Before changing anything
data-shaped, read "Where the data comes from" below — a wrong route, a missing
stop or a bad polyline is usually a bug in a *different* repository.

## Repository family

| Repo | Role |
| --- | --- |
| `hkbus/hk-independent-bus-eta` | **this repo** — the React PWA |
| `hkbus/hk-bus-crawling` | Python crawlers → `routeFareList.min.json` (the route/stop/fare DB) |
| `hkbus/hk-bus-eta` | npm package `hk-bus-eta` — fetches the DB and live ETAs |
| `hkbus/route-waypoints` | route polylines (GeoJSON) for the map |
| `hkbus/hk-pmtiles-generation` | base map tiles |

## Where the data comes from

1. `src/db.ts` calls `fetchEtaDb()` / `fetchEtaDbMd5()` from the **`hk-bus-eta`**
   npm package, which downloads `routeFareList.min.json` (~8 MB) from
   `data.hkbus.app` — built daily by **`hk-bus-crawling`**. It is cached in
   IndexedDB (`hkbus` → `etadb`), keyed by `versionMd5`, and invalidated by
   `DB_CONTEXT_VERSION` in `src/db.ts` plus `public/schema-version.txt`.
2. Live ETAs come from `fetchEtas()` in the same npm package, which calls the
   operators' `data.gov.hk` endpoints directly. Nothing is proxied.
3. Map polylines are fetched by `src/hooks/useRoutePath.tsx` from
   `https://hkbus.github.io/route-waypoints/{gtfsId}-{O|I}.json`
   (**`O` = `ROUTE_SEQ` 1, `I` = `ROUTE_SEQ` 2**).

**Triage rule.** Route/stop/fare/direction wrong for everyone → `hk-bus-crawling`.
ETA value or remark wrong → `hk-bus-eta`. Polyline wrong → `route-waypoints`.
Only rendering, state and interaction bugs belong here.

## Layout

```text
src/
  main.tsx AppWrapper.tsx App.tsx   entry, providers, react-router routes
  db.ts                             DB fetch + IndexedDB/localStorage cache
  utils.ts                          route sorting, formatting, search helpers
  context/
    AppContext.tsx                  ~900-line god context: settings, geolocation,
                                    energy mode, colour mode, most app state
    DbContext.tsx                   the route/stop database + refresh logic
    PinnedEtasContext.tsx  ReactNativeContext.tsx  EmotionContext.tsx
  CollectionContext.tsx             saved routes ("常用") and user collections
  SearchContext.tsx
  hooks/                            useEtas, useStopEtas, useRoutePath, useNotices…
  pages/                            one component per route-router path
  components/                       home/ route-board/ route-eta/ route-search/
                                    map/ settings/ layout/ bookmarked-stop/
  i18n/translation.js               all UI strings
scripts/                            prebuild, pre-rendering, sitemap generation
public/                             static assets, schema-version.txt
```

Routes live in `src/App.tsx` and are all language-prefixed: `/:lang/route/:id/:panel?`,
`/:lang/board`, `/:lang/search`, `/:lang/stop/:stopId`, `/:lang/settings`, …

## Commands

```sh
npx yarn@1.22.22 install --frozen-lockfile   # Yarn 1 — see the note below
yarn start                                   # vite dev server (https, port 443)
yarn build                                   # tsc && vite build  → ./build
yarn lint                                    # eslint over the whole repo — see caveat
npx prettier --check "src/**/*.{js,jsx,ts,tsx}"
```

(The install line is pinned to Yarn Classic on purpose — plain `yarn install
--frozen-lockfile` fails on most current setups. Everything after it is a
`package.json` script and runs under either Yarn.)

**`yarn build` is the only gate CI enforces** (Node 20.x and 22.x). Because
`vite-plugin-eslint` runs ESLint inside the build, a lint error in a file that is
actually imported *does* fail the build — so the build is the check that matters.

**`yarn lint` is red on a pristine `master`** (last checked: 10 errors, 1
warning) in files outside the build's module graph:
`public/service-worker.js`, `scripts/pre-rendering.js`,
`src/components/settings/InstallDialog.test.js`, `src/@types/types.d.ts`, and two
stale `eslint-disable` directives in `src/utils.ts`. Do not "fix" these as a
drive-by; do check that `yarn lint` reports nothing new *in the files you
touched*.

There is essentially no test suite (one legacy `InstallDialog.test.js`, which is
not wired to a runner); verify changes by building and exercising the app.

### Yarn: this repo uses Yarn 1 (Classic)

`yarn.lock` is a `# yarn lockfile v1` file. If your machine's `yarn` is Berry
(2+/corepack), `yarn install --frozen-lockfile` fails with *"This package doesn't
seem to be present in your lockfile"*. Use Yarn Classic:

```sh
npx yarn@1.22.22 install --frozen-lockfile
```

Do not "fix" this by migrating the lockfile — CI runs Classic.

## House rules

- **Minimal, single-concern diffs.** The maintainer merges small obviously-correct
  changes quickly and stalls on large or design-judgment ones. Split unrelated
  fixes into separate PRs. Do not reformat untouched code, bump dependencies, or
  fold in drive-by refactors.
- **Comments are rare and terse.** One short line where the *why* is not obvious;
  no block comments restating the code. Put your reasoning in the PR body.
- **Pitch first, then build.** New UI, new settings, new infrastructure and
  anything with a design trade-off should be raised as an issue and agreed before
  a PR appears.
- **TypeScript.** Every new file is `.ts`/`.tsx`. `any` and non-null assertions
  are permitted by the ESLint config, but prefer types from `hk-bus-eta`
  (`EtaDb`, `RouteListEntry`, `Company`, `Eta`) over hand-rolled shapes.
- **Formatting is automated** — Prettier runs in CI and may rewrite your code;
  see the trap below before assuming a red run is a blocker.

## i18n: Chinese strings are the keys

`src/i18n/translation.js` maps **Chinese key → English value**:

```js
en: { translation: { 分鐘: "min", 搜尋: "Search" } }
```

Components call `t("搜尋")`. Adding a user-visible string means writing the
Chinese text at the call site and adding an English entry in `translation.js` —
never an invented English key. The `zh` block only carries entries for keys that
are *not* already Chinese (hyphenated keys like `bad-weather-text`, company codes
like `kmb`); everything else falls through to the key itself. Language is a URL
segment (`/:lang`), so anything user-visible must go through `t()`.

## Traps that have actually bitten

- **Prettify is a push workflow, not a PR check.** `prettify.yml` is `on: [push]`
  (only `node.js.yml` has `pull_request`), so it is not triggered by the PR event
  — look for its runs in the Actions tab of whichever repo you pushed to. It runs
  `creyD/prettier_action@v4.6`, which bundles a *newer* Prettier than the
  repo-pinned `3.2.5`; they disagree on how to indent wrapped boolean chains, so
  locally-formatted code can still be rewritten. Prefer formatting-stable code
  (short lines, no `&&` chains that wrap inside a call). The action also runs
  `--write` and then tries to auto-commit, which fails with a 403 where the bot
  has no write access — a red Prettify run on your fork is usually that push
  failure, not a blocker on your PR.
- **The service worker serves stale builds.** After rebuilding, `npx serve` on a
  port you have used before will hand back the previous build from the SW cache.
  Serve on a *fresh port* (new origin ⇒ no cache) when verifying a build.
- **hkbus.app can lag `master`.** The live site is a scheduled deploy and may be
  older than `master`. Never use it as the oracle for current-master behaviour;
  build and run locally.
- **Chunk names are content-fingerprinted.** Grepping build output by filename to
  decide "is library X still bundled?" gives wrong answers — a dependency can
  live in a chunk named after something else. Grep chunk *contents*.
- **The route DB is 8 MB over the network.** A cold headless run can stall on the
  splash screen while it downloads; that is usually the network, not your change.
- **`AppContext` re-renders widely.** It spreads all of its state into one
  provider value with ~40 consumers, so adding state there re-renders much of the
  app. Prefer a narrower context or local state.
- **Shared components are shared.** Row components such as
  `SuccinctTimeReport` are rendered from Starred, Collections, bookmarked stops
  and settings. Reading global context inside them leaks behaviour into unrelated
  screens; pass an opt-in prop from the one call site that wants it instead.
- **Do not mutate arrays that come from the DB.** Entries in `routeList` are
  shared objects; sorting `entry.co` in place corrupts state globally for every
  later consumer. Copy first (`[...entry.co].sort()`).
- **Layout is mobile-first with no breakpoints.** The root is
  `<Container maxWidth="xs">`; there are no `useMediaQuery`/`theme.breakpoints`
  uses. Wide-screen work is a design change — pitch it.

## Pull requests

- Branch from `master`; PRs target `master`.
- CI on a PR is **Build only** — `build (20.x)` and `build (22.x)`, both running
  `yarn build`. Prettify is a push workflow and is not a PR check; see the note
  above before treating a red Prettify run as a blocker.
- Every PR gets an automated CodeRabbit review. It is a bot; weigh it, do not
  obey it.
- PR body: a short statement of the user-visible problem, then the evidence —
  reproduction steps, before/after screenshots for anything visual. Host images
  outside the diff (e.g. a branch used only for assets) rather than committing
  them. Merged PRs here have a median body of ~650 characters; several times
  that reads as cost, not as thoroughness.
- Verify before claiming: build it, run it, look at the screen. "Should work" is
  not a verification.

## Licence

GPL-3.0-only. Contributions are made under the same licence.
