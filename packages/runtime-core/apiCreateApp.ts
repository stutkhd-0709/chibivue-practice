import { Component } from "./component"
import { RootRenderFunction } from "./renderer"

export interface App<HostElement = any> {
  mount(rootContainer: HostElement | string): void
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>

// rendererからRootRendererFunctionのinterfaceだけ渡して依存させてる
export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement) {
        // ! -> 非nullアサーション演算子
        // rootComponentはrenderを持たない可能性がある(型的に)
        // そうするとTSがエラーを返すが、それを防ぐために明示的にnullじゃないことを示す
        const vnode = rootComponent.render!()
        console.log(vnode); // ログを見てみる
        render(vnode, rootContainer)
      }
    }

    return app
  }
}