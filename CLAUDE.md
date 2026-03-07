# molkky-score Development Guidelines

Last updated: 2026-03-01

## Tech Stack

- **Runtime**: TypeScript 5.7 (strict mode) + React 19
- **Styling**: TailwindCSS v4 (`@tailwindcss/vite`)
- **Build**: Vite 6.1
- **PWA**: vite-plugin-pwa 0.21
- **State**: React Context + `useReducer` (no external libraries)
- **Persistence**: `localStorage` — key `molkky-score-v2`, `SCHEMA_VERSION=2`
- **Testing**: Vitest + @testing-library/react

## Project Structure

```text
src/
├── components/
│   ├── GameScreen/         # ゲーム画面（スコアボード + ピン入力）
│   ├── MolkkoutScreen/     # Mölkkout 画面
│   ├── ui/                 # 共通UIコンポーネント
│   │   ├── ScreenHeader.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── Toast.tsx
│   │   └── InstallHelpModal.tsx
│   ├── HomeScreen.tsx
│   ├── SetupScreen.tsx
│   ├── MolkkoutSetupScreen.tsx
│   └── ResultScreen.tsx
├── context/GameContext.tsx
├── reducers/gameReducer.ts
├── types/game.ts
├── utils/
│   ├── scoring.ts
│   ├── storage.ts
│   ├── i18n.ts
│   └── share.ts
└── i18n/
    ├── ja.ts   # Messages 型定義ソース
    ├── en.ts
    └── fi.ts
tests/unit/
```

## Commands

```bash
npm test        # Vitest unit tests
npm run build   # Production build
npm run dev     # Dev server
```

## Code Style

- TypeScript strict mode: no `any`, explicit types at boundaries
- i18n: `ja.ts` defines the `Messages` type; `en.ts` and `fi.ts` implement it via `import type { Messages }`
- Navigation: `dispatch({ type: 'NAVIGATE', screen: '...' })` via `gameReducer.ts`
- All non-home screens use `<ScreenHeader>` for consistent back-to-home navigation

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies
- TypeScript 5.7 (strict mode) + React 19, Vite 6.1, vite-plugin-pwa 0.21, TailwindCSS v4 (012-fix-review-issues)
- localStorage (key: `molkky-score-v2`, SCHEMA_VERSION=2) (012-fix-review-issues)
- TypeScript 5.7 (strict mode) + React 19 + React 19, Vite 6.1, TailwindCSS v4, vite-plugin-pwa 0.21 (013-molkkout-setup-refactor)
- localStorage — key `molkky-score-v2`, `SCHEMA_VERSION: 2 → 3` (013-molkkout-setup-refactor)
- TypeScript 5.7 (strict mode) + React 19 + React Context + useReducer、TailwindCSS v4、Vite 6.1、vite-plugin-pwa 0.21 (014-timeout-settlement)
- localStorage（key: `molkky-score-v2`、SCHEMA_VERSION: 3 → 4） (014-timeout-settlement)
- TypeScript 5.7 (strict mode) + React 19, TailwindCSS v4, Vite 6.1 (015-pin-setup-guide)
- N/A（このモーダルは表示専用。永続データなし） (015-pin-setup-guide)
- TypeScript 5.7 (strict mode) + React 19 + TailwindCSS v4 (016-rotate-pin-layout)
- N/A（表示専用、永続データなし） (016-rotate-pin-layout)
- TypeScript 5.7 (strict mode) + React 19 + React Context + useReducer（追加ライブラリなし）、TailwindCSS v4 (017-game-history)
- localStorage — 新規キー `molkky-score-history`（既存 `molkky-score-v2` は変更なし） (017-game-history)
- TypeScript 5.7 (strict mode) + React 19 + TailwindCSS v4（`@tailwindcss/vite`）、既存コンポーネント流用 (018-scoresheet-print)
- N/A（印刷は表示専用、永続データなし） (018-scoresheet-print)
- TypeScript 5.7 (strict mode) + React 19、TailwindCSS v4 (`@tailwindcss/vite`)、vite-plugin-pwa 0.21、Vite 6.1 (019-safe-area-insets)

## Recent Changes
- 012-fix-review-issues: Added TypeScript 5.7 (strict mode) + React 19, Vite 6.1, vite-plugin-pwa 0.21, TailwindCSS v4
