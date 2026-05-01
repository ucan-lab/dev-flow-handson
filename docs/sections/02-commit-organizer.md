# Section 2: コミット整理自動化 (Claude Skills)

使うツール: `/git-commit-organizer` スキル

## Why — なぜやるか

- 実装中は WIP コミットや `fixup` が溜まる
- レビューに出す前に「意味のある粒度」に再構成したい
- interactive rebase は毎回コンフリクトが怖い

AI に **意図でグルーピングしてもらう** ことで、安全に rebase / squash を実施できる。

## Demo — 完成形

1. フィーチャーブランチに 10 個ほどの WIP コミットがある状態
2. `/git-commit-organizer` を実行
3. AI が「このブランチはこう 3 つに再構成するのが自然」と提案
4. 承認すると rebase / reword / fixup を自動実行

## How — 手順

### 1. 前提

- 作業中のブランチが `main` / `master` 以外であること
- 未 push、または自分だけが使っているリモートブランチ (force push が許される)

### 2. スキル登録

未登録なら以下の内容で `~/.claude/skills/git-commit-organizer/SKILL.md` を作成 (右上のコピーボタン)。

<<< ../../examples/claude-skills/git-commit-organizer/SKILL.md [~/.claude/skills/git-commit-organizer/SKILL.md]

### 3. 練習用サンプルコミットを用意する

実プロジェクトでいきなり試すのは怖いので、**捨てブランチ + `sandbox/` 配下** に意図的に汚いコミット履歴を作る。下のブロックをそのままターミナルに貼り付ければ、7 個のコミット (WIP / fixup / typo / 無関係な docs 混入) ができあがる。

```bash
# 1. 練習用ブランチに切り替え (main から派生)
git switch -c practice/commit-organizer-$(date +%H%M%S) main

# 2. 作業ディレクトリ
mkdir -p sandbox/commit-organizer-demo
cd sandbox/commit-organizer-demo

# --- commit 1: user service の雛形 (WIP) ---
cat > user.ts <<'EOF'
export class UserService {
  async findById(id: string) {
    return { id, name: 'unknown' }
  }
}
EOF
git add user.ts
git commit -m "wip: add user service"

# --- commit 2: typo 修正 (本来 commit 1 に混ぜたかった) ---
sed -i.bak "s/unknown/unknown user/" user.ts && rm user.ts.bak
git add user.ts
git commit -m "typo"

# --- commit 3: validation helper (別の関心事を WIP で開始) ---
cat > validation.ts <<'EOF'
export const isEmail = (s: string) => /.+@.+/.test(s)
EOF
git add validation.ts
git commit -m "wip: validation helper"

# --- commit 4: user service にコメント追加 (fixup 相当) ---
printf "\n// TODO: cache layer\n" >> user.ts
git add user.ts
git commit -m "fixup! add user service"

# --- commit 5: validation の正規表現を直す ---
cat > validation.ts <<'EOF'
export const isEmail = (s: string) => /^.+@.+\..+$/.test(s)
EOF
git add validation.ts
git commit -m "fix validation regex"

# --- commit 6: テスト追加 ---
cat > user.test.ts <<'EOF'
import { UserService } from './user'
test('findById', async () => {
  const svc = new UserService()
  expect((await svc.findById('1')).id).toBe('1')
})
EOF
git add user.test.ts
git commit -m "wip: tests"

# --- commit 7: 完全に無関係な README いじり (別ブランチに分けるべき) ---
cd ../..
printf "\n<!-- practice noise -->\n" >> README.md
git add README.md
git commit -m "docs: tweak readme"

# 確認
git log --oneline main..HEAD
```

期待される `git log` (timestamp は環境依存):

```
xxxxxxx docs: tweak readme
xxxxxxx wip: tests
xxxxxxx fix validation regex
xxxxxxx fixup! add user service
xxxxxxx wip: validation helper
xxxxxxx typo
xxxxxxx wip: add user service
```

> 💡 ここで一度 **バックアップブランチ** を作っておくと、失敗してもすぐ戻せる:
>
> ```bash
> git branch backup/$(date +%Y%m%d-%H%M%S)
> ```

### 4. 実行

```
/git-commit-organizer
```

AI は:

1. `git log --oneline <base>..HEAD` で現状把握
2. `git diff <base>...HEAD` で「論理的なグループ」を抽出
3. 上のサンプル (7 コミット) ならおおむね次のように提案してくる:
   ```
   ■ 現状: 7 コミット
   ■ 整理案:
     1. feat: add user service (旧 #1 wip, #2 typo, #4 fixup を統合)
     2. feat: add email validation helper (旧 #3 wip, #5 fix を統合)
     3. test: add user service tests (旧 #6)
     残り #7 (docs: tweak readme) は無関係なので別ブランチ推奨
   ```
4. ユーザーが OK なら `git reset --soft <base>` + 明示コミット再生成で履歴を作り直す

### 5. 安全策

- **必ず作業前にバックアップ**:
  ```bash
  git branch backup/$(date +%Y%m%d-%H%M%S)
  ```
- AI は force push を勝手にはしない。最後に `git push --force-with-lease` するかはユーザー判断。

### 6. 後片付け

練習用ブランチごと捨てれば `sandbox/` 配下のファイルも README の練習編集も消える。

```bash
git switch main
git branch -D $(git branch --list 'practice/commit-organizer-*' | tr -d ' *')
git branch -D $(git branch --list 'backup/*' | tr -d ' *')   # バックアップも不要なら
```

## カスタマイズの勘所

- チーム規約で「1 PR = 1 コミット (squash merge)」ならこのスキルは PR 直前に 1 回だけ使う
- 「1 PR = 複数コミット (rebase merge)」なら粒度を意識した整理が活きる

## チェックポイント

- [ ] 再構成前のコミット履歴をバックアップブランチに残した
- [ ] 再構成後のコミット履歴が論理的に読める
- [ ] `git diff <backup>..HEAD` が空 (=中身は変わっていない)
