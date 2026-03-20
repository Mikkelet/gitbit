export function useClipboard() {
  function copy(text: string, event: Event) {
    const btn = event.target as HTMLButtonElement

    function onSuccess() {
      const orig = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = orig }, 1500)
    }

    // navigator.clipboard requires a secure context (HTTPS or localhost).
    // Fall back to the legacy execCommand approach over plain HTTP.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      onSuccess()
    }
  }

  return { copy }
}
