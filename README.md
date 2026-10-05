# Memo Test

A memory game. You pick a memo test, turn over 2 cards at a time and look for matching pictures. Every click counts as 1 try, and a perfect game scores 100. You can stop a game and finish it later.

This repo is the frontend. The backend (Laravel, GraphQL and MySQL) lives in [api-memo-test](https://github.com/diegomottadev/api-memo-test).

The backend is optional. Without it, or when it doesn't answer, the app plays with sample data.

Live demo: https://diegomottadev.github.io/memo-test/ (sample data).

## Screenshots

|         | Light                                                            | Dark                                                           |
| ------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Desktop | ![Home, light, desktop](docs/screenshots/home-light-desktop.png) | ![Home, dark, desktop](docs/screenshots/home-dark-desktop.png) |
| Desktop | ![Game, light, desktop](docs/screenshots/game-light-desktop.png) | ![Game, dark, desktop](docs/screenshots/game-dark-desktop.png) |
| Mobile  | ![Home, light, mobile](docs/screenshots/home-light-mobile.png)   | ![Home, dark, mobile](docs/screenshots/home-dark-mobile.png)   |
| Mobile  | ![Game, light, mobile](docs/screenshots/game-light-mobile.png)   | ![Game, dark, mobile](docs/screenshots/game-dark-mobile.png)   |

## Stack

- React 19, React Router 7 and Vite 8.
- CSS Modules with design tokens in `oklch`. Light and dark mode follow your system.
- GraphQL calls go through a small `fetch` layer. I removed Apollo.
- Vitest, Testing Library and jsdom for tests. ESLint 9 with `jsx-a11y`, and Prettier 3.
- PropTypes on every component, checked by ESLint.

## What you need

Node.js 20.19 or newer (I use Node 24) and npm. You only need Docker if you want to run the backend.

## Quick start (no backend)

```bash
git clone https://github.com/diegomottadev/memo-test
cd memo-test
npm install
npm run dev
```

Open http://localhost:5173. With no `VITE_API_URL`, the app uses sample data and shows a "Demo mode" message.

## With the real backend

1. Start the backend. It's 1 command (more in its README):

   ```bash
   git clone https://github.com/diegomottadev/api-memo-test
   cd api-memo-test
   docker compose up -d
   ```

   The first start takes a few minutes, because it installs packages, creates the database and adds sample data. Then the API answers at http://localhost:82/graphql.

2. Point the frontend to it and start it:

   ```bash
   cp .env.example .env.local   # VITE_API_URL=http://localhost:82/graphql
   npm run dev
   ```

### Where the data comes from

| Case                                         | What the app does                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL` is empty                      | Uses sample data from the start.                                          |
| `VITE_API_URL` is set and the server answers | Uses the backend.                                                         |
| The server stops answering                   | Switches to sample data, runs the same request there and shows a message. |

"Stops answering" means a network error, no answer after 5 seconds, an HTTP error status or an answer that isn't JSON.

A GraphQL error is a different case. The server did answer, so the app shows the error and keeps using the server.

After the switch, the app stays on sample data until you reload the page. I did it this way so data from the 2 sources never gets mixed.

Sample data and its scores live in your browser's `localStorage`.

## Commands

| Command           | What it does                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5173.                                   |
| `npm run build`   | Production build in `dist/`.                                           |
| `npm run preview` | Serves `dist/`, so you can try the build.                              |
| `npm test`        | Runs the tests once (`npm run test:watch` keeps them running).         |
| `npm run lint`    | ESLint.                                                                |
| `npm run format`  | Formats everything with Prettier (`npm run format:check` only checks). |
| `npm run deploy`  | Publishes to GitHub Pages (see below).                                 |

Before you push:

```bash
npm test && npm run lint && npm run format:check && npm run build
```

## How to play

1. Pick a memo test and press **Start**. If you left a game halfway, press **Continue**.
2. Turn over a card, then another one. If both show the same picture, they stay face up. If they don't, they turn back after 1 second.
3. Find all the pairs. Score = cards ÷ clicks × 100, and every click on a card counts.

You can also play with the keyboard (Tab to move, Enter to turn a card) and with a screen reader. Each card says what it shows, and each move is read out loud ("Pair found! Dog.").

## Project structure

```
src/
  api/          the only code that calls fetch: graphqlRequest, memoTestApi (GraphQL), mocks/, createApi (switch to sample data)
  hooks/        useAsync (reads), useAsyncAction (writes), useMemoGame, useDataSource, useFocusOnMount
  hocs/         withAsyncState (loading, error and empty screens), withErrorBoundary
  components/   <Name>/<Name>.jsx + <Name>.module.css + index.js (they only get props, with propTypes)
  pages/        Home, GameSession (+ GamePlay), NotFound
  constants/    config, routes, game, localStorage keys, links, stats, help steps
  styles/       tokens.css (design) and base.css (reset)
  types/        shared PropTypes
  utils/        game rules (pure functions), safe localStorage, page titles
  testUtils/    renderWithProviders, API mock, test setup
scripts/deploy.sh
docs/screenshots/
```

The rules I follow:

- Only pages (and their hooks) keep state. Components get props.
- Options you can change live in arrays in `constants/` (links, stats, help steps). To add one, add an object.
- Colors and sizes come from `src/styles/tokens.css`. Nothing else has literal values.
- All text in the code (UI, comments, tests) is simple English, with JSDoc on everything exported.
- Tests sit next to the code (`*.test.js(x)`). They find elements by role, label or text, and they mock the `api/` layer with `vi.mock`.

## Deploy to GitHub Pages

```bash
DRY_RUN=1 npm run deploy   # shows what it would publish, with no commit and no push
npm run deploy             # builds and publishes to the gh-pages branch
```

`scripts/deploy.sh` builds with the base path `/<repo name>/` and with no API URL, so the site uses sample data.

To use a public backend, run `DEPLOY_API_URL=https://... npm run deploy`. If that server doesn't answer, the app switches to sample data by itself.

Then the script puts the build on the `gh-pages` branch from a temporary worktree (it creates the branch the first time). It adds `.nojekyll`, commits with your git user and pushes without `--force`.

The first time, go to GitHub **Settings → Pages → Deploy from a branch → `gh-pages` / root**.

Local `dev`, `build` and `preview` serve the app from `/`. Only the deploy uses the subfolder.

## Decisions

**I removed Apollo.** The app has 5 simple operations and never used the cache. A small `fetch` layer in `api/` lets tests inject `baseUrl` and `fetchImpl`, cancels requests with `AbortController` and decides when to switch to sample data. The bundle went from about 465 KB to about 285 KB.

Deep links use `404.html`. GitHub Pages can't route on the server, so the build copies `index.html` to `404.html`. A direct link like `/memo-test/game/1/...` loads the app, and `BrowserRouter` shows the right page. I picked this over `HashRouter` to keep URLs clean. The cost is small: the first request to a deep link gets an HTTP 404 status, even though the page looks fine.

HOCs handle render states and hooks handle logic. `withAsyncState` and `withErrorBoundary` draw the loading, error and empty screens that every page used to repeat. Game state and API calls live in hooks.

The game saved in your browser decides what "Continue" shows. The backend gets the progress after each pair and the final score at the end.

## Known limits

- The backend schema has `endGameSession`, but there's no code behind it. Sessions never reach `Completed`, and only the score is saved.
- The backend's "Best score" counts unfinished games (score 0), so you can see `Best score: 0`.
- The backend has no text for its pictures. Screen readers hear "Picture 1", "Picture 2" and so on. (Sample data has real names.)
- Backend pictures are links to other websites. If one of those sites goes down, that card shows a broken image.
- After switching to sample data, the app doesn't try the server again until you reload.
- There are no user accounts. Scores are global on the backend, or per browser with sample data.

## To do: a checklist for learning

Tasks sorted by level, for whoever picks up this project next. Each one says where to look and what you'll learn.

Before you tick a box, run `npm test && npm run lint && npm run format:check && npm run build`, and add a test for your change.

### Beginner

- [ ] **Add a memo test to the sample data.** Where: `src/api/mocks/fixtures.js`. You'll learn: the data model the whole UI uses.
- [ ] **Add a help step or a new stat** (for example, hit rate). Where: `src/constants/howToPlay.js`, `src/constants/stats.js`. You'll learn: how config arrays change the UI with no changes to components.
- [ ] **Hide "Best score" when it's 0.** Where: `src/components/MemoTestItem/`. You'll learn: conditional rendering and its test.
- [ ] **Add a `danger` variant to `Button`.** Where: `src/components/Button/`, `src/styles/tokens.css`. You'll learn: tokens, CSS Modules and how to check AA contrast in both color modes.
- [ ] **Write the missing tests** for `GameStats`, `EmptyState` and `MemoTestList`. Where: next to each component. You'll learn: Testing Library queries by role and text.

### Intermediate

- [ ] **A game timer** that survives "Continue". Where: `src/hooks/useMemoGame.js`, `src/utils/game.js`. You'll learn: derived state, timers with cleanup and tests with `vi.useFakeTimers`.
- [ ] **A "Quit game" button** that deletes the saved game. Where: `src/pages/GameSession/`, `src/utils/gameStorage.js`. You'll learn: navigation and `localStorage`.
- [ ] **Pick the number of pairs** (difficulty). Where: `createDeck` in `src/utils/game.js`. You'll learn: pure functions and how to test them.
- [ ] **Go back to the server without a reload** when it answers again. Today demo mode lasts until you reload. Where: `src/api/createApi.js`, `src/components/DataSourceNotice/`. You'll learn: an external store with `useSyncExternalStore`.
- [ ] **A "pair found" animation** that respects `prefers-reduced-motion`. Where: `src/components/Card/`. You'll learn: CSS animation and accessibility.
- [ ] **End-to-end tests with Playwright**, plus an axe-core check. I ran these checks with throwaway scripts during the upgrade, and they aren't in the repo. You'll learn: testing in a real browser.
- [ ] **CI with GitHub Actions**: tests, lint, format and build on every pull request, and a deploy to Pages after each merge to `main`. You'll learn: automation.

### Advanced

- [ ] **Move to TypeScript.** The JSDoc `@typedef`s (`Card`, `Game`, `MemoTest`) are a good place to start. You'll learn: types and a step-by-step migration.
- [ ] **Split the code by route** with `React.lazy`, and measure the bundle before and after. You'll learn: load performance.
- [ ] **A UI in 2 languages** (English and Spanish) with a dictionary of texts. You'll learn: i18n.
- [ ] **Offline mode (PWA)** with a service worker. It fits well with demo mode. You'll learn: caching and the service worker life cycle.
- [ ] **Swap `useAsync` for TanStack Query** and compare the code. You'll learn: caching server data.
- [ ] **Users and a ranking**, together with the backend. You'll learn: login from end to end.

### Needs backend work first

See the checklist in [api-memo-test](https://github.com/diegomottadev/api-memo-test#to-do-a-checklist-for-learning).

- [ ] Mark the game as `Completed` at the end, once `endGameSession` works.
- [ ] Show real picture names (today "Picture 1", "Picture 2"...) once the backend sends them.
- [ ] Put the backend online with HTTPS and deploy the frontend with `DEPLOY_API_URL`, so the demo uses real data.
