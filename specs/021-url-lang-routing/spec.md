# Feature Specification: URLベースの言語ルーティング

**Feature Branch**: `021-url-lang-routing`
**Created**: 2026-03-07
**Status**: Draft
**Input**: User description: "URLベースの言語ルーティング機能を"

## Clarifications

### Session 2026-03-07

- Q: 日本語（デフォルト）選択時、URL に `?lang=ja` を付けるか省略するか → A: 省略（クリーン URL）
- Q: hreflang タグの管理方法 → A: index.html の静的タグを更新するのみ（JS による動的注入は不要）
- Q: PWA インストール済み起動時の言語決定方法 → A: localStorage の保存値を使用（URL パラメータがなければ既存挙動のまま）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - URL パラメータで言語を指定してアクセス (Priority: P1)

英語圏またはフィンランド語圏のユーザーが、言語付き URL（例: `?lang=en`）を受け取り、アプリを開くとその言語で表示される。SNS やメッセージでリンクを共有したり、Google 検索結果から遷移した場合に、受け取った言語のまま利用できる。

**Why this priority**: 国際ユーザーが言語を手動で切り替える手間を省く最重要ユースケース。SEO 改善の直接的な効果もある。

**Independent Test**: `?lang=en` 付き URL を開くとアプリが英語で起動することを確認するだけで価値が検証できる。

**Acceptance Scenarios**:

1. **Given** `https://jacobiz.github.io/molkky-score/?lang=en` を開いた状態で、**When** アプリが起動したとき、**Then** UIが英語で表示される
2. **Given** `https://jacobiz.github.io/molkky-score/?lang=fi` を開いた状態で、**When** アプリが起動したとき、**Then** UIがフィンランド語で表示される
3. **Given** `https://jacobiz.github.io/molkky-score/?lang=ja` を開いた状態で、**When** アプリが起動したとき、**Then** UIが日本語で表示される
4. **Given** 無効な lang 値（例: `?lang=zh`）を持つ URL を開いた状態で、**When** アプリが起動したとき、**Then** ブラウザのデフォルト言語検出にフォールバックする

---

### User Story 2 - 言語切替時に URL が更新される (Priority: P2)

アプリ内の言語セレクターで言語を切り替えると、ブラウザの URL が自動的に更新される（例: `?lang=fi` が付与される）。更新後の URL をコピーして他のユーザーに共有すると、同じ言語で開ける。日本語（デフォルト）に切り替えた場合は `?lang` パラメータが除去されたクリーン URL になる。

**Why this priority**: P1 の URL 読み取りと合わせて、共有フローを完結させる。言語付き URL が実際に生成されないと、SEO 効果も限定的になる。

**Independent Test**: 言語セレクターで英語に切り替えた後、アドレスバーに `?lang=en` が付いていることを確認できる。

**Acceptance Scenarios**:

1. **Given** アプリを開いている状態で、**When** 言語セレクターで英語を選択したとき、**Then** URL が `?lang=en` を含むよう更新される（ページリロードなし）
2. **Given** URL が `?lang=en` の状態で、**When** その URL を別のブラウザで開いたとき、**Then** 英語で表示される
3. **Given** 非日本語が選択されている状態で、**When** 日本語に切り替えたとき、**Then** `?lang` パラメータが URL から除去され、クリーン URL になる

---

### User Story 3 - hreflang リンクの動的反映 (Priority: P3)

Google などの検索エンジンが各言語版の URL を正確に把握できるよう、ページ内の `hreflang` タグが言語別 URL（`?lang=en` など）を参照する。

**Why this priority**: SEO 上の長期的メリット。P1・P2 が揃ってから効果を発揮するため P3。

**Independent Test**: ページの head タグに `hreflang="en"` が `?lang=en` 付き URL を参照していることを確認できる。

**Acceptance Scenarios**:

1. **Given** アプリを開いた状態で、**When** ページの head タグを確認したとき、**Then** `hreflang="en"` が `?lang=en` 付き URL を参照している
2. **Given** アプリを開いた状態で、**When** ページの head タグを確認したとき、**Then** `hreflang="fi"` が `?lang=fi` 付き URL を参照している
3. **Given** アプリを開いた状態で、**When** ページの head タグを確認したとき、**Then** `hreflang="ja"` および `hreflang="x-default"` はパラメータなしのクリーン URL を参照している

---

### Edge Cases

- `?lang=` が空値の場合、ブラウザ言語検出にフォールバックする
- URL に複数の `lang` パラメータがある場合、最初の値を使用する
- `localStorage` に保存された言語設定と URL パラメータが異なる場合、URL パラメータを優先する
- 既存のゲーム中に別タブで言語付き URL を開いた場合、そのタブのみ指定言語で表示される（他タブに影響しない）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: アプリは URL クエリパラメータ `lang` を読み取り、サポートされた値（`ja`・`en`・`fi`）であれば起動時の表示言語として適用しなければならない
- **FR-002**: `lang` パラメータが不正値または欠落している場合、既存のブラウザ言語検出ロジックにフォールバックしなければならない
- **FR-003**: ユーザーが言語セレクターで言語を切り替えたとき、URL クエリパラメータをページリロードなしに更新しなければならない。日本語（デフォルト言語）を選択した場合は `?lang` パラメータを URL から除去してクリーン URL とする
- **FR-004**: URL パラメータの言語設定は `localStorage` に保存された言語設定より優先されなければならない
- **FR-005**: `index.html` の静的 `hreflang` タグを更新し、英語・フィンランド語は `?lang=XX` 付き URL を、日本語・x-default はパラメータなしのクリーン URL を参照しなければならない（JS による動的生成は行わない）
- **FR-006**: 言語パラメータを含む URL を共有・ブックマークしたとき、受け取ったユーザーが同じ言語でアプリを開けなければならない

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `?lang=en` または `?lang=fi` 付き URL を開いたユーザーが、言語セレクターを操作することなく目的の言語でアプリを利用できる
- **SC-002**: 言語切替後に生成される URL を別のデバイスで開いたとき、同じ言語で表示される（共有リンクの再現性 100%）
- **SC-003**: Google Search Console 上で en・fi の言語バリアントが認識され、インデックスに追加される（hreflang の正常動作）
- **SC-004**: 既存の言語切替機能（言語セレクター）が URL ルーティング導入後も従来通り動作し、既存ユーザーの操作に影響を与えない

## Assumptions

- URL パラメータ方式（`?lang=en`）を採用する。GitHub Pages の静的ホスティング環境ではパスベースルーティング（`/en/`）はサーバー設定変更が必要なため対象外とする
- `localStorage` への言語保存は引き続き行い、URL パラメータがない場合（PWA 起動時を含む）のフォールバックとして機能させる
- 日本語はデフォルト言語のため、`?lang=ja` は不要。日本語選択時は URL パラメータを除去してクリーン URL とする
- サポート言語は現行の `ja`・`en`・`fi` の3言語のみ
- ブラウザ履歴を汚さないよう `history.replaceState` 相当の手法で URL を更新する（ブラウザの「戻る」挙動に影響させない）
