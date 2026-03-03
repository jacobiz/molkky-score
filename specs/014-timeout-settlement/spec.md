# Feature Specification: 時間切れによる途中決着

**Feature Branch**: `014-timeout-settlement`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "大会などの時間切れルールに対応して、途中決着できるようにする"

## Clarifications

### Session 2026-03-03

- Q: Mölkkout での途中決着時、勝者判定の対象は？ → A: 通常ゲームでは脱落済みプレイヤーを除いた残存プレイヤーが対象。Mölkkout ではチーム（MolkkoutTeam）に脱落の概念がないため全チームが判定対象
- Q: 結果画面での途中決着の表示方法は？ → A: 通常終了と同じレイアウトに「時間切れ / 途中決着」ラベル／バッジを追加するだけ
- Q: 途中決着の結果は通常終了と区別して保存するか？ → A: 区別して保存する（終了理由フィールドを持つ）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 時間切れ宣言で途中決着 (Priority: P1)

大会の進行役（または参加者）がゲーム中に制限時間の終了を宣言し、その時点のスコアで勝敗を決定する。
進行役は「途中決着」ボタンを押すことで、現在のスコア状況に基づいた勝者を確認できる。

**Why this priority**: 大会運営において時間切れは頻繁に発生するシナリオであり、このストーリーだけで機能の核心的な価値（途中終了の正式な処理）が実現される。

**Independent Test**: ゲーム進行中に「途中決着」を選択することで、現在のスコア上位者が勝者として結果画面に表示され、単独でMVPとして機能を検証できる。

**Acceptance Scenarios**:

1. **Given** ゲームが進行中（少なくとも1投済み）の状態で、**When** 進行役が「途中決着」を選択して確認操作を行う、**Then** 現時点のスコアが最も高いプレイヤーが勝者として結果画面に表示される
2. **Given** ゲームが進行中の状態で、**When** 進行役が「途中決着」を選択した、**Then** 確認ダイアログが表示され、誤操作を防ぐための確認ステップが存在する
3. **Given** 途中決着の確認操作後、**When** 結果画面が表示される、**Then** 通常の試合終了と同様に結果の共有や再戦の選択ができる

---

### User Story 2 - 同点時の途中決着 (Priority: P2)

時間切れ宣言時に複数プレイヤーが同スコアで首位に並んでいる場合、引き分け（同点）として処理する。

**Why this priority**: 同点が発生するケースは実際の大会でも起こりうるため、スコープを明確に定義することが必要。ただしP1で単独勝者が決まるケースを先に実装できる。

**Independent Test**: 複数プレイヤーが同スコアで首位の状態で途中決着を行い、引き分けの勝者表示（複数名）が正しく表示されることを確認できる。

**Acceptance Scenarios**:

1. **Given** 複数プレイヤーが同スコアで首位に並んでいる状態で、**When** 途中決着を宣言する、**Then** 該当する全プレイヤーが「同点優勝」として結果画面に表示される
2. **Given** 途中決着で同点の場合、**When** 結果が表示される、**Then** 「引き分け」であることがわかるラベルまたは表示がされる

---

### User Story 3 - ゲーム未開始・開始直後の途中決着 (Priority: P3)

ゲームが開始されたが1投も投げていない（全員スコア0）の状態での途中決着の扱いを明確にする。

**Why this priority**: エッジケースとして存在するが、日常的な操作ではないためP3とする。

**Independent Test**: 全員スコア0の状態でゲーム画面を確認したとき、途中決着オプションが非表示になっていることを確認できる。

**Acceptance Scenarios**:

1. **Given** ゲーム開始直後で全員スコアが0の状態で、**When** ゲーム画面を表示する、**Then** 途中決着のボタン・オプションは表示されない
2. **Given** 全員スコア0の状態で、**When** いずれかのプレイヤーが1点以上を獲得する、**Then** 途中決着のオプションが表示される

---

### Edge Cases

- 1人しかプレイヤーがいない場合の途中決着はどう扱うか？（1人プレイは現在非対応のため発生しないと想定）
- Mölkkout ゲーム中の途中決着：全チームが判定対象（MolkkoutTeam に脱落ステータスはなく全チームが常に active）。最高 totalScore のチームが勝者となる
- 途中決着後に「もう一度」を押した場合、設定（プレイヤー・ルール）は引き継がれるか？（通常終了と同じ挙動で問題ない）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "途中決着" (early settlement) action during an active game that any participant can trigger
- **FR-002**: System MUST display a confirmation step before finalizing early settlement to prevent accidental triggering
- **FR-003**: Upon confirmed early settlement, the system MUST determine the winner(s) as the player(s)/team(s) holding the highest current score. In a regular game, only active (non-eliminated) players are considered; in Mölkkout, all teams are always active and all are included in winner determination
- **FR-004**: When multiple players share the highest score at time of settlement, the system MUST display all tied players as joint winners (draw)
- **FR-005**: System MUST display the standard result screen layout with an additional "時間切れ / 途中決着" label or badge that clearly distinguishes it from a normal game completion
- **FR-006**: After early settlement, users MUST be able to share results and initiate a rematch, identical to normal game completion
- **FR-007**: System MUST hide the early settlement option when all players currently have a score of 0 (i.e., no throws have been made yet)

### Key Entities

- **途中決着 (Early Settlement)**: ゲームが通常の勝利条件（スコア50点）に達する前に時間制限などの外部要因により終了される状態。勝者はその時点の最高スコア（残存プレイヤー内）で決まる
- **結果 (Game Result)**: 勝者・スコア・終了理由を記録したデータ。終了理由として「通常終了（50点到達）」と「途中決着（時間切れ）」を区別して保存する

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 進行役が途中決着を宣言してから結果画面が表示されるまでの操作が3タップ以内で完了できる
- **SC-002**: 途中決着による結果画面において、勝者または同点情報が100%の確率で正確に表示される
- **SC-003**: 通常終了と同様に、途中決着後も再戦・共有機能がすべて利用可能である

## Assumptions

- 途中決着を宣言できるのはアプリを操作している端末のユーザー（進行役）に限定する（複数端末間の同期は対象外）
- 内蔵タイマー機能（カウントダウン）はこの機能のスコープ外とし、時間の管理は大会側が行う
- Mölkkoutゲーム中の途中決着では、全チームを対象に最高 totalScore のチームが勝者となる（MolkkoutTeam に脱落概念はなく全チームが常に判定対象）
