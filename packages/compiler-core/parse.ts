export const baseParse = (
  content: string,
): { tag: string; props: Record<string, string>; textContent: string } => {
  // htmlタグに囲まれているかどうか
  const matched = content.match(/<(\w+)\s+([^>]*)>([^<]*)<\/\1>/)
  if (!matched) return { tag: '', props: {}, textContent: '' }

  const [_, tag, attrs, textContent] = matched

  const props: Record<string, string> = {}
  // htmlタグのattributeをpropsに格納
  // 変換はしないので空文字returnしてる
  attrs.replace(/(\w+)=["']([^"']*)["']/g, (_, key: string, value: string) => {
    props[key] = value
    return ''
  })

  return { tag, props, textContent }
}