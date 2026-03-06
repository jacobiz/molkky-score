# Research: スコアシート印刷機能

**Feature**: 018-scoresheet-print
**Date**: 2026-03-06

---

## Decision 1: 印刷トリガー方法

**Decision**: `window.print()` を使用する（ブラウザ標準印刷ダイアログ）

**Rationale**: Constitution 原則 I「シンプルさ優先」に従い、外部ライブラリを使わない最小実装。
`window.print()` はすべてのモダンブラウザ（iOS Safari・Android Chrome 含む）でサポートされており、PWA としても正常動作する。

**Alternatives considered**:
- `html2canvas` + `jsPDF`: 高品質な PDF 生成が可能だが、依存関係追加が Constitution I 違反。スコープ外。
- 新しい印刷ウィンドウ（`window.open()` + print）: 複雑すぎる。不要。

---

## Decision 2: 印刷時のモーダル表示方法（CSS戦略）

**Decision**: CSS `visibility` トリックを `@media print` で実装する。`src/index.css` に以下を追加:

```css
@media print {
  body * { visibility: hidden; }
  .scoresheet-print-area,
  .scoresheet-print-area * { visibility: visible; }
  .scoresheet-print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}
```

`ScoreSheetModal` の印刷対象コンテナ（モーダル本体 div）に `scoresheet-print-area` クラスを追加する。

**Rationale**: `display: none` ではなく `visibility: hidden` を使う理由は、`visibility` がレイアウトを保持するため、`position: absolute` で配置し直した `.scoresheet-print-area` が正しく表示されるため。モーダルの外（背景・他画面要素）は全て非表示になる。

`@page` ルールで A4 横向きのページサイズヒントも追加:
```css
@page { size: A4 landscape; margin: 1cm; }
```

**Alternatives considered**:
- Tailwind `print:hidden` / `print:block` バリアント: スコープが個々の要素に限られ、モーダル外の全要素を一括非表示にするのに冗長になる。全要素に `print:hidden` を追加するより、グローバル CSS 1 ルールの方がシンプル。
- `@media print { body > * { display: none } }`: `display: none` は `visibility` より挙動が不安定な場合がある（特に Safari）。

---

## Decision 3: 複数ページ時のテーブルヘッダー繰り返し

**Decision**: CSS `thead { display: table-header-group; }` ブラウザ標準動作に依存する。追加実装不要。

**Rationale**: HTML の `<thead>` 要素はブラウザが印刷時に自動的に各ページで繰り返す（CSS 仕様の `display: table-header-group` の標準動作）。既存の `ScoreSheetModal` はすでに `<thead>` を使用しているため、追加実装は不要。

---

## Decision 4: 横幅超過時の自動縮小

**Decision**: `@media print` に `table { width: 100%; } .scoresheet-print-area { width: 100%; }` を追加し、ブラウザの「用紙に合わせて縮小」設定に委ねる。

**Rationale**: ほぼすべてのブラウザ印刷ダイアログには「縮小して用紙に合わせる」オプションがデフォルトで有効になっている。CSS 側では `overflow: hidden` を解除して全コンテンツが表示されるようにするだけで十分。アプリ側で強制縮小（`transform: scale()`）は不要。

---

## Decision 5: ResultScreen からの印刷フロー

**Decision**: ResultScreen に `showScoreSheet: boolean` state を追加し、`ScoreSheetModal` を `loadHistory()[0]`（最新保存レコード）で開く。

**Rationale**: ゲーム終了時に `GameContext` が自動で `addRecord()` を呼ぶため（`active → finished` 遷移検知）、ResultScreen が表示された時点で最新レコードが localStorage に保存済み。`buildHistoryRecord(game)` を再度呼ぶより、保存済みレコードを使う方が履歴との整合性が取れる。

`loadHistory()` は既存のユーティリティ関数で利用可能。

**Edge case**: `loadHistory()` が空配列を返す場合（localStorage 無効・プライベートモード）は、ボタンを非表示にする。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/index.css` | `@media print` ルールを追加 |
| `src/components/ui/ScoreSheetModal.tsx` | 印刷ボタン追加、`scoresheet-print-area` クラス追加 |
| `src/components/ResultScreen.tsx` | `ScoreSheetModal` state + スコアシートボタン追加 |
| `src/i18n/ja.ts` | 印刷関連 i18n キー追加 |
| `src/i18n/en.ts` | 同上 |
| `src/i18n/fi.ts` | 同上 |

**非影響範囲**:
- `src/types/` — データモデル変更なし
- `src/utils/historyStorage.ts` — 変更なし
- `src/components/HistoryScreen.tsx` — ScoreSheetModal の呼び出し元として変更なし（印刷ボタンは ScoreSheetModal 内に追加されるため自動的に利用可能）
- `src/reducers/gameReducer.ts` — 変更なし
