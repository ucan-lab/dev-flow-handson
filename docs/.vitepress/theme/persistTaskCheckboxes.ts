const STORAGE_PREFIX = 'vitepress:task-list:'

const buildKey = (path: string): string => `${STORAGE_PREFIX}${path}`

const readState = (path: string): boolean[] => {
  try {
    const raw = localStorage.getItem(buildKey(path))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(Boolean) : []
  } catch {
    return []
  }
}

const writeState = (path: string, state: boolean[]): void => {
  try {
    localStorage.setItem(buildKey(path), JSON.stringify(state))
  } catch {
    // quota / disabled storage は黙殺
  }
}

export const persistTaskCheckboxes = (path: string): void => {
  const checkboxes = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input.task-list-item-checkbox[type="checkbox"]',
    ),
  )

  if (checkboxes.length === 0) return

  const saved = readState(path)

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.dataset.persistBound === 'true') return
    checkbox.dataset.persistBound = 'true'
    checkbox.dataset.persistIndex = String(index)

    if (saved[index] !== undefined) {
      checkbox.checked = saved[index]
    }

    checkbox.addEventListener('change', () => {
      const next = checkboxes.map((cb) => cb.checked)
      writeState(path, next)
    })
  })
}
