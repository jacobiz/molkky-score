# Research: Back to Home Navigation

**Branch**: `011-game-back-home` | **Date**: 2026-03-01

## Phase 0 Findings

### Decision 1: Navigation Mechanism

**Decision**: 既存の `dispatch({ type: 'NAVIGATE', screen: 'home' })` をそのまま使用する。

**Rationale**: `gameReducer.ts` で `NAVIGATE` アクションが実装済みであり、ホーム画面への遷移は既に他のボタン（ResultScreen の "New Game" 等）で動作確認済み。追加実装は不要。

**Alternatives considered**:
- 新しい `GO_HOME` アクションを追加する → `NAVIGATE` で充分なため却下

---

### Decision 2: 確認ダイアログの実装方針

**Decision**: 既存の `ConfirmDialog` コンポーネント（`src/components/ui/ConfirmDialog.tsx`）を再利用する。`ScreenHeader` がローカル state `showConfirm` を持ち、`requireConfirm` prop が true のときにダイアログを制御する。

**Rationale**: `ConfirmDialog` は既に `HomeScreen` で使用されており、同一の props インターフェース（`message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`）で要件を満たす。新規モーダル実装は YAGNI 違反。

**Alternatives considered**:
- ブラウザ標準 `window.confirm()` → モバイル UX 不適、i18n 不可のため却下
- 新しいダイアログコンポーネントを作成 → 既存で充分なため却下

---

### Decision 3: ScreenHeader コンポーネント設計

**Decision**: `src/components/ui/ScreenHeader.tsx` を新規作成。Props は以下の通り:

```tsx
interface ScreenHeaderProps {
  title: string
  requireConfirm?: boolean    // default: false
  onGoHome: () => void        // 確認後またはボタン直接タップ時に呼ばれる
  rightContent?: React.ReactNode  // SetupScreen の LanguageSelector 用
}
```

ローカル state: `showConfirm: boolean`

**Rationale**:
- `requireConfirm` で3種類の画面動作（confirm必要/不要）を単一コンポーネントで処理
- `rightContent` slot は SetupScreen の LanguageSelector を維持するための最小限の拡張。これがないと SetupScreen が現在のヘッダを残せず「2つのヘッダ」問題が発生する
- `onGoHome` は caller が `dispatch({ type: 'NAVIGATE', screen: 'home' })` を渡す

**Alternatives considered**:
- ScreenHeader 内で `useGame()` を直接使い dispatch を呼ぶ → 呼び出し側の制御が失われるため却下
- rightContent なし（LanguageSelector を別の場所に移動） → SetupScreen の既存動作を変更するため却下

**Visual Design**:
```
[← ホームへ戻る]  [Title]           [rightContent?]
  bg-white border-b, h-14, px-4
```
- 左: テキストボタン（`←` + i18n キー `common.backToHome`）
- 中: `title` prop (font-semibold)
- 右: `rightContent` (flex-shrink-0)

---

### Decision 4: 各画面の requireConfirm 設定

**Decision**:

| 画面 | requireConfirm | 理由 |
|------|---------------|------|
| SetupScreen | `true` | 入力中プレイヤー情報が失われる |
| GameScreen | `true` | 進行中ゲームデータあり（ストレージ保持済みだが確認 UX が必要） |
| ResultScreen | `false` | ゲーム終了後。データ損失なし |
| MolkkoutSetupScreen | `false` | ゲーム終了後の遷移画面。データ損失なし |
| MolkkoutScreen | `molkkoutGame.status === 'active' \|\| 'overtime'` | アクティブ中は確認必要、終了後は不要 |

**Rationale**: spec FR-002 および Clarifications の Q1 回答に準拠。

---

### Decision 5: MolkkoutScreen 既存 "Back to Home" ボタンの処理

**Decision**: MolkkoutScreen の finished state にある既存 "Back to Home" ボタンを削除する。ScreenHeader が同等の機能を提供するため。

**Rationale**: ScreenHeader（requireConfirm=false の場合）がすでに home ボタンを提供する。finished state に重複ボタンを残すと UX が一貫しない。

**Alternatives considered**:
- 既存ボタンを残す → 重複ナビゲーション要素。Constitution I（シンプルさ）に反するため却下

---

### Decision 6: i18n 追加キー

**Decision**: 以下のキーを `common` セクションおよび `game` セクションに追加する:

| キー | ja | en | fi |
|------|----|----|-----|
| `common.backToHome` | "ホームへ戻る" | "Back to Home" | "Palaa kotiin" |
| `common.backToHomeConfirm` | "ホームへ戻りますか？" | "Return to home?" | "Palaa etusivulle?" |
| `game.title` | "ゲーム中" | "Game" | "Peli" |

**Rationale**:
- `common.backToHome`: ヘッダのボタンラベル（FR-008: 多言語対応必須）
- `common.backToHomeConfirm`: 確認ダイアログのメッセージ（spec acceptance scenario 1 に準拠）
- `game.title`: GameScreen のヘッダタイトル（FR-007 で全画面にタイトル必要、既存キーなし）
- confirm ラベルには `common.backToHome` を再利用、cancel には既存 `common.cancel` を使用

---

### Decision 7: テスト方針

**Decision**: 新規ゲームロジックがないため、テストは任意（Constitution II 準拠）。新規 `NAVIGATE` 呼び出しは既存の `gameReducer.test.ts` があれば自動的にカバー済みと判断。ScreenHeader の UI テストは実装者の判断に委ねる。

**Rationale**: Constitution II は「スコア計算・ゲームルール」への TDD を義務付けるが、本機能は純粋な UI ナビゲーション機能であり対象外。

---

## Summary

本機能に NEEDS CLARIFICATION はなし。すべての設計判断は既存コードベースの調査と spec の要件から確定した。
