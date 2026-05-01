# AI 開発フロー自動化ハンズオン

開催日: 2026-05-07 (木)

## ねらい

AI (Claude Code / Gemini Code Assist) を組み込んで **コーディングではなく開発フロー自体** を自動化する。
既存の GitHub Actions ベースの自動化に AI レイヤーを重ね、日々の定型作業をゼロに近づけるのがゴール。

## 対象

- 日常的に Git / GitHub / GitHub Actions を使っているエンジニア
- Claude Code をインストール済み (未導入でも当日対応可)
- 自分のリポジトリで試したい自動化の候補が 1 つ以上ある人

## ゴール (当日 = お土産)

1. `/git:commit` `/git:commit-organizer` `/pr:create` スキルを使いこなし、**PR 提出までを 1 コマンド化** できる
2. Gemini Code Assist による **PR 自動レビュー** を有効化し、観点付きで指摘を返せるようになる
3. リリース PR とリリースノートが **push だけで生成される** 仕組みを自分のリポジトリに導入できる

## 取り扱う自動化

| #   | カテゴリ           | 自動化対象                   | 使うツール                    |
| --- | ------------------ | ---------------------------- | ----------------------------- |
| 1   | Claude Skills      | コミット生成                 | `/git:commit`                 |
| 2   | Claude Skills      | コミット整理 (rebase/squash) | `/git:commit-organizer`       |
| 3   | Claude Skills      | PR 作成                      | `/pr:create`                  |
| 4   | Gemini Code Assist | PR レビュー                  | Gemini Code Assist for GitHub |
| 5   | Claude Skills      | PR レビュー対応              | `/pr:review-respond`          |
| 6   | GitHub Actions     | リリース PR 作成             | git-pr-release                |
| 7   | GitHub Actions     | リリースノート生成           | Release Drafter               |

## ディレクトリ構成

```
.
├── README.md                # 本ファイル
├── docs/
│   ├── 00-prerequisites.md  # 事前準備
│   ├── sections/
│   │   ├── 01-commit.md
│   │   ├── 02-commit-organizer.md
│   │   ├── 03-pr-create.md
│   │   ├── 04-gemini-review.md
│   │   ├── 05-pr-review-respond.md
│   │   ├── 06-release-pr.md
│   │   └── 07-release-notes.md
│   └── 99-faq.md            # トラブルシューティング
└── examples/                # 雛形
    ├── github-actions/
    ├── claude-skills/
    └── gemini/
```

## 当日の流れ (ダイジェスト)

1. オープニング / ねらい共有
2. Section 1-3: Claude Skills 系
3. Section 4: Gemini Code Assist
4. Section 5: PR レビュー対応 (Claude Skills)
5. Section 6-7: GitHub Actions 系

## 参加までにやっておくこと

→ [docs/00-prerequisites.md](docs/00-prerequisites.md)

## ドキュメントをローカルで開く (VitePress)

```bash
npm install
npm run docs:dev      # http://localhost:5173 で閲覧
npm run docs:build    # 静的ビルド (docs/.vitepress/dist)
npm run docs:preview  # ビルド結果のプレビュー
```

## Markdown を整形する (Prettier)

```bash
npm run format        # 整形を実行
npm run format:check  # 差分チェックのみ (CI と同じ)
```

GitHub Actions (`.github/workflows/format-check.yml`) で PR 時に `format:check` が走る。
