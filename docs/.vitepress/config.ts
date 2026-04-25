import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AI 開発フロー自動化ハンズオン',
  description: '2026-05-07 開催 / Claude Code・Gemini Code Assist で開発フローを自動化する',
  lang: 'ja',
  lastUpdated: true,
  cleanUrls: true,
  base: process.env.DOCS_BASE ?? '/',
  themeConfig: {
    nav: [
      { text: 'はじめに', link: '/' },
      { text: '事前準備', link: '/00-prerequisites' },
      { text: 'アジェンダ', link: '/01-agenda' },
      { text: 'FAQ', link: '/99-faq' },
    ],
    sidebar: [
      {
        text: 'はじめに',
        items: [
          { text: 'トップ', link: '/' },
          { text: '事前準備', link: '/00-prerequisites' },
          { text: '当日アジェンダ', link: '/01-agenda' },
        ],
      },
      {
        text: 'GitHub Actions',
        collapsed: false,
        items: [
          { text: 'Section 1: リリース PR 作成', link: '/sections/01-release-pr' },
          { text: 'Section 2: リリースノート生成', link: '/sections/02-release-notes' },
        ],
      },
      {
        text: 'Claude Skills',
        collapsed: false,
        items: [
          { text: 'Section 3: コミット自動化', link: '/sections/03-commit' },
          { text: 'Section 4: コミット整理', link: '/sections/04-commit-organizer' },
          { text: 'Section 5: PR 作成', link: '/sections/05-pr-create' },
        ],
      },
      {
        text: 'Gemini Code Assist',
        collapsed: false,
        items: [
          { text: 'Section 6: PR レビュー', link: '/sections/06-gemini-review' },
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
})
