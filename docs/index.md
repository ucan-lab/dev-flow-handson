---
layout: home

hero:
  name: AI 開発フロー自動化
  text: ハンズオン
  tagline: Claude Code と Gemini Code Assist で開発フロー自体を自動化する
  actions:
    - theme: brand
      text: 事前準備を見る
      link: /00-prerequisites
    - theme: alt
      text: アジェンダ
      link: /01-agenda

features:
  - title: GitHub Actions で自動化
    details: release-please と Release Drafter + Claude で、push だけでリリース PR とリリースノートが生成される仕組みを導入する。
    link: /sections/01-release-pr
  - title: Claude Skills で省力化
    details: /git:commit・/git:commit-organizer・/pr-create で、コミットから PR 提出までを 1 コマンドにまとめる。
    link: /sections/03-commit
  - title: Gemini Code Assist でレビュー
    details: PR に Gemini Code Assist を導入し、観点付きで自動レビューが返ってくる状態を作る。
    link: /sections/06-gemini-review
---

## ねらい

AI (Claude Code / Gemini Code Assist) を組み込んで **コーディングではなく開発フロー自体** を自動化する。
既存の GitHub Actions ベースの自動化に AI レイヤーを重ね、日々の定型作業をゼロに近づけるのがゴール。

## 対象

- 日常的に Git / GitHub / GitHub Actions を使っているエンジニア
- Claude Code をインストール済み (未導入でも当日対応可)
- 自分のリポジトリで試したい自動化の候補が 1 つ以上ある人

## 当日のお土産

1. リリース PR とリリースノートが **push だけで生成される** 仕組みを自分のリポジトリに導入できる
2. `/git:commit` `/git:commit-organizer` `/pr-create` 系スキルで **PR 提出までを 1 コマンド化** できる
3. Gemini Code Assist による **PR 自動レビュー** を有効化し、観点付きで指摘を返せるようになる

## 取り扱う自動化

| #   | カテゴリ           | 自動化対象                   | 使うツール                    |
| --- | ------------------ | ---------------------------- | ----------------------------- |
| 1   | GitHub Actions     | リリース PR 作成             | release-please                |
| 2   | GitHub Actions     | リリースノート生成           | Release Drafter + Claude      |
| 3   | Claude Skills      | コミット生成                 | `/git:commit`                 |
| 4   | Claude Skills      | コミット整理 (rebase/squash) | `/git:commit-organizer`       |
| 5   | Claude Skills      | PR 作成                      | `/pr-create`                  |
| 6   | Gemini Code Assist | PR レビュー                  | Gemini Code Assist for GitHub |

## 進め方

セクションは次の 5 パートで構成されています。

1. **なぜやるか** (Why) — その自動化が無いと何が痛いか
2. **完成形** (Demo) — 最終的にどう動くか
3. **手順** (How) — コピペで動く具体的ステップ
4. **カスタマイズの勘所** — 自分のリポジトリに持ち帰る時のチューニング
5. **チェックポイント** — 次セクションへ進む前に動作確認

まずは [事前準備](/00-prerequisites) を済ませてから当日に臨んでください。
