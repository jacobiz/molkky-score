# Research: 時間切れによる途中決着

**Branch**: `014-timeout-settlement` | **Date**: 2026-03-03

## Decision 1: 複数勝者（引き分け）の表現方法

**Decision**: `Game.winnerId` を `null` のまま保持し、`players[].status === 'winner'` を複数プレイヤーに設定する

**Rationale**:
- 既存の `PlayerStatus = 'active' | 'eliminated' | 'winner'` 型を活用できる
- `ResultScreen` はすでに `players.filter(p => p.status === 'winner')` で複数対応可能
- `winnerId: null` が「未決定」と「引き分け」の両方を表すが、`status: 'finished'` との組み合わせで引き分けと区別できる
- 新しい `winnerIds: string[]` フィールドの追加は不要（YAGNI）

**Alternatives considered**:
- `winnerIds: string[]` — より明示的だが、破壊的型変更になりスキーマ移行コストが高い
- `isDraw: boolean` — 冗長な情報。`winnerId === null && status === 'finished'` で同等に判定可能

---

## Decision 2: ストレージスキーマバージョン

**Decision**: `SCHEMA_VERSION: 3 → 4`、既存 v3 データは破棄（移行なし）

**Rationale**:
- `Game` と `MolkkoutGame` に `finishReason` フィールドを追加するため型が変わる
- プロジェクトの既存パターン（v2→v3 も移行なし）と一致する
- ゲーム結果は永続的な資産ではなく、ユーザーへの影響は最小
- 移行ロジック（v3 を読んで `finishReason: 'normal'` をデフォルト注入）はシンプルだが、シンプルさ優先の原則に従い不採用

**Alternatives considered**:
- v3 → v4 マイグレーション — 進行中ゲームが保持される利点があるが、既存パターンと異なる。将来の migration 基盤として価値があるが現時点では YAGNI

---

## Decision 3: 途中決着アクションの設計

**Decision**: `EARLY_SETTLEMENT` と `EARLY_MOLKKOUT_SETTLEMENT` を別アクションとして定義

**Rationale**:
- 既存の action パターン（`RECORD_TURN` / `RECORD_MOLKKOUT_TURN` など）が分離しているため一貫性がある
- Game と MolkkoutGame は独立した state フィールドであり、型安全性を保つ

**Alternatives considered**:
- 統合 `EARLY_SETTLEMENT` + `gameType` フィールド — ゲームタイプの条件分岐が reducer 内で増え、可読性が下がる

---

## Decision 4: 途中決着ボタンの表示条件

**Decision**: 「いずれか 1 人（1 チーム）以上のスコアが 0 より大きい」場合にのみボタンを表示

**Rationale**:
- FR-007 の「全員スコア 0 の間は非表示」の反条件を満たす最小実装
- `game.players.some(p => p.status === 'active' && p.score > 0)` で判定
- Mölkkout: `mg.teams.some(t => t.totalScore > 0)` で判定

---

## Decision 5: MolkkoutGame の途中決着

**Decision**: `EARLY_MOLKKOUT_SETTLEMENT` は `status: 'finished'` に遷移し、`overtime` を経由しない

**Rationale**:
- 時間切れは「追加投球ができない」外部制約であり、延長戦（overtime）は対象外
- 引き分け時は `winnerId: null` + `status: 'finished'` + `finishReason: 'timeout'` で表現
- MolkkoutScreen の `status === 'finished'` 分岐に乗っかることで既存 UI を最大限再利用

---

## Decision 6: TDD 対象

**Decision**: `gameReducer` の `EARLY_SETTLEMENT` / `EARLY_MOLKKOUT_SETTLEMENT` ハンドラをテスト対象とする

**Rationale**:
- Constitution: 「主要機能（スコア計算・ゲームルール）のテストは実装前に記述すること（MUST）」
- 途中決着ロジック（最高スコア判定・引き分け検出）はゲームルールの核心部分
- UI コンポーネント（ボタン表示条件、ダイアログ）はテスト任意（MAY）
