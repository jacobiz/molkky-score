# Data Model: 013-molkkout-setup-refactor

**生成日**: 2026-03-02

---

## 型変更サマリー（`src/types/game.ts`）

### MolkkoutTeam — 変更あり

```typescript
// BEFORE
export interface MolkkoutTeam {
  id: string
  name: string
  playerNames: string[]   // ← 削除
  totalScore: number
}

// AFTER
export interface MolkkoutTeam {
  id: string
  name: string
  // playerNames は削除 — 投球順はプレイヤーが物理管理
  totalScore: number
}
```

**バリデーション制約**:
- `name`: 非空文字列、同一ゲーム内で一意
- `totalScore`: 0 以上の整数

---

### MolkkoutTurn — 変更あり

```typescript
// BEFORE
export interface MolkkoutTurn {
  teamId: string
  playerName: string    // ← 削除
  points: number
}

// AFTER
export interface MolkkoutTurn {
  teamId: string
  // playerName は削除
  points: number
  // Undo 用スナップショット（追加）
  teamIndex: number        // このターン時点の currentTeamIndex
  throwIndex: number       // このターン時点の currentThrowIndex
  prevStatus: 'active' | 'overtime'  // このターン適用前のゲームステータス
}
```

---

### MolkkoutGame — 変更あり

```typescript
// BEFORE
export interface MolkkoutGame {
  teams: MolkkoutTeam[]
  currentTeamIndex: number
  currentPlayerInTeamIndex: number  // ← 削除
  throwsPerPlayer: number           // ← 削除（playerNames 由来）
  turns: MolkkoutTurn[]
  status: 'active' | 'finished' | 'overtime'
  winnerId: string | null
}

// AFTER
export interface MolkkoutGame {
  teams: MolkkoutTeam[]
  currentTeamIndex: number
  currentThrowIndex: number  // 追加: 現在チーム内の投球インデックス (0 始まり)
  totalThrows: number        // 追加: 全チーム共通の投球数 (1〜10, ユーザー指定)
  turns: MolkkoutTurn[]
  status: 'active' | 'finished' | 'overtime'
  winnerId: string | null
}
```

**ライフサイクル / 状態遷移**:

```
[start]
  │
  ▼
active ──(currentThrowIndex < totalThrows - 1)──▶ active (同チーム内次投)
  │
  └─(currentThrowIndex === totalThrows - 1)──▶ チーム切替
      │
      ├─(nextTeamIndex !== 0)──▶ active (次チームへ)
      └─(全チーム完了 allDone)
           │
           ├─(単独最高)──▶ finished
           └─(同点)──▶ overtime ──(繰り返し)──▶ finished
```

**Undo 状態遷移**:
- `finished` 状態でも Undo 可能（最後のターン取り消しで active/overtime に戻る）
- `turns.length === 0` → Undo ボタン disabled

---

### GameAction — 変更あり

```typescript
// BEFORE
| { type: 'START_MOLKKOUT'; teams: { name: string; playerNames: string[] }[] }

// AFTER
| { type: 'START_MOLKKOUT'; teams: { name: string }[]; totalThrows: number }
| { type: 'UNDO_MOLKKOUT_TURN' }   // 新規追加
```

---

## ストレージスキーマ（`src/utils/storage.ts`）

```typescript
// SCHEMA_VERSION: 2 → 3
const SCHEMA_VERSION = 3

interface StoredState {
  version: typeof SCHEMA_VERSION  // 3
  game: Game | null
  molkkoutGame: MolkkoutGame | null  // 新しい shape を反映
  settings: Settings
}
```

**マイグレーション戦略**:
- バージョン 2 以前のデータ: `isValidStoredState` がバージョン不一致を検出 → `null` 返却 → localStorage から削除 → ユーザーはホーム画面（FR-009）
- `isValidStoredState` の変更は不要（既存の `v.version !== SCHEMA_VERSION` チェックで十分）

---

## リデューサーロジック変更（`src/reducers/gameReducer.ts`）

### START_MOLKKOUT

```typescript
case 'START_MOLKKOUT': {
  const teams = action.teams.map(t => ({
    id: generateId(),
    name: t.name,
    // playerNames は不要
    totalScore: 0,
  }))
  return {
    ...state,
    screen: 'molkkout-game',
    molkkoutGame: {
      teams,
      currentTeamIndex: 0,
      currentThrowIndex: 0,       // 新フィールド
      totalThrows: action.totalThrows,  // 新フィールド
      turns: [],
      status: 'active',
      winnerId: null,
    },
  }
}
```

### RECORD_MOLKKOUT_TURN（簡素化）

```typescript
case 'RECORD_MOLKKOUT_TURN': {
  // ... (points を totalScore に加算)
  const turn: MolkkoutTurn = {
    teamId: team.id,
    points,
    teamIndex: mg.currentTeamIndex,    // undo 用
    throwIndex: mg.currentThrowIndex,   // undo 用
    prevStatus: mg.status,              // undo 用
  }

  const isTeamDone = mg.currentThrowIndex + 1 >= mg.totalThrows
  const nextTeamIdx = isTeamDone
    ? (mg.currentTeamIndex + 1) % mg.teams.length
    : mg.currentTeamIndex
  const nextThrowIdx = isTeamDone ? 0 : mg.currentThrowIndex + 1

  const allDone = isTeamDone && nextTeamIdx === 0
  // 勝者判定は現行ロジックと同じ（FR-008）
}
```

### UNDO_MOLKKOUT_TURN（新規）

```typescript
case 'UNDO_MOLKKOUT_TURN': {
  const mg = state.molkkoutGame
  if (!mg || mg.turns.length === 0) return state

  const history = [...mg.turns]
  const lastTurn = history.pop()!

  const restoredTeams = mg.teams.map(t =>
    t.id === lastTurn.teamId
      ? { ...t, totalScore: t.totalScore - lastTurn.points }
      : t,
  )

  return {
    ...state,
    molkkoutGame: {
      ...mg,
      teams: restoredTeams,
      currentTeamIndex: lastTurn.teamIndex,
      currentThrowIndex: lastTurn.throwIndex,
      status: lastTurn.prevStatus,
      winnerId: null,
      turns: history,
    },
  }
}
```
