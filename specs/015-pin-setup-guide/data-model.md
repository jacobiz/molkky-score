# Data Model: 初期ピン配置ガイド

**Branch**: `015-pin-setup-guide` | **Date**: 2026-03-03

---

## 概要

このフィーチャーは永続データを持たない純粋な UI 表示機能。新規エンティティや GameState の変更はなし。
コンポーネント Props とi18n キー構造のみ記載する。

---

## コンポーネント Props

### `PinSetupGuideModal` (新規)

```ts
interface PinSetupGuideModalProps {
  mode: 'regular' | 'molkkout'  // 表示する配置図の種別
  onClose: () => void            // モーダルを閉じる
}
```

**制約**:
- `mode` は必須。呼び出し側が GameScreen/MolkkoutScreen で静的に決定する
- `onClose` は必須

---

## i18n キー構造

`src/i18n/ja.ts` に追加する `pinGuide` namespace:

```ts
pinGuide: {
  title: 'ピン配置ガイド',
  closeButton: '閉じる',
  buttonAriaLabel: 'ピン配置ガイドを開く',
  regular: {
    heading: '通常ゲーム（12ピン）',
    layoutCaption: '配置図（スロワー側から）',
    distanceLabel: '投球ラインから最前列まで: 3.5m',
  },
  molkkout: {
    heading: 'Mölkkout（5ピン）',
    layoutCaption: '配置図（左から）',
    distanceLabel: '投球ラインから先頭ピンまで: 3.5m',
    spacingLabel: 'ピン間隔: Mölkky スティック1本分',
    resetNote: '倒れたピンは元の位置に戻す',
  },
}
```

`en.ts` / `fi.ts` は `import type { Messages }` で同構造を実装する（TypeScript が欠落を型エラーとして検出）。

---

## 配置図データ

### 通常ゲーム: 三角配置（静的 JSX）

```
スロワー側から見た図:

         [7] [9] [8]          Row 4（後列）
       [5] [11][12] [6]       Row 3
          [3] [10] [4]        Row 2
             [1] [2]          Row 1（前列）

         ─────────────        投球ライン（3.5m 前方）
              スロワー
```

各ピンは `<span>` または `<div>` で番号を表示（スタイルは既存のカラーパレットに従う）。

### Mölkkout: 直線配置（静的 JSX）

```
スロワー側から見た図:

  [6] ─ [4] ─ [12] ─ [10] ─ [8]
   ↑
 3.5m

ピン間隔: ─── = Mölkky スティック1本分
```

ピン順序の参照: `MOLKKOUT_PINS = [6, 4, 12, 10, 8] as const`（`src/types/game.ts:73`）

---

## 既存の Messages 型への影響

`ja.ts` の `export type Messages = typeof ja` により、`pinGuide` namespace の追加後は `en.ts` / `fi.ts` が同構造を実装しなければ TypeScript コンパイルエラーとなる。これは意図した型安全性の確保。

既存の `molkkout.pinSetupGuide` キー（`ja.ts:59`）は Mölkkout セットアップ画面の簡易注記として残存しており、今回の `pinGuide` namespace とは独立。変更・削除しない。
