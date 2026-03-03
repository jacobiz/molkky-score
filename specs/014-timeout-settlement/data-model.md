# Data Model: 時間切れによる途中決着

**Branch**: `014-timeout-settlement` | **Date**: 2026-03-03

## 変更概要

`Game` と `MolkkoutGame` に `finishReason` フィールドを追加。
ストレージスキーマバージョン: **3 → 4**

---

## 変更エンティティ

### `Game` (src/types/game.ts)

```
Game
├── players: Player[]
├── currentPlayerIndex: number
├── status: 'active' | 'finished'
├── winnerId: string | null           ← 変更なし（引き分け時は null）
├── totalTurns: number
├── turnHistory: Turn[]
└── finishReason: 'normal' | 'timeout'  ← 新規追加
```

**ルール**:
- `status === 'finished' && finishReason === 'normal'`: 50点到達による通常終了
- `status === 'finished' && finishReason === 'timeout'`: 時間切れ途中決着
- `winnerId !== null && finishReason === 'timeout'`: 単独勝者の途中決着
- `winnerId === null && status === 'finished' && finishReason === 'timeout'`: 引き分け途中決着 — 勝者は `players.filter(p => p.status === 'winner')` で取得

### `MolkkoutGame` (src/types/game.ts)

```
MolkkoutGame
├── teams: MolkkoutTeam[]
├── currentTeamIndex: number
├── currentThrowIndex: number
├── totalThrows: number
├── turns: MolkkoutTurn[]
├── status: 'active' | 'finished' | 'overtime'
├── winnerId: string | null           ← 変更なし
└── finishReason: 'normal' | 'timeout'  ← 新規追加
```

**ルール**:
- 途中決着時は `status: 'finished'`、`overtime` を経由しない
- 引き分け途中決着: `winnerId === null` — 勝チームは `teams.filter(t => t.totalScore === maxScore)` で算出

---

## 変更なしエンティティ

- `Player` — `status: 'winner'` は複数プレイヤーに設定可能（引き分け対応済み）
- `Turn`, `MolkkoutTeam`, `MolkkoutTurn` — 変更なし

---

## アクション型変更 (src/types/game.ts)

```
GameAction +=
  | { type: 'EARLY_SETTLEMENT' }
  | { type: 'EARLY_MOLKKOUT_SETTLEMENT' }
```

---

## ストレージスキーマ (src/utils/storage.ts)

```
StoredState
├── version: 4          ← 3 から更新
├── game: Game | null
├── molkkoutGame: MolkkoutGame | null
└── settings: Settings
```

**移行方針**: バージョン 4 未満のデータは破棄（既存パターンと一致）

---

## 状態遷移図: 通常ゲームの途中決着

```
active
  │
  │  EARLY_SETTLEMENT（1人以上スコア > 0）
  ▼
finished
  ├── winnerId != null, finishReason = 'timeout'  → 単独勝者
  └── winnerId = null, finishReason = 'timeout'   → 引き分け（複数 winner）
```

## 状態遷移図: Mölkkout の途中決着

```
active / overtime
  │
  │  EARLY_MOLKKOUT_SETTLEMENT（1チーム以上スコア > 0）
  ▼
finished (finishReason = 'timeout')
  ├── winnerId != null  → 単独勝チーム
  └── winnerId = null   → 引き分け（最高スコアの複数チーム）
```
