# Feature Specification: コードレビュー残課題の対処

**Feature Branch**: `012-fix-review-issues`
**Created**: 2026-03-02
**Status**: Draft
**Input**: User description: "残った問題に対処して"

## 背景

コードレビューで検出されたうち、即時修正（#1〜#3, #6, #7）は完了済み。本フィーチャーでは残る10件の問題を解消する。問題は大きく4つのカテゴリに分類される：(A) i18n 一貫性、(B) アクセシビリティ、(C) コード品質・保守性、(D) テストカバレッジ。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 全言語でUIテキストが正しく表示される (Priority: P1)

英語・フィンランド語を選択したユーザーが、アプリ内のすべての画面・ダイアログ・操作ボタンで適切な言語のテキストを確認できる。

現状の問題:
- LicensesScreen が `isJa` フラグのみで判定するため、Finnish ユーザーに英語テキストが表示される
- SetupScreen のプレイヤー順序変更・削除ボタンの aria-label が常に日本語
- MolkkoutSetupScreen のバリデーションエラーが常に日本語

**Why this priority**: 多言語対応はアプリの中核要件であり、翻訳が機能しないユーザー体験の問題はすべての該当言語ユーザーに影響する。

**Independent Test**: 言語を Finnish に切り替えてプレイヤー設定画面・ライセンス画面・Mölkkout設定画面を開くと、英語 / Finnish のテキストが正しく表示される。

**Acceptance Scenarios**:

1. **Given** 言語が Finnish に設定されている, **When** ライセンス画面を開く, **Then** タイトル・プライバシーポリシー・戻るボタンのラベルがすべて Finnish で表示される
2. **Given** 言語が English に設定されている, **When** SetupScreen でプレイヤー順序変更ボタンにフォーカスする, **Then** スクリーンリーダーが "Move up" / "Move down" / "Remove" と読み上げる
3. **Given** 言語が Finnish に設定されている, **When** MolkkoutSetupScreen でチーム名を空のまま送信する, **Then** バリデーションエラーが Finnish で表示される
4. **Given** 言語が Japanese に設定されている, **When** 上記のいずれかの操作を行う, **Then** 日本語テキストが引き続き正しく表示される

---

### User Story 2 - スクリーンリーダーユーザーがダイアログを正しく操作できる (Priority: P2)

スクリーンリーダーを使うユーザーが、確認ダイアログが表示された際にダイアログと認識され、適切にナビゲートできる。

**Why this priority**: アクセシビリティはアプリの品質基準。確認ダイアログへのフォーカス管理・役割アナウンスが欠如している。

**Independent Test**: VoiceOver / NVDA でゲーム画面から「ホームへ戻る」を押すと、ダイアログが "dialog" ロールとして認識され、メッセージが読み上げられる。

**Acceptance Scenarios**:

1. **Given** 確認ダイアログが表示されている, **When** スクリーンリーダーがフォーカスを受け取る, **Then** ダイアログとして認識され、メッセージが読み上げられる
2. **Given** 確認ダイアログが表示されている, **When** ダイアログ背景をクリックする, **Then** ダイアログが閉じる（キャンセル扱い）

---

### User Story 3 - SetupScreen の入力制限が一貫している (Priority: P2)

プレイヤー名の入力フィールドに12文字超を入力しようとすると、そもそも13文字目が入力できないため、エラーメッセージが出ない。

**Why this priority**: 現状では13文字まで入力して追加ボタンを押すと初めてエラーが表示されるという不一貫なUX。1行修正で解決できる。

**Independent Test**: SetupScreen でプレイヤー名を13文字入力しようとすると、12文字目で入力が止まる。

**Acceptance Scenarios**:

1. **Given** SetupScreen でプレイヤー名入力中, **When** 13文字目を入力しようとする, **Then** 入力が受け付けられず12文字で止まる
2. **Given** 12文字のプレイヤー名, **When** 「追加」を押す, **Then** エラーなく追加される

---

### User Story 4 - コードの重複が排除されメンテナンス性が向上する (Priority: P3)

開発者が PinInput / MolkkoutInput を変更する際に1箇所だけ修正すれば済む。また i18n の言語追加が容易になる。

**Why this priority**: ユーザー体験への直接影響はないが、将来の変更コストを削減し回帰バグを防止する。

**Independent Test**: PinInput と MolkkoutInput の共通ロジックを変更したとき、両画面で変更が反映される。

**Acceptance Scenarios**:

1. **Given** 共通入力コンポーネントが存在する, **When** ボタンラベルを変更する, **Then** 通常ゲーム・Mölkkout の両方に反映される
2. **Given** i18n.ts の言語選択ロジック, **When** 4つ目の言語を追加する, **Then** ネスト三項演算子を深くすることなく1エントリの追加で対応できる

---

### User Story 5 - localStorage データ破損時もアプリがクラッシュしない (Priority: P3)

ユーザーが localStorage を手動編集・ブラウザ拡張によって壊された状態でアプリを開いても、クラッシュせずにホーム画面から再開できる。

**Why this priority**: 実運用での信頼性。現状では壊れたデータが型アサーションで通過するとランタイムクラッシュする。

**Independent Test**: DevTools で `molkky-score-v2` の値を不正な JSON または欠損フィールドを含む JSON に変更してリロードすると、ホーム画面が正常表示される。

**Acceptance Scenarios**:

1. **Given** localStorage に `{"version":2, "game":"CORRUPT_STRING"}` が存在する, **When** アプリを開く, **Then** クラッシュせずホーム画面が表示される
2. **Given** localStorage に不正な JSON が存在する, **When** アプリを開く, **Then** データが削除されて初期状態から起動する

---

### User Story 6 - Mölkkout・storage・share のロジックがテストで保護される (Priority: P3)

開発者が Mölkkout のチームローテーション・overtime 遷移・storage のバリデーション・share のテキスト生成を変更した際に、回帰テストが検出する。

**Why this priority**: 現状ではこれらのロジックにテストが存在せず、変更時のバグ検出が手動テストに依存している。

**Independent Test**: `npm test` を実行すると Mölkkout / storage / share の主要なケースが自動検証される。

**Acceptance Scenarios**:

1. **Given** Mölkkout の overtime ロジックを変更する, **When** テストを実行する, **Then** 同点時の overtime 遷移・勝者決定が自動検証される
2. **Given** storage.ts の loadState を変更する, **When** テストを実行する, **Then** バージョン不一致・破損データの処理が自動検証される
3. **Given** share.ts の buildShareText を変更する, **When** テストを実行する, **Then** 脱落プレイヤー含む出力フォーマットが自動検証される

---

### Edge Cases

- handleMoveUp/Down のスワップ処理で境界値（先頭・末尾）を超えようとした場合
- Mölkkout で2回連続して同点になった場合（overtime → overtime）
- localStorage が存在するがフィールドが欠損している場合
- 言語キーが Messages 型に追加された際の全言語ファイルへの波及

## Requirements *(mandatory)*

### Functional Requirements

#### (A) i18n 一貫性

- **FR-001**: LicensesScreen は `useTranslation()` を使って全テキストを表示しなければならない（Finnish ユーザーへの英語フォールバックを排除）
- **FR-002**: `ja.ts` / `en.ts` / `fi.ts` に `licenses.*` キーを追加し、タイトル・戻るボタン・ライセンス全文表示・プライバシーポリシーのタイトルと本文を3言語で定義しなければならない
- **FR-003**: SetupScreen の「上へ」「下へ」「削除」aria-label を i18n キー（`setup.moveUp`, `setup.moveDown`, `setup.removePlayer`）経由で取得しなければならない
- **FR-004**: MolkkoutSetupScreen のバリデーションエラーを i18n キー（`molkkout.errorRequiredFields`）経由で取得しなければならない

#### (B) アクセシビリティ

- **FR-005**: ConfirmDialog は `role="dialog"` および `aria-modal="true"` 属性を持たなければならない
- **FR-006**: ConfirmDialog のメッセージ要素は `aria-labelledby` で参照されなければならない
- **FR-007**: ConfirmDialog のオーバーレイ（背景）をクリックするとダイアログが閉じなければならない

#### (C) コード品質・保守性

- **FR-008**: SetupScreen の名前入力フィールドの `maxLength` を 12 に修正しなければならない（バリデーション上限と一致させる）
- **FR-009**: `handleMoveUp` / `handleMoveDown` を `handleMove(index, direction)` に統合しなければならない
- **FR-010**: `PinInput` と `MolkkoutInput` の共通ロジックを `src/components/ui/` 配下の共通コンポーネントに抽出しなければならない
- **FR-011**: `i18n.ts` の言語選択をルックアップオブジェクト（`Record<Language, Messages>`）に変更し、ネスト三項演算子を排除しなければならない

#### (D) バグ修正・テストカバレッジ

- **FR-012**: `loadState` は JSON パース後に最低限の型チェック（version フィールドの一致、settings が object であること）を行い、検証失敗時は localStorage を削除して null を返さなければならない
- **FR-013**: `RECORD_MOLKKOUT_TURN` のチームローテーション・overtime 遷移・勝者決定のユニットテストを追加しなければならない
- **FR-014**: `storage.ts` の `loadState` でバージョン不一致・破損データを処理するユニットテストを追加しなければならない
- **FR-015**: `share.ts` の `buildShareText` の出力フォーマット（脱落プレイヤー含む）のユニットテストを追加しなければならない

### Key Entities

- **Messages 型（i18n）**: `ja.ts` から自動生成される翻訳キーの型。新しいキーを追加する際は `ja.ts` → `en.ts` → `fi.ts` の順で全言語に追加する必要がある
- **StoredState**: localStorage に保存される状態のスキーマ。`version` フィールドによりスキーマ変更時の互換性を管理する

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Finnish / English に言語設定したユーザーがライセンス画面・プレイヤー設定画面・Mölkkout設定画面を開いたとき、すべてのテキストが設定言語で表示される
- **SC-002**: スクリーンリーダーで確認ダイアログにフォーカスしたとき、ダイアログとして認識されメッセージが読み上げられる
- **SC-003**: プレイヤー名入力フィールドで12文字を超える入力が物理的にできない（エラーを出さずに制限される）
- **SC-004**: localStorage を破損させた状態でアプリを開いても、クラッシュせずホーム画面が表示される
- **SC-005**: `npm test` で Mölkkout / storage / share の主要ロジックが自動検証され、テスト件数が27件（現在）から40件以上に増加する
- **SC-006**: 全 TypeScript が strict モードでエラーなしにコンパイルされる
- **SC-007**: `PinInput` と `MolkkoutInput` の重複コードが共通コンポーネントに集約され、UIの変更が両画面に一度の修正で反映される

## Assumptions

- `licenses` i18n キーの追加に際し、スキーマバージョン（SCHEMA_VERSION）の変更は不要（翻訳キーは永続化されないため）
- Finnish 翻訳の自然な表現は既存の fi.ts のスタイル（機能優先、語学的な完全性よりも実用性）に倣う
- 共通入力コンポーネントのスタイル差分（PinInput と MolkkoutInput のパディング等）は props で制御する
- ConfirmDialog の背景クリックでのキャンセルは既存の `onCancel` コールバックを使用する（新しいコールバックは追加しない）
