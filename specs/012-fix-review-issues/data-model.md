# Data Model: コードレビュー残課題の対処

**Feature**: 012-fix-review-issues
**Date**: 2026-03-02

---

## 変更概要

本フィーチャーでの主な型変更は `Messages` 型への新キー追加のみ。永続化スキーマ（`StoredState` / `SCHEMA_VERSION`）の変更はなし。

---

## i18n: Messages 型への追加キー

`ja.ts` の `ja` オブジェクトに以下を追加し、`Messages = typeof ja` 経由で型が自動更新される。

### `setup` セクション（追加）

```ts
setup: {
  // 既存キー（変更なし）
  // ...
  moveUp: string        // 「上へ」ボタンの aria-label
  moveDown: string      // 「下へ」ボタンの aria-label
  removePlayer: string  // 「削除」ボタンの aria-label
}
```

### `molkkout` セクション（追加）

```ts
molkkout: {
  // 既存キー（変更なし）
  // ...
  errorRequiredFields: string  // バリデーションエラー: チーム名・プレイヤー名が未入力
}
```

### `licenses` セクション（新規）

```ts
licenses: {
  title: string         // 画面タイトル「オープンソースライセンス」
  backLabel: string     // 戻るボタンの aria-label
  showFullText: string  // ライセンス全文展開ボタンのラベル
  privacyTitle: string  // プライバシーポリシーセクションのタイトル
  privacyBody: string   // プライバシーポリシー本文
}
```

### 3言語の翻訳値

| キー | ja | en | fi |
|------|----|----|-----|
| `setup.moveUp` | 上へ | Move up | Siirrä ylös |
| `setup.moveDown` | 下へ | Move down | Siirrä alas |
| `setup.removePlayer` | 削除 | Remove | Poista |
| `molkkout.errorRequiredFields` | チーム名とプレイヤー名をすべて入力してください | Please fill in all team and player names | Täytä kaikki tiimi- ja pelaajanimi |
| `licenses.title` | オープンソースライセンス | Open Source Licenses | Avoimen lähdekoodin lisenssit |
| `licenses.backLabel` | 戻る | Back | Takaisin |
| `licenses.showFullText` | ライセンス全文を表示 | Show full license text | Näytä koko lisenssiteksti |
| `licenses.privacyTitle` | プライバシーポリシー | Privacy Policy | Tietosuojakäytäntö |
| `licenses.privacyBody` | このアプリはユーザーのデータを外部サーバーに送信しません。スコアや設定はこのデバイスの localStorage にのみ保存されます。 | This app does not send any user data to external servers. Scores and settings are stored only in this device's localStorage. | Tämä sovellus ei lähetä käyttäjätietoja ulkoisille palvelimille. Pisteet ja asetukset tallennetaan vain tämän laitteen localStorageen. |

---

## storage: loadState バリデーション追加

`StoredState` 型・`SCHEMA_VERSION` の変更はなし。`loadState` 関数に type guard を追加するのみ。

```ts
// 追加される type guard（StoredState は変更なし）
function isValidStoredState(value: unknown): value is StoredState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (v.version !== SCHEMA_VERSION) return false
  if (typeof v.settings !== 'object' || v.settings === null) return false
  return true
}
```

---

## コンポーネント: NumberInput（新規）

`src/components/ui/NumberInput.tsx` として追加。

```ts
interface NumberInputProps {
  onSubmit: (points: number) => void
  variant?: 'game' | 'molkkout'  // デフォルト: 'game'
}
```

| variant | 用途 | 主なスタイル差異 |
|---------|------|-----------------|
| `'game'` | GameScreen/PinInput（旧来のスタイル） | `p-3`, `py-2`, `text-2xl`, grid に maxHeight なし |
| `'molkkout'` | MolkkoutScreen/MolkkoutInput（旧来のスタイル） | `p-4`, `py-4`, `text-xl`, `max-h-[280px]` |

既存の `PinInput` / `MolkkoutInput` は `NumberInput` の薄いラッパーに変更（コンポーネント名はそのまま維持）。

---

## 永続化スキーマへの影響

**なし。** `StoredState.version = 2` は変更しない。i18n キーは localStorage に保存されないため。
