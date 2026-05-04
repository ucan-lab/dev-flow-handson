---
name: pr-review-respond
description: |
  現在のブランチに紐づく PR のレビューコメントを取得し、各指摘の妥当性を判断。
  対応方針一覧をユーザーへ提示し、承認後に指摘単位でコミット & push、
  インラインレビューコメントへ返信 (リクエスタへメンション付き) を行う。
disable-model-invocation: true
allowed-tools: Bash(gh *) Bash(git *)
argument-hint: "[pr-number]"
---

## 起動時コンテキスト

以下のコマンドはスキル起動直前に実行され、結果が本文に注入される
(Claude は注入後の値だけを見る)。

- 現在ブランチ: !`git branch --show-current`
- リモート同期状況: !`git status -sb`
- 未コミット変更: !`git status --short`
- PR メタ情報: !`gh pr view ${ARGUMENTS:-} --json number,url,headRefName,baseRefName,author,isDraft 2>/dev/null || echo "(PR 未特定: 引数で番号を指定するか、現在ブランチに紐づく PR を探す)"`

## 事前チェック

1. `git branch --show-current` で現在のブランチ取得。`main` / `master` / `release/*` なら中止。
2. `gh auth status` で認証確認。
3. 現在のブランチに紐づく PR を `gh pr view --json number,url,headRefName,baseRefName,author` で特定。
   見つからない場合は中止し、ユーザーに PR 番号を確認。
4. ローカルが未コミット (`git status --short` で出力あり) なら **中止または stash 提案**。
5. リモートと同期しているか `git status -sb` で確認。乖離があればユーザーへ確認。

## レビューコメント取得

1. インラインレビューコメント (行に紐づくもの):

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments \
  --jq '.[] | {id, user: .user.login, path, line, body, in_reply_to_id, html_url}'
```

2. PR 全体への一般コメント / レビュー本文:

```bash
gh pr view <number> --json reviews,comments
```

3. 既に解決済み (resolved) のスレッドは除外する。

GraphQL で `isResolved` を取得し、未解決のみ対象:

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$number) {
        reviewThreads(first:100) {
          nodes { id isResolved comments(first:20) { nodes { id databaseId author{login} body path line } } }
        }
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F number=<number>
```

## 妥当性判断と方針提示

各指摘について次を判定:

- **対応する**: 指摘が妥当でコード修正が必要
- **議論したい**: 妥当性に疑問あり / 設計判断を要する → 返信のみ (コミットなし)
- **対応しない**: 既に対応済み / スコープ外 / 誤解 → 理由を返信のみ

ユーザーへの提示フォーマット:

```
■ 未解決レビューコメント N 件

[1] @<reviewer> path/to/file.ts:42
    指摘: <要約>
    判断: 対応する / 議論したい / 対応しない
    方針: <1-2 行>

[2] @<reviewer> path/to/file.ts:88
    ...

承認すると以下を実行します:
- [1][3] についてコミット & push (指摘ごとに 1 コミット)
- 各コメントへ返信 (@<reviewer> 宛メンション)
```

ユーザーが `y` / 部分承認 / 修正指示を出すまで実行しない。

## 実行

### 指摘ごとのコミット

- 1 指摘 = 1 コミット を原則とする (関連が強い指摘はまとめても良いが、ユーザー提示時に明示)。
- コミットメッセージは Conventional Commits を継承:

```
fix: <指摘内容の要約>

Refs: <PR URL>#discussion_r<comment_id>
```

- `--amend` は使わない。
- 各コミット後に `git push` (force push しない)。

### レビューコメントへの返信

インラインレビューコメントへの返信は GitHub API の reply エンドポイントを使う:

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments \
  -F body="@<reviewer> <返信本文>" \
  -F in_reply_to=<original_comment_id>
```

返信本文テンプレート:

- 対応した場合: `@<reviewer> ご指摘ありがとうございます。<commit-sha> で修正しました。`
- 議論したい場合: `@<reviewer> <議論したい論点>。ご意見いただけますか？`
- 対応しない場合: `@<reviewer> <理由>。このままで問題ないと判断しましたがいかがでしょうか。`

PR 全体コメントへの返信は `gh pr comment <number> --body "..."` を使う。

## 禁止事項

- ユーザー承認なしのコミット / push / コメント投稿
- `git push --force` / `--force-with-lease`
- 解決済みスレッドへの蒸し返し
- レビュアーへのメンション漏れ (返信で必ず `@<reviewer>`)
- `.env` や秘密情報を含むコミット / コメント

## 最後に伝えること

- 全件処理後、未解決スレッドが残っているか `gh api ... reviewThreads` で再確認し、サマリを報告。
- レビュアーへ再レビュー依頼が必要なら `gh pr ready` / `gh pr review --request` ではなく
  「再レビュー依頼ボタンを押してください」と案内 (誤操作防止)。
