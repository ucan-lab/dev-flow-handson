---
name: code-review
description: |
  現在のフィーチャーブランチの累積差分 (base..HEAD) を 1 パスで軽量レビューし、
  Must / Nits の 2 段階で指摘を返す。コミット直後の素早いセルフレビュー用途。
disable-model-invocation: true
allowed-tools: Bash(git *), Read, Grep
argument-hint: "[base-branch]"
---

## 起動時コンテキスト

- 現在ブランチ: !`git branch --show-current`
- 作業ツリー状態: !`git status --short`
- ベースブランチ候補: !`git for-each-ref --format='%(refname:short)' refs/heads/ refs/remotes/origin/ | grep -E '^(origin/)?(main|master|develop)$' | head -3`
- 推定マージベース (vs origin/main): !`git merge-base origin/main HEAD 2>/dev/null || echo "n/a"`
- 累積コミット (vs origin/main): !`git log origin/main..HEAD --oneline 2>/dev/null | head -20`
- 累積差分サマリ (vs origin/main): !`git diff origin/main...HEAD --stat 2>/dev/null | tail -20`

ベースブランチは引数 `$ARGUMENTS` の有無で分岐するため、起動時コンテキストは `origin/main` 仮定の参考値として扱う。

## 事前チェック

1. `git branch --show-current` で現在ブランチを取得。`main` / `master` / `develop` 上ならレビュー対象がないので中止し、トピックブランチへ切り替えるよう案内。
2. ベースブランチを決定:
   - 引数 `$ARGUMENTS` が指定されていればそれを採用 (例: `/code-review develop` → `develop`、`/code-review origin/release/x` → `origin/release/x`)。`git rev-parse --verify <base>` で存在確認し、見つからなければユーザーに正しいブランチ名を聞き直す。
   - 引数が無ければ既定 `origin/main`。起動時コンテキストで `n/a` なら `master` / `develop` / ローカル `main` を順に試して最初に見つかったものを採用。どれも当たらなければユーザーにベースブランチを質問。
3. 採用するベースブランチをユーザーに 1 行で提示し、明示的に承認を取る。例: `ベースは origin/main で進めます。よいですか？` (引数で指定された場合は `指定どおり <base> で進めます。` と短く確認する)
4. 累積差分が 0 行なら `レビュー対象の差分がありません。` と返して終了。
5. 累積差分が **1000 行を超える** ときは、観点を絞るか / コミット単位でレビューするか / そのまま続行するかを選んでもらう。

## レビュー手順

1. `git diff <base>...HEAD` の本文を読む。サイズが大きい場合は **ファイル単位** で `git diff <base>...HEAD -- <path>` に分けて読む。
2. 以下の観点を 1 パスで横断チェック (浅め広め):
   - **シークレット混入**: `.env`, `*_KEY`, `*_TOKEN`, `BEGIN .* PRIVATE KEY`, ハードコード URL に含まれる認証情報など
   - **デバッグコード残置**: `console.log` / `console.debug` / `debugger` / `dd(` / `dump(` / `var_dump` / `print(` / `pp ` (Ruby) / `fmt.Println` の追加行
   - **TODO / FIXME / XXX** が **新規** 追加されているか (既存は無視)
   - **明らかな typo**: 識別子・コメント (英単語スペル誤り、地の日本語の誤字)
   - **コミット粒度**: 1 コミット内で「機能追加 + 無関係なリファクタ」「実装 + 大量フォーマット」が混ざっていないか
   - **不要な差分**: 末尾空白だけの変更、コメントアウトされた古いコード、空行だけの増減
   - **明らかな破綻**: 構文エラー疑い、未閉じカッコ、明らかに使われていない import の追加
3. 各指摘は `<ファイルパス>:<行番号>` を必ず付ける。行番号は diff の `@@ -a,b +c,d @@` から新ファイル側 (`+c`) で計算する。

## 出力フォーマット

レビュー結果は以下の Markdown で返す。指摘がない区分は見出しごと省略してよい。

```
## サマリ
- ベース: <base>
- 範囲: <commits> コミット / <files> ファイル / +<add>/-<del> 行
- 所感: <1-2 文>

## Must (要修正)
- <path>:<line> — <指摘内容>

## Nits (任意)
- <path>:<line> — <指摘内容>
```

判定の目安:

- **Must**: そのまま push したら明らかに事故るもの (シークレット、デバッグコード、構文破綻、コミットに入れるべきでない無関係差分)
- **Nits**: 動作には影響しないが整えた方がよいもの (typo、コメントアウト残骸、軽微なスタイル)

## 禁止事項

- 自動でコード修正・コミット・amend をしない。レビューは **読むだけ**。
- ベースブランチ承認なしに `git diff` を実行しない (起動時コンテキストの範囲なら可)。
- `git push` / `git reset` / `git rebase` 等の状態変更コマンドは使わない。
- 推測で指摘を増やさない。実際に diff 上で確認できた箇所のみ報告する。

## 最後に伝えること

- 指摘 0 件なら `Must / Nits ともに指摘なし。` と明示する。
- Must がある場合は「修正後にもう一度 `/code-review` を実行することを推奨します」と案内する。
- 観点を変えたい / より厳しく見たい場合は `/cross-review` (辛口/甘口クロスバリデーション版) を案内する。
