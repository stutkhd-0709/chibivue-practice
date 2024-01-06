/*
DOMを操作するためのオブジェクトを実装
*/
import { RendererOptions } from "../runtime-core/renderer";

export const nodeOps: RendererOptions<Node> = {
  setElementText(node, text) {
    node.textContent = text
  }
}
