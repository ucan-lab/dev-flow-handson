---
name: git:commit
description: |
  staged diff を解析して Conventional Commits 形式のメッセージ案を作成し、
  ユーザー承認後にコミットを実行する。
disable-model-invocation: true
allowed-tools: Bash(git *)
---

## 起動時コンテキスト

- 現在ブランチ: !`git branch --show-current`
- 作業ツリー状態: !`git status --short`
- staged diff (要約): !`git diff --staged --stat`
- 直近 5 コミット (スタイル参考用): !`git log -5 --oneline`

## 手順

1. `git status --short` で未 staged ファイルがあるか確認。あれば対象として良いかユーザーへ確認。
2. `git diff --staged` を読み、変更の意図を 1-2 文で要約。
3. プレフィックス判定:
   - 新機能追加 → `feat:`
   - バグ修正 → `fix:`
   - 内部リファクタ → `refactor:`
   - ドキュメント → `docs:`
   - テスト → `test:`
   - 設定・雑務 → `chore:`
   - パフォーマンス → `perf:`
   - CI/CD → `ci:`
4. コミットメッセージ案を次の形式でユーザーに提示:

   ```
   <type>: <概要 (50文字以内)>

   - 箇条書きで詳細 (任意, 各 72 文字以内)
   ```

5. ユーザーが `y` または承認を出したら HEREDOC でコミット。
   - `--amend` は使わない (pre-commit フックが落ちた場合は新規コミットで作り直す)
   - `.env` や秘密情報を含むファイルが staged にある場合は **警告** を出し確認を取る。

## 出力ルール

- 言語: 日本語でも英語でも良いが、リポジトリの既存コミットの多数派に合わせる。
- 絵文字は使わない。
- 「なぜ」を優先し、「何を」はコードが語るので簡潔に。
