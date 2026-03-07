# Implementation Plan: UI Layout Fixes

**Branch**: `020-ui-layout-fixes` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-ui-layout-fixes/spec.md`

## Summary

4つの独立したUI表示調整。いずれも既存コンポーネントへのTailwindクラス変更またはJSX要素の削除のみで完結し、新ファイル・新依存関係・データモデル変更は不要。

1. スコアシート印刷ボタン＋閉じるボタンの間隔拡大（`gap-1` → `gap-3`）
2. ピン入力エリアの最大高さを使用可能ビューポートの40%に制限
3. プレイヤー名設定画面から言語セレクターを削除
4. スコアシートの累計スコアが50になったセルを緑でハイライト

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: TailwindCSS v4 (`@tailwindcss/vite`) — arbitrary values, CSS env() variables
**Storage**: N/A（データ変更なし）
**Testing**: Vitest — UIレイアウト変更のため新規テスト不要（コア機能変更なし）
**Target Platform**: Mobile PWA (iOS / Android / modern browsers)
**Project Type**: Mobile-first PWA
**Performance Goals**: UIのみの変更 — レンダリング負荷への影響なし
**Constraints**: TailwindCSS v4 arbitrary value構文で `env(safe-area-inset-bottom)` を参照; `dvh` 単位を使用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 既存コンポーネントのクラス変更のみ。新規抽象化・ライブラリなし |
| II. テストファースト（主要機能のみ） | ✅ PASS | スコア計算・ゲームルールの変更なし。UIレイアウトのみ → テスト任意 |
| III. モバイルファースト・PWA | ✅ PASS | 全変更がモバイル操作性を改善。オフライン動作に影響なし |
| 品質ゲート: TypeScriptコンパイル | ✅ 確認済み | 型変更なし、削除するimportは `LanguageSelector` のみ（他で使用なし in SetupScreen） |
| 品質ゲート: 不必要な複雑さなし | ✅ PASS | 変更は最小限。CSS arbitrary value 1件のみ新構文 |

**Complexity Tracking**: 違反なし。追記不要。

## Project Structure

### Documentation (this feature)

```text
specs/020-ui-layout-fixes/
├── plan.md           # This file
├── research.md       # Phase 0 output
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md          # /speckit.tasks で生成
```

### Source Code (変更対象ファイル)

```text
src/
└── components/
    ├── ui/
    │   └── ScoreSheetModal.tsx   # 変更1（ボタン間隔）・変更4（50点ハイライト）
    ├── GameScreen/
    │   └── index.tsx             # 変更2（ピン入力エリア高さ制限）
    └── SetupScreen.tsx           # 変更3（言語セレクター削除）
```

**Structure Decision**: 既存ファイルへのインライン変更のみ。新ファイル不要。

---

## Phase 1: Design & Contracts

### data-model.md

データモデル変更なし。`ScoreSheetModal` はすでに `entry.scoreAfter` を保持しており、50点判定に追加フィールド不要。詳細は [data-model.md](data-model.md) 参照。

### Contracts

外部API・インターフェース変更なし。スコープ外。

---

## Implementation Design

### 変更1 — ScoreSheetModal: ボタン間隔

**対象**: `src/components/ui/ScoreSheetModal.tsx` line 79

```tsx
// Before
<div className="flex items-center gap-1 ml-4 shrink-0">

// After
<div className="flex items-center gap-3 ml-4 shrink-0">
```

### 変更2 — GameScreen: ピン入力エリア高さ制限

**対象**: `src/components/GameScreen/index.tsx` line 106

```tsx
// Before
<div className="flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-2/5 md:justify-center safe-bottom">

// After
<div className="flex-1 min-h-0 max-h-[calc(40dvh-env(safe-area-inset-bottom,0px))] overflow-y-auto flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-2/5 md:max-h-none md:overflow-visible md:justify-center safe-bottom">
```

備考: `md:max-h-none md:overflow-visible` でデスクトップ幅では制限を解除（mdレイアウトでは左右分割のため不要）。

### 変更3 — SetupScreen: 言語セレクター削除

**対象**: `src/components/SetupScreen.tsx`

- line 4: `import { LanguageSelector } from './ui/LanguageSelector'` を削除
- lines 77–80: `rightContent={<LanguageSelector ... />}` プロップを削除（`<ScreenHeader>` のみに戻す）

### 変更4 — ScoreSheetModal: 50点セルハイライト

**対象**: `src/components/ui/ScoreSheetModal.tsx` lines 148–152, 157

```tsx
// Before (className array)
className={[
  'px-3 py-2 text-center',
  entry.isBust ? 'bg-red-50 text-red-600' : '',
  entry.isEliminated ? 'bg-orange-50 text-orange-600' : '',
].join(' ')}

// After
className={[
  'px-3 py-2 text-center',
  entry.isBust ? 'bg-red-50 text-red-600' : '',
  entry.isEliminated ? 'bg-orange-50 text-orange-600' : '',
  entry.scoreAfter === 50 ? 'bg-green-100' : '',
].join(' ')}
```

累計スコア表示 `<span>` も色付け:
```tsx
// Before
<span className={['block text-gray-500', entry.isBust ? 'text-red-400' : ''].join(' ')}>

// After
<span className={['block text-gray-500', entry.isBust ? 'text-red-400' : '', entry.scoreAfter === 50 ? 'text-green-700 font-bold' : ''].join(' ')}>
```
