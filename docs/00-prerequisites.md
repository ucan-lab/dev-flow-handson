# 事前準備 (当日までに済ませておくこと)

## 1. アカウント / 権限

- [ ] **GitHub アカウント**
- [ ] **Google アカウント** (Gemini Code Assist for GitHub を有効化するため)

## 2. ローカル環境

### 必須

| ツール                           | 推奨バージョン | 確認コマンド    |
| -------------------------------- | -------------- | --------------- |
| Git                              | 2.40+          | `git --version` |
| GitHub CLI (`gh`)                | 2.50+          | `gh --version`  |

### Claude Code

- Claude Code クイックスタート: https://code.claude.com/docs/ja/quickstart

```bash
claude --version
2.1.119 (Claude Code)
```

### `gh` 認証

```bash
gh auth login
gh auth status
```

`gh auth login` では対話形式でいくつか質問されます。基本的には次の選択になっていれば OK です。

```text
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? SSH
? Upload your SSH public key to your GitHub account? /Users/ucan/.ssh/github.pub
? Title for your SSH key: GitHub CLI
? How would you like to authenticate GitHub CLI? Login with a web browser
```

各設問で確認すること:

- `Where do you use GitHub?`: 通常の GitHub を使う場合は `GitHub.com` を選ぶ。会社の GitHub Enterprise Server を使う場合だけ別ホストを選ぶ。
- `preferred protocol`: このハンズオンでは `SSH` を選ぶ。`HTTPS` を選ぶと Git 操作時の認証方式が変わり, 後続手順の前提とズレる。
- `Upload your SSH public key`: 表示された公開鍵を GitHub に登録する。自分の SSH 公開鍵が別パスにある場合はその鍵を選ぶ。まだ鍵がない場合は先に `ssh-keygen` で作る。
- `Title for your SSH key`: GitHub 上で識別するための名前。迷ったら `GitHub CLI` のままでよい。
- `authenticate GitHub CLI`: `Login with a web browser` を選び, ブラウザで GitHub にログインして認可する。

`gh auth status` の結果は次の状態になっていれば OK です。

```text
github.com
  ✓ Logged in to github.com account <your-account> (keyring)
  - Active account: true
  - Git operations protocol: ssh
  - Token: gho_************************************
  - Token scopes: 'admin:public_key', 'gist', 'read:org', 'repo'
```

確認ポイント:

- `Logged in` と表示されている
- `Active account: true` になっている
- `Git operations protocol: ssh` になっている
- `Token scopes` に `repo` が含まれている

`Git operations protocol: https` になっている場合は, この手順では未完了です。`gh auth login` をやり直すか, 次のコマンドで SSH に切り替えてください。

```bash
gh config set git_protocol ssh --host github.com
```

## 3. 練習用リポジトリの用意

練習用の空リポジトリ を用意します。

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

## 4. 動作確認チェック

下のコマンドがすべて成功すれば OK。

```bash
git --version
gh --version
gh auth status
claude --version
```
