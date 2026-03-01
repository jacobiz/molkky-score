# Research: Game UI Polish

**Date**: 2026-03-01 | **Branch**: `004-game-ui-polish`

## 調査結果

### 1. 投数カウントの実装方式

**Decision**: `turnHistory` からの導出（新フィールド不追加）

**Rationale**:
- `Turn` インターフェースは `playerId` を持つため、`turnHistory.filter(t => t.playerId === id).length + 1` で現在のプレイヤーの次投数が正確に得られる
- undo 時は `turnHistory` から自動的に pop されるため、追加ロジック不要
- `Player` 型への `throwCount` フィールド追加は不要（YAGNI）

**Alternatives considered**:
- `Player.throwCount: number` フィールドを追加する → 増分は RECORD_TURN で +1、UNDO_TURN で -1 が必要。プレーヤーのスナップショット復元（`playerSnapshotBefore`）も count を含めないと undo が壊れる。複雑度が増すため却下。
- 累計（全プレイヤー合算）カウント → spec で「各プレイヤーの個別投数」と確定済み。却下。

---

### 2. アイコン実装方式

**Decision**: Unicode 絵文字（外部ライブラリなし）

**Rationale**:
- Constitution 原則 I「追加ライブラリ・依存関係は最小限」を遵守
- Unicode 絵文字は iOS/Android/Chrome で安定してレンダリングされる
- テキストと並べて使用するため、アイコン単体でのレンダリング一貫性問題は軽微
- Heroicons / lucide-react 等の SVG ライブラリは bundle サイズ増加と不要な抽象化を招く

**Alternatives considered**:
- Heroicons / lucide-react（SVG アイコンライブラリ）→ 依存追加・bundle 増加のためボツ
- インライン SVG → コード量が増えシンプルさを損なうためボツ
- CSS アイコンフォント（FontAwesome 等）→ ネットワーク依存でオフライン PWA に不適のためボツ

---

### 3. 既実装済み項目の確認

**Decision**: FR-011（結果画面の優勝者 🏆 アイコン）は実装済み

**Findings**:
- `ResultScreen.tsx` の rankings ループ内に `{isWinner && <span className="text-xl">🏆</span>}` が存在（既実装）
- 新規実装不要。tasks でこの項目はスキップ可。

---

### 4. バースト・脱落トーストのアイコン対応方法

**Decision**: i18n 文字列内に絵文字を含める

**Rationale**:
- `Toast` コンポーネントはメッセージ文字列をそのまま表示する汎用コンポーネント
- メッセージ文字列（`game.bustMessage`, `game.eliminatedMessage`）の先頭に絵文字を追加するだけで対応可能
- Toast コンポーネント自体の変更不要

---

### 5. 残りスコア強調の閾値確認

**Decision**: `50 - player.score <= 12` の場合に強調

**Findings**:
- `Player.score` は `0〜50` の範囲（`applyBustRule` がそれを保証）
- バースト後は `score = 25`（`50 - 25 = 25 > 12`）→ 強調解除 ✓
- 脱落プレイヤーは `isEliminated` フラグで除外 ✓
- 勝利プレイヤーは `status === 'winner'`（score = 50, remaining = 0）→ ゲーム終了するため強調表示は不要

---

### 6. i18n 追加キー

**Decision**: `game.throwCount: (n: number) => string` を追加

**Rationale**:
- ja: `${n}投目`（固定サフィックス）
- en: `${ordinal(n)} throw`（既存 `ordinal()` 関数を再利用可）
- 関数型にすることで `rankSuffix` と一貫した設計

**Alternatives considered**:
- プレースホルダー文字列 `"{n}投目"` → `.replace('{n}', ...)` で実装可能だが en では序数が必要なため関数型が適切
