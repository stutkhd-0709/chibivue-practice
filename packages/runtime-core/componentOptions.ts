export type ComponentOptions = {
  props?: Record<string, any>
  setup?: (
    props: Record<string, any>,
    ctx: { emit: (event: string, ...args: any[]) => void},
  ) => Function | void // ctx.emitを受け取れるように, void追加はテンプレートへのバインディングのため
  render?: () => Function
  template?: string
}