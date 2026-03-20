export function useClipboard() {
  function copy(text: string, event: Event) {
    const btn = event.target as HTMLButtonElement
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = orig }, 1500)
    })
  }

  return { copy }
}
