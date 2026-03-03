# Implementation Plan: 初期ピン配置ガイド

**Branch**: `015-pin-setup-guide` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-pin-setup-guide/spec.md`

---

## Summary

通常ゲーム画面と Mölkkout ゲーム画面の `ScreenHeader` 右側に配置ガイドアイコンボタンを追加し、タップで `PinSetupGuideModal`（新規作成）を表示する。通常ゲームは12ピン三角配置、Mölkkout は5ピン直線配置をそれぞれ表示する。既存の `InstallHelpModal` パターンと `ScreenHeader.rightContent` スロットを活用し、新規コンポーネント1つ・既存3コンポーネントの小改修・i18n 追加のみで実現する。

---

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 19, TailwindCSS v4, Vite 6.1
**Storage**: N/A（このモーダルは表示専用。永続データなし）
**Testing**: Vitest + @testing-library/react（このモーダルは補助的 UI のためテスト任意）
**Target Platform**: モバイルブラウザ（PWA、iOS/Android）＋デスクトップブラウザ
**Project Type**: モバイルファースト Web アプリ（PWA）
**Performance Goals**: モーダル表示は 100ms 以内（static render）
**Constraints**: オフライン動作必須。新規依存ライブラリ追加なし
**Scale/Scope**: 既存コンポーネント5ファイル変更＋新規1ファイル作成

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 評価 | 根拠 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | `ScreenHeader.rightContent` スロット（既存）と `InstallHelpModal` パターン（既存）を再利用。新規抽象化なし |
| II. テストファースト | ✅ PASS | 補助的 UI 要素のためテスト任意（Constitution II「補助的な UI 要素や単純なユーティリティへのテストは不要」）|
| III. モバイルファースト・PWA | ✅ PASS | 既存モーダルパターン踏襲。オフライン動作は静的 JSX のため影響なし |
| 品質ゲート | ✅ PASS | TypeScript strict 対応・依存追加なし・TSコンパイルエラーなし見込み |

**Complexity Tracking**: 違反なし。追加不要。

---

## Project Structure

### Documentation (this feature)

```text
specs/015-pin-setup-guide/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (変更対象ファイル)

```text
src/
├── components/
│   ├── ui/
│   │   └── PinSetupGuideModal.tsx          # 新規作成（InstallHelpModal パターン）
│   ├── GameScreen/
│   │   └── index.tsx                       # 変更: rightContent + showPinGuide state 追加
│   └── MolkkoutScreen/
│       └── index.tsx                       # 変更: rightContent + showPinGuide state 追加
└── i18n/
    ├── ja.ts                               # 変更: pinGuide namespace 追加
    ├── en.ts                               # 変更: pinGuide namespace 追加
    └── fi.ts                               # 変更: pinGuide namespace 追加

tests/unit/                                 # 任意（補助的 UI のため不要）
```

**Structure Decision**: Single project（既存構造を維持）。新規 UI コンポーネント1ファイルのみ追加。

---

## Phase 0: Research Summary → [research.md](research.md)

事前調査で NEEDS CLARIFICATION はなし。research.md に調査結果を記録済み。

---

## Phase 1: Design & Contracts → [data-model.md](data-model.md)

### コンポーネント設計

#### 新規: `PinSetupGuideModal`

```
Props:
  mode: 'regular' | 'molkkout'   // どちらのガイドを表示するか
  onClose: () => void             // 閉じる操作

内部: InstallHelpModal と同じパターン
  - fixed inset-0 z-50 backdrop (bg-black/40)
  - 白背景ダイアログ (max-h-[80dvh] overflow-y-auto)
  - ヘッダー: タイトル + ✕ 閉じるボタン
  - ボディ: 配置図 (mode に応じて分岐)
  - Escape キーで閉じる（useEffect）
```

#### 変更: `GameScreen/index.tsx`

```
追加: const [showPinGuide, setShowPinGuide] = useState(false)

ScreenHeader の rightContent に渡す:
  <button onClick={() => setShowPinGuide(true)}>
    {/* ピン配置ガイドアイコン */}
  </button>

JSX ルートに追加（ConfirmDialog と同じパターン）:
  {showPinGuide && (
    <PinSetupGuideModal mode="regular" onClose={() => setShowPinGuide(false)} />
  )}
```

#### 変更: `MolkkoutScreen/index.tsx`

```
同上。mode="molkkout" を渡す。
アクティブ状態・終了後の両 ScreenHeader 利用箇所に rightContent を追加する。
```

### i18n キー設計

`ja.ts` に追加する新規キー（`pinGuide` namespace）:

```ts
pinGuide: {
  title: 'ピン配置ガイド',
  closeButton: '閉じる',
  regular: {
    heading: '通常ゲーム（12ピン）',
    distanceLabel: '投球ラインから最前列まで: 3.5m',
    layoutCaption: '配置図（スロワー側から見た図）',
  },
  molkkout: {
    heading: 'Mölkkout（5ピン）',
    pinOrder: 'ピンの順番（左から）: 6 → 4 → 12 → 10 → 8',
    distanceLabel: '投球ラインから先頭ピンまで: 3.5m',
    spacingLabel: 'ピン間隔: Mölkky スティック1本分',
    resetNote: '倒れたピンは元の位置に戻す',
  },
  buttonAriaLabel: 'ピン配置ガイドを開く',
}
```

`en.ts` / `fi.ts` は同じキー構造で英語・フィンランド語訳を実装。

### 配置図の表現

通常ゲームの三角配置図は JSX で静的に記述（A-002: テキストベースのビジュアル）:

```
         [7] [9] [8]          ← Row 4（後列）
       [5] [11][12] [6]       ← Row 3
          [3] [10] [4]        ← Row 2
             [1] [2]          ← Row 1（前列）

              スロワー
```

Mölkkout の直線配置図:

```
  [6] — [4] — [12] — [10] — [8]
   ↑
 3.5m
```

各ピン番号はスタイル付き `<span>` または `<div>` で視覚的に強調。
`MOLKKOUT_PINS` 定数（`src/types/game.ts`）は型の参照のみに使用し、表示は静的 JSX。

---

## Implementation Sequence

1. `src/i18n/ja.ts` — `pinGuide` namespace を `Messages` 型定義に追加
2. `src/i18n/en.ts` / `fi.ts` — 同キーの英語・フィンランド語訳を追加
3. `src/components/ui/PinSetupGuideModal.tsx` — 新規作成
4. `src/components/GameScreen/index.tsx` — `rightContent` ＋ `showPinGuide` state ＋ モーダル追加
5. `src/components/MolkkoutScreen/index.tsx` — 同上（`mode="molkkout"`）
