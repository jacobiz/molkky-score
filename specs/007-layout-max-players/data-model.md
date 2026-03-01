# Data Model: 得点入力エリア拡大・プレイヤー上限10人対応

**Feature**: 007-layout-max-players
**Date**: 2026-03-01

## Summary

本機能はゲームロジック（型定義・状態管理）への変更を含まない。既存の `Player[]` 型・
`GameState` 型はそのまま使用し、任意のプレイヤー数をサポートする。

変更は以下の UI バリデーション値のみ:

| 項目 | 変更前 | 変更後 | ファイル |
|------|--------|--------|---------|
| MAX_PLAYERS (UI 制限) | `players.length >= 6` | `players.length >= 10` | `SetupScreen.tsx` |

## 既存型定義（変更なし）

```typescript
// src/types/game.ts - 変更なし
type PlayerStatus = 'active' | 'eliminated' | 'winner'

interface Player {
  id: string
  name: string
  score: number
  consecutiveMisses: number
  status: PlayerStatus
}

interface GameState {
  players: Player[]      // 任意の要素数（制限なし）
  currentPlayerIndex: number
  totalTurns: number
  turnHistory: TurnRecord[]
  status: 'playing' | 'finished'
}
```

`Player[]` は要素数制限を持たないため、10人対応のための型変更は不要。
