/*
renderのロジックのみを持つオブジェクトを生成するための
ファクトリ関数を実装
*/

import { VNode, normalizeVNode, Text, createVNode } from './vnode'
import { ReactiveEffect } from '../reactivity';
import { Component, ComponentInternalInstance, InternalRenderFunction, createComponentInstance, setupComponent } from "./component"
import { updateProps } from './componentProps';

// factory
export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: Component,
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

    insert(child: HostNode, parent: HostNode, anchor?: HostNode | null) : void,

    parentNode(node: HostNode): HostNode
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
    parentNode: hostParentNode,
  } = options

  // DOMの差分比較して、差分だけ更新したDOMを生成(他はそのままで全体を再レンダリングしてない)
  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2
    if (type === Text) {
      // 文字を差し替える部分
      processText(n1, n2, container)
    } else if (typeof type === 'string'){
      processElement(n1, n2, container)
    } else if (typeof type === 'object' ) {
      processComponent(n1, n2, container)
    } else {
      // do nothing
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
    mountChildren(vnode.children as VNode[], el)

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

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
      updateComponent(n1, n2)
    }
  }

  // VNode -> 仮想DOM elementの情報をobjectとして扱ってる
  // container -> 実際のElement, ここに挿入する
  const mountComponent = (initialVNode: VNode, container: RendererElement) => {
    const instance: ComponentInternalInstance = (
      initialVNode.component = createComponentInstance(initialVNode)
    )
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  // effectは今までrender関数で実行してたのを、インスタンスの状態を活用して移植した
  const setupRenderEffect = (
    instance: ComponentInternalInstance,
    initialVNode: VNode,
    container: RendererElement,
  ) => {
    // 更新時に実行する関数なので、mount, patchの両方に対応できる形になってる
    const componentUpdateFn = () => {
      const { render } = instance
      if (!instance.isMounted) {
        // mount process
        const subTree = (instance.subTree = normalizeVNode(render()))
        // 初回なのでそのままmountする
        patch(null, subTree, container)
        // initialVNode.elは初期値はundefinedなので、すぐにrenderingするsubTreeのelをそのまま参照させる
        // 初期値はcreateVNode関数を見るとわかる
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        // patch process -> 更新されるたびに呼ばれる
        // vnodeはcomponentを呼び出す親のrender関数
        let { next, vnode } = instance

        if (next) {
          next.el = vnode.el
          next.component = instance
          instance.vnode = next
          instance.next = null
          updateProps(instance, next.props)
        } else {
          // 新しいVNodeがない場合に、既存のVNodeをnextに格納
          next = vnode
        }

        const prevTree = instance.subTree
        const nextTree = normalizeVNode(render())
        instance.subTree = nextTree

        // 差分比較
        patch(prevTree, nextTree, hostParentNode(prevTree.el!))
        next.el = nextTree.el
      }
    }

    // 更新時実行する関数(componentUpdateFn)を登録
    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn))
    const update = (instance.update = () => { effect.run() }) // instance.updateに登録
    update()
  }

  const updateComponent = (n1: VNode, n2: VNode) => {
    const instance = (n2.component = n1.component)!
    instance.next = n2
    instance.update()
  }

  // rootComponent: createAppの第１引数, setupプロパティを持つオブジェクト
  // container: mountする場所 createAppの.mountで指定した場所(runtime_dom/indexでElementに変換されてる)
  const render: RootRenderFunction = (rootComponent, container) => {
    const vnode = createVNode(rootComponent, {}, [])
    patch(null, vnode, container)
  }

  return { render };
}