# Implementation Plan: Back to Home Navigation

**Branch**: `011-game-back-home` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-game-back-home/spec.md`

## Summary

5つの画面（setup・game・result・molkkout-setup・molkkout-game）に共通ヘッダを追加し、ホームへ戻るボタンを配置する。進行中データが存在する3画面（setup・game・molkkout-game）ではタップ時に `ConfirmDialog` を表示、残り2画面は直接ホームへ遷移する。新規コンポーネント `ScreenHeader` を作成し、既存の `ConfirmDialog` と `dispatch({ type: 'NAVIGATE', screen: 'home' })` を活用して実装する。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: TailwindCSS v4（新規ライブラリなし）
**Storage**: localStorage `molkky-score-v2` SCHEMA_VERSION=2（変更なし）
**Testing**: vitest + @testing-library/react（UIコンポーネントは MAY; 新規ゲームロジックなし）
**Target Platform**: iOS/Android mobile PWA（Vite + vite-plugin-pwa）
**Project Type**: モバイルファースト PWA
**Performance Goals**: ホームボタンタップ → ダイアログ表示 ≤ 100ms（Constitution III）
**Constraints**: 追加ライブラリなし・オフライン動作維持（PWA変更なし）
**Scale/Scope**: 5画面に共通ヘッダ追加、新規UIコンポーネント1件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 確認項目 | 状態 |
|------|----------|------|
| I. シンプルさ優先 | `ScreenHeader` は単一責務（ヘッダ表示＋確認ダイアログ）のみ | ✅ PASS |
| I. シンプルさ優先 | 既存 `ConfirmDialog` を再利用（新規モーダル実装なし） | ✅ PASS |
| I. シンプルさ優先 | 追加ライブラリなし | ✅ PASS |
| I. シンプルさ優先 | 将来の拡張を先取りしない（right slot は SetupScreen の LanguageSelector 維持のみ） | ✅ PASS |
| II. テストファースト | 新規ゲームロジックなし（NAVIGATE アクション既存）→ テスト任意 | ✅ PASS |
| III. モバイルファースト | タッチターゲット十分なサイズ（44px 以上）で設計 | ✅ PASS |
| III. モバイルファースト | PWA 変更なし・オフライン動作影響なし | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/011-game-back-home/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── ja.ts            # 変更: common.backToHome, common.backToHomeConfirm, game.title 追加
│   ├── en.ts            # 変更: 同上（英語訳）
│   └── fi.ts            # 変更: 同上（フィンランド語訳）
└── components/
    ├── SetupScreen.tsx           # 変更: 既存ヘッダ → ScreenHeader に置換
    ├── GameScreen/
    │   └── index.tsx             # 変更: ScreenHeader 追加（画面最上部）
    ├── ResultScreen.tsx          # 変更: ScreenHeader 追加（画面最上部）
    ├── MolkkoutSetupScreen.tsx   # 変更: 既存ヘッダ → ScreenHeader に置換
    ├── MolkkoutScreen/
    │   └── index.tsx             # 変更: ScreenHeader 追加、既存 "Back to Home" ボタン削除
    └── ui/
        └── ScreenHeader.tsx      # 新規: 共通ヘッダコンポーネント

tests/
└── (UIテストは任意)
```

**Structure Decision**: 既存のシングルプロジェクト構造を維持。新規ファイルは `src/components/ui/` に配置（既存パターンに準拠）。

## Complexity Tracking

> 今回は Constitution Check に違反なし。このセクションは記録不要。
