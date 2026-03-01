# Data Model: Shuffle Player Order

**Date**: 2026-03-01 | **Branch**: `005-shuffle-order`

## 変更なし

本フィーチャーはすべて **SetupScreen の UI ローカル操作**であり、データモデルへの変更は不要。

## 既存エンティティとの関係

### シャッフル操作（US1）

`SetupScreen` 内の `players: string[]` ローカル state を直接シャッフルする。

```text
players (string[]) → shuffleArray(players) → players (string[], 並び替え後)
```

- `src/types/game.ts` — **変更なし**
- `src/reducers/gameReducer.ts` — **変更なし**（`START_GAME` は既存のまま `playerNames: string[]` を受け取る）

## 型定義変更サマリ

| ファイル | 変更 |
|---|---|
| `src/types/game.ts` | **変更なし** |
| `src/reducers/gameReducer.ts` | **変更なし** |
| `src/i18n/ja.ts` | `setup.shuffle: string` 追加 |
| `src/i18n/en.ts` | `setup.shuffle: string` 追加 |
