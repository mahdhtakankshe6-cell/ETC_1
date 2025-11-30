/**
 * 复制文本到剪贴板（支持多层级 fallback）
 *
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 复制成功返回 true，失败返回 false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 第一层：尝试现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      // Clipboard API 失败，继续尝试下一层
      console.warn('Clipboard API failed:', error)
    }
  }

  // 第二层：降级到传统 execCommand
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text

    // ✅ 关键：设置为只读，防止移动端输入法弹出打断 selection
    textarea.setAttribute('readonly', '')

    // 样式设置：隐藏但保持可操作
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'

    // ✅ 关键：明确设置为可选中
    textarea.style.userSelect = 'auto'
    textarea.style.webkitUserSelect = 'auto'

    document.body.appendChild(textarea)

    // 聚焦并选中文本
    textarea.focus()
    textarea.select()

    // 兼容 iOS
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange()
      range.selectNodeContents(textarea)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      textarea.setSelectionRange(0, textarea.value.length)
    }

    // 执行复制命令
    const success = document.execCommand('copy')

    // 清理 DOM
    document.body.removeChild(textarea)

    return success
  } catch (error) {
    console.warn('execCommand copy failed:', error)
    return false
  }
}
