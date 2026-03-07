# Research: URLベースの言語ルーティング

## Decision 1: URL パラメータの読み取り API

**Decision**: `URLSearchParams` + `window.location.search` を使用する

**Rationale**: ブラウザネイティブ API。外部ライブラリ不要で IE11 も含む全モダンブラウザ対応。TypeScript での型サポートも標準で提供される。

**Alternatives considered**:
- 手動文字列パース: エラーが起きやすく不要
- `URL` コンストラクタ: `URLSearchParams` と等価だが冗長

## Decision 2: URL パラメータの更新方法

**Decision**: `history.replaceState(null, '', newUrl)` を使用する

**Rationale**: ページリロードなしに URL を更新でき、ブラウザの「戻る」スタックに積まれない（`pushState` と異なる）。FR-003 の「ページリロードなし」かつ「ブラウザ履歴を汚さない」要件に合致。

**Alternatives considered**:
- `history.pushState`: 戻るボタンで不要な遷移が発生するため不採用
- React Router: 本プロジェクトは React Router を使用しておらず、導入はオーバーエンジニアリング

## Decision 3: 言語読み取りロジックの配置

**Decision**: 既存の `src/utils/i18n.ts` に `getLangFromUrl()` 関数を追加する

**Rationale**: 言語関連ユーティリティは既に `i18n.ts` に集約されており（`detectLocale()` が存在）、同ファイルへの追加が最もシンプル。ユニットテストも書きやすい。

**Alternatives considered**:
- 新規ファイル `urlLang.ts`: 小さな関数1つのためにファイル分割は不要（YAGNI）
- `GameContext.tsx` 内に直接記述: テスト不可能になるため不採用

## Decision 4: URL 更新のトリガー

**Decision**: `GameContext.tsx` の `useEffect` で `state.settings.language` の変化を監視して URL を更新する

**Rationale**: 言語変更がどこで発生しても（現在は `HomeScreen.tsx` のみだが）URL が確実に同期される。`LanguageSelector` の `onSelect` に直接書くより関心が分離される。

**Alternatives considered**:
- `HomeScreen.tsx` の `onSelect` コールバック内で更新: 言語変更箇所が増えた場合に漏れるリスクがある
- Reducer 内で副作用として更新: Reducer は純粋関数であるべきなので不採用

## Decision 5: 初期化時の優先順位

**Decision**: URL パラメータ → localStorage → ブラウザ言語検出 の順で言語を決定する

**Rationale**: 仕様（FR-004）に準拠。URL パラメータが最優先なので共有リンクの言語が確実に適用される。localStorage はPWA起動時のフォールバックとして機能する（Clarification Q3 の決定）。

## Decision 6: hreflang タグの更新

**Decision**: `index.html` の既存 hreflang タグ href 属性を `?lang=en` / `?lang=fi` 付き URL に静的更新する

**Rationale**: Clarification Q2 で確定。Google は静的 HTML を優先してインデックスするため、JS 動的注入より確実。

**Alternatives considered**:
- JS による動的 `<link>` 注入: 不要な複雑さ、シンプルさ優先原則に反する
