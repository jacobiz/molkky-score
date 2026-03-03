# Quickstart: 013-molkkout-setup-refactor

## ローカル開発

```bash
# 開発サーバー起動
npm run dev

# ユニットテスト実行（watch モード）
npm test

# 型チェック
npx tsc --noEmit

# プロダクションビルド
npm run build
```

## 実装の実行順序

この機能は依存関係に基づき以下の順で実装する。

```
1. src/types/game.ts           (型定義 — 他全ファイルの基盤)
     ↓
2. src/utils/storage.ts        (SCHEMA_VERSION バンプ — 型に依存)
     ↓
3. src/reducers/gameReducer.ts  (ロジック — 型に依存)
     ↓
4. tests/unit/molkkoutReducer.test.ts  (TDD: 実装前にテスト失敗確認)
     ↓
5. src/i18n/ja.ts / en.ts / fi.ts   (新 i18n キー追加)
     ↓
6. src/components/MolkkoutSetupScreen.tsx  (UI — 型・i18n・reducer に依存)
     ↓
7. src/components/MolkkoutScreen/index.tsx  (UI — 型・i18n・reducer に依存)
```

## 手動テストシナリオ

### セットアップ
1. ホーム画面 → 「Mölkkout」ボタン → セットアップ画面が開く
2. プレイヤー名フィールドが**存在しない**ことを確認
3. チーム名 2 つを入力し、投球数ステッパーで 3 → 4 に変更
4. 「開始」→ ゲーム画面が開き、投球数=4 で進行することを確認

### バリデーション（Toast）
- チーム名を空欄で「開始」→ Toast エラーが表示される
- 2 チームに同じ名前を入力して「開始」→ Toast エラーが表示される
- ステッパーで 1 を下回る操作ができないことを確認（`−` ボタンが disabled）
- ステッパーで 10 を超える操作ができないことを確認（`+` ボタンが disabled）

### Undo
- ゲーム開始直後: Undo ボタンが disabled であることを確認
- 1 投記録後: Undo でスコアが元に戻り、投球インデックスが戻ることを確認
- チーム切替直後（チーム B の 1 投目）: Undo でチーム A の最終投球状態に戻ることを確認

### 旧データ互換性
```javascript
// ブラウザコンソールで実行:
localStorage.setItem('molkky-score-v2', JSON.stringify({
  version: 2,
  molkkoutGame: {
    teams: [{ id: 'x', name: 'A', playerNames: ['P1'], totalScore: 0 }],
    currentTeamIndex: 0,
    currentPlayerInTeamIndex: 0,
    throwsPerPlayer: 3,
    turns: [],
    status: 'active',
    winnerId: null,
  },
  game: null,
  settings: { language: 'ja' },
}))
```
→ ページリロード → ホーム画面に戻り、クラッシュしないことを確認

## テスト方針（コンスティテューション II 準拠）

| 対象 | テスト要否 | 理由 |
|------|-----------|------|
| `START_MOLKKOUT` reducer | **必須** | ゲームルール（主要機能） |
| `RECORD_MOLKKOUT_TURN` rotation | **必須** | ゲームルール（主要機能） |
| `UNDO_MOLKKOUT_TURN` | **必須** | ゲームルール（主要機能） |
| overtime 遷移 | **必須** | ゲームルール（主要機能） |
| `MolkkoutSetupScreen` UI | 任意 | 補助的 UI コンポーネント |
| Toast バリデーション | 任意 | 補助的 UI コンポーネント |
| i18n キー存在確認 | 任意 | 単純ユーティリティ |
