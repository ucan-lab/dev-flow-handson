# Section 3: コミット自動化 (Claude Skills)

使うツール: `/git:commit` スキル

## Why — なぜやるか

- コミットメッセージを考える時間を毎回 30 秒〜 1 分取られている
- Conventional Commits を徹底したいが、うっかり `update something` と書いてしまう
- `git diff` を毎回読んで要点を掴むのは AI が得意な作業

## Demo — 完成形

1. `git add` で差分を staged に載せる
2. Claude Code で `/git:commit` を実行
3. AI が diff を読み、`feat: ...` / `fix: ...` を含む候補メッセージを提示
4. 承認すると即コミット

## How — 手順

### 1. スキルの確認

Claude Code 起動中に以下を実行:

```
/git:commit
```

「そのようなスキルはありません」と出た場合は、`~/.claude/skills/git/commit.md` があるか確認。無ければ `examples/claude-skills/git-commit/SKILL.md` をコピー。

### 2. サンプル運用

```bash
# ファイルを編集
echo "export const version = '0.1.0'" > version.ts
git add version.ts
```

Claude Code で:

```
/git:commit
```

AI の提案例:

```
feat: expose package version constant

- add version.ts exporting semver string
- used by release workflow to validate tag
```

`y` で承認 → コミット完了。

### 3. 英語 / 日本語の切替

スキル内のプロンプトに言語指定を書く。本ハンズオンの雛形は日本語コミット向け / 英語コミット向けの 2 種類を用意。

## カスタマイズの勘所

- プロジェクト固有のプレフィックス (例: `[ABC-123] feat: ...`) を強制 → プロンプトに固定前置き
- 差分が大きいときに「1 コミットにまとめるか分割するか」を AI に判断させる → Section 4 の commit-organizer と組み合わせ
- pre-commit フック落ちは amend せず新規コミット (global CLAUDE.md のルール) を徹底

## チェックポイント

- [ ] `/git:commit` が AI からメッセージ案を提示する
- [ ] Conventional Commits プレフィックスが正しく推論されている
- [ ] コミット後、`git log -1` で意図した内容になっている
