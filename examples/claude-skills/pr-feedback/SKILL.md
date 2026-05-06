---
name: pr-feedback
description: |
  現在のブランチに紐づく PR のレビューコメントを取得し、各指摘の妥当性を判断。
  方針一覧をユーザーへ提示・`AskUserQuestion` で承認を得た後、修正は `general-purpose`
  サブエージェントへ委譲してメインのコンテキストを節約。コミット / push、
  返信文面 (リクエスタへメンション付き) も都度ユーザー承認を経て実行する。
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Agent, AskUserQuestion
argument-hint: "[pr-number]"
---

## 起動時コンテキスト

以下のコマンドはスキル起動直前に実行され、結果が本文に注入される
(Claude は注入後の値だけを見る)。

- 現在ブランチ: !`git branch --show-current`
- リモート同期状況: !`git status -sb`
- 未コミット変更: !`git status --short`

PR メタ情報はスキル本文ロジック側で取得する (引数 `$ARGUMENTS` の有無で分岐するため、起動時注入には含めない)。

## 事前チェック

このスキルは PR レビューの **複数ラウンド** で繰り返し呼ばれる前提。毎回ゼロから状況を確認する。

1. `git branch --show-current` で現在ブランチを取得。`main` / `master` / `release/*` なら中止。
2. `gh auth status` で認証確認。
3. PR 特定:
   - 引数 `$ARGUMENTS` に PR 番号が指定されていれば `gh pr view <番号> --json number,url,headRefName,baseRefName,author,isDraft`
   - 指定がなければ `gh pr view --json number,url,headRefName,baseRefName,author,isDraft` (現在ブランチに紐づく PR を自動検出)
   - どちらでも失敗した場合は中止し、ユーザーに PR 番号を確認。
4. ローカルが未コミット (`git status --short` で出力あり) なら **中止または stash 提案**。
5. リモートと同期しているか `git status -sb` で確認。乖離があればユーザーへ確認。

## 状況確認 (早期終了判定)

未解決コメントと CI の両方を確認し、**やることがあるか** を判定する。

### 未解決コメントのカウント

GraphQL で `reviewThreads.isResolved=false` のスレッドを集計:

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$number) {
        reviewThreads(first:100) {
          nodes { id isResolved comments(first:1) { nodes { author{login} body } } }
        }
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F number=<number>
```

未解決件数を `N_open` として記録。

### CI の確認

```bash
gh pr checks <number>
```

- 全て `pass` (または `pending` のみ): 修正不要
- `fail` あり: 失敗ジョブのログを `gh run view <run-id> --log-failed` で取得し、**コード修正が必要な失敗か / インフラ起因か** を判定。コード修正が必要なら「CI 修正」をステップ 1 の指摘リストに **追加項目 [CI]** として混ぜる。

### 既に解決済みのスレッドを resolve 提案

未解決スレッド (`isResolved=false`) のうち、**実質的にはもう対応済み** のものを Claude が判定する。判定材料の例:

- 直近のコミットで該当ファイル / 該当行が変更され、指摘内容に沿った修正が入っている
- スレッド内の最新コメントが「LGTM」「直りましたね」など解決を示唆する文脈
- 指摘がコメントタイポ等の軽微なものでコード側で既に消えている

該当ありの場合、`AskUserQuestion` で resolve するか確認:

- `header`: "解決済みスレッドの resolve"
- `question`: "以下 K 件は既に対応済みと判断しました。GitHub 側で resolve しますか？\n[1] @<reviewer> path:line - <要約>\n..."
- `options`:
  - `{ label: "全部 resolve", description: "提示した K 件すべてを resolve" }`
  - `{ label: "一部のみ", description: "番号で指定する" }`
  - `{ label: "resolve しない", description: "未解決のまま処理続行" }`

承認されたら GraphQL mutation で resolve:

```bash
gh api graphql -f query='
  mutation($threadId:ID!) {
    resolveReviewThread(input:{threadId:$threadId}) {
      thread { id isResolved }
    }
  }' -f threadId=<thread-id>
```

resolve 後、未解決件数 `N_open` を更新する。

### 早期終了

`N_open == 0` かつ `CI に修正必要な失敗なし` の場合:

- 「未解決コメント 0 件 / CI 通過。対応すべき項目はありません。」とユーザーに伝えて終了。
- `gh pr view <number> --json reviewDecision,statusCheckRollup` で APPROVED 状態か等も合わせて報告。

## レビューコメント取得

未解決コメントが 1 件以上あった場合のみ実施。

1. インラインレビューコメント (行に紐づくもの):

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments \
  --jq '.[] | {id, user: .user.login, path, line, body, in_reply_to_id, html_url}'
```

2. PR 全体への一般コメント / レビュー本文:

```bash
gh pr view <number> --json reviews,comments
```

3. 既に解決済み (resolved) のスレッドは除外する。GraphQL で `isResolved` を取得し、未解決のみ対象:

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

## ステップ 1: 妥当性判断と方針提示

各指摘について、Claude が次のいずれかを判定:

- **対応する**: 指摘が妥当でコード修正が必要
- **議論したい**: 妥当性に疑問あり / 設計判断を要する。返信のみ (コミットなし)。
- **対応しない**: 既に対応済み / スコープ外 / 誤解。理由を返信のみ。

### サマリ提示フォーマット

```text
## 未解決レビューコメント N 件

[1] @<reviewer> path/to/file.ts:42
    指摘: <要約>
    判断: 対応する
    方針: <1-2 行>

[2] @<reviewer> path/to/file.ts:88
    指摘: <要約>
    判断: 議論したい
    方針: <1-2 行>

...
```

### `AskUserQuestion` による承認

サマリ提示の **直後** に `AskUserQuestion` を 1 回だけ呼び、次のいずれかを選択させる:

- `header`: "方針承認"
- `question`: "上記 N 件の判断方針でよいですか？"
- `multiSelect`: false
- `options`:
  - `{ label: "一括承認", description: "提示した方針すべてで進める" }`
  - `{ label: "個別調整", description: "一部の指摘について判断を変えたい" }`
  - `{ label: "中止", description: "今回はこのまま実行しない" }`

「個別調整」が選ばれた場合は、ユーザーに変更したい指摘番号と新しい判断を自然文で答えてもらい、サマリを更新して再度同じ `AskUserQuestion` をかける。「一括承認」が出るまでループする。

## ステップ 2: 修正の委譲とコミット

### サブエージェントへの委譲

「対応する」と判定された指摘がある場合、メインのコンテキストを節約するため
`general-purpose` サブエージェントへ修正のみを委譲する (コミットはメインで作成する)。

- **エージェント呼び出し**: `Agent` ツール、`subagent_type: "general-purpose"`。
- **`description`**: `"PR レビュー指摘の修正"`
- **`prompt` の必須要素**:
  - PR 番号 / URL / リポジトリ
  - 「対応する」と判定された指摘の **完全なリスト** (number, path, line, body, comment_id, 修正方針)
  - 「**1 指摘 = 1 コミット原則を維持する**。ただしコミット作成はメイン側で行うので、修正のみを行い、各指摘ごとに変更ファイルが識別できるよう **指摘番号順に修正し、1 指摘の修正が完了するごとに `git status` を返す**」旨の指示
  - 「修正完了後、各指摘ごとに `変更ファイル一覧` と `1 行サマリ` を返す」指示
  - **コミット・push を行わない** こと、`git add` のみ可、`--amend` 禁止

### コミット作成

サブエージェントが完了したら、メイン側で以下を実施:

1. `git status` / `git diff --stat` で変更を確認。
2. 指摘ごとに以下を行う:
   - 該当指摘に関連するファイルだけ `git add <files>` でステージング。
   - コミットメッセージ案を作成 (Conventional Commits):

     ```
     fix: <指摘内容の要約>

     Refs: <PR URL>#discussion_r<comment_id>
     ```

   - **`AskUserQuestion` で承認**:
     - `header`: "コミット承認 [k/N]"
     - `question`: "コミットメッセージ:\n<message>\nでコミットしますか？"
     - `options`:
       - `{ label: "承認", description: "このメッセージでコミット" }`
       - `{ label: "修正", description: "メッセージを書き直す (自然文で指示)" }`
       - `{ label: "スキップ", description: "この指摘は今回コミットしない" }`
   - 承認されたらコミット作成。

3. 全コミット完了後、`git log --oneline -n <件数>` を表示し、**push 承認** を `AskUserQuestion` で取る:
   - `options`:
     - `{ label: "push する", description: "リモートへ push" }`
     - `{ label: "保留", description: "後で手動で push する" }`

`--amend` / `--force` / `--force-with-lease` は使わない。

## ステップ 3: 返信

「対応する」「議論したい」「対応しない」すべての指摘に対して返信文面を作成。

### 返信文面テンプレート

- 対応した場合: `@<reviewer> ご指摘ありがとうございます。<commit-sha> で修正しました。`
- 議論したい場合: `@<reviewer> <議論したい論点>。ご意見いただけますか？`
- 対応しない場合: `@<reviewer> <理由>。このままで問題ないと判断しましたがいかがでしょうか。`

### 一覧承認

全件の返信文面案を 1 つのリストとして提示:

```text
## 返信文面案 N 件

[1] @<reviewer> path/to/file.ts:42 (commit <sha>)
    > <返信本文>

[2] @<reviewer> path/to/file.ts:88
    > <返信本文>

...
```

直後に `AskUserQuestion` を 1 回:

- `header`: "返信承認"
- `question`: "上記 N 件の返信文面でよいですか？"
- `options`:
  - `{ label: "一括承認", description: "全件この内容で送信" }`
  - `{ label: "個別調整", description: "一部の文面を直したい" }`
  - `{ label: "中止", description: "返信を送らない" }`

「個別調整」が選ばれたら番号と修正内容を自然文で受け取り、リストを更新して再質問。

### 送信

承認後、インラインレビューコメントへの返信は GitHub API:

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments \
  -F body="@<reviewer> <返信本文>" \
  -F in_reply_to=<original_comment_id>
```

PR 全体コメントへの返信は `gh pr comment <number> --body "..."`。

## 禁止事項

- ユーザー承認なしのコミット / push / コメント投稿
- `git push --force` / `--force-with-lease` (履歴整理が必要なら別途 `/git:commit-organizer` を案内)
- 解決済みスレッドへの蒸し返し
- レビュアーへのメンション漏れ (返信で必ず `@<reviewer>`)
- `.env` や秘密情報を含むコミット / コメント
- サブエージェント側でのコミット / push (修正のみ)

## 最後に伝えること

- 全件処理後、未解決スレッドが残っているか `gh api ... reviewThreads` で再確認し、サマリを報告。
- レビュアーへ再レビュー依頼が必要なら `gh pr ready` / `gh pr review --request` ではなく
  「再レビュー依頼ボタンを押してください」と案内 (誤操作防止)。
- **次のラウンドへの引き継ぎ**: 返信送信まで完了したら、ユーザーに以下を案内する:
  > 今ラウンドの対応は完了しました。次のレビューが返ってきたら、**`/clear` でコンテキストをクリアしてから** 改めてこのスキルを呼び出してください (今回までの会話履歴を残したまま走らせるとコンテキストが膨らみ精度が落ちます)。
