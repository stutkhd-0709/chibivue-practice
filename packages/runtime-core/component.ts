import { ReactiveEffect } from '../reactivity'
import { emit } from './componentEmits'
import { ComponentOptions } from './componentOptions'
import { VNode, VNodeChild } from './vnode'
import { Props } from './componentProps'

export type Component = ComponentOptions

export type Data = Record<string, unknown>

export interface ComponentInternalInstance {
  type: Component // 元となるユーザー定義のコンポーネント(旧 rootComponent) -> 実際にはrootComponentではない
  vnode: VNode // インスタンスの親を持つ。emitで親の関数を探すのに必要
  subTree: VNode // 旧n1
  next: VNode | null // 旧n2
  effect: ReactiveEffect // 旧 effect
  render: InternalRenderFunction // 旧 componentRender
  update: () => void // 旧 updateComponent
  isMounted: boolean

  propsOptions: Props // `props: { message: { type: String } }` のようなオブジェクトを保持

  props: Data // 実際に親から渡されたデータを保持 (今回の場合は場合は `{ message: "hello" }`のようにな)

  emit: (event: string, ...args: any[]) => void
}

export type InternalRenderFunction = {
  (): VNodeChild
}

// constructor
export function createComponentInstance(
  vnode: VNode,
): ComponentInternalInstance {
  const type = vnode.type as Component

  const instance: ComponentInternalInstance = {
    type,
    vnode,
    next: null,
    effect: null!,
    subTree: null!,
    update: null!,
    render: null!,
    isMounted: false,
    propsOptions: type.props || {},
    props: {},
    emit: null! // to be set immediately
  }

  // bindは新しい関数を生成し、呼び出された際にthisキーワードに指定した値が格納される
  /*
    右辺がやっていることは以下の通り (emitはcomponentEmitsの関数)
    (instance) => emit.call(null, instance)を実行してるのと等しい
    メタプロっぽい感じ
  */
  instance.emit = emit.bind(null, instance)

  return instance
}