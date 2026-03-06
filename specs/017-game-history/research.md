# Research: ゲーム結果履歴

**Feature**: 017-game-history
**Date**: 2026-03-06

## 調査サマリー

既存コードの構造を調査し、履歴機能の設計上の選択肢を検討した。
主な調査対象: `src/types/game.ts`、`src/utils/storage.ts`、`src/App.tsx`、`src/components/HomeScreen.tsx`

---

## Decision 1: localStorage 保存方針

**Decision**: 別キー `molkky-score-history` を新設し、履歴データを完全分離して保存する

**Rationale**: 既存の `molkky-score-v2`（SCHEMA_VERSION=4）はゲーム進行状態を管理しており、
履歴データを同一キーに追加するとスキーマ検証ロジックの変更・バージョンバンプが必要になる。
別キーにすることで既存のロード/セーブコードに一切影響を与えず、
履歴専用の `historyStorage.ts` を新規追加するだけで実装できる。
Constitution「シンプルさ優先」に合致。

**Alternatives considered**:
- 既存キーへの追加（SCHEMA_VERSION: 4 → 5）: スキーマ検証の修正が必要。メリットなし。

---

## Decision 2: 履歴一覧の表示方式

**Decision**: `HistoryScreen` を新規スクリーンとして追加（`Screen` 型に `'history'` を追加、
`NAVIGATE` アクションで遷移）

**Rationale**: 履歴一覧は複数件の縦スクロールリストを含み、各アイテムからスコアシートモーダルを
開くため、既存の `App.tsx` の画面遷移パターン（`NAVIGATE` + 条件レンダリング）と一致させた方が
設計が一貫する。モーダル内でさらにモーダルを開く入れ子構造を避けられる。

**Alternatives considered**:
- ホーム画面上のモーダル: 一覧スクロール + 詳細モーダルの入れ子が複雑になる。

---

## Decision 3: スコアシート詳細の表示方式

**Decision**: `ScoreSheetModal` コンポーネントをモーダルで表示
（`/speckit.clarify` セッションで確定済み）

**Rationale**: 既存の `PinSetupGuideModal` と同パターン。新規スクリーン追加不要で
`HistoryScreen` 内の状態管理だけで完結する。

**Alternatives considered**:
- 別画面遷移: HistoryScreen → ScoreSheetScreen の2段階遷移が必要で過剰。

---

## Decision 4: スコアシートデータの構築方法

**Decision**: ゲーム終了時に `Game.turnHistory: Turn[]` から `HistoryTurnEntry[]` に変換して保存

**Rationale**: 既存の `Turn` 型には `playerSnapshotBefore: Player`（スコア・連続ミス・状態）が
格納されており、これを使って各ターン後の状態を完全に再現できる。
- `scoreAfter` = `isBust ? 25 : playerSnapshotBefore.score + points`
- `isEliminated` = `isMiss && playerSnapshotBefore.consecutiveMisses === 2`（3回目のミスで脱落）

ゲーム終了後に変換・保存することで、ゲームプレイ中のパフォーマンスに影響しない。

**Alternatives considered**:
- プレイ中に随時記録: 毎ターンのsaveState呼び出しで余分な処理が発生する。

---

## Decision 5: 履歴保存のトリガー

**Decision**: `gameReducer.ts` の `RECORD_TURN` と `EARLY_SETTLEMENT` アクション処理内で
ゲームが `finished` に遷移した直後に履歴を保存する

**Rationale**: Reducer内で状態遷移と履歴保存を同時に行うことで、保存漏れが発生しない。
`saveHistory()` は副作用（localStorage書き込み）だが、既存の `saveState()` も同様に
Reducer外のReactコンテキストから呼び出されている。
実際には `GameContext.tsx` の `dispatch` ラッパー内で `RECORD_TURN` / `EARLY_SETTLEMENT`
実行後に `saveHistory()` を呼び出す設計とする。

**Alternatives considered**:
- ResultScreen のマウント時: ユーザーがResultScreenを表示しない場合に保存されない（再試合/Undo後など）。
- 専用 `SAVE_HISTORY` アクション: 明示的だが呼び出し忘れのリスクがある。

---

## Decision 6: ScoreSheetModal のラウンド集約方式（実装確定）

**Decision**: スコアシートの行は `turnNumber`（通算投球番号）ではなく、
プレイヤーごとの投球回数カウンターで算出した「ラウンド番号」を使ってグループ化する

**Rationale**: `turnNumber` は全プレイヤー分の投球を通した連番であるため、
そのまま行キーにすると 1行＝1投球 となり、横並びで全プレイヤーのスコアを比較できない。
「各プレイヤーの R 投目をラウンド R として集約」する方式により、
1行＝1ラウンド（全プレイヤーが1投ずつ行う1巡）となり、直感的に比較できる。

**実装**:
```typescript
const playerThrowCounts = new Map<string, number>()
for (const turn of record.turns) {
  const count = (playerThrowCounts.get(turn.playerId) ?? 0) + 1
  playerThrowCounts.set(turn.playerId, count)
  roundMap.get(count)!.set(turn.playerId, turn) // countがラウンド番号
}
```

**Alternatives considered**:
- `turnNumber` を行キーにそのまま使う: 1行1投球になり横比較不可。初期実装で判明し修正済み。

---

## Decision 7: Mölkkout 履歴

**Decision**: Mölkkoutゲームは今回のスコープ外
（`/speckit.clarify` セッションで確定済み）

**Rationale**: Mölkkoutのデータ構造（チームA/Bの複数投球）は通常ゲームと根本的に異なる。
別フィーチャーとして設計する方がシンプルで品質が高い。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/types/game.ts` | `Screen` 型に `'history'` を追加 |
| `src/types/history.ts` | 新規: 履歴型定義 |
| `src/utils/historyStorage.ts` | 新規: 履歴のCRUD操作 |
| `src/reducers/gameReducer.ts` | ゲーム終了後の履歴保存ロジック追加 |
| `src/App.tsx` | `HistoryScreen` の条件レンダリング追加 |
| `src/components/HomeScreen.tsx` | 「履歴」ボタン追加 |
| `src/components/HistoryScreen.tsx` | 新規: 履歴一覧画面 |
| `src/components/ui/ScoreSheetModal.tsx` | 新規: スコアシートモーダル |
| `src/i18n/ja.ts` | `history` i18n キー追加 |
| `src/i18n/en.ts` | 同上（英語版） |
| `src/i18n/fi.ts` | 同上（フィンランド語版） |

---

## 非影響範囲

- `src/utils/storage.ts`: 変更なし（既存スキーマそのまま）
- `src/utils/scoring.ts`: 変更なし
- Mölkkout 関連コンポーネント: 変更なし
- ゲームロジック（スコア計算・ルール）: 変更なし
