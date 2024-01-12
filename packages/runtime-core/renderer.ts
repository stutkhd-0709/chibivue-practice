/*
renderのロジックのみを持つオブジェクトを生成するための
ファクトリ関数を実装
*/

import { VNode, normalizeVNode, Text } from './vnode'
import { ReactiveEffect } from '../reactivity';
import { Component } from "./component"

// factory
export type RootRenderFunction<HostElement = RendererElement> = (
  component: Component,
  container: HostElement
) => void

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
  > {
    // onClickなど標準で存在しないpropertyを有効にする
    patchProp(el: HostElement, key: string, value: any): void;

    createElement(type: string): HostNode

    createText(text: string): HostNode

    setElementText(node: HostNode, text: string): void

    insert(child: HostNode, parent: HostNode, anchor?: HostNode | null) : void
}

export interface RendererNode {
  [key: string]: any;
}

// PatchProps用の型
export interface RendererElement extends RendererNode {}

// RendererOptionsに依存しているが、引数にinterfaceを噛ませることで
// interfaceを満たす引数が動的に変わるため依存度を減らしてる
// 直接nodeOpsを書くのではなく、抽象化したinterfaceに依存させてる
export function createRenderer(options: RendererOptions) {
  // 分割代入でhostSetElementTextに値を格納
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setElementText: hostSetText,
    insert: hostInsert,
  } = options

  // DOMの差分比較して、差分だけ更新したDOMを生成(他はそのままで全体を再レンダリングしてない)
  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2
    if (type === Text) {
      // 文字を差し替える部分
      processText(n1, n2, container)
    } else {
      // それ以外
      processElement(n1, n2, container)
    }
  }

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    // 初回は比較するDOMがないため、そのままmountする
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      // 既存のやつがある場合
      patchElement(n1, n2)
    }
  }

  // container -> mountする場所
  const mountElement = (vnode: VNode, container: RendererElement) => {
    let el: RendererElement
    const { type, props } = vnode

    // Element生成
    el = vnode.el = hostCreateElement(type as string)

    // 親の配下(el)にchildをmount
    mountChildren(vnode.children, el) // TODO

    if (props) {
      // onClickなどVue特有のものがあったらpatchしてる
      for (const key in props) {
        hostPatchProp(el, key, props[key])
      }
    }

    hostInsert(el, container)
  }

  const mountChildren = (children: VNode[], container: RendererElement) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container)
    }
  }

  // n1がold, n2がnew
  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!)

    const props = n2.props

    patchChildren(n1, n2, el)

    for (const key in props) {
      if (props[key] !== n1.props?.[key] ?? {}) {
        hostPatchProp(el, key, props[key])
      }
    }
  }

  const patchChildren = (n1: VNode, n2: VNode, container: RendererElement) => {
    const c1 = n1.children as VNode[]
    const c2 = n2.children as VNode[]

    for (let i = 0; i < c2.length; i++) {
      const child = (c2[i] = normalizeVNode(c2[i]))
      patch(c1[i], child, container)
    }
  }

  const processText = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    if (n1 == null) {
      // 初回はそのまま追加
      // CreateTextでNode作って、hostInsertでhtmlに追加
      hostInsert((n2.el = hostCreateText(n2.children as string)), container)
    } else {
      const el = (n2.el = n1.el!)
      // childrenはh関数の第３引数
      // 表示したい文字列とか, 今回だと`count: n`
      if (n2.children !== n1.children) {
        // 変更したやつを既存のtextから差し替える
        hostSetText(el, n2.children as string)
      }
    }
  }

  // rootComponent: createAppの第１引数, setupプロパティを持つオブジェクト
  // container: mountする場所 createAppの.mountで指定した場所(runtime_dom/indexでElementに変換されてる)
  const render: RootRenderFunction = (rootComponent, container) => {
    // render関数そのもの
    const componentRender = rootComponent.setup!()

    let n1: VNode | null = null

    // reactiveになるたびに実行される
    const updateComponent = () => {
      // render関数で仮想DOM生成
      const n2 = componentRender()
      // 比較
      patch(n1, n2, container)
      // 更新
      console.log(n2)
      n1 = n2
    }

    const effect = new ReactiveEffect(updateComponent)

    effect.run()
  }

  return { render };
}