# Section 2: リリースノート作成自動化

使うツール: [Release Drafter](https://github.com/release-drafter/release-drafter) + (任意で) Claude による要約強化

## Why — なぜやるか

release-please の自動 CHANGELOG は **機械的** で、人間向けハイライトが薄い。
`feat: add xxx` の列挙だけだと読者はうれしくない。
→ 「セクション分類」「意図の言語化」を AI に任せると人間は最終確認だけで済む。

## Demo — 完成形

1. PR に `feature` / `bug` / `chore` のラベルが付く
2. `main` への merge をトリガに Release Drafter が草稿リリースを更新
3. 任意: ワークフロー内で Claude を呼び出し、箇条書きを「ユーザー視点の要約」に書き換えてコメント投稿

## How — 手順

### Step A: Release Drafter の導入

1. `.github/release-drafter.yml` を追加 (雛形: `examples/github-actions/release-drafter.yml`)
2. `.github/workflows/release-drafter.yml` を追加 (雛形: `examples/github-actions/release-drafter-workflow.yml`)
3. PR に ラベル (`feature` / `bug` / `chore`) を付ける運用を開始

### Step B: Claude で要約強化 (オプション)

1. Repository secrets に `ANTHROPIC_API_KEY` を登録
2. `.github/workflows/release-notes-polish.yml` を追加 (雛形: `examples/github-actions/release-notes-polish.yml`)
3. タグ push 時に Claude がリリースノート本文を日本語で読みやすく書き換え → Release body を更新

## カスタマイズの勘所

- プロダクト広報向けに「ユーザーに見えない変更」を除外するフィルタをプロンプトで追加
- 外部向け / 内部向け 2 種類の Release body を作りたい場合は Notes を分割して書き出し
- PR 本文に含まれる "## Summary" をプロンプトに取り込むと品質が跳ね上がる

## チェックポイント

- [ ] PR をマージすると Draft Release が更新される
- [ ] (任意) Claude ポリッシュ後のリリースノートが日本語で読みやすい
