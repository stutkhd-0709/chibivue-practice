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
      // appオブジェクトにmount関数を持たせる
      mount(rootContainer: HostElement) {
        // createAppAPIの引数のrender関数
        render(rootComponent, rootContainer)
      }
    }

    return app
  }
}