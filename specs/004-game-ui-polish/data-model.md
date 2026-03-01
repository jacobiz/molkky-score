# Data Model: Game UI Polish

**Date**: 2026-03-01 | **Branch**: `004-game-ui-polish`

## 変更なし

本フィーチャーはすべて **UI 表示レイヤの変更**であり、データモデルへの変更は不要。

## 既存エンティティとの関係

### 投数表示（US1）

`Player.id` と `Game.turnHistory` を用いて投数を**導出**する。

```text
throwCount = turnHistory
  .filter(turn => turn.playerId === currentPlayer.id)
  .length + 1
```

- `Turn.playerId: string` — 既存フィールド
- 新フィールド不要

### 残りスコア強調（US2）

`Player.score` と `Player.status` から**導出**する。

```text
remaining = 50 - player.score
isCloseToWin = remaining <= 12
             && player.status === 'active'
```

- `Player.score: number` — 既存フィールド
- `Player.status: PlayerStatus` — 既存フィールド

### アイコン・絵文字（US4/US5）

UI 文字列定数の更新のみ。データモデル変更なし。

## 型定義変更サマリ

| ファイル | 変更 |
|---|---|
| `src/types/game.ts` | **変更なし** |
| `src/reducers/gameReducer.ts` | **変更なし** |
| `src/i18n/ja.ts` | `game.throwCount: (n: number) => string` 追加 |
| `src/i18n/en.ts` | `game.throwCount: (n: number) => string` 追加 |
