---
name: pr-create
description: |
  現在のブランチの変更内容を読み、PR タイトル / Summary / Test plan を生成し、
  ユーザー承認後に `gh pr create` で PR を作成する。
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *)
argument-hint: "[--draft]"
---

## 起動時コンテキスト

- 現在ブランチ: !`git branch --show-current`
- リモート同期状況: !`git status -sb`
- デフォルトブランチ: !`gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo main`
- ベースからのコミット一覧: !`git log --oneline $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo main)..HEAD`
- ベースからの変更範囲: !`git diff --stat $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo main)...HEAD`
- PR テンプレート有無: !`ls .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || echo "(テンプレートなし)"`

## 事前チェック

1. `git branch --show-current` で現在ブランチを取得。`main` / `master` / `release/*` なら中止。
2. `gh auth status` で認証確認。
3. リモート追跡ブランチが無ければ `git push -u origin <branch>` を提案 (ユーザー承認必須)。
4. ベースブランチの推定は `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` を優先し、
   topic ブランチ運用の可能性があればユーザーに確認。

## 本文生成

1. `git log <base>..HEAD` でブランチ差分コミットを全取得。
2. `git diff <base>...HEAD` で差分を読む (長大なら `--stat` から重要ファイルだけ `diff`)。
3. 次のテンプレートで出力:

```markdown
## Summary

- <WHY を 1 行で>
- <WHAT を 1-2 行で>
- <補足があれば>

## Test plan

- [ ] <テストケース 1>
- [ ] <テストケース 2>

## 関連

- Closes #<issue>
```

4. リポジトリに `.github/PULL_REQUEST_TEMPLATE.md` があればその構造を尊重。

## 実行

- タイトルは 70 文字以内、プレフィックスは最新コミット or Conventional Commits を継承。
- 本文は必ず here-doc で渡す:

```bash
gh pr create --title "..." --body "$(cat <<'EOF'
...
EOF
)"
```

- draft で作るかどうかはユーザーに確認。

## 禁止事項

- ユーザー承認なしの PR 作成
- main / master / release/\* ブランチからの PR 作成
- PR body に `.env` や秘密情報を含めない。
