# Section 6: PR レビュー自動化 (Gemini Code Assist)

使うツール: [Gemini Code Assist for GitHub](https://github.com/apps/gemini-code-assist) (GitHub App)

## Why — なぜやるか

- 小さな PR こそ人間レビュアーが後回しにされがち
- 「lint で十分な指摘」を人間がやるのはもったいない
- 2 枚目の目として常時稼働する AI レビュアーが欲しい

## Demo — 完成形

- PR を open すると Gemini Code Assist が自動で要約 + レビューコメントを投稿
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

雛形: `examples/gemini/config.yaml` / `examples/gemini/styleguide.md`

### 3. 動作確認

```bash
git checkout -b test/gemini-review
echo "const x=1" > sample.ts     # 意図的に乱雑なコード
git add sample.ts
git commit -m "feat: add sample"
git push -u origin test/gemini-review
gh pr create --fill
```

数分以内に PR コメントが付くことを確認。

## カスタマイズの勘所

- **レビュー言語を日本語に** → `config.yaml` の `language: ja`
- **ノイズを減らす** → `comment_severity_threshold: MEDIUM` 以上のみにする
- **特定ディレクトリだけレビュー** → `ignore_patterns` で除外
- **ポリシー共有** → `styleguide.md` にチームの合意事項を書いておけば AI がそれに従う
- セキュリティ観点 / パフォーマンス観点など複数の「レビュアー人格」を切り替えたい場合は config を複数運用 (ブランチ別)

## Claude との使い分け

| 役割                 | 推奨                                   |
| -------------------- | -------------------------------------- |
| コーディング (実装)  | Claude Code                            |
| PR レビュー (第一次) | Gemini Code Assist                     |
| PR レビュー (精読)   | 人間 + Claude の `code-reviewer` agent |

Gemini は「PR を開いた瞬間の一次レビュー」に特化、Claude Code は「書きながらの壁打ち」と覚える。

## チェックポイント

- [ ] PR に Gemini のサマリ + コメントが付いた
- [ ] `@gemini-code-assist` メンションに返信が来る
- [ ] `.gemini/config.yaml` が反映されている (日本語レビューなど)
