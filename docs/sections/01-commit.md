# Section 1: 自作 Claude スキルによる、コミットメッセージの提案

使うツール: `/git-commit` スキル

## Why — なぜやるか

- git commit -m "fix: xxx" タイトルメッセージだけで済ませてしまう。
- コミットメッセージの本文まで考えるのがめんどう
- `git diff` を毎回読んで要点をAIにまとめてもらってコミットメッセージを提案してもらいたい

## Demo — 完成形

1. 実装する
2. Claude Code で `/git-commit` を実行
3. AI が diff を読み、`feat: ...` / `fix: ...` を含む候補メッセージを提示
4. 承認するとコミットする

## 準備

練習用の空リポジトリ を用意します。

```bash
# 例: GitHub 上に空のリポジトリを作成
gh repo create dev-flow-handson-sandbox --public --clone
cd dev-flow-handson-sandbox

# README を作って初回コミット
echo "# dev-flow-handson-sandbox" > README.md
git add README.md
git commit -m "first commit"
git push -u origin main

# リポジトリを表示
gh repo view --web
```

## How — 手順

### 1. スキルの確認

Claude Code 起動中に以下を実行:

```
/git-commit
```

「そのようなスキルはありません」と出た場合は、`~/.claude/skills/git-commit/SKILL.md` があるか確認。無ければ以下の内容で `~/.claude/skills/git-commit/SKILL.md` を作成 (右上のコピーボタンで取得)。

<<< ../../examples/claude-skills/git-commit/SKILL.md [~/.claude/skills/git-commit/SKILL.md]

#### フロントマターの読み方

スキル冒頭の YAML フロントマターは Claude Code がスキルを認識するためのメタ情報。各フィールドの意味は以下:

| フィールド                 | 役割                                                                                                                                                  | このスキルでの値                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `name`                     | スラッシュコマンド名 (`/git-commit`) として登録されるキー。`group:command` 形式にするとグルーピング表示される。                                       | `git-commit`                                 |
| `description`              | スキル一覧やモデルがスキルを選ぶときに参照する説明文。1〜2 行で「何をするか」を端的に書く。                                                           | コミットメッセージ案を作って承認後にコミット |
| `disable-model-invocation` | `true` にすると **モデルが自律的に呼ばない** ようになり、ユーザーが明示的に `/git-commit` と打った時だけ起動。誤発火を防ぐ用途。                      | `true` (コミットは必ず人間トリガで)          |
| `allowed-tools`            | スキル実行中に使えるツールをホワイトリストで制限。`Bash(git *)` は `git` で始まる Bash コマンドのみ許可、という意味で、`rm` や `npm` などは弾かれる。 | `Bash(git *)`                                |

> 補足: `allowed-tools` は省略するとそのセッションの既定権限がそのまま使える。安全側に倒したいスキル (コミット・push 系) では明示的に絞るのがおすすめ。
> 補足: `disable-model-invocation` を付けないと、会話の流れで Claude が「ここでコミットすべき」と判断したタイミングで勝手に `/git-commit` 相当の処理を呼ぶことがある。ステージング状態を確認してから実行したい運用なら付けておく。

#### 本文中のテクニック

スキル本文 (フロントマター以下の Markdown) でも、Claude Code 固有の記法をいくつか使っている。

**1. `!` プレフィックスによるコマンド埋め込み (起動時コンテキスト)**

```markdown
- 現在ブランチ: !`git branch --show-current`
- 作業ツリー状態: !`git status --short`
- staged diff (要約): !`git diff --staged --stat`
- unstaged diff (要約): !`git diff --stat`
- 直近 5 コミット (スタイル参考用): !`git log -5 --oneline`
```

- バッククォート直前の `!` は「**スキル起動時にこのシェルコマンドを実行し、その出力を本文に展開**」する記法。
- AI に Bash ツールを呼ばせるよりも 1 ターン早く事実を渡せるので、`git status` のような **毎回必ず見る情報** を先回りで注入したいときに使う。
- 副作用のないコマンド (`git status`, `ls`, `cat README.md` など) に限定する。`git push` のような書き込み系は絶対に書かない (起動の度に走る)。
- `allowed-tools` で `Bash(git *)` を許可していないと、ここで使う `git` コマンドも弾かれる点に注意。

**2. なぜ「起動時コンテキスト」を冒頭に置くのか**

- AI は最初に渡された情報ほど判断材料として参照しやすい。
- 「diff を見て要約しろ」より「以下が staged diff の summary です。これを踏まえて本文を読め」のほうが、無駄な探索ターンが減る。
- ブランチ名や直近コミットのスタイル (英語/日本語、語調) を最初に渡しておくと、出力スタイルが安定する。

**3. 手順を番号付きリストで書く**

- スキル本文は **AI 向けの実行手順書**。曖昧な「いい感じに」を避け、`1. → 2. → 3.` で分岐や条件 (「未 staged があれば確認」など) まで明示する。
- 出力フォーマット (コミットメッセージのテンプレ) もコードブロックで具体例を見せると、ブレが小さくなる。

**4. ガードレールは「やらないこと」も明記**

- `--amend は使わない`, `絵文字は使わない`, `.env が staged にあれば警告` のような **NG ルール** を本文末に集約。
- AI は「やっていいこと」より「やってはいけないこと」のほうが守りやすいので、禁止事項は箇条書きで残す。

### 2. サンプル運用

Section 3 の PR 作成につなげるため、`main` に直接コミットせずトピックブランチで作業する。

```bash
# 練習用ブランチを作る
git switch main
git pull
git switch -c feat/version-constant

# ファイルを編集
echo "export const version = '0.1.0'" > version.ts
git add version.ts
```

Claude Code で:

```
/git-commit
```

AI の提案例:

```
feat: expose package version constant

- add version.ts exporting semver string
- used by release workflow to validate tag
```

`y` で承認 → コミット完了。

## チェックポイント

- [ ] `/git-commit` が AI からメッセージ案を提示する
- [ ] Conventional Commits プレフィックスが正しく推論されている
- [ ] コミット後、`git log -1` で意図した内容になっている

---
