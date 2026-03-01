# Data Model: 次のゲーム設定画面（リマッチ）

**Feature**: 009-rematch-setup
**Date**: 2026-03-01

## Summary

ゲームロジック・スコア計算・型の構造に変更はない。変更は `GameState` へのフィールド追加と
新規アクション型の追加のみ。

## State 変更

### GameState への追加

```
GameState {
  screen: Screen
  game: Game | null
  molkkoutGame: MolkkoutGame | null
  settings: Settings
  rematchPlayers: string[] | null   ← NEW（transient）
}
```

- **型**: `string[] | null`
- **初期値**: `null`
- **セット**: `REMATCH_SETUP` アクション実行時に `game.players.map(p => p.name)`
- **クリア**: `START_GAME` アクション実行時に `null` に戻す
- **永続化**: しない（`StoredState` に含めないため、リロード時は常に `null`）

## Action 追加

### REMATCH_SETUP（新規）

```
{ type: 'REMATCH_SETUP' }
```

**前提**: `state.game` が存在すること（結果画面からのみ呼ばれる）

**効果**:
1. `state.game.players.map(p => p.name)` → `rematchPlayers` に格納
2. `screen` を `'setup'` に変更
3. `game` は変更しない（setup 画面でプレイヤー設定後 `START_GAME` で新しい game が生成される）

## 変更なし

- `Player`, `Game`, `Turn`, `MolkkoutGame`, `Settings` 型: 変更なし
- `StoredState`: 変更なし（`SCHEMA_VERSION = 2` 維持）
- `Screen` 型: 変更なし（`'setup'` 画面を再利用）
