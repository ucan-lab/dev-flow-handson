# FAQ / トラブルシューティング

## 共通

### Q. `gh auth login` が会場の Wi-Fi で弾かれる

- Device flow (`gh auth login --web` → ブラウザコード入力) を試す
- それでもダメならスマホテザリング

### Q. Actions が失敗する: `GITHUB_TOKEN` に write 権限がない

- Repo `Settings → Actions → General → Workflow permissions` を "Read and write" に
  - URL 例: `https://github.com/<user-name>/dev-flow-handson-sandbox/settings/actions`
- Org レベルで制限されている場合は Org Admin に連絡

## Section 1 / 2 (GitHub Actions)

### Q. git-pr-release が PR を作ってくれない

- `develop` 以外にコミットしていないか (push トリガは `develop`)
- `main` と `develop` の両方が GitHub 上に存在するか
- `develop` と `main` で差分があるか (差分ゼロだと "No diff" で終了)
- `actions/checkout` で `fetch-depth: 0` を指定しているか (履歴がないと比較できない)
- `Settings → Actions → General` の **Workflow permissions** で "Allow GitHub Actions to create and approve pull requests" が OFF だと PR 作成に失敗

### Q. release-please / git-pr-release のどちらを使えば?

- `develop`/`main` の二段ブランチ運用 → git-pr-release
- `main` 一本 + Conventional Commits + CHANGELOG/タグも自動化 → release-please
- Section 1 の比較表参照

### Q. Release Drafter が動かない

- PR にラベルが付いているか (`feature` / `bug` / `chore`)
- `.github/release-drafter.yml` と workflow の両方を作ったか

## Section 3–5 (Claude Skills)

### Q. `/git-commit` がスキル一覧に出ない

- スキルファイルの配置: `~/.claude/skills/<dir>/SKILL.md` or `<project>/.claude/skills/<dir>/SKILL.md` (ディレクトリ + `SKILL.md` の形式)
- frontmatter の `name:` がディレクトリ名と一致しているか確認 (例: `git-commit`)
- Claude Code の再起動

### Q. コミットメッセージがいつも英語 (日本語が欲しい)

- スキル本文の最後に「コミットメッセージは日本語で」と追記
- あるいは `~/.claude/CLAUDE.md` のグローバル指示を参照

### Q. commit-organizer が main/master 上で走って怖い

- スキル本体に「main / master では実行しない」ガードが入っている雛形を使うこと

## Section 6 (Gemini Code Assist)

### Q. PR を作っても Gemini がコメントしない

- App がそのリポジトリにインストールされているか (`Settings → GitHub Apps`)
  - URL: `https://github.com/settings/installations`
- プライベートリポジトリの場合は追加の権限許可が必要
- 1–3 分のラグはあるので少し待つ

### Q. 指摘が多すぎ / 少なすぎ

- `comment_severity_threshold` を調整 (`LOW` / `MEDIUM` / `HIGH` / `CRITICAL`)
- `ignore_patterns` で対象外を広げる

### Q. Claude と Gemini のどちらを使えば?

- 書く時 = Claude Code / 見る時 (PR) = Gemini が最小構成
- 精読が必要な PR は Claude の `code-reviewer` agent で再レビュー

## その他

### Q. ハンズオン中に詰まった

- 隣の人に聞く or 講師/TA に声掛け
- 進捗を止めず、各セクションの **チェックポイント未達のまま次に進んで OK**。資料は後から 1 人で追える構成になっています。
