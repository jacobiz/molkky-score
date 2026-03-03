# Action Contracts: 時間切れによる途中決着

**Branch**: `014-timeout-settlement` | **Date**: 2026-03-03

## 新規アクション

### `EARLY_SETTLEMENT`

通常ゲームの途中決着を宣言する。

```typescript
{ type: 'EARLY_SETTLEMENT' }
```

**前提条件**:
- `state.game !== null`
- `state.game.status === 'active'`
- `state.game.players.some(p => p.status === 'active' && p.score > 0)`

**後条件**:
- `state.game.status === 'finished'`
- `state.game.finishReason === 'timeout'`
- `state.screen === 'result'`
- 最高スコアの active プレイヤーが `status: 'winner'` になる（複数可）
- 単独勝者の場合: `state.game.winnerId === winner.id`
- 引き分けの場合: `state.game.winnerId === null`、複数プレイヤーが `status: 'winner'`

**エラー条件**:
- `state.game === null` → state 変更なし（no-op）
- `state.game.status !== 'active'` → state 変更なし（no-op）

---

### `EARLY_MOLKKOUT_SETTLEMENT`

Mölkkout ゲームの途中決着を宣言する。

```typescript
{ type: 'EARLY_MOLKKOUT_SETTLEMENT' }
```

**前提条件**:
- `state.molkkoutGame !== null`
- `state.molkkoutGame.status === 'active' || status === 'overtime'`
- `state.molkkoutGame.teams.some(t => t.totalScore > 0)`

**後条件**:
- `state.molkkoutGame.status === 'finished'`
- `state.molkkoutGame.finishReason === 'timeout'`
- **全チームが判定対象**（MolkkoutTeam に脱落概念はない）。最高 totalScore のチームが勝者
- 単独勝者: `state.molkkoutGame.winnerId === winner.id`
- 引き分け: `state.molkkoutGame.winnerId === null`

**エラー条件**:
- `state.molkkoutGame === null` → state 変更なし（no-op）

---

## 既存アクション（変更なし）

`RECORD_TURN`, `UNDO_TURN`, `RESTART_GAME`, `NEW_GAME`, `REMATCH_SETUP`,
`RECORD_MOLKKOUT_TURN`, `UNDO_MOLKKOUT_TURN`, `NAVIGATE`, `START_GAME`,
`START_MOLKKOUT`, `SET_LANGUAGE` — 変更なし
