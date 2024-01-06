/*
renderのロジックのみを持つオブジェクトを生成するための
ファクトリ関数を実装
*/

export interface RendererOptions<HostNode = RendererNode> {
  setElementText(node: HostNode, text: string): void;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

// factory
export type RootRenderFunction<HostElement = RendererElement> = (
  message: string,
  container: HostElement
) => void

// RendererOptionsに依存しているが、引数にinterfaceを噛ませることで
// interfaceを満たす引数が動的に変わるため依存度を減らしてる
// 直接nodeOpsを書くのではなく、抽象化したinterfaceに依存させてる
export function createRenderer(options: RendererOptions) {
  // 分割代入でhostSetElementTextに値を格納
  const { setElementText: hostSetElementText } = options
  const render: RootRenderFunction = (message, container) => {
    hostSetElementText(container, message) // 今回はメッセージを挿入するだけなのでこういう実装になっている
  }

  return { render };
}