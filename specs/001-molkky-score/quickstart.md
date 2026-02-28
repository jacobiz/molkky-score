# Quickstart: Mölkky スコア管理アプリ

**対象**: 開発者向けセットアップガイド

---

## 前提条件

- Node.js 20+
- npm 10+

---

## 初回セットアップ

```bash
# 依存関係インストール（既存 + 新規追加分）
npm install

# TailwindCSS v4 追加
npm install tailwindcss @tailwindcss/vite

# テスト環境追加
npm install -D vitest @testing-library/react jsdom @vitest/coverage-v8
```

---

## 設定ファイルの更新

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({ /* 既存設定 */ }),
  ],
})
```

### `src/index.css`（新規作成 または 既存を置換）

```css
@import "tailwindcss";
```

### `vitest.config.ts`（新規作成）

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

### `package.json` scripts に追加

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### `src/main.tsx` で CSS をインポート

```tsx
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## 開発サーバー起動

```bash
npm run dev
# → http://localhost:5173
```

---

## テスト実行

```bash
# ウォッチモード（TDD 用）
npm test

# 1回実行
npm run test:run

# カバレッジ確認
npm run test:coverage
```

---

## ビルド

```bash
npm run build
# → dist/ に出力（PWA 対応）
```

---

## ディレクトリ構成（実装対象）

```
src/
├── components/
│   ├── HomeScreen.tsx
│   ├── SetupScreen.tsx
│   ├── GameScreen/
│   │   ├── index.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── PinInput.tsx
│   ├── ResultScreen.tsx
│   ├── MolkkoutScreen/
│   │   ├── index.tsx
│   │   └── MolkkoutInput.tsx
│   └── ui/
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── context/
│   └── GameContext.tsx
├── reducers/
│   └── gameReducer.ts
├── types/
│   └── game.ts
├── utils/
│   ├── scoring.ts        ← TDD 必須
│   ├── storage.ts
│   ├── share.ts
│   └── i18n.ts
├── i18n/
│   ├── ja.ts
│   └── en.ts
├── index.css
├── App.tsx
└── main.tsx

tests/unit/
├── scoring.test.ts       ← TDD 必須（先に書く）
└── gameReducer.test.ts   ← TDD 必須（先に書く）
```

---

## 実装順序（Constitution: テストファースト）

1. `src/types/game.ts` — 型定義
2. `tests/unit/scoring.test.ts` — **テスト先行**
3. `src/utils/scoring.ts` — テストをパスさせる実装
4. `tests/unit/gameReducer.test.ts` — **テスト先行**
5. `src/reducers/gameReducer.ts` — テストをパスさせる実装
6. `src/utils/storage.ts`, `src/utils/share.ts`, `src/utils/i18n.ts`
7. `src/context/GameContext.tsx`
8. `src/i18n/ja.ts`, `src/i18n/en.ts`
9. コンポーネント（P1 → P2 → P3 順）
10. `src/App.tsx` — 画面ルーティング統合
