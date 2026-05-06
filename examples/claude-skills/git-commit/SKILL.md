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

1. **差分サマリーを最初に提示** (下記「差分サマリー」フォーマット)。
   - ファイル数 / 追加行 / 削除行 / 主要な変更領域を一覧化する。
   - staged / unstaged / untracked を分けて表示。
2. 差分の意図を 1-2 文で要約し、単一コミットか複数コミットかの判断を提示する。
   - 分割の目安: 10 ファイル超、300 行超、目的が複数、ドキュメントと実装が混在、リファクタと仕様変更が混在。
   - ユーザーが単一コミットを明示した場合でも、履歴が読みにくくなるなら理由を短く指摘してから従う。
3. **コミット計画を提示** (下記「コミット計画」フォーマット)。
   - 単一コミット: メッセージ案、対象ファイル、含めないファイル、注意点。
   - 複数コミット: コミット順 / 各コミットの対象ファイル(または hunk) / メッセージ案 / 分割理由 / 検証コマンド。
4. ユーザー承認後、計画どおりに staging してコミットする。
   - unstaged / untracked を含める場合は、承認済みのファイルだけ `git add` する。
   - hunk 単位の分割が必要なら `git add -p` を使う前に対象 hunk を説明し、対話操作で迷う場合は中止してユーザーに確認。
   - 複数コミットでは、各コミット前に `git diff --staged --stat` で対象を確認する。
5. type判定:
   - 新機能追加 → `feat:`
   - バグ修正 → `fix:`
   - 内部リファクタ → `refactor:`
   - ドキュメント → `docs:`
   - テスト → `test:`
   - 設定・雑務 → `chore:`
   - パフォーマンス → `perf:`
   - CI/CD → `ci:`
6. コミットメッセージ形式:

   ```
   <type>: <概要 (50文字以内)>

   - 箇条書きで詳細 (任意, 各 72 文字以内)
   ```

7. 承認後、HEREDOC でコミット。
   - `--amend` は使わない (pre-commit フックが落ちた場合は新規コミットで作り直す)

```bash
git commit -F - <<'EOF'
<commit message>
EOF
```

## 差分サマリー (提示フォーマット)

最初の応答で必ず次のテーブル/箇条書きを表示する。

```
## 差分サマリー

| 区分 | ファイル数 | +行 | -行 |
| --- | ---: | ---: | ---: |
| staged   | N | +X | -Y |
| unstaged | N | +X | -Y |
| untracked| N | -  | -  |
| 合計     | N | +X | -Y |

主な変更領域:
- <path/dir>: 1-2語の概要 (+X / -Y)
- ...
```

`git diff --staged --stat` / `git diff --stat` / `git status --short` から数値を集計する。

## コミット計画 (提示フォーマット)

### 単一コミットの場合

```
## コミット計画 (1件)

[1/1] <type>: <概要>
  対象: <files>
  除外: <files (任意)>
  メッセージ:
    <type>: <概要>

    - 詳細1
    - 詳細2
  検証: <任意 — lint/test コマンドなど>
```

### 複数コミットの場合

```
## コミット計画 (N件)

分割理由: <なぜ分けるか 1-2 文>

[1/N] <type>: <概要>
  対象ファイル:
    - path/a.ts (+10 / -2)
    - path/b.ts (新規)
  対象 hunk: <hunk 単位なら明記>
  メッセージ:
    <type>: <概要>

    - 詳細
  差分量: +12 / -2

[2/N] <type>: <概要>
  対象ファイル:
    - ...
  メッセージ: ...
  差分量: +X / -Y

順序の理由: <例: 先にリファクタ→後で機能追加 など>
検証順: <任意>
```

各コミットでどのファイル(または hunk)が含まれ、どんなメッセージになるかが一目で分かる粒度で書く。

## 確認フォーマット

差分サマリーと計画提示後、必ず次の順にユーザーへ確認する。

1. unstaged / untracked changes がある場合: 「これらも今回のコミット対象に含めますか？」
2. 差分が大きい場合: 「上記の N コミット分割案で進めますか？ (単一にまとめる場合は指示してください)」
3. 最終確認: 「この計画で staging / commit を実行してよいですか？」

承認が曖昧な場合は実行しない。

## 出力ルール

- 言語: 日本語
- 絵文字は使わない。
- 「なぜ」を優先し、「何を」はコードが語るので簡潔に。
- コミット後に `git status --short` と、作成した各コミットの hash / subject を一覧で報告する。
