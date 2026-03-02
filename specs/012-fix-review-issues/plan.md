# Implementation Plan: コードレビュー残課題の対処

**Branch**: `012-fix-review-issues` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-fix-review-issues/spec.md`

## Summary

コードレビューで検出された残り10件の問題（i18n一貫性4件・アクセシビリティ4件・コード品質4件・テストカバレッジ3件）を解消する。新規ファイルは `NumberInput` コンポーネントとテスト3ファイルの計4ファイル。既存コードへの変更は最小限で、外部ライブラリの追加はない。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 19, Vite 6.1, vite-plugin-pwa 0.21, TailwindCSS v4
**Storage**: localStorage (key: `molkky-score-v2`, SCHEMA_VERSION=2)
**Testing**: Vitest + jsdom
**Target Platform**: PWA (iOS/Android/Chrome, Mobile-first)
**Project Type**: Mobile-first PWA
**Performance Goals**: 主要操作 100ms 以内（Constitution III）
**Constraints**: オフライン動作必須、外部ライブラリ追加なし（Constitution I）
**Scale/Scope**: 3言語 × 新規i18nキー9件、新規ファイル4件、既存ファイル変更11件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: シンプルさ優先

| 変更 | 評価 | 備考 |
|------|------|------|
| i18n キー追加 | ✅ PASS | 既存パターンの踏襲、複雑さ増加なし |
| i18n lookup object 化 | ✅ PASS | コードを単純化する変更 |
| NumberInput 共通化 | ✅ PASS | 重複削除による単純化 |
| handleMove 統合 | ✅ PASS | 重複削除による単純化 |
| storage runtime validation | ✅ PASS | 1 type guard 関数の追加のみ |
| ConfirmDialog フォーカストラップ | ⚠️ JUSTIFIED | 複雑さが増すが WCAG 2.1 準拠（clarify Q1 で明示選択）。Complexity Tracking 参照 |

### Principle II: テストファースト（主要機能のみ）

- `RECORD_MOLKKOUT_TURN` はゲームロジック（主要機能） → TDD 適用（テスト先）✅
- `loadState` バリデーション追加はストレージ層 → TDD 適用 ✅
- `buildShareText` は純粋関数 → TDD 適用 ✅
- `NumberInput`, `LicensesScreen` 等の UI 変更 → Constitution により任意（テスト不要）✅

### Principle III: モバイルファースト・PWA

- フォーカストラップはキーボード/スクリーンリーダー対応。タッチ操作・オフライン動作への悪影響なし ✅
- NumberInput の variant 実装はモバイルの操作性（大きなタップターゲット）を維持 ✅

**Constitution Check 結果**: すべてのゲートをパス（フォーカストラップは Complexity Tracking で正当化）

## Project Structure

### Documentation (this feature)

```text
specs/012-fix-review-issues/
├── plan.md        ← このファイル
├── research.md    ← Phase 0 完了
├── data-model.md  ← Phase 1 完了
├── quickstart.md  ← Phase 1 完了
└── tasks.md       ← /speckit.tasks コマンドで生成
```

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── ja.ts                    # 変更: setup.moveUp/Down/removePlayer, molkkout.errorRequiredFields, licenses.* 追加
│   ├── en.ts                    # 変更: 同上 (英語訳)
│   └── fi.ts                    # 変更: 同上 (フィンランド語訳)
├── utils/
│   ├── i18n.ts                  # 変更: 三項演算子 → Record<Language, Messages> lookup
│   └── storage.ts               # 変更: isValidStoredState type guard 追加
├── components/
│   ├── LicensesScreen.tsx       # 変更: isJa フラグ削除 → useTranslation() 移行
│   ├── SetupScreen.tsx          # 変更: aria-label i18n化, maxLength 修正, handleMove 統合
│   ├── MolkkoutSetupScreen.tsx  # 変更: エラー文字列 → t.molkkout.errorRequiredFields
│   ├── ui/
│   │   ├── ConfirmDialog.tsx    # 変更: role/aria/focus trap/Escape/background click 追加
│   │   └── NumberInput.tsx      # 新規: PinInput + MolkkoutInput の共通コンポーネント
│   ├── GameScreen/
│   │   └── PinInput.tsx         # 変更: NumberInput の薄いラッパーに変更
│   └── MolkkoutScreen/
│       └── MolkkoutInput.tsx    # 変更: NumberInput の薄いラッパーに変更

tests/unit/
├── scoring.test.ts              # 変更なし
├── gameReducer.test.ts          # 変更なし
├── molkkoutReducer.test.ts      # 新規: RECORD_MOLKKOUT_TURN の TDD テスト
├── storage.test.ts              # 新規: loadState バリデーションの TDD テスト
└── share.test.ts                # 新規: buildShareText フォーマットのテスト
```

**Structure Decision**: 既存の単一プロジェクト構造（Option 1）を踏襲。新規ファイルは既存の命名・配置規則に従う。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| ConfirmDialog にフォーカストラップ実装（useRef + useEffect + keydown listener） | WCAG 2.1 準拠: clarify Q1 でフォーカストラップ + 自動フォーカス移動を明示選択。スクリーンリーダーユーザーがダイアログを正しく操作できない問題を解決する | ARIA 属性追加のみ（FR-005/006 最小実装）では、スクリーンリーダーユーザーがフォーカスを手動でダイアログまで移動する必要があり、実用的なアクセシビリティを達成できない |
