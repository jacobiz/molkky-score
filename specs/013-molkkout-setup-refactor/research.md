# Research: 013-molkkout-setup-refactor

**生成日**: 2026-03-02
**ステータス**: 完了（NEEDS CLARIFICATION なし）

---

## 1. 投球カウンター — playerNames 廃止後のモデル

**Decision**: `currentPlayerInTeamIndex` + `throwsPerPlayer` を廃止し、
ユーザー指定の `totalThrows`（1〜10）と単純な `currentThrowIndex`（0 始まり）に置き換える。

**Rationale**:
- プレイヤー名を収集しなくなったため、チームサイズ由来の `throwsPerPlayer` 計算が不要。
- `currentThrowIndex >= totalThrows` → チーム切替、という単純なロジックに収束。
- オーバータイムも同じ `totalThrows` でラウンドを繰り返す（現行実装の動作を維持）。

**Alternatives considered**:
- プレイヤー数から `throwsPerPlayer` を保持し続ける → YAGNI・プレイヤー情報が消えると意味をなさないため却下。

---

## 2. Undo データモデル

**Decision**: `MolkkoutTurn` に `teamIndex`, `throwIndex`, `prevStatus` を追加し、O(1) undo を実現。

**Rationale**:
- 通常ゲームの `playerSnapshotBefore` パターンに倣い、undo に必要な情報をターン記録に埋め込む。
- undo 時: `currentTeamIndex ← turn.teamIndex`, `currentThrowIndex ← turn.throwIndex`, `status ← turn.prevStatus`, `team.totalScore -= turn.points`。
- チーム境界をまたぐ Undo（チームBの1投目 → チームAの最終投球に戻る）が自然に実現できる。

**Alternatives considered**:
- ターン履歴全体から再計算 → オーバータイム跨ぎで複雑化するため却下。
- 状態スナップショット全体を保存 → メモリ効率が悪いため却下。

---

## 3. SCHEMA_VERSION バンプ

**Decision**: `SCHEMA_VERSION` を `2 → 3` に変更し、ストレージキーは `molkky-score-v2` のまま。

**Rationale**:
- `MolkkoutGame` の shape が大幅に変わるため（`playerNames`, `throwsPerPlayer`, `currentPlayerInTeamIndex` 削除）、バージョン 2 のデータをそのままロードするとランタイムクラッシュが発生する。
- 既存の `isValidStoredState` は `v.version !== SCHEMA_VERSION` でバージョン不一致を検出し `null` を返す → ユーザーはホーム画面に遷移（仕様 FR-009 の要件を既存ロジックで満たす）。
- バンプにより正規ゲームデータも失われるが、これは仕様で許容（"旧データは破棄し、ホームへ戻す"）。

**Alternatives considered**:
- `molkkoutGame` のみ個別バリデーション → 実装複雑度が上がりシンプルさ原則に反するため却下。
- ストレージキーを `molkky-score-v3` に変更 → 不要（バージョンフィールドで十分）。

---

## 4. 投球進捗の表示フォーマット

**Decision**: `throwProgress: (current: number, total: number) => string` 型の i18n 関数キーを追加。

| 言語 | フォーマット |
|------|-------------|
| ja   | `(c, t) => \`${t}投中${c}投目\`` |
| en   | `(c, t) => \`Throw ${c} of ${t}\`` |
| fi   | `(c, t) => \`Heitto ${c}/${t}\`` |

**Rationale**: FR-006 の例「4投中2投目」に直接対応。`throwCount` (通常ゲーム) との重複を避けるため `molkkout` 名前空間に新設。

---

## 5. オーバータイム中の Undo

**Decision**: オーバータイム中も通常ラウンドと同じ Undo ロジックを使用。

**Rationale**: `MolkkoutTurn.prevStatus` が `'active'` または `'overtime'` を持つため、undo で適切に状態を復元できる。undo の Disabled 条件は `turns.length === 0` のみ。

---

## 6. ステッパー UI コンポーネント

**Decision**: `MolkkoutSetupScreen` 内にインライン実装（`ui/` への抽出なし）。

**Rationale**:
- アプリ全体でこのステッパーを使う箇所は 1 箇所のみ → コンスティテューション「1回限りの操作に抽象化を作らない」に従う。
- +/− ボタンで `totalThrows` ステートを更新し、範囲（1〜10）をボタンの `disabled` 属性で自然に強制する。

---

## 7. Toast バリデーション統合

**Decision**: `MolkkoutSetupScreen` に `<Toast>` を import し、エラー時に `toast` ステートをセット、`onClose` で `null` に戻す。

**Rationale**: 既存の `<Toast>` コンポーネント（`src/components/ui/Toast.tsx`）が `message`, `duration`, `onClose` を受け取るシンプルな実装であり、追加の依存なしで再利用可能。現行の inline `<p className="text-red-500">` パターンを置き換える。
