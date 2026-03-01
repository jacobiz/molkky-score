# Implementation Plan: 横画面レイアウト最適化（タブレット対応）

**Branch**: `008-landscape-layout` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-landscape-layout/spec.md`

## Summary

横画面（md: 幅以上）でのポイント入力エリアを画面幅の 40% に拡大する。
現在は固定 320px（`md:w-80`）だが、`md:w-2/5` に変更することで 1024px 端末で
+28%・1280px 端末で +60% の幅増加を実現。変更は 1 ファイル・1 クラスの置換のみ。

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode 有効）
**Primary Dependencies**: React 19, TailwindCSS v4（`@tailwindcss/vite`）
**Storage**: N/A（UI レイアウト変更のみ）
**Testing**: Vitest（既存 27 件のユニットテストがパスすることを確認）
**Target Platform**: タブレット横画面（768px 以上）、デスクトップ
**Project Type**: モバイルファースト PWA
**Performance Goals**: タッチ操作レスポンス 100ms 以内（既存目標を維持）
**Constraints**: 幅上限 50%（FR-002）。縦画面（768px 未満）変更なし（FR-004）
**Scale/Scope**: 横画面の GameScreen レイアウト 1 箇所のみ

## Constitution Check

| 原則 | 評価 | 詳細 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 1 ファイル・1 クラス変更のみ。新規コンポーネント・ライブラリなし |
| II. テストファースト | ✅ PASS | CSS クラス変更のため新規テスト不要。既存 27 件継続確認 |
| III. モバイルファースト | ✅ PASS | 縦画面（モバイル）は無変更。横画面（タブレット）最適化のみ |
| 品質ゲート | ✅ PASS | TypeScript エラーなし・既存テストパスを SC-005 で確認 |

## Project Structure

### Documentation (this feature)

```text
specs/008-landscape-layout/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # N/A（UI レイアウト変更のみ、データ変更なし）
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code（変更対象）

```text
src/
└── components/
    └── GameScreen/
        └── index.tsx    # [US1] PinInput ラッパーの md:w-80 → md:w-2/5
```

## Detailed Change Specification

### 変更: `src/components/GameScreen/index.tsx`（US1）

**変更前後**:

```diff
- <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center">
+ <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-2/5 md:justify-center">
```

**変更内容**: `md:w-80` → `md:w-2/5`（1 クラスの置き換えのみ）

**根拠**:
- `md:w-2/5` = 40% of parent width → 常に 50% 上限（FR-002）を満たす
- `md:flex-none` は維持 → ScoreBoard エリアが `md:flex-1` で残余 60% を取得（FR-003）
- 縦画面クラス（`flex-1 min-h-0`）は無変更（FR-004）

## Width Budget Verification

| 画面幅 | 変更前 (md:w-80) | 変更後 (md:w-2/5) | 増加率 | 50% 上限 |
|--------|-----------------|-------------------|--------|----------|
| 768px | 320px | 307px | -4% | 384px ✓ |
| 1024px | 320px | 410px | +28% | 512px ✓ |
| 1280px | 320px | 512px | +60% | 640px ✓ |
| 1920px | 320px | 768px | +140% | 960px ✓ |

*768px での -4%: iPad 最小横画面（768px）では僅かに縮小するが、主要ターゲットである
1024px 以上では確実に改善。許容範囲と判断（research.md Decision 1 参照）*

## Complexity Tracking

> 本機能は Constitution の複雑さ原則に違反しない。Tracking 不要。
