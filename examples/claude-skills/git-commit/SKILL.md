---
name: git-commit
description: |
  staged / unstaged diff を解析してコミット計画を提案し、
  ユーザー承認後に Conventional Commits 形式でコミットを実行する。
disable-model-invocation: true
allowed-tools: Bash(git *)
---

## 起動時コンテキスト

- 現在ブランチ: !`git branch --show-current`
- 作業ツリー状態: !`git status --short`
- staged diff (要約): !`git diff --staged --stat`
- unstaged diff (要約): !`git diff --stat`
- 直近 5 コミット (スタイル参考用): !`git log -5 --oneline`

## 事前チェック

1. `git status --short` で staged / unstaged / untracked の有無を確認。
2. staged changes があれば `git diff --staged` を読む。
3. unstaged changes があれば `git diff` を読み、コミット対象に含めたいかユーザーへ確認。
   - untracked files は `git status --short` と必要に応じて `git ls-files --others --exclude-standard` で確認。
   - ユーザー承認なしに unstaged / untracked files を `git add` しない。
   - unstaged を含めない回答なら、staged changes だけで計画を作る。
4. staged changes がなく、unstaged / untracked を含める承認もない場合は中止。
5. `.env`、鍵、トークン、認証情報、個人情報らしきファイルや差分があれば、計画提示前に警告して確認を取る。

## 手順

1. staged / unstaged の差分を分けて読み、変更の意図を 1-2 文で要約。
2. 差分が大きい場合は、単一コミットに押し込まず複数コミット案を提示してユーザーに確認。
   - 目安: 10 ファイル超、300 行超、目的が複数、ドキュメントと実装が混在、リファクタと仕様変更が混在。
   - 分割案には各コミットの目的、対象ファイル、想定メッセージを含める。
   - ユーザーが単一コミットを明示した場合でも、履歴が読みにくくなるなら理由を短く指摘してから従う。
3. コミット計画を提示し、ユーザー承認を得る。
   - 単一コミット: メッセージ案、対象ファイル、含めないファイル、注意点を提示。
   - 複数コミット: コミット順、各コミットの対象ファイル / hunk、メッセージ案、検証コマンドを提示。
4. 承認後、計画どおりに staging してコミットする。
   - unstaged / untracked を含める場合は、承認済みのファイルだけ `git add` する。
   - hunk 単位の分割が必要なら `git add -p` を使う前に対象 hunk を説明し、対話操作で迷う場合は中止してユーザーに確認。
   - 複数コミットでは、各コミット前に `git diff --staged --stat` で対象を確認する。
5. プレフィックス判定:
   - 新機能追加 → `feat:`
   - バグ修正 → `fix:`
   - 内部リファクタ → `refactor:`
   - ドキュメント → `docs:`
   - テスト → `test:`
   - 設定・雑務 → `chore:`
   - パフォーマンス → `perf:`
   - CI/CD → `ci:`
6. コミットメッセージ案を次の形式でユーザーに提示:

   ```
   <type>: <概要 (50文字以内)>

   - 箇条書きで詳細 (任意, 各 72 文字以内)
   ```

7. ユーザーが `y` または承認を出したら HEREDOC でコミット。
   - `--amend` は使わない (pre-commit フックが落ちた場合は新規コミットで作り直す)

```bash
git commit -F - <<'EOF'
<commit message>
EOF
```

## 確認フォーマット

差分確認後、必ず次の順にユーザーへ確認する。

1. unstaged changes がある場合: 「これらも今回のコミット対象に含めますか？」
2. 差分が大きい場合: 「複数コミットに分ける案で進めますか？」
3. 最終コミット計画: 「この計画で staging / commit を実行してよいですか？」

承認が曖昧な場合は実行しない。

## 出力ルール

- 言語: 日本語でも英語でも良いが、リポジトリの既存コミットの多数派に合わせる。
- 絵文字は使わない。
- 「なぜ」を優先し、「何を」はコードが語るので簡潔に。
- コミット後に `git status --short` と作成したコミット hash / subject を報告する。
