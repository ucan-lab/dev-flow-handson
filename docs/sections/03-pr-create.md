# Section 3: PR 作成自動化 (Claude Skills)

使うツール: `/pr-create` スキル

## Why — なぜやるか

- PR の Summary / Test plan を真面目に書くのが面倒で、結局「タイトルだけ」「コミットメッセージそのまま」の中身が薄い PR ができがち
- レビュアーに渡す前に自分のコミットを全部読み返して要約するのが手間 → AI に読ませる
- テンプレートを毎回埋める作業こそ自動化の本命

## Demo — 完成形

1. フィーチャーブランチで作業完了
2. `/pr-create` を実行
3. AI が `git log base..HEAD` と `git diff base...HEAD` を読み、次を生成:
   - PR タイトル (70 文字以内)
   - Summary (箇条書き 1–3 点)
   - Test plan (チェックリスト)
   - 影響範囲メモ / スクリーンショット欄 (必要なら)
4. 承認で `gh pr create` を実行

## How — 手順

### 1. スキル登録

以下の内容で `~/.claude/skills/pr-create/SKILL.md` を作成 (右上のコピーボタン)。

<<< ../../examples/claude-skills/pr-create/SKILL.md [~/.claude/skills/pr-create/SKILL.md]

### 2. PR テンプレートとの統合

リポジトリに `.github/PULL_REQUEST_TEMPLATE.md` がある場合、スキルはその構造を尊重してセクションを埋める。
テンプレートは `/pr-create` 実行前に `main` へ入れる。後から追加しても、既に作った PR の本文には反映されない。

本ハンズオン用テンプレート:

<<< ../../examples/github-actions/PULL_REQUEST_TEMPLATE.md [.github/PULL_REQUEST_TEMPLATE.md]

作ったら `main` に乗せる。以下をそのままコピペで OK。

```bash
git switch main
git pull
git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "chore: PR テンプレートを追加"
git push origin main
```

### 3. PR 対象ブランチへ戻る

Section 1 のサンプルを使っている場合は、コミット済みのブランチへ戻る。
別のブランチを使う場合も、`main` ではなく PR 化したいフィーチャーブランチ上で実行する。

```bash
git switch feat/version-constant
```

### 4. 実行

```
/pr-create
```

未 push のブランチなら自動で `git push -u origin <branch>` まで実行する (スキル側で確認ステップあり)。

## カスタマイズの勘所

- 関連 Issue 番号を自動抽出 (ブランチ名 `feat/ABC-123-xxx` から `ABC-123` を抽出してリンク)
- プロジェクト固有の「リリース影響の有無」欄は PR テンプレートに追加しておけばスキルが自動で埋める
- draft PR で作るか ready で作るかはユーザーに聞く

## チェックポイント

- [ ] PR のタイトルが 70 文字以内で要旨を伝えている
- [ ] Summary は WHY が先頭に書かれている
- [ ] Test plan にチェックボックスが並ぶ
- [ ] PR URL が返り、ブラウザで開ける
