export type ComponentOptions = {
  props?: Record<string, any>
  setup?: (
    props: Record<string, any>,
    ctx: { emit: (event: string, ...args: any[]) => void},
  ) => Function // ctx.emitを受け取れるように
  render?: () => Function
}