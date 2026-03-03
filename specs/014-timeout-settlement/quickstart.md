# Developer Quickstart: 時間切れによる途中決着

**Branch**: `014-timeout-settlement`

## 概要

ゲーム進行中に「途中決着」を宣言し、現時点の最高スコアで勝敗を決める機能を追加する。

## 実装順序（TDD）

### Step 1: テスト先行（Constitution 必須）

```bash
# テストを先に書き、失敗を確認してから実装する
npm test -- --watch
```

テストファイル: `tests/unit/earlySettlement.test.ts`

テストすべき内容:
- `EARLY_SETTLEMENT`: 明確な勝者がいる場合（最高スコアの1人が winner）
- `EARLY_SETTLEMENT`: 引き分けの場合（複数プレイヤーが winner、winnerId は null）
- `EARLY_SETTLEMENT`: 脱落済みプレイヤーがいる場合（active プレイヤーのみで判定）
- `EARLY_SETTLEMENT`: no-op 条件（game === null、全員スコア 0）
- `EARLY_MOLKKOUT_SETTLEMENT`: 同様のケース（teams ベース）

### Step 2: 型定義

`src/types/game.ts`:
```typescript
// Game に追加
finishReason: 'normal' | 'timeout'

// MolkkoutGame に追加
finishReason: 'normal' | 'timeout'

// GameAction に追加
| { type: 'EARLY_SETTLEMENT' }
| { type: 'EARLY_MOLKKOUT_SETTLEMENT' }
```

### Step 3: Reducer 実装

`src/reducers/gameReducer.ts` に2ケースを追加:

**EARLY_SETTLEMENT ロジック**:
1. `game.status !== 'active'` → no-op
2. active プレイヤーを抽出（`status === 'active'`）
3. 最高スコアを特定
4. 最高スコアの active プレイヤー全員を `status: 'winner'` に設定
5. 単独なら `winnerId = player.id`、複数なら `winnerId = null`
6. `status: 'finished'`, `finishReason: 'timeout'`
7. `screen: 'result'` に遷移

**EARLY_MOLKKOUT_SETTLEMENT ロジック**（同様だが teams ベース）

### Step 4: ストレージ更新

`src/utils/storage.ts`:
- `SCHEMA_VERSION: 4`
- `Game` / `MolkkoutGame` の `finishReason` フィールドを追加
- 既存データ検証で version 4 を要求（旧データは自動破棄）

また `START_GAME` / `START_MOLKKOUT` reducer ケースで `finishReason: 'normal'` を初期値として設定する。

### Step 5: i18n キー追加

`src/i18n/ja.ts` に追加（`en.ts`・`fi.ts` も同様）:
```typescript
game: {
  // 既存キーに追加:
  earlySettlement: "途中決着",
  earlySettlementConfirm: "時間切れで途中決着しますか？",
}
result: {
  // 既存キーに追加:
  timeoutBadge: "⏱ 時間切れ",
  draw: "引き分け",
  drawWinners: "同点優勝",
}
```

### Step 6: GameScreen に途中決着ボタン追加

`src/components/GameScreen/index.tsx`:
- 表示条件: `game.players.some(p => p.status === 'active' && p.score > 0)`
- タップで `ConfirmDialog` を表示（既存コンポーネントを再利用）
- 確認後: `dispatch({ type: 'EARLY_SETTLEMENT' })`

### Step 7: MolkkoutScreen に途中決着ボタン追加

`src/components/MolkkoutScreen/index.tsx`:
- 表示条件: `mg.teams.some(t => t.totalScore > 0)` かつ `mg.status !== 'finished'`
- `ConfirmDialog` → `dispatch({ type: 'EARLY_MOLKKOUT_SETTLEMENT' })`

### Step 8: ResultScreen の途中決着表示

`src/components/ResultScreen.tsx`:
- `game.finishReason === 'timeout'` の場合、タイトルの下に「⏱ 時間切れ」バッジを表示
- 複数 winner 対応: `game.players.filter(p => p.status === 'winner')` で全勝者を取得
  - 1名: 現行と同じ「優勝: {name}」
  - 複数名: 「引き分け: {name1}・{name2}」など

### Step 9: MolkkoutScreen finished 表示の途中決着対応

`src/components/MolkkoutScreen/index.tsx` の `status === 'finished'` 分岐:
- `mg.finishReason === 'timeout'` の場合に「⏱ 時間切れ」バッジを表示
- `mg.winnerId === null` の場合、最高スコアのチーム全員を「同点優勝」として強調

## 実行コマンド

```bash
npm test        # ユニットテスト（Vitest）
npm run build   # 型チェック + ビルド
npm run dev     # 開発サーバー
```

## 品質チェック（Constitution）

- [ ] `EARLY_SETTLEMENT` / `EARLY_MOLKKOUT_SETTLEMENT` のユニットテストがすべてパス
- [ ] TypeScript のコンパイルエラーなし（`npm run build`）
- [ ] モバイルでの動作確認（iOS / Android）
- [ ] オフライン動作確認
- [ ] ストレージ版バンプにより旧データが適切に破棄されること
