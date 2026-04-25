# 事前準備 (当日までに済ませておくこと)

所要時間目安: 30–40 分

## 1. アカウント / 権限

- [ ] **GitHub アカウント** (自分で push / workflow 編集できるリポジトリを 1 つ用意)
  - 既存リポジトリを使う場合は `Settings → Actions → General` で「Read and write permissions」を許可しておく
  - 「Allow GitHub Actions to create and approve pull requests」も ON にする
- [ ] **Google アカウント** (Gemini Code Assist for GitHub を有効化するため)

## 2. ローカル環境

### 必須

| ツール                           | 推奨バージョン | 確認コマンド    |
| -------------------------------- | -------------- | --------------- |
| Git                              | 2.40+          | `git --version` |
| GitHub CLI (`gh`)                | 2.50+          | `gh --version`  |
| Node.js or Python など言語処理系 | 任意           | —               |

### Claude Code

- [ ] Claude Code をインストール ([公式ガイド](https://docs.claude.com/claude-code))
- [ ] `claude --version` で起動確認
- [ ] `~/.claude/` に書き込み権限があること

### `gh` 認証

```bash
gh auth login
gh auth status
```

## 3. 練習用リポジトリの用意

当日 「自分のリポジトリでいきなり触る」 は事故のもと。**練習用の空リポジトリ** を用意してください。

```bash
# 例: GitHub 上に空のリポジトリを作成
gh repo create dev-flow-handson-sandbox --public --clone
cd dev-flow-handson-sandbox

# README を作って初回コミット
echo "# dev-flow-handson-sandbox" > README.md
git add README.md
git commit -m "chore: initial commit"
git push -u origin main
```

## 4. 配布する Secrets の取得 (当日の講師案内に従う)

当日扱う自動化は基本的に追加 Secrets 不要です。

- `GEMINI_API_KEY` は不要 (Gemini Code Assist は GitHub App として動作)

## 5. 動作確認チェック

下のコマンドがすべて成功すれば OK。

```bash
git --version
gh --version
gh auth status
claude --version
```

## 6. 当日持参するもの

- ノート PC (電源アダプタ)
- 上記の練習用リポジトリ URL
- やる気

---

不安な点があれば当日開始 15 分前に会場入り → サポートします。
