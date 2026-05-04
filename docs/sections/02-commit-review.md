# Section 2: 自作 Claude スキルによる、コミットのレビュー

使うツール: `/git-commit-review` スキル

## Why — なぜやるか

- コミット後に AI に diff をセルフレビューしてもらい、人間レビューに回す前に明らかな問題を潰したい
- 「とりあえずコミット → PR でレビュアー指摘 → 直してまたコミット」の往復を減らしたい
- 命名・テスト漏れ・デバッグコード残り・不要な差分などの低レベル指摘を AI に任せ、レビュアーは設計判断に集中したい

## Demo — 完成形

1. 実装してコミットまで終わった状態
2. Claude Code で `/git-commit-review` を実行
3. AI が直近のコミット (HEAD など) の diff を読み、指摘 (Must / Should / Nits) をカテゴリ別に提示
4. 指摘に応じて修正 → amend または追加コミット

## How — 手順

> ⚠️ TODO: スキル本体・サンプル運用・チェックポイントは後で詳細を詰める。以下は枠だけ。

### 1. 前提

- TODO

### 2. スキル登録

- TODO: `~/.claude/skills/git-commit-review/SKILL.md` の雛形を `examples/claude-skills/git-commit-review/SKILL.md` から流し込む

### 3. サンプル運用

- TODO: 練習用ブランチで diff を作って `/git-commit-review` を実行する手順

### 4. 出力フォーマット

- TODO: Must / Should / Nits の指摘カテゴリ・出力テンプレ

## 補足

- TODO

## チェックポイント

- [ ] TODO
