# Contract: localStorage スキーマ

**Key**: `molkky-score-v1`
**Type**: JSON 文字列（`JSON.stringify` / `JSON.parse`）

---

## スキーマ

```typescript
interface StoredState {
  /** スキーマバージョン（互換性チェック用） */
  version: 1
  /** ゲーム状態（進行中の場合のみ、なければ null） */
  game: Game | null
  /** 進行中の Mölkkout（なければ null） */
  molkkoutGame: MolkkoutGame | null
  /** アプリ設定 */
  settings: {
    language: 'ja' | 'en'
  }
}
```

`screen` はストレージに保存しない。起動時は常に `'home'` から開始し、`game !== null` の場合に「ゲームを再開」ボタンを表示する。

---

## 読み書きルール

| ケース | 動作 |
|---|---|
| キーが存在しない（初回起動） | デフォルト初期状態で起動 |
| `version !== 1` | 古いスキーマ。キーを削除して初期状態で起動 |
| JSON パースエラー | キーを削除して初期状態で起動 |
| 正常読み込み | 保存された `game`, `molkkoutGame`, `settings` を復元 |

---

## 保存タイミング

- `useEffect` で `GameState` の変化を検知し、毎ターン後に即時保存
- `NEW_GAME` アクション時は `game: null` で保存（ゲームをクリア）
