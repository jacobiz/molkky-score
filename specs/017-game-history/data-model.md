# Data Model: ゲーム結果履歴

**Feature**: 017-game-history
**Date**: 2026-03-06

## 新規エンティティ

### HistoryTurnEntry

1ターンの投球記録。`GameHistoryRecord.turns` の要素。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `turnNumber` | `number` | 通算投球番号（1始まり。全プレイヤー分の投球を通して連番） |
| `playerId` | `string` | 投球プレイヤーID |
| `points` | `number` | 投点（0〜12） |
| `scoreAfter` | `number` | このターン後の累計スコア（バースト後は25） |
| `isBust` | `boolean` | バーストフラグ（score > 50 → 25にリセット） |
| `isMiss` | `boolean` | ミスフラグ（0本） |
| `isEliminated` | `boolean` | このターンで脱落したか（3回連続ミス） |

**導出ルール**:
- `scoreAfter` = `isBust ? 25 : playerSnapshotBefore.score + points`（保存時に計算）
- `isEliminated` = `isMiss && playerSnapshotBefore.consecutiveMisses === 2`（保存時に計算）

**スコアシート表示時のグループ化**:
`ScoreSheetModal` では `turnNumber`（連番）を行キーとして使わず、プレイヤーごとの投球回数カウンターを使ってラウンド番号を算出する。
ラウンド R = 各プレイヤーの R 投目の集合。これにより 1行＝全プレイヤーの同一ラウンド分が横並びになる。

---

### GameHistoryRecord

1ゲームの完結した記録。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `string` | 一意ID（`Date.now().toString(36)` で生成） |
| `finishedAt` | `string` | 終了日時（ISO 8601 形式） |
| `players` | `{ id: string; name: string }[]` | 参加者リスト（投球順） |
| `winnerId` | `string \| null` | 勝者ID（引き分けは `null`） |
| `finishReason` | `'normal' \| 'timeout'` | 終了理由（既存 `FinishReason` 型と同一） |
| `totalTurns` | `number` | 総ターン数 |
| `turns` | `HistoryTurnEntry[]` | 全ターンの投球記録 |

**バリデーション**:
- `players` の長さ: 2〜10
- `turns` の長さ: `totalTurns` と一致

---

### StoredHistory

localStorage に保存される最上位構造。キー: `molkky-score-history`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `version` | `1`（リテラル型） | スキーマバージョン |
| `records` | `GameHistoryRecord[]` | 最新順の履歴リスト（最大20件） |

**制約**:
- `records.length` ≤ 20（超過時は末尾の最古レコードを削除）
- 最新レコードが先頭（`records[0]` が最新）

---

## 既存エンティティへの変更

### Screen（`src/types/game.ts`）

`'history'` を追加:

```
'home' | 'setup' | 'game' | 'result' | 'molkkout-setup' | 'molkkout-game' | 'history'
```

---

## localStorage スキーマ

| キー | 内容 | バージョン管理 |
|-----|------|--------------|
| `molkky-score-v2` | ゲーム進行状態（既存、変更なし） | `SCHEMA_VERSION=4`（変更なし） |
| `molkky-score-history` | 履歴データ（新規） | `StoredHistory.version=1` |

---

## データフロー

```
ゲーム終了（RECORD_TURN / EARLY_SETTLEMENT）
    ↓
GameContext: game.status === 'finished' を検出
    ↓
buildHistoryRecord(game) で Game → GameHistoryRecord に変換
    ↓
historyStorage.addRecord(record) で localStorage に保存
    （最大20件超過時は末尾を削除）
    ↓
HistoryScreen / ScoreSheetModal で参照
```
