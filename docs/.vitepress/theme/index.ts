import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { persistTaskCheckboxes } from './persistTaskCheckboxes'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return

    const apply = () => {
      requestAnimationFrame(() => persistTaskCheckboxes(window.location.pathname))
    }

    router.onAfterRouteChanged = apply
    apply()
  },
}

export default theme
