# Research: 得点入力エリア拡大・プレイヤー上限10人対応

**Feature**: 007-layout-max-players
**Date**: 2026-03-01

---

## Decision 1: US1+US2 のレイアウト再設計方針

**Decision**: ScoreBoard エリアを `flex-none`（固定高さ）とし、PinInput エリアを `flex-1 min-h-0`（残余スペース獲得）に変更する。ScoreBoard ラッパーに `h-[272px]` を設定することで 4人分の高さを確保しつつ、5人以上の場合はラッパー内スクロールを許容する。

**Rationale**:
- 現在（006 後）のレイアウト: ScoreBoard エリア `flex-1`、PinInput `shrink-0`
  → PinInput は常に自然高さ（~272px）に固定されており、大きなボタンにできない
- 逆転させる: ScoreBoard エリアを固定（header 56px + wrapper 272px = **328px** 固定）、PinInput が残余スペースを獲得
  → 600px 端末: PinInput = 272px（現状維持）
  → 740px 端末: PinInput = 412px（140px 増）→ ボタン大幅拡大 ✓
  → 812px 端末: PinInput = 484px（212px 増）→ より大きく ✓

**ScoreBoard wrapper の固定高さ `h-[272px]` の導出**:
- 行高さ: `py-2`(16px) + 積み重ね score area (text-2xl 32px + text-sm 20px = 52px) = **68px/行**
- 4行 × 68px = **272px**
- これにより 4人以下: コンテンツ (4×68=272px) ≤ ラッパー (272px) → スクロールなし ✓
- 5人以上: コンテンツ (5×68=340px) > ラッパー (272px) → スクロールあり ✓ (FR-004)

**Alternatives considered**:
- `min-h-[272px]` のみ (flex-1 PinInput との組み合わせ): ScoreBoard と PinInput 両方 flex-1 にした場合の空間配分が複雑になる → rejected
- `flex-ratio (3:2)` 分割: 600px 端末で PinInput が現状より小さくなる → rejected
- JS による動的高さ計算: Principle I（シンプルさ）違反 → rejected
- `shrink-0` + `max-h-[272px]`: `h-[272px]` と等価（min-h = max-h = 固定高さ）→ 同じ結果

---

## Decision 2: PinInput の動的高さ拡大

**Decision**: PinInput の外側 div に `h-full` を復元し、グリッドコンテナに `flex-1 min-h-0` を付与することでボタンが利用可能な縦スペースを自動的に充填する。グリッドボタンの `py-2` を削除し、グリッド行高さをボタン高さとする。

**Rationale**:
- PinInput の親（wrapper）が `flex-1 min-h-0`（高さあり）になるため、`h-full` で親の高さを利用できる
- グリッド (`grid-rows-3 flex-1 min-h-0`) の行高さは `minmax(0, 1fr)` → 利用可能スペースを均等配分
- ボタンはグリッドセルを `align-items: stretch` (デフォルト) で充填する
- `py-2` 削除: ボタンがセル全体に広がるよう縦パディングを除去（`flex items-center justify-center` で数字はセル内中央配置）
- `min-h-[44px]` はタッチターゲット最小サイズの安全網として維持

**高さ計算（iPhone SE dvh ~619px）**:
- ScoreBoard area: 328px 固定
- PinInput area: 619 - 328 = 291px → h-full = 291px
- 固定要素: p-3×2(24) + label(24) + gap-2×2(16) + btn-0(~48px) = 112px
- グリッド高さ (flex-1): 291 - 112 = 179px
- 3行 × height + 2 × gap-2(8px): (179 - 16) / 3 ≈ **54px/ボタン**（現状 ~48px → +12%）

**高さ計算（一般的スマートフォン dvh ~740px）**:
- PinInput area: 740 - 328 = 412px
- グリッド高さ: 412 - 112 = 300px
- 各ボタン: (300 - 16) / 3 ≈ **95px/ボタン**（現状比 +98%）→ 大幅に大きく ✓

---

## Decision 3: デスクトップ（md:）レイアウト保持

**Decision**: ScoreBoard エリアに `md:flex-1 md:min-h-0 md:overflow-y-auto`、ScoreBoard ラッパーに `md:h-auto md:flex-1 md:min-h-0`、PinInput エリアに `md:flex-none md:w-80` を付与し、デスクトップ横並びレイアウトを完全に維持する。

**Rationale**:
- デスクトップ (md:flex-row) では ScoreBoard エリアが横方向 flex-1 → `md:flex-1` で override ✓
- ScoreBoard ラッパーは `md:h-auto md:flex-1` で高さ固定を解除し、エリア縦方向を充填 ✓
- PinInput エリアは `md:flex-none md:w-80` (320px 固定幅) を維持 ✓

---

## Decision 4: US3 プレイヤー上限の変更

**Decision**: `src/components/SetupScreen.tsx` の `players.length >= 6` を `players.length >= 10` に変更する。その他のファイルに変更は不要。

**Rationale**: 調査の結果、プレイヤー上限の強制箇所は SetupScreen.tsx の 1箇所のみ。gameReducer.ts・types/game.ts ともにプレイヤー数制限を持たず、任意の人数の Player[] をサポートする。

---

## Decision 5: テスト方針

**Decision**: レイアウト変更のため新規ユニットテストは不要。既存 27件のテスト（スコア計算・ゲームロジック）が引き続きパスすることで SC-006 を確認する。

**Rationale**: Principle II（主要機能のみテストファースト）に準拠。純粋な CSS クラス変更（US1/US2）と UI バリデーション値変更（US3）に対してユニットテストは過剰。

---

## Summary Table

| US | ファイル | 変更 |
|----|--------|------|
| US1+US2 | `GameScreen/index.tsx` | ScoreBoard area: `flex-1 min-h-0` → `flex-none`; wrapper: `flex-1 min-h-0 overflow-y-auto` → `h-[272px] overflow-y-auto md:h-auto md:flex-1 md:min-h-0`; PinInput area: `shrink-0` → `flex-1 min-h-0` |
| US1 | `GameScreen/PinInput.tsx` | 外側 div に `h-full` 追加; グリッドに `flex-1 min-h-0` 追加; グリッドボタンから `py-2` 削除 |
| US3 | `SetupScreen.tsx` | `>= 6` → `>= 10` |
