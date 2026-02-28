# Research: 得点直接入力（1タップスコア入力）

**Branch**: `002-direct-score-input` | **Date**: 2026-02-28

---

## 変更スコープ調査

### Decision: `calculatePoints` 関数の扱い

- **Decision**: `calculatePoints` を `scoring.ts` から削除する
- **Rationale**: 新方式では UI 側が直接得点を受け取るため、「本数 + ピン番号 → 得点」の変換ロジックが不要になる。`applyBustRule`・`checkWin`・`incrementMisses` は引き続き使用する。
- **Alternatives considered**: 関数を残して deprecated コメントを付ける → YAGNI 原則違反。使われないコードは削除する。

### Decision: `Turn` / `MolkkoutTurn` 型の変更方針

- **Decision**: `pinsKnockedDown` と `pinNumber` フィールドを両型から完全削除
- **Rationale**: clarification Q1 で確定。スキーマのシンプルさを優先。
- **Alternatives considered**: optional フィールドとして残す → 型の意図が曖昧になり他の開発者が混乱する。

### Decision: localStorage バージョン管理

- **Decision**: ストレージキーを `molkky-score-v1` → `molkky-score-v2`、SCHEMA_VERSION を 2 に更新
- **Rationale**: `Turn` 型の構造変更により旧データとの互換性がない。バージョン不一致でストレージをクリアする既存ロジックを活用し、アプリが旧データを読んで型エラーになるリスクを防ぐ。
- **Alternatives considered**: マイグレーション処理を書く → ゲーム中のセーブデータが失われても影響が小さい（短時間ゲーム）ため不要。

### Decision: `GameAction.RECORD_TURN` の型変更

- **Decision**: `{ pinsKnockedDown, pinNumber }` を削除し `{ points: number }` に変更
- **Rationale**: UI が直接得点を算出して渡すため、reducer 内での `calculatePoints` 呼び出しが不要になる。`isMiss` 判定は `points === 0` で代替可能。
- **Alternatives considered**: `pinsKnockedDown` を残して reducer 側で計算する → 変更目的（UI 簡素化）と矛盾。

### Decision: `PinInput` UI レイアウト

- **Decision**: 0 を全幅赤ボタン（上段）、1〜12 を 4列×3行グリッド（下段）とする
- **Rationale**:
  - 0（ミス）は誤タップリスクが高いため全幅で視覚的に区別（FR-006 準拠）
  - 1〜12 の 12ボタンは 4×3 が最もバランスが良く、モバイル縦持ちで親指が届く範囲に収まる
  - ユーザー注意事項「ボタンサイズのバランスに注意」に対応し、1〜12 ボタンは正方形に近いアスペクト比で均一サイズを確保する
  - 最小タップターゲット 44×44px（Constitution 原則 III）を維持
- **Alternatives considered**:
  - 0〜12 を均等グリッド → 0 の特別扱いができず誤タップリスク増
  - 縦スクロールリスト → タップ操作が遅くなる

### Decision: `MolkkoutInput` の UI

- **Decision**: clarification Q2 確定通り、通常ゲームの PinInput と同じ 0〜12 の 13ボタン構成
- **Rationale**: UI 統一・実装コスト最小。Mölkkout で理論上取得できない得点（1・2・3・5・7・9・11）も誤入力はアンドゥで対処可能。

### Decision: `GameScreen/index.tsx` のバスト通知ロジック

- **Decision**: `applyBustRule(player.score, points)` を直接使ってバスト判定し通知する（現行と変わらず）
- **Rationale**: `calculatePoints` 削除後も `points` は action から直接得られるため、通知ロジックの変更範囲は最小。
