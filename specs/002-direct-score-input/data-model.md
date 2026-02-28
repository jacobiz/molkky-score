# Data Model: 得点直接入力（1タップスコア入力）

**Branch**: `002-direct-score-input` | **Date**: 2026-02-28

---

## 変更エンティティ

### Turn（変更）

アンドゥスタックの1要素。`pinsKnockedDown` / `pinNumber` を削除し `points` のみで得点を表現する。

| フィールド | 型 | 変更 | 説明 |
|-----------|-----|------|------|
| `playerId` | `string` | 変更なし | 投球したプレイヤーの ID |
| ~~`pinsKnockedDown`~~ | ~~`number`~~ | **削除** | 倒した本数（廃止） |
| ~~`pinNumber`~~ | ~~`number \| null`~~ | **削除** | ピン番号（廃止） |
| `points` | `number` | 変更なし | このターンで入力された得点（0〜12） |
| `isBust` | `boolean` | 変更なし | バースト発生フラグ |
| `isMiss` | `boolean` | 変更なし | ミス（0点）フラグ。`points === 0` で判定 |
| `playerSnapshotBefore` | `Player` | 変更なし | アンドゥ用プレイヤー状態スナップショット |

### MolkkoutTurn（変更）

| フィールド | 型 | 変更 | 説明 |
|-----------|-----|------|------|
| `teamId` | `string` | 変更なし | チーム ID |
| `playerName` | `string` | 変更なし | 投球者名 |
| ~~`pinsKnockedDown`~~ | ~~`number`~~ | **削除** | 倒した本数（廃止） |
| ~~`pinNumber`~~ | ~~`number \| null`~~ | **削除** | ピン番号（廃止） |
| `points` | `number` | 変更なし | このターンで入力された得点（0〜12） |

### GameAction（変更）

| アクション | 変更前 | 変更後 |
|-----------|--------|--------|
| `RECORD_TURN` | `{ pinsKnockedDown: number; pinNumber: number \| null }` | `{ points: number }` |
| `RECORD_MOLKKOUT_TURN` | `{ pinsKnockedDown: number; pinNumber: number \| null }` | `{ points: number }` |

---

## 変更なしエンティティ

- `Player`: 変更なし
- `Game`: 変更なし（`turnHistory` の要素型 `Turn` は変更されるが Game 自体の構造は不変）
- `MolkkoutGame`: 変更なし
- `Settings`: 変更なし
- `GameState`: 変更なし

---

## ストレージスキーマ

| 項目 | 旧値 | 新値 |
|------|------|------|
| `localStorage` キー | `molkky-score-v1` | `molkky-score-v2` |
| `SCHEMA_VERSION` | `1` | `2` |

バージョン不一致時は既存ロジックにより旧データを自動クリアしてアプリを初期状態で起動する。

---

## scoring.ts の変更

| 関数 | 変更 |
|------|------|
| `calculatePoints` | **削除**（UI が直接得点を入力するため不要） |
| `applyBustRule` | 変更なし |
| `checkWin` | 変更なし |
| `incrementMisses` | 変更なし |
