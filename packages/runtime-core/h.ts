import { VNodeProps, VNode, createVNode } from "./vnode";

export function h(
  type: string | object, // objectでcomponentを受け取れる！
  props: VNodeProps,
  children: (VNode | string)[],
) {
  return createVNode(type, props, children)
}