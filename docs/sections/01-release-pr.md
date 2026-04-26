# Section 1: リリース PR 作成自動化

使うツール: [release-please](https://github.com/googleapis/release-please) (GitHub Action)

## Why — なぜやるか

リリース作業の定型パートはこのあたり:

- `main` に溜まったコミットを眺めて次バージョン番号を決める
- CHANGELOG を手で書く
- リリース PR を作って承認を取る

これ全部 AI じゃなくても自動化できます。Conventional Commits を守っていれば release-please が **リリース PR をずっと最新に保ってくれる**。

## Demo — 完成形

- `main` に `feat: ...` や `fix: ...` のコミットが入ると、release-please が自動で
  - バージョン番号を semver で決定
  - CHANGELOG.md を更新
  - `chore(main): release x.y.z` という PR を作成 / 更新
- その PR をマージすると Git タグ + GitHub Release が自動作成

## How — 手順

### 1. `.github/workflows/release-please.yml` を追加

以下の内容をそのままコピーしてください (右上のコピーボタン)。

<<< ../../examples/github-actions/release-please.yml [release-please.yml]

### 2. リポジトリ設定

- `Settings → Actions → General`
  - "Workflow permissions" を **Read and write** に
  - "Allow GitHub Actions to create and approve pull requests" を ON

### 3. Conventional Commits ルールを共有

最低限覚える 3 つ:

| プレフィックス                | 意味       | semver |
| ----------------------------- | ---------- | ------ |
| `feat:`                       | 新機能     | minor  |
| `fix:`                        | バグ修正   | patch  |
| `feat!:` / `BREAKING CHANGE:` | 破壊的変更 | major  |

### 4. 動かす

```bash
# サンプル機能追加
echo "console.log('hello')" > hello.js
git add hello.js
git commit -m "feat: add hello script"
git push origin main
```

Actions タブで release-please が走り、`Release PR` が作られることを確認。

## カスタマイズの勘所

- モノレポ対応: `release-please-config.json` で package ごとに設定
- 日本語 CHANGELOG: `changelog-notes-type: "default"` のまま、`--release-as` で明示指定も可
- 既存プロジェクトへの導入: `release-please-manifest.json` で現行バージョンを明示

## チェックポイント

- [ ] Actions タブに release-please の実行履歴がある
- [ ] `Release PR` がオープンしている、または直近の main に reaction されている
- [ ] CHANGELOG.md が自動更新されている (PR 内で確認)

→ 次は Section 2 (リリースノート) へ
