# Data Model: Back to Home Navigation

**Branch**: `011-game-back-home` | **Date**: 2026-03-01

## Overview

本機能はゲーム状態やデータモデルを変更しない。変更は UI コンポーネントの Props インターフェースと i18n キーに限定される。

---

## コンポーネントインターフェース

### ScreenHeader（新規）

```tsx
// src/components/ui/ScreenHeader.tsx

interface ScreenHeaderProps {
  /** 画面タイトル（例: t.setup.title, t.game.title） */
  title: string

  /**
   * true の場合、ボタンタップ時に ConfirmDialog を表示してから onGoHome を呼ぶ。
   * false の場合、ボタンタップで直接 onGoHome を呼ぶ。
   * @default false
   */
  requireConfirm?: boolean

  /**
   * ホームへの遷移を実行するコールバック。
   * 呼び出し側は通常 dispatch({ type: 'NAVIGATE', screen: 'home' }) を渡す。
   */
  onGoHome: () => void

  /**
   * ヘッダ右端に配置するオプション要素。
   * SetupScreen の LanguageSelector 配置用。
   */
  rightContent?: React.ReactNode
}

// ローカル state
// showConfirm: boolean  ← ConfirmDialog の表示制御
```

---

## i18n 型定義変更

### `src/i18n/ja.ts`（型ソース）

`common` セクションへの追加:

```ts
common: {
  ok: string
  cancel: string
  copied: string
  language: string
  // --- 追加 ---
  backToHome: string         // ボタンラベル: "ホームへ戻る"
  backToHomeConfirm: string  // ダイアログメッセージ: "ホームへ戻りますか？"
}
```

`game` セクションへの追加:

```ts
game: {
  // ... 既存キー ...
  // --- 追加 ---
  title: string  // ヘッダタイトル: "ゲーム中"
}
```

### 各言語の値

| キー | ja | en | fi |
|------|----|----|----|
| `common.backToHome` | `"ホームへ戻る"` | `"Back to Home"` | `"Palaa kotiin"` |
| `common.backToHomeConfirm` | `"ホームへ戻りますか？"` | `"Return to home?"` | `"Palaa etusivulle?"` |
| `game.title` | `"ゲーム中"` | `"Game"` | `"Peli"` |

---

## 各画面の ScreenHeader 使用パターン

| 画面コンポーネント | title | requireConfirm | onGoHome |
|-------------------|-------|---------------|----------|
| `SetupScreen` | `t.setup.title` | `true` | `dispatch({ type: 'NAVIGATE', screen: 'home' })` |
| `GameScreen` | `t.game.title` | `true` | `dispatch({ type: 'NAVIGATE', screen: 'home' })` |
| `ResultScreen` | `t.result.title` | `false` | `dispatch({ type: 'NAVIGATE', screen: 'home' })` |
| `MolkkoutSetupScreen` | `t.molkkout.title` | `false` | `dispatch({ type: 'NAVIGATE', screen: 'home' })` |
| `MolkkoutScreen` | `t.molkkout.title` | `game.status === 'active' \|\| 'overtime'` | `dispatch({ type: 'NAVIGATE', screen: 'home' })` |

---

## 既存データモデルへの影響

- `GameState`（`src/types/game.ts`）: **変更なし**
- `gameReducer.ts`: **変更なし**（`NAVIGATE` アクション既存）
- localStorage スキーマ（`SCHEMA_VERSION=2`）: **変更なし**
- `GameContext.tsx`: **変更なし**

---

## ConfirmDialog 呼び出しパターン（ScreenHeader 内）

```tsx
<ConfirmDialog
  message={t.common.backToHomeConfirm}
  confirmLabel={t.common.backToHome}
  cancelLabel={t.common.cancel}
  onConfirm={onGoHome}
  onCancel={() => setShowConfirm(false)}
/>
```
