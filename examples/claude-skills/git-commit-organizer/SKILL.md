---
name: git:commit-organizer
description: |
  フィーチャーブランチのコミット履歴を読み、論理的なグループに再構成する案を提示。
  承認後に interactive rebase / squash / reword を安全に実行する。
disable-model-invocation: true
allowed-tools: Bash(git *)
---

## 起動時コンテキスト

- 現在ブランチ: !`git branch --show-current`
- HEAD: !`git rev-parse --short HEAD`
- 未コミット変更: !`git status --short`
- デフォルトブランチ推定: !`git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo origin/main`
- ベースからのコミット一覧: !`git log --oneline $(git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo origin/main)..HEAD`
- ベースからの変更範囲: !`git diff --stat $(git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo origin/main)...HEAD`

## 事前チェック

1. `git branch --show-current` で現在のブランチ確認。`main` / `master` なら中止。
2. `git rev-parse --verify HEAD` で HEAD があること。
3. 未コミットの変更 (`git status --short`) があれば中止または stash 提案。
4. バックアップブランチ `backup/<timestamp>` の作成を **必ず先に提案**。

## 再構成手順

1. ベースブランチ推定 (デフォルトは `origin/main` or `origin/master`、ユーザーに確認)。
2. `git log --oneline <base>..HEAD` でコミット一覧取得。
3. `git diff <base>...HEAD --stat` で変更範囲を把握。
4. 次のルールでグルーピング:
   - 同じ機能 / 同じファイル群に触れる WIP コミットは統合
   - 明らかに別 Issue / 別機能のコミットは「別ブランチ推奨」と警告
   - 「fixup!」「wip」「typo」で始まるコミットは隣接するコミットに自動 fixup
5. 再構成案を `■ 整理案:` 形式でユーザーに提示し、承認を得る。
6. 承認後:
   - 一時ブランチを作る
   - `git rebase -i` の代わりに `git reset --soft <base>` + 手動 commit 再生成を推奨 (rebase conflict を回避)
   - 最終的に `git diff <backup>..HEAD` が空 (= 中身不変) を確認

## 禁止事項

- ユーザー確認なしでの `git push --force` / `--force-with-lease`
- `main` / `master` / `release/*` での実行
- interactive 必要な操作 (`git rebase -i`) を勝手に使わない。代わりに `git reset --soft` + 明示コミット。

## 最後に伝えること

- force push が必要なら `git push --force-with-lease` を手動で叩くよう案内
- 問題があれば `git reset --hard backup/<timestamp>` で戻せる旨を案内
