# Research: Mölkky スコア管理アプリ

**Branch**: `001-molkky-score` | **Date**: 2026-02-28

---

## 1. TailwindCSS v4 + Vite 統合

**Decision**: `@tailwindcss/vite` プラグインを使用（PostCSS 不要）

**Rationale**: TailwindCSS v4 は Vite 専用プラグイン `@tailwindcss/vite` を提供しており、PostCSS 経由よりもパフォーマンスが高く、設定ファイル（`tailwind.config.js`）が不要。Constitution 原則 I（シンプルさ）に最も適合する。

**Installation**:
```bash
npm install tailwindcss @tailwindcss/vite
```

**vite.config.ts**:
```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(...)],
})
```

**src/index.css**:
```css
@import "tailwindcss";
```

**Alternatives considered**:
- `@tailwindcss/postcss`（PostCSS 経由）: 不要な複雑さが増える。Vite プロジェクトでは非推奨
- TailwindCSS v3: 旧バージョン。`tailwind.config.js` と PostCSS が必要で設定が煩雑

**Caveats**:
- React 19 との互換性問題はなし（TailwindCSS は純粋な CSS ツールで React バージョンに依存しない）
- プロジェクトルートに `postcss.config.js` が存在する場合は削除すること
- コンテンツ検出は自動（`content` glob 設定不要）

---

## 2. レスポンシブデザイン戦略

**Decision**: TailwindCSS v4 デフォルトブレークポイント（モバイルファースト）を使用

**Breakpoints**:
| プレフィックス | 最小幅 | 対象デバイス |
|---|---|---|
| （なし） | 0px | スマートフォン（主要ターゲット） |
| `sm:` | 640px | 大型スマートフォン・小型タブレット |
| `md:` | 768px | タブレット |
| `lg:` | 1024px | デスクトップ |

**ゲーム画面レイアウト戦略**:
- **モバイル**: 上半分スコア一覧 + 下半分入力 UI（固定高さ、スクロールなし）
- **タブレット以上**: スコア一覧と入力 UI を左右並列に配置
- TailwindCSS `flex`/`grid` + `md:flex-row` パターンで実装

**Rationale**: 仕様書 SC-004「親指1本のタップ操作」と FR-018「スクロールなしで両方が見える」を満たすため、モバイルでは上下分割を維持しながら、大画面では左右並列に自然に切り替わるレスポンシブレイアウトを採用。

---

## 3. 状態管理

**Decision**: React Context + `useReducer`（外部ライブラリなし）

**Rationale**: Constitution 原則 I（シンプルさ優先・追加ライブラリ最小限）。ゲーム状態は単一の `GameState` オブジェクトで表現でき、Zustand や Redux の複雑さは不要。`useReducer` はアンドゥスタックの実装にも自然に適合する（各アクションでスタックを操作）。

**State Shape** (概要):
```ts
interface GameState {
  screen: 'home' | 'setup' | 'game' | 'result' | 'molkkout'
  game: Game | null
  settings: { language: 'ja' | 'en' }
}
```

**Alternatives considered**:
- Zustand: 軽量だが追加依存が発生。Constitution 原則 I に反する
- Redux Toolkit: 過剰。単一デバイスのローカル状態に不要な複雑さ
- `useState` のみ: アンドゥスタックの管理が困難。`useReducer` の方が適切

---

## 4. テスト環境

**Decision**: Vitest + `@testing-library/react`

**Rationale**: Vite プロジェクトの標準テストツール。Jest との API 互換性があり学習コストが低い。Constitution 原則 II（テストファースト・主要機能のみ）に従い、`scoring.ts` と `gameReducer.ts` のみ TDD 必須。

**Installation**:
```bash
npm install -D vitest @testing-library/react jsdom @vitest/coverage-v8
```

**vitest.config.ts**:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

**package.json scripts**:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Alternatives considered**:
- Jest: Vite との統合設定が煩雑。`babel-jest` 等の追加設定が必要
- Playwright/Cypress: E2E テストは Constitution の対象外（主要機能のみが必須）

---

## 5. localStorage 永続化

**Decision**: JSON シリアライズ + バージョニング付きスキーマ

**Rationale**: オフライン動作（Constitution 原則 III）と FR-030（セッション維持）を満たす最もシンプルな実装。バージョニングにより将来のスキーマ変更時の互換性を確保する。

**Key**: `molkky-score-v1`

**Strategy**:
- 保存: `useEffect` で `gameState` の変化を検知して `localStorage.setItem`
- 読み込み: アプリ起動時に `localStorage.getItem` → パース → 初期状態として使用
- バージョン不一致: 古いスキーマは無視して初期状態で起動

---

## 6. Web Share API + フォールバック

**Decision**: Web Share API を試み、非対応時はクリップボードにフォールバック

**Detection**:
```ts
if (navigator.share) {
  await navigator.share({ text: shareText })
} else {
  await navigator.clipboard.writeText(shareText)
  // show toast
}
```

**Compatibility**:
- iOS Safari 12.1+: ✅ サポート
- Android Chrome 61+: ✅ サポート
- デスクトップ Chrome/Edge: ✅ サポート（2023以降）
- Firefox（デスクトップ）: ❌ 非対応 → クリップボードフォールバック

---

## 7. i18n 実装

**Decision**: シンプルなキー/値オブジェクト + カスタムフック（外部ライブラリなし）

**Rationale**: 日英2言語のみ。`react-i18next` 等のライブラリは過剰。Constitution 原則 I に反する。

**Pattern**:
```ts
// src/utils/i18n.ts
export function useTranslation() {
  const { settings } = useGame()
  const t = settings.language === 'en' ? en : ja
  return { t }
}
```

**Alternatives considered**:
- `react-i18next`: 多言語・名前空間・複数形が必要なアプリ向け。2言語のみには過剰
- `FormatJS/react-intl`: 同様に過剰
