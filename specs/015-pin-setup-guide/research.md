# Research: 初期ピン配置ガイド

**Branch**: `015-pin-setup-guide` | **Date**: 2026-03-03

---

## 調査結果

### Decision 1: モーダルの実装パターン

**Decision**: `InstallHelpModal` パターンを踏襲し、新規 `PinSetupGuideModal` を作成する

**Rationale**: 配置ガイドは情報表示専用（read-only）であり、`ConfirmDialog`（confirm/cancel の決定を求めるダイアログ）ではなく `InstallHelpModal`（情報提示＋閉じるボタンのみ）が意味的に正しい。`InstallHelpModal` の実装:
- `fixed inset-0 z-50 bg-black/40` バックドロップ
- `max-h-[80dvh] overflow-y-auto` スクロール可能コンテンツ
- ヘッダー: タイトル＋✕閉じるボタン
- `onClose` プロパティのみ

**Alternatives considered**:
- `ConfirmDialog` の流用 → 却下（confirm/cancel 2ボタン構造が不要、意味的に不適切）
- 新規抽象 `Modal` 基底コンポーネント → 却下（YAGNI: 現時点で必要なモーダルは2種類のみで抽象化する価値なし）

---

### Decision 2: ScreenHeader へのボタン追加方法

**Decision**: `ScreenHeader` の既存 `rightContent?: React.ReactNode` prop スロットに渡す形で実装する。`ScreenHeader.tsx` 本体は変更しない。

**Rationale**: `ScreenHeader` はすでに `rightContent` 拡張ポイントを持っており（現状 `GameScreen`・`MolkkoutScreen` ともに未使用）、呼び出し側から `<button>` を渡すだけでよい。`ScreenHeader` のシグネチャ変更なし。

**Alternatives considered**:
- `ScreenHeader` に `onPinGuide?: () => void` prop を追加 → 却下（既存 `rightContent` スロットで十分。新 prop は過剰）
- ゲーム画面内にフローティングボタンを配置 → 却下（ヘッダー統合の方が視覚的一貫性が高い）

---

### Decision 3: i18n キーの namespace

**Decision**: `pinGuide` という新規トップレベル namespace を `ja.ts` に追加する

**Rationale**: 配置ガイドは通常ゲームと Mölkkout の両方で使用する共通機能であり、`game` / `molkkout` どちらにも属さない。既存の `molkkout.pinSetupGuide` キー（単一文字列）は Mölkkout セットアップ画面の簡易注記用であり、今回のモーダル用に別途 namespace を設ける。

**Alternatives considered**:
- `game` namespace に追加 → 却下（Mölkkout でも使用するため不適切）
- `molkkout` namespace に追加 → 却下（通常ゲームでも使用するため不適切）
- `common` namespace に追加 → 却下（`common` は汎用ラベル用であり、ドメイン固有のコンテンツには不向き）

---

### Decision 4: 配置図のレンダリング方法

**Decision**: 静的 JSX（テキストベースのビジュアル）で配置図を表現する。画像ファイルなし。

**Rationale**: A-002（spec の前提）に沿い、シンプルさ優先原則（Constitution I）に適合する。`MOLKKOUT_PINS` 定数（`src/types/game.ts:73`）は型参照のみに活用し、表示は静的に記述する。

**Alternatives considered**:
- SVG 動的生成 → 却下（過剰。静的表示で十分）
- Canvas/WebGL → 却下（不要な依存と複雑さ）
- 画像ファイル（PNG/SVG） → 却下（A-002 で明示的に除外）

---

### Decision 5: state 管理の場所

**Decision**: `showPinGuide: boolean` state は各ゲーム画面コンポーネント（`GameScreen/index.tsx`、`MolkkoutScreen/index.tsx`）のローカル `useState` で管理する。

**Rationale**: モーダルの表示状態はゲームロジック（GameContext/reducer）と無関係な純粋な UI 状態。既存の `showEarlySettlementConfirm` と同じパターン。Context/reducer への追加は不要（Constitution I: YAGNI）。

---

## 既存コードの再利用サマリー

| 既存資産 | 再利用方法 |
|---|---|
| `ScreenHeader.rightContent` | ガイドボタンを挿入するスロット（変更なし） |
| `InstallHelpModal` | モーダルの実装パターン（コピーして `PinSetupGuideModal` を作成） |
| `MOLKKOUT_PINS` 定数 | Mölkkout の5ピン順序（型参照） |
| `ConfirmDialog` の Escape キー処理 | `useEffect` で Escape → `onClose()` のパターンを踏襲 |
| 既存 `molkkout.pinSetupGuide` キー | 今後 `pinGuide.molkkout.pinOrder` に置き換え（後方互換性確認要） |
