# Section 2: リリースノート作成自動化

使うツール: [Release Drafter](https://github.com/release-drafter/release-drafter)

## Why — なぜやるか

Section 1 の git-pr-release は **「次のリリースに何が乗るか」を可視化する** ところまでが守備範囲。
リリースした後に **外部 / 社内向けに配るリリースノート** までは作ってくれない。
手で書くと

- マージ済み PR を漁って書き写す → 漏れる
- カテゴリ分け (新機能 / 修正 / その他) を毎回考える → 揺れる

→ Release Drafter で「ラベル別のセクション分類」を自動化し、人間は最終確認だけで済む状態を作る。
git-pr-release が **リリース PR**、Release Drafter が **リリースノート (Draft Release)** という役割分担。

## Demo — 完成形

1. PR に `feature` / `bug` / `chore` のラベルが付く
2. `main` への merge をトリガに Release Drafter が草稿リリースを更新
3. 各カテゴリにグルーピングされた Draft Release が常に最新化されている

## How — 手順

### 1. `.github/release-drafter.yml` を追加

<<< ../../examples/github-actions/release-drafter.yml [release-drafter.yml]

### 2. `.github/workflows/release-drafter.yml` を追加

<<< ../../examples/github-actions/release-drafter-workflow.yml [release-drafter-workflow.yml]

### 3. main にコミット & push

作った 2 ファイルを `main` に乗せる。以下をそのままコピペで OK。

```bash
git switch main
git add .github/release-drafter.yml .github/workflows/release-drafter.yml
git commit -m "ci: Release Drafter を導入"
git push origin main
```

### 4. PR ラベル運用

PR に ラベル (`feature` / `bug` / `chore`) を付ける運用を開始する。

## カスタマイズの勘所

- カテゴリやラベルの増減は `release-drafter.yml` の `categories` を編集
- バージョン解決ルール (`major` / `minor` / `patch`) もラベル基準に変更可能
- 外部向け / 内部向け 2 種類の Release body を作りたい場合は Notes を分割して書き出し

## チェックポイント

- [ ] PR をマージすると Draft Release が更新される
- [ ] ラベルに応じてカテゴリ分けされている
