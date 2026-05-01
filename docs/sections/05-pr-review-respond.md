# Section 5: PR レビュー対応自動化 (Claude Skills)

使うツール: `/pr-review-respond` スキル

## Why — なぜやるか

- Gemini Code Assist や人間レビュアーから飛んでくるコメントを、1 件ずつ手で拾って返すのは時間がかかる
- 「対応する / 議論したい / 対応しない」の判断 → 修正コミット → 返信、の流れがほぼ機械的
- 指摘単位のコミット粒度を保ちたい (squash merge なら粒度は崩せるが、レビューの追跡性は下げたくない)

## Demo — 完成形

1. PR に未解決のレビューコメントが N 件残っている状態
2. `/pr-review-respond` を実行
3. AI が未解決コメントを集計し、各指摘について「対応 / 議論 / 対応しない」の方針案を提示
4. 承認後、指摘ごとに 1 コミット → push、各コメントに `@reviewer` メンション付きで返信

## How — 手順

### 1. スキル登録

以下の内容で `~/.claude/skills/pr-review-respond/SKILL.md` を作成 (右上のコピーボタン)。

<<< ../../examples/claude-skills/pr-review-respond/SKILL.md [~/.claude/skills/pr-review-respond/SKILL.md]

### 2. 実行

Section 4 で Gemini Code Assist のコメントが付いた PR を使う。
Section 3 で作った PR を使う場合は、先に `/gemini review` でレビューコメントを発生させておく。

PR が紐づいているフィーチャーブランチ上で:

```
/pr-review-respond
```

PR 番号を明示したい場合は引数で指定:

```
/pr-review-respond 123
```

### 3. 提示フォーマット

スキルは未解決コメントを次のように一覧化します。

```
■ 未解決レビューコメント 3 件

[1] @reviewer-a path/to/file.ts:42
    指摘: null チェック漏れ
    判断: 対応する
    方針: ガード句を追加

[2] @reviewer-b README.md:10
    指摘: 表記ゆれ
    判断: 対応する
    方針: 文言修正

[3] @reviewer-a src/index.ts:88
    指摘: 命名がわかりにくい
    判断: 議論したい
    方針: 既存実装との整合を確認したい旨を返信
```

### 4. 実行内容

- 「対応する」項目: 指摘 1 件 = 1 コミット で修正 → `git push`
- 「議論したい / 対応しない」項目: コミットせず、返信のみ
- インラインコメントは GitHub API の reply エンドポイント (`in_reply_to`) を使ってスレッドに紐付ける
- すべての返信に `@<reviewer>` メンションを付与

## 補足

- コミットメッセージのフォーマットを Conventional Commits に揃える (`fix:` / `refactor:` / `docs:`)
- Gemini Code Assist のコメントに対しては `@gemini-code-assist` 宛にメンションして再レビューを依頼

## 禁止事項 (スキル側でガード済み)

- ユーザー承認なしのコミット / push / コメント投稿
- `--force` push (履歴整理が必要なら `/git-commit-organizer` を案内)
- 解決済みスレッドへの蒸し返し

## チェックポイント

- [ ] 未解決コメントが正しく一覧化される
- [ ] 指摘ごとに 1 コミットで修正されている
- [ ] 各レビューコメントに `@<reviewer>` メンション付きの返信が付いている
- [ ] 解決済みスレッドが再オープンされていない
