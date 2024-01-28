import { ComponentInternalInstance } from "./component"

// objectはcomponent自体を受け取れるようにするため
export type VNodeTypes = string | typeof Text | object

// 無名の一意の値
// なぜSymbolを使うのかはよくわからない
// web標準のelement要素と名前をバッティングさせないため？
export const Text = Symbol()

export interface VNode<HostNode = any> {
  type: VNodeTypes
  props: VNodeProps | null
  children: VNodeNormalizedChildren
  el: HostNode | undefined // 実際の DOM への参照を持たせる
  component: ComponentInternalInstance | null
}

export interface VNodeProps {
  [key: string]: any
}

// normalize後の型(仮想Node)
// Textを文字列として扱わず、VNodeに統一した
export type VNodeNormalizedChildren = string | VNodeArrayChildren
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren
type VNodeChildAtom = VNode | string

// VNodeにパッキングしてるだけ
export function createVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: VNodeNormalizedChildren,
): VNode {
  const vnode: VNode = {
    type,
    props,
    children: children,
    el: undefined,
    component: null,
  }
  return vnode
}

// VNodeChildはVNode | string | VNodeArrayChildrenをとる
export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === 'object') {
    return { ...child } as VNode
  } else {
    // stringだった場合もVNodeに変換する
    return createVNode(Text, null, String(child))
  }
}