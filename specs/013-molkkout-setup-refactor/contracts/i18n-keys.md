# i18n Key Changes: 013-molkkout-setup-refactor

**対象ファイル**: `src/i18n/ja.ts` (型定義ソース), `en.ts`, `fi.ts`

---

## `molkkout` 名前空間 — 変更差分

### 削除するキー

| キー | 旧値（ja） | 削除理由 |
|------|-----------|---------|
| `molkkout.errorRequiredFields` | `"チーム名とプレイヤー名をすべて入力してください"` | プレイヤー名フィールドが削除されるため |
| `molkkout.teamTurn` | `"{team} のターン（{player}）"` | プレイヤー名表示なしの新フォーマットに置き換え |

### 追加するキー

| キー | 型 | ja | en | fi |
|------|----|----|----|----|
| `molkkout.throwProgress` | `(current: number, total: number) => string` | `` (c, t) => `${t}投中${c}投目` `` | `` (c, t) => `Throw ${c} of ${t}` `` | `` (c, t) => `Heitto ${c}/${t}` `` |
| `molkkout.teamTurnLabel` | `string` | `"{team} のターン"` | `"{team}'s turn"` | `"Vuoro: {team}"` |
| `molkkout.totalThrowsLabel` | `string` | `"1チームあたりの投球数"` | `"Throws per team"` | `"Heittoja per joukkue"` |
| `molkkout.errorTeamRequired` | `string` | `"チーム名をすべて入力してください"` | `"Please fill in all team names"` | `"Täytä kaikki joukkuenimet"` |
| `molkkout.errorDuplicateTeam` | `string` | `"チーム名が重複しています"` | `"Team names must be unique"` | `"Joukkuenimet eivät saa toistua"` |
| `molkkout.undo` | `string` | `game.undo` を流用（"やり直し"） | reuse `game.undo` | reuse `game.undo` |

> **Note**: `molkkout.undo` は新規キーを追加せず `game.undo` を直接参照する。

### 変更するキー（既存キーの値のみ更新）

| キー | 旧値（ja） | 新値（ja） | 変更理由 |
|------|-----------|-----------|---------|
| `molkkout.pinSetupGuide` | `"ピンを以下の順に並べてください: 6-4-12-10-8"` | 変更なし | ゲーム画面では非表示に変更（setup 画面のみ表示） |

---

## `Messages` 型への影響（`ja.ts`）

```typescript
molkkout: {
  title: string
  pinSetupGuide: string
  start: string
  // teamTurn: string  ← 削除
  teamTurnLabel: string                              // 追加: "{team} のターン"
  throwProgress: (current: number, total: number) => string  // 追加
  totalThrowsLabel: string                           // 追加
  totalScore: string
  winner: string
  overtime: string
  // errorRequiredFields: string  ← 削除
  errorTeamRequired: string                          // 追加
  errorDuplicateTeam: string                         // 追加
}
```

---

## コンポーネント Props 変更

### MolkkoutSetupScreen（全面改修）

**新しい local state**:
```typescript
const [teams, setTeams] = useState<{ name: string }[]>([
  { name: '' }, { name: '' }
])
const [totalThrows, setTotalThrows] = useState(3)  // デフォルト3
const [toast, setToast] = useState<string | null>(null)
```

**バリデーション（開始ボタン押下時）**:
1. 全チーム名が非空 → `errorTeamRequired` トースト
2. チーム名が一意 → `errorDuplicateTeam` トースト
3. `totalThrows` は 1〜10（ステッパーで強制済み）

**dispatch**:
```typescript
dispatch({
  type: 'START_MOLKKOUT',
  teams: teams.map(t => ({ name: t.name.trim() })),
  totalThrows,
})
```

### MolkkoutScreen（部分変更）

**変更点**:
- `currentPlayerName` 派生削除
- ヘッダー表示: `teamTurnLabel.replace('{team}', currentTeam.name)` + `throwProgress(mg.currentThrowIndex + 1, mg.totalThrows)`
- `pinSetupGuide` をヘッダーから削除
- Undo ボタン追加: `disabled={mg.turns.length === 0}`
  - dispatch: `{ type: 'UNDO_MOLKKOUT_TURN' }`
