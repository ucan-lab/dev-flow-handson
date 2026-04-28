---
layout: home

hero:
  name: AI 開発フロー自動化
  text: ハンズオン
  tagline: GitHub Actions × Claude Skills × Gemini Code Assist で「コーディング以外」を自動化する
  actions:
    - theme: brand
      text: 事前準備を見る
      link: /00-prerequisites
    - theme: alt
      text: アジェンダ
      link: /01-agenda

features:
  - title: GitHub Actions で自動化
    details: git-pr-release と Release Drafter で、push だけでリリース PR とリリースノートが自動生成される仕組みを導入する。
    link: /sections/01-release-pr
  - title: Claude Skills で省力化
    details: /git-commit・/git-commit-organizer・/pr-create で、普段のコミットから PR 提出までをコマンド 1 つに圧縮する。
    link: /sections/03-commit
  - title: Gemini Code Assist で自動レビュー
    details: GitHub App を入れるだけで、PR に無料で AI レビューが返ってくる状態を作る。
    link: /sections/06-gemini-review
---

## このハンズオンの目的

**コーディングではなく、コーディングの "周辺作業" を自動化する** ことがゴールです。
リリース PR を切る、コミットメッセージを書く、PR を作る、レビューを依頼する — こうした毎日繰り返している定型作業を、AI と GitHub Actions で限りなくゼロに近づけます。

このハンズオンで扱うのは次の 3 本柱です。

1. **GitHub Actions による自動化** — リリース PR 作成 / リリースノート生成
2. **Claude Skills によるローカル作業の自動化** — コミット・コミット整理・PR 作成・レビュー対応
3. **Gemini Code Assist による無料の PR 自動レビュー**

::: warning このハンズオンで扱わないこと
**自動テスト・自動デプロイなど CI/CD パイプラインの構築は対象外** です。
GitHub Actions は使いますが、テスト実行やデプロイ自動化ではなく、**リリースフローの定型作業を AI で省力化する** 用途に限定します。
:::

## 対象

- 日常的に Git / GitHub / GitHub Actions を使っているエンジニア
- Claude Code をインストール済み (有償サブスクリプション契約済み前提)
- 自分のリポジトリで試したい自動化の候補が 1 つ以上ある人

## 当日のお土産

1. リリース PR とリリースノートが **push だけで生成される** 仕組みを自分のリポジトリに導入できる
2. `/git-commit` `/git-commit-organizer` `/pr-create` スキルで **PR 提出までを 1 コマンド化** できる
3. Gemini Code Assist による **PR 自動レビュー** を有効化し、観点付きで指摘を返せるようになる

## 取り扱う自動化

| #   | カテゴリ           | 自動化対象                   | 使うツール                    |
| --- | ------------------ | ---------------------------- | ----------------------------- |
| 1   | GitHub Actions     | リリース PR 作成             | git-pr-release                |
| 2   | GitHub Actions     | リリースノート生成           | Release Drafter               |
| 3   | Claude Skills      | コミット生成                 | `/git-commit`                 |
| 4   | Claude Skills      | コミット整理 (rebase/squash) | `/git-commit-organizer`       |
| 5   | Claude Skills      | PR 作成                      | `/pr-create`                  |
| 6   | Gemini Code Assist | PR レビュー                  | Gemini Code Assist for GitHub |
| 7   | Claude Skills      | PR レビュー対応              | `/pr-review-respond`          |

## 進め方

セクションは次の 5 パートで構成されています。

1. **なぜやるか** (Why) — その自動化が無いと何が痛いか
2. **完成形** (Demo) — 最終的にどう動くか
3. **手順** (How) — コピペで動く具体的ステップ
4. **カスタマイズの勘所** — 自分のリポジトリに持ち帰る時のチューニング
5. **チェックポイント** — 次セクションへ進む前に動作確認

まずは [事前準備](/00-prerequisites) を済ませてから当日に臨んでください。
