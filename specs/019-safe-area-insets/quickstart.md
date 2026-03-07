# Quickstart: Safe Area Insets 実装ガイド

## 概要

iPhoneのノッチ・Dynamic Island・ホームインジケーターにコンテンツが隠れないよう、CSSの `env(safe-area-inset-*)` を使って安全領域余白を適用する。

## 前提条件

- `index.html` に `viewport-fit=cover` が既に設定済み
- TailwindCSS v4 (`@tailwindcss/vite`) を使用

## 実装ステップ

### 1. `index.html` — ステータスバースタイル変更

```html
<!-- Before -->
<meta name="apple-mobile-web-app-status-bar-style" content="default" />

<!-- After -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### 2. `src/index.css` — カスタムユーティリティ追加

```css
@import "tailwindcss";

@utility safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
@utility safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@utility safe-x {
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

### 3. `ScreenHeader.tsx` — トップ安全領域

```tsx
// Before
<header className="bg-white border-b flex items-center gap-2 px-4 h-14 shrink-0">

// After: h-14 削除、items-end + pb-3 + safe-top で高さを可変に
<header className="bg-white border-b flex items-end gap-2 px-4 pb-3 shrink-0 safe-top">
```

`safe-top` により `padding-top = env(safe-area-inset-top, 0px)` が付与される。ヘッダー背景がステータスバー後ろまで延伸し、HIG 準拠のデザインになる。

### 4. `HomeScreen.tsx` — トップ＆ボトム安全領域

```tsx
// Before
<div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 px-6 py-12">

// After: py-12 を pt-12 + pb-12 に分解し、safe-top / safe-bottom を追加
<div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 px-6 pt-12 pb-12 safe-top safe-bottom">
```

### 5. `GameScreen/index.tsx` — ボトム安全領域

ピン入力エリアのコンテナ（`flex-1 min-h-0 flex flex-col bg-white border-t ...`）の末尾に `safe-bottom` を追加。

### 6. `MolkkoutScreen/index.tsx` — ボトム安全領域

入力エリアのコンテナに `safe-bottom` を追加（GameScreen と同じ対応）。

### 7. モーダルコンポーネント

`PinSetupGuideModal`・`ScoreSheetModal`・`InstallHelpModal` のスクロールコンテナに `safe-top safe-bottom` を追加。

## 動作確認方法

1. iOS Safari で開発サーバーに接続し、PWA としてホーム画面に追加
2. アプリを起動してフルスクリーン表示を確認
3. 各画面を遷移して、ヘッダーとボトムエリアがノッチ/ホームインジケーターと重ならないことを確認
4. 横向き表示で同様に確認

## 安全領域の値（参考）

| デバイス | top | bottom |
|---------|-----|--------|
| iPhone SE (ノッチなし) | 0px | 0px |
| iPhone 12/13/14 | 47px | 34px |
| iPhone 14 Pro (Dynamic Island) | 59px | 34px |
| iPhone 15 Pro Max | 59px | 34px |
