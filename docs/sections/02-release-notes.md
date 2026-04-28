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

### 3. develop にコミット & PR 経由で main へ

Section 1 で `develop → main` 運用に切り替えたので、Release Drafter の設定ファイルも同じフローに乗せる。
feature ブランチ → `develop` にマージ → git-pr-release が作るリリース PR をマージ → `main` 反映、の順で `main` に届く。

```bash
# develop からトピックブランチを切る
git switch develop
git pull
git switch -c ci/release-drafter

# 2 ファイルを追加
git add .github/release-drafter.yml .github/workflows/release-drafter.yml
git commit -m "ci: Release Drafter を導入"
git push -u origin ci/release-drafter

# develop に対して PR を作成し、即マージ
gh pr create --base develop --head ci/release-drafter --fill
gh pr merge --merge --delete-branch
```

`develop` への push で git-pr-release が `develop → main` のリリース PR を更新する。
そのリリース PR をマージすると `main` に届き、Release Drafter (`push: main` トリガ) が初回の Draft Release を作成する。

::: tip なぜトリガが `push: main` だけ?

Release Drafter は **config を常にデフォルトブランチ (main) から読み込む** 仕様。
PR トリガ (`pull_request`) を入れると、`.github/release-drafter.yml` が main に届く前の bootstrap PR で `Configuration file is not found` エラーになる。
基本構成 (autolabeler を使わない) では PR トリガは実質何もしないので、`push: main` のみで十分。

:::

### 4. PR ラベル運用

PR に ラベル (`feature` / `bug` / `chore`) を付ける運用を開始する。

## カスタマイズの勘所

- カテゴリやラベルの増減は `release-drafter.yml` の `categories` を編集
- バージョン解決ルール (`major` / `minor` / `patch`) もラベル基準に変更可能
- 外部向け / 内部向け 2 種類の Release body を作りたい場合は Notes を分割して書き出し

## チェックポイント

- [ ] PR をマージすると Draft Release が更新される
- [ ] ラベルに応じてカテゴリ分けされている
