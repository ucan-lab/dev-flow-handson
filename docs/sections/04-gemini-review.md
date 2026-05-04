# Section 4: Gemini Code Assist による、プルリクレビュー

使うツール: [Gemini Code Assist for GitHub](https://github.com/apps/gemini-code-assist) (GitHub App)

## Gemini Code Assist とは

Google が提供する AI 開発支援サービス。IDE 用の補完 / チャット機能と、本セクションで使う **GitHub 上で PR を自動レビューしてくれる GitHub App** がある。GitHub App 単体なら GitHub アカウントだけで利用可能 (Google Cloud プロジェクト不要)。

### 無料枠 (Individual / Consumer)

| 項目                                  | 無料枠                |
| ------------------------------------- | --------------------- |
| **PR レビュー (GitHub App)**          | **33 PR / 日**        |
| IDE 補完・チャット (Code Assist 全体) | 1,000 リクエスト / 日 |
| ローカルコンテキスト                  | 100 万トークン        |

> 個人 OSS / 小規模リポジトリなら無料枠で十分。社内利用で 33 PR/日では足りない場合は Standard (1,500 req/日) / Enterprise (100+ PR レビュー/日) を検討。

### 主要モデル

最新世代の Gemini モデルが使われる (`config.yaml` で固定指定はせず、Google 側でアップデートされる)。

### 公式リンク

- 概要 (Google Developers): <https://developers.google.com/gemini-code-assist/docs/overview>
- 無料枠 / 上限: <https://developers.google.com/gemini-code-assist/resources/quotas>
- GitHub App インストール: <https://github.com/apps/gemini-code-assist>
- 料金プラン (Google Cloud): <https://cloud.google.com/products/gemini/pricing>
- GitHub での使い方ドキュメント: <https://developers.google.com/gemini-code-assist/docs/review-github-code>

## Why — なぜやるか

- PR レビューで本当に高いのは「指摘する時間」よりも、レビュー開始までの待ち時間。Gemini を入れると、PR を open した瞬間に一次レビューが走る
- 人間レビュアーには設計判断・仕様判断・チーム事情の確認に集中してほしい。typo、境界値、null 安全性、単純な見落としは AI に先に拾わせる
- 小さな PR ほど「後で見る」で滞留しやすい。AI レビューを常時走らせると、軽い PR でも最低限のフィードバックが即返る
- レビュー結果が GitHub 上に残るので、チーム全員が同じコメント・同じ差分・同じ判断履歴を見られる。個人のローカル確認で終わらない
- 実装に Claude を使っている場合、レビューも Claude だけだと「同じモデルの思い込み」を見逃しやすい。**別モデル (Gemini) の視点** を挟むことで、片方が見落としたパターンや別解にも気付ける

## Demo — 完成形

- PR を open すると Gemini Code Assist がレビューコメントを投稿
- `@gemini-code-assist` をメンションすると追加質問にも答える
- `/gemini review` コマンドで再レビューをトリガ

## How — 手順

### 1. GitHub App のインストール

1. https://github.com/apps/gemini-code-assist へアクセス
2. "Install" → 対象リポジトリ (または Organization) を選択
3. 権限付与 (Contents: read, PR: write, Issues: write)

### 2. 設定ファイル

リポジトリに以下を追加:

- `.gemini/config.yaml` — レビュー観点 / 対象ブランチ / 言語を定義
- `.gemini/styleguide.md` — チーム固有のコーディング規約 (任意)

#### `.gemini/config.yaml`

<<< ../../examples/gemini/config.yaml [.gemini/config.yaml]

#### `.gemini/styleguide.md`

<<< ../../examples/gemini/styleguide.md [.gemini/styleguide.md]

### 3. main にコミット & push

作った 2 ファイルを `main` に乗せる。以下をそのままコピペで OK。

```bash
git switch main
git add .gemini/config.yaml .gemini/styleguide.md
git commit -m "chore: Gemini Code Assist の設定を追加"
git push origin main
```

### 4. 動作確認

Section 3 で作った PR は、Gemini Code Assist のインストール前に open している可能性がある。
その PR を使う場合は、設定後に PR コメントで `/gemini review` を投稿して再レビューを明示的にトリガする。
新規 PR で確認するなら、以下の手順でよい。

```bash
git switch -c test/gemini-review
echo "const x=1" > sample.ts     # 意図的に乱雑なコード
git add sample.ts
git commit -m "feat: add sample"
git push -u origin test/gemini-review
gh pr create --fill
```

数分以内に PR コメントが付くことを確認。

## 補足

- **レビュー言語を日本語に** → `config.yaml` の `language: ja`
- **ノイズを減らす** → `comment_severity_threshold: MEDIUM` 以上のみにする
- **特定ディレクトリだけレビュー** → `ignore_patterns` で除外
- **ポリシー共有** → `styleguide.md` にチームの合意事項を書いておけば AI がそれに従う
- セキュリティ観点 / パフォーマンス観点など複数の「レビュアー人格」を切り替えたい場合は config を複数運用 (ブランチ別)

## チェックポイント

- [ ] PR に Gemini のサマリ + コメントが付いた
- [ ] `@gemini-code-assist` メンションに返信が来る
- [ ] `.gemini/config.yaml` が反映されている (日本語レビューなど)
