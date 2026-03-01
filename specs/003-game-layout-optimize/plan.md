# Implementation Plan: ゲーム画面レイアウト最適化

**Branch**: `003-game-layout-optimize` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-game-layout-optimize/spec.md`

## Summary

スコアボードに `max-h-80` (320px) の高さ上限と `overflow-y-auto` を設定し、スコア入力エリアを `flex-1 min-h-0` で残余スペースをすべて取得する構成に変更する。入力ボタンは `grid-rows-3` + CSS Grid の stretch により高さを動的に埋め、6人時でも 44px 以上、少人数時はさらに大きくなる。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: TailwindCSS v4 (utility classes のみ、追加ライブラリなし)
**Storage**: N/A（UI レイアウト変更のみ）
**Testing**: Vitest（UI コンポーネントのため変更なし。Constitution 原則 II: UI は TDD 任意）
**Target Platform**: モバイル PWA (iOS/Android)、スマートフォン縦向き優先
**Performance Goals**: レイアウト変更は CSS のみ、JS 処理追加なし
**Constraints**: 既存 md: ブレークポイント以上の横並びレイアウトを破壊しない
**Scale/Scope**: 4コンポーネント変更（GameScreen/index, PinInput, MolkkoutScreen/index, MolkkoutInput）

## Constitution Check

| 原則 | ゲート | 評価 |
|------|--------|------|
| I. シンプルさ優先 | 追加ライブラリなし | ✅ TailwindCSS ユーティリティのみ |
| I. シンプルさ優先 | 新しい抽象化なし | ✅ 既存コンポーネントのクラス変更のみ |
| II. テストファースト | UI コンポーネントは任意 | ✅ レイアウト変更は UI のみ、テスト追加不要 |
| III. モバイルファースト | タッチ操作最適化 | ✅ ボタン拡大が目的 |
| III. モバイルファースト | オフライン動作 | ✅ CSS 変更のみ、影響なし |

**複雑さ追加なし。Complexity Tracking 不要。**

## Project Structure

### Documentation (this feature)

```text
specs/003-game-layout-optimize/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── contracts/
│   └── layout-contract.md  ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← /speckit.tasks で生成
```

### Source Code (変更ファイル)

```text
src/
├── components/
│   ├── GameScreen/
│   │   ├── index.tsx        ← レイアウト構造変更
│   │   └── PinInput.tsx     ← h-full + grid-rows-3 追加
│   └── MolkkoutScreen/
│       ├── index.tsx        ← レイアウト構造変更（GameScreen と同パターン）
│       └── MolkkoutInput.tsx ← h-full + grid-rows-3 追加（PinInput と同パターン）
```

**Structure Decision**: 既存の Single Project 構成を維持。変更は 4 ファイルのクラス修正のみ。

## Phase 0: Research Findings → research.md

→ [research.md](./research.md) 参照

## Phase 1: Design

### レイアウト変換方針

#### 変換前（現状）

```
┌── h: min-h-dvh flex flex-col ──────────────┐
│  ┌── flex-1 flex flex-col ────────────────┐ │  ← スコアボード側が可変
│  │  [Header ~60px]                        │ │
│  │  [ScoreBoard 可変: 2〜6人×60px]        │ │
│  └────────────────────────────────────────┘ │
│  ┌── 自然な高さ ───────────────────────────┐ │  ← 入力側は固定
│  │  [PinInput ~310px 固定]                │ │
│  └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
問題: 6人 + PinInput = ~730px > 667px (iPhone SE) → スクロール必要
```

#### 変換後（新構成）

```
┌── h: h-dvh flex flex-col ──────────────────┐
│  ┌── shrink-0 flex flex-col ──────────────┐ │  ← スコアボード側は上限固定
│  │  [Header ~60px] (sticky)               │ │
│  │  ┌── max-h-80 overflow-y-auto ────────┐│ │
│  │  │  [ScoreBoard: 2〜6人×60px, scroll] ││ │
│  │  └────────────────────────────────────┘│ │
│  └────────────────────────────────────────┘ │
│  ┌── flex-1 min-h-0 flex flex-col ────────┐ │  ← 入力側が残余スペースを取得
│  │  [PinInput: h-full, ボタンが伸縮]      │ │
│  └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

#### 高さ試算

| プレイヤー数 | ScoreBoard | PinInput 取得 | ボタン高さ試算 |
|------------|-----------|--------------|--------------|
| 2人 | 120px | 667-60-120=487px | ~115px/行 🎉 |
| 4人 | 240px | 667-60-240=367px | ~80px/行 ✓ |
| 6人 | 320px (上限) | 667-60-320=287px | ~48px/行 ✓ |

※ iPhone SE (667px)。ボタン高さ試算: (PinInput - 80px overhead) ÷ 4 (0ボタン+3グリッド行)

### コンポーネント別変更詳細

#### GameScreen/index.tsx

```diff
- <div className="min-h-dvh flex flex-col bg-gray-50 md:flex-row">
-   <div className="flex-1 flex flex-col md:overflow-y-auto">
-     <header ...>
-     <ScoreBoard ... />
-   </div>
-   <div className="bg-white border-t ... md:border-t-0 md:border-l md:w-80 md:flex md:flex-col md:justify-center">
-     <PinInput ... />
-   </div>
+ <div className="h-dvh flex flex-col bg-gray-50 md:flex-row">
+   <div className="shrink-0 flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto">
+     <header ...>
+     <div className="overflow-y-auto max-h-80 md:max-h-none md:flex-1">
+       <ScoreBoard ... />
+     </div>
+   </div>
+   <div className="flex-1 min-h-0 flex flex-col bg-white border-t ... md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center">
+     <PinInput ... />
+   </div>
```

#### PinInput.tsx

```diff
- <div className="flex flex-col gap-3 p-4">
+ <div className="flex flex-col gap-3 p-4 h-full">
    <p ...>label</p>
-   <button className="w-full py-4 rounded-2xl ...">0</button>
+   <button className="shrink-0 w-full py-4 rounded-2xl ...">0</button>
-   <div className="grid grid-cols-4 gap-2">
+   <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2">
      {[1..12].map(n => <button className="min-h-[44px] ..." />)}
    </div>
```

**CSS Grid `grid-rows-3`** = `grid-template-rows: repeat(3, minmax(0, 1fr))` → 3行均等。デフォルト `align-items: stretch` により各ボタンが行高さいっぱいに伸びる。

#### MolkkoutScreen/index.tsx / MolkkoutInput.tsx

GameScreen / PinInput と同一パターンを適用。

### md: ブレークポイント (タブレット以上) の互換性確保

- `shrink-0` → `md:flex-1`: タブレットでは左ペインが flex-1 を回復
- `max-h-80` → `md:max-h-none`: タブレットでは高さ上限を解除
- `flex-1 min-h-0` → `md:flex-none md:w-80`: 入力エリアは元の固定幅 280px に戻る

→ タブレット以上では既存レイアウトを完全維持。
