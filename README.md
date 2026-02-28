# Mölkky スコア管理アプリ

モルック（Mölkky）のスコアをリアルタイムで追跡・管理するモバイルファースト PWA です。
屋外でのプレイ中にスマートフォン1台を囲んで使用することを想定して設計されています。

## 機能

- **スコア入力**: 倒した本数と（1本の場合）ピン番号をタップで入力
- **ルール自動判定**: バースト（50超→25点リセット）・3回連続ミスで脱落・50点ちょうどで勝利
- **やり直し（アンドゥ）**: 直前のターンを取り消してスコアと状態を完全復元
- **Mölkkout（タイブレーカー）モード**: 5本ピン（6-4-12-10-8）を使ったチーム対抗タイブレーカー
- **結果シェア**: ゲーム結果をテキストでシェアまたはクリップボードにコピー
- **オフライン対応**: PWA としてインストール可能、ネットワークなしで動作
- **状態の永続化**: ページリロード後もゲームを再開できる
- **日英対応**: UI を日本語・英語で切り替え可能

## 対応人数

- 通常ゲーム: 2〜12人
- Mölkkout: 2〜6チーム（各チーム1〜5人）

## 技術スタック

| カテゴリ | 採用技術 |
|---------|---------|
| フレームワーク | React 19 + TypeScript 5.7（strict） |
| スタイリング | TailwindCSS v4（`@tailwindcss/vite`） |
| ビルド | Vite 6.1 |
| PWA | vite-plugin-pwa 0.21 |
| 状態管理 | React Context + `useReducer`（外部ライブラリなし） |
| 永続化 | `localStorage` |
| テスト | Vitest + @testing-library/react |

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build

# ビルド結果のプレビュー（PWA オフライン確認用）
npm run preview

# TypeScript 型チェック
npx tsc --noEmit
```

## プロジェクト構成

```
src/
├── components/
│   ├── GameScreen/       # ゲーム画面（スコアボード + ピン入力）
│   ├── MolkkoutScreen/   # Mölkkout 画面
│   ├── ui/               # Toast, ConfirmDialog 等の共通 UI
│   ├── HomeScreen.tsx
│   ├── SetupScreen.tsx
│   ├── MolkkoutSetupScreen.tsx
│   └── ResultScreen.tsx
├── context/
│   └── GameContext.tsx   # グローバル状態管理
├── reducers/
│   └── gameReducer.ts    # 全アクションの処理
├── types/
│   └── game.ts           # TypeScript 型定義
├── utils/
│   ├── scoring.ts        # スコア計算ピュア関数
│   ├── storage.ts        # localStorage 永続化
│   ├── i18n.ts           # 言語切り替えフック
│   └── share.ts          # 結果シェア
└── i18n/
    ├── ja.ts             # 日本語文字列
    └── en.ts             # 英語文字列
tests/
└── unit/
    ├── scoring.test.ts
    └── gameReducer.test.ts
```

## モルックのルール

モルックは、木製のピン（スキットル）を倒して点数を競うフィンランド発祥のアウトドアゲームです。

- **1本倒した場合**: そのピンに書かれた数字が得点
- **2本以上倒した場合**: 倒した本数が得点
- **50点ちょうど**: 即座に勝利
- **50点超え（バースト）**: スコアが25点にリセット
- **3回連続ミス（0本）**: 脱落

詳細なルールは [`docs/molkky-rules.md`](docs/molkky-rules.md) を参照してください。
