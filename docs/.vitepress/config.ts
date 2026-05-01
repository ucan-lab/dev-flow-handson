import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import taskLists from 'markdown-it-task-lists'

export default withMermaid(defineConfig({
  title: 'AI 開発フロー自動化ハンズオン',
  description: '2026-05-07 開催 / Claude Code・Gemini Code Assist で開発フローを自動化する',
  lang: 'ja',
  lastUpdated: true,
  cleanUrls: true,
  base: process.env.DOCS_BASE ?? '/',
  markdown: {
    config: (md) => {
      md.use(taskLists, { enabled: true })
    },
  },
  themeConfig: {
    nav: [
      { text: 'はじめに', link: '/' },
      { text: '事前準備', link: '/00-prerequisites' },
      { text: 'FAQ', link: '/99-faq' },
    ],
    sidebar: [
      {
        text: 'はじめに',
        items: [
          { text: 'トップ', link: '/' },
          { text: '事前準備', link: '/00-prerequisites' },
        ],
      },
      {
        text: 'Claude Skills',
        collapsed: false,
        items: [
          { text: 'Section 1: コミット自動化', link: '/sections/01-commit' },
          { text: 'Section 2: コミット整理', link: '/sections/02-commit-organizer' },
          { text: 'Section 3: PR 作成', link: '/sections/03-pr-create' },
        ],
      },
      {
        text: 'Gemini Code Assist',
        collapsed: false,
        items: [
          { text: 'Section 4: PR レビュー', link: '/sections/04-gemini-review' },
        ],
      },
      {
        text: 'Claude Skills (レビュー対応)',
        collapsed: false,
        items: [
          { text: 'Section 5: PR レビュー対応', link: '/sections/05-pr-review-respond' },
        ],
      },
      {
        text: 'GitHub Actions',
        collapsed: false,
        items: [
          { text: 'Section 6: リリース PR 作成', link: '/sections/06-release-pr' },
          { text: 'Section 7: リリースノート生成', link: '/sections/07-release-notes' },
        ],
      },
      {
        text: 'リファレンス',
        items: [{ text: 'FAQ / トラブルシューティング', link: '/99-faq' }],
      },
    ],
    outline: { level: [2, 3], label: '目次' },
    docFooter: { prev: '前のページ', next: '次のページ' },
    lastUpdatedText: '最終更新',
    darkModeSwitchLabel: 'カラーテーマ',
    sidebarMenuLabel: 'メニュー',
    returnToTopLabel: 'トップへ戻る',
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ucan-lab/dev-flow-handson' },
    ],
    footer: {
      message: '2026-05-07 開催 / 開発フロー自動化ハンズオン',
    },
  },
}))
