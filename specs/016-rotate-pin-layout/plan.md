# Implementation Plan: Mölkkout ピン配置図の縦向き表示

**Branch**: `016-rotate-pin-layout` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-rotate-pin-layout/spec.md`

## Summary

`PinSetupGuideModal.tsx` の `MolkkoutLayout` コンポーネントを横向き（`flex-row`）から
縦向き（`flex-col`）に変更し、スロワー視点で正しい向きの配置図を表示する。
投球ラインインジケーターを `RegularLayout` と同一スタイルで下部に追加。
i18n の `layoutCaption` を「左から」→「スロワー側から」に更新する。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: TailwindCSS v4
**Storage**: N/A（表示専用、永続データなし）
**Testing**: Vitest + @testing-library/react（UI補助コンポーネントのため追加テスト任意）
**Target Platform**: Mobile-first PWA（iOS / Android）
**Project Type**: Web application (PWA)
**Performance Goals**: タッチ操作レスポンス 100ms 以内（Constitution III）
**Constraints**: 新規依存ライブラリ追加禁止、既存スタイルパターンの再利用を優先
**Scale/Scope**: 単一コンポーネント変更（`MolkkoutLayout`）+ i18n 3ファイル

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | ステータス | 備考 |
|------|-----------|------|
| I. シンプルさ優先 | ✅ PASS | `RegularLayout` の既存パターンを再利用。新抽象化なし |
| II. テストファースト | ✅ PASS | UI補助コンポーネントのためテスト任意（Constitution II MAY） |
| III. モバイルファースト・PWA | ✅ PASS | TailwindCSS flexbox のみ。モーダルは既にモバイル対応済み |
| 品質ゲート | ✅ PASS | TypeScript strict、既存テスト継続パス見込み |

**Violations**: なし

## Project Structure

### Documentation (this feature)

```text
specs/016-rotate-pin-layout/
├── plan.md              # This file
├── research.md          # Phase 0 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ui/
│       └── PinSetupGuideModal.tsx   # MolkkoutLayout を変更
└── i18n/
    ├── ja.ts                         # layoutCaption 更新
    ├── en.ts                         # layoutCaption 更新
    └── fi.ts                         # layoutCaption 更新
```

**Structure Decision**: 単一コンポーネント変更のみ。既存ファイル4本の修正で完結。新規ファイル作成なし。

## Phase 1: Design

### コンポーネント設計

#### 変更前（横向き）

```
[ #6 ] — [ #4 ] — [ #12 ] — [ #10 ] — [ #8 ]
```

#### 変更後（縦向き・スロワー視点）

```
    [ #8 ]     ← 後列（スロワーから最も遠い）
    [ #10 ]
    [ #12 ]
    [ #4 ]
    [ #6 ]     ← 前列（スロワーに最も近い）
  - - ▽ - -   ← 投球ライン（RegularLayout と同一スタイル）
```

#### `MolkkoutLayout` の変更方針

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| コンテナ方向 | `flex items-center justify-center gap-1 flex-wrap` | `flex flex-col items-center gap-1` |
| ピン順序 | 左から `#6, #4, #12, #10, #8` | 上から `#8, #10, #12, #4, #6` |
| 区切り記号 | `<span>—</span>` | 削除（余白のみ） |
| 投球ラインインジケーター | なし | `RegularLayout` と同一スタイルで追加 |
| `layoutCaption` (ja) | `'配置図（左から）'` | `'配置図（スロワー側から）'` |
| `layoutCaption` (en) | `'Layout (left to right)'` | `'Layout (viewed from thrower)'` |
| `layoutCaption` (fi) | `'Asettelu (vasemmalta oikealle)'` | `'Asettelu (heittäjän suunnasta)'` |

### i18n 変更

変更するのは `pinGuide.molkkout.layoutCaption` のみ。他のキーは変更なし。

| ファイル | キー | 変更前 | 変更後 |
|---------|------|--------|--------|
| `src/i18n/ja.ts` | `pinGuide.molkkout.layoutCaption` | `'配置図（左から）'` | `'配置図（スロワー側から）'` |
| `src/i18n/en.ts` | `pinGuide.molkkout.layoutCaption` | `'Layout (left to right)'` | `'Layout (viewed from thrower)'` |
| `src/i18n/fi.ts` | `pinGuide.molkkout.layoutCaption` | `'Asettelu (vasemmalta oikealle)'` | `'Asettelu (heittäjän suunnasta)'` |

### 非変更範囲

- `RegularLayout`: 変更なし
- `PinSetupGuideModal`（モーダル本体）: 変更なし
- ゲームロジック・状態管理（`gameReducer.ts`、`GameContext.tsx`）: 変更なし
- モーダル開閉制御（`MolkkoutScreen/index.tsx`）: 変更なし

## Complexity Tracking

*Constitution 違反なし。記載不要。*
