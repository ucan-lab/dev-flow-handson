# Section 4: コミット整理自動化 (Claude Skills)

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

### 3. 実行

```
/git-commit-organizer
```

AI は:

1. `git log --oneline <base>..HEAD` で現状把握
2. `git diff <base>...HEAD` で「論理的なグループ」を抽出
3. 提案例:
   ```
   ■ 現状: 12 コミット
   ■ 整理案:
     1. feat: add user service (旧 #1, #3, #7 を統合)
     2. refactor: extract validation helper (旧 #2, #4)
     3. test: add user service tests (旧 #5, #6, #8)
     残り #9, #10 は除外/別ブランチ推奨 (無関係の修正)
   ```
4. ユーザーが OK なら rebase を実行

### 4. 安全策

- **必ず作業前にバックアップ**:
  ```bash
  git branch backup/$(date +%Y%m%d-%H%M%S)
  ```
- AI は force push を勝手にはしない。最後に `git push --force-with-lease` するかはユーザー判断。

## カスタマイズの勘所

- チーム規約で「1 PR = 1 コミット (squash merge)」ならこのスキルは PR 直前に 1 回だけ使う
- 「1 PR = 複数コミット (rebase merge)」なら粒度を意識した整理が活きる

## チェックポイント

- [ ] 再構成前のコミット履歴をバックアップブランチに残した
- [ ] 再構成後のコミット履歴が論理的に読める
- [ ] `git diff <backup>..HEAD` が空 (=中身は変わっていない)
