# Section 2: リリースノート作成自動化

使うツール: [Release Drafter](https://github.com/release-drafter/release-drafter)

## Why — なぜやるか

release-please の自動 CHANGELOG は **機械的** で、人間向けハイライトが薄い。
`feat: add xxx` の列挙だけだと読者はうれしくない。
→ Release Drafter で「ラベル別のセクション分類」を自動化し、人間は最終確認だけで済む状態を作る。

## Demo — 完成形

1. PR に `feature` / `bug` / `chore` のラベルが付く
2. `main` への merge をトリガに Release Drafter が草稿リリースを更新
3. 各カテゴリにグルーピングされた Draft Release が常に最新化されている

## How — 手順

1. `.github/release-drafter.yml` を追加 (雛形: `examples/github-actions/release-drafter.yml`)
2. `.github/workflows/release-drafter.yml` を追加 (雛形: `examples/github-actions/release-drafter-workflow.yml`)
3. PR に ラベル (`feature` / `bug` / `chore`) を付ける運用を開始

## カスタマイズの勘所

- カテゴリやラベルの増減は `release-drafter.yml` の `categories` を編集
- バージョン解決ルール (`major` / `minor` / `patch`) もラベル基準に変更可能
- 外部向け / 内部向け 2 種類の Release body を作りたい場合は Notes を分割して書き出し

## チェックポイント

- [ ] PR をマージすると Draft Release が更新される
- [ ] ラベルに応じてカテゴリ分けされている
