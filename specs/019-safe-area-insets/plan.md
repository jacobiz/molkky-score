# Implementation Plan: Safe Area Insets (Apple HIG準拠の外周余白)

**Branch**: `019-safe-area-insets` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-safe-area-insets/spec.md`

## Summary

全画面（特にiPhone のノッチ・Dynamic Island・ホームインジケーター環境）でコンテンツがシステムUIに隠れないよう、CSS の `env(safe-area-inset-*)` 環境変数を活用して安全領域余白を適用する。`viewport-fit=cover` は既設定済み。`apple-mobile-web-app-status-bar-style` を `black-translucent` に変更し、TailwindCSS v4 カスタムユーティリティ経由で共有コンポーネント（`ScreenHeader`）と各画面のボトムエリアに一括適用する。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 19、TailwindCSS v4 (`@tailwindcss/vite`)、vite-plugin-pwa 0.21、Vite 6.1
**Storage**: N/A（表示専用、永続データなし）
**Testing**: Vitest（本機能は CSS/レイアウト変更のため自動テスト対象外。目視確認で品質保証）
**Target Platform**: iOS Safari (PWA)、Android Chrome、PWA standalone モード
**Project Type**: PWA / モバイルウェブアプリ
**Performance Goals**: CSS ベースの変更のみ。ランタイムパフォーマンスへの影響なし
**Constraints**: 追加ライブラリ禁止（YAGNI）。既存コンポーネント構造の大幅変更禁止
**Scale/Scope**: 8画面コンポーネント + 4モーダルコンポーネント

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 評価 | 判定 |
|------|------|------|
| I. シンプルさ優先 | TailwindCSS カスタムユーティリティ（`@utility`）を `index.css` に追加するのみ。新ライブラリ・新抽象化なし | PASS |
| II. テストファースト（主要機能のみ） | スコア計算・ゲームルールへの変更なし。CSS/HTML の変更は UI テスト任意（MAY）| PASS |
| III. モバイルファースト・PWA | 本機能はモバイルファースト PWA 原則の直接的な実装。最優先で取り組む | PASS |
| 品質ゲート | TypeScript 変更最小限。モバイル実機確認が必須（iOS Safari/PWA）| PASS（実機確認を tasks に含める）|

**Complexity Tracking**: 不要（Constitution 違反なし）

## Project Structure

### Documentation (this feature)

```text
specs/019-safe-area-insets/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A（データモデル変更なし）
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks で生成)
```

### Source Code (変更対象ファイル)

```text
index.html                                          # apple-mobile-web-app-status-bar-style 変更
src/
├── index.css                                       # @utility safe-top / safe-bottom / safe-x 追加
└── components/
    ├── ui/
    │   ├── ScreenHeader.tsx                        # safe-top 適用（全非ホーム画面に効く）
    │   └── ScoreSheetModal.tsx                     # ボトムシート下端に safe-bottom 適用
    │   # ConfirmDialog / PinSetupGuideModal / InstallHelpModal は max-h-[80dvh] 中央配置のため対応不要（R-008）
    ├── HomeScreen.tsx                              # safe-top / safe-bottom 適用（ScreenHeader なし）
    ├── GameScreen/index.tsx                        # ボトム入力エリアに safe-bottom 適用
    └── MolkkoutScreen/index.tsx                    # 同上
```

**Structure Decision**: 既存単一プロジェクト構造を維持。新ファイル作成なし。

## Phase 0: Research

### R-001: `viewport-fit=cover` の現状

**Decision**: `index.html` に既に設定済み（`content="width=device-width, initial-scale=1.0, viewport-fit=cover"`）。追加作業不要。
**Rationale**: コード調査で確認済み。
**Alternatives considered**: 不要。

---

### R-002: `apple-mobile-web-app-status-bar-style` の影響

**Decision**: `default` → `black-translucent` に変更する。
**Rationale**:
- `black-translucent`: ステータスバーがコンテンツの上に透過表示される。`safe-area-inset-top` がステータスバー高さ分（iPhone X 以降: 44〜59px）返される。Apple HIG 準拠のフルスクリーン表示が実現できる。
- `default`: ステータスバーが独立表示され、`safe-area-inset-top = 0`。コンテンツが安全領域内に収まっているが、画面上部が白いステータスバーで占有される。
**Alternatives considered**: `black`（完全黒ステータスバー）は本アプリの白ベースUIに不整合。

---

### R-003: TailwindCSS v4 でのカスタムユーティリティ定義

**Decision**: `index.css` で `@utility` ディレクティブを使用してカスタムクラスを定義する。

```css
@utility safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
@utility safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@utility safe-x {
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

**Rationale**: TailwindCSS v4 の `@utility` ディレクティブにより、`safe-top` などのクラスが通常の Tailwind クラスと同様に使用可能。任意値構文（`pt-[env(safe-area-inset-top)]`）より可読性が高く、DRY 原則を遵守。
**Alternatives considered**:
- 任意値構文: `pt-[env(safe-area-inset-top,0px)]` — 可読性が低くコンポーネントごとに重複する
- CSS 変数 + Tailwind: `--safe-top: env(safe-area-inset-top)` → 間接参照が増える
- `body` への直接 padding 適用: `h-dvh` を使う画面で正しく機能しない（後述）

---

### R-004: `body` padding アプローチが機能しない理由

**Decision**: `body` への safe area padding 適用ではなく、コンポーネントレベルで適用する。
**Rationale**:
- `GameScreen` / `MolkkoutScreen` は `h-dvh` (height: 100dvh) を使用。`body` に `padding-top: 44px` を適用しても、`h-dvh` は viewport 全体の高さのまま。`body` padding と `h-dvh` の組み合わせでコンテンツが viewport 外にはみ出す可能性がある（特に `overflow: hidden` がある場合）。
- コンポーネントレベルで適用することで、画面ごとの挙動を制御できる。
**Alternatives considered**: `body` padding — 上記理由で不採用。

---

### R-005: ScreenHeader への適用方針

**Decision**: `ScreenHeader` の `<header>` 要素に `safe-top` ユーティリティを追加し、固定 `h-14` を `min-h-14` に変更する。

```html
<!-- Before -->
<header className="bg-white border-b flex items-center gap-2 px-4 h-14 shrink-0">

<!-- After -->
<header className="bg-white border-b flex items-end gap-2 px-4 pb-3 shrink-0 safe-top">
```

**Rationale**:
- `safe-top` で `padding-top: env(safe-area-inset-top, 0px)` が付与される。ステータスバー領域のヘッダー背景色が status bar の背景として表示される（`black-translucent` なのでコンテンツが透けて見える）。
- `items-end` + `pb-3` でボタン・タイトルをヘッダー下部に整列。safe area がある場合は `h-14 + safe-area-inset-top` の高さになる。
- `ScreenHeader` は SetupScreen・GameScreen・ResultScreen・MolkkoutSetupScreen・MolkkoutScreen・HistoryScreen の全非ホーム画面で使用されるため、これ一箇所の変更で6画面をカバーできる。

---

### R-006: HomeScreen への適用方針

**Decision**: HomeScreen の root `<div>` に `safe-top safe-bottom` を追加する（`ScreenHeader` を使わないため）。

**Rationale**: `HomeScreen` は `min-h-dvh flex flex-col items-center justify-center px-6 py-12` を使用。`py-12` の上部を `safe-top` + `pt-12` に分割することで安全領域に対応。

---

### R-007: 画面下部（ゲーム入力エリア）への適用方針

**Decision**: `GameScreen` と `MolkkoutScreen` のピン入力エリア（ボトムコンテナ）に `safe-bottom` を追加。

**Rationale**: 両画面ともにボトム部分に固定高さのスコア入力エリアがある。`safe-bottom` (`padding-bottom: env(safe-area-inset-bottom, 0px)`) を追加することでホームインジケーターとの干渉を防ぐ。

---

### R-008: モーダルコンポーネントへの適用方針

**Decision**:
- `ConfirmDialog`: `fixed inset-0 flex items-center justify-center` でダイアログが垂直中央表示。safe area 対応不要（中央ならシステムUIと干渉しない）。
- `PinSetupGuideModal` / `ScoreSheetModal` / `InstallHelpModal`: `fixed inset-0` のオーバーレイ内のスクロールコンテナに `safe-top safe-bottom` を追加。

**Rationale**: オーバーレイ自体は viewport 全体を覆うが、内部コンテンツが safe area 内に収まるよう padding が必要。

## Phase 1: Design

### コンポーネント変更一覧

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | `apple-mobile-web-app-status-bar-style`: `default` → `black-translucent` |
| `src/index.css` | `@utility safe-top / safe-bottom / safe-x` を追加 |
| `src/components/ui/ScreenHeader.tsx` | `h-14 items-center` → `items-end pb-3 safe-top`（ヘッダー高さ可変化） |
| `src/components/HomeScreen.tsx` | root div に `safe-top safe-bottom` 追加 |
| `src/components/GameScreen/index.tsx` | ボトムコンテナに `safe-bottom` 追加 |
| `src/components/MolkkoutScreen/index.tsx` | ボトムコンテナに `safe-bottom` 追加 |
| `src/components/ui/ScoreSheetModal.tsx` | モバイルボトムシートコンテナに `safe-bottom` 追加 |

### 変更しないコンポーネント

| ファイル | 理由 |
|---------|------|
| `ConfirmDialog.tsx` | 垂直中央配置のため対応不要 |
| `PinSetupGuideModal.tsx` | `max-h-[80dvh]` 中央配置のため対応不要 |
| `InstallHelpModal.tsx` | `max-h-[80dvh]` 中央配置のため対応不要 |
| `SetupScreen.tsx` | `ScreenHeader` 経由でトップ対応済み。ボトムは固定要素なし |
| `ResultScreen.tsx` | 同上 |
| `MolkkoutSetupScreen.tsx` | 同上 |
| `HistoryScreen.tsx` | 同上 |

### quickstart.md の内容

→ 別ファイル `quickstart.md` を参照（下記で作成）

### Agent Context

`.specify/scripts/bash/update-agent-context.sh claude` で更新予定（tasks フェーズで実行）
