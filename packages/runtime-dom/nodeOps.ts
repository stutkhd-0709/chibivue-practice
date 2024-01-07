/*
DOMを操作するためのオブジェクトを実装
*/
import { RendererOptions } from "../runtime-core/renderer";

// Omit: 指定したプロパティを除いた型を定義できる
export const nodeOps: Omit<RendererOptions, "patchProp"> = {
  createElement: tagName => {
    return document.createElement(tagName)
  },

  createText: (text: string) => {
    return document.createTextNode(text)
  },

  setElementText(node, text) {
    node.textContent = text
  },

  insert: (child, parent, anchor) => {
    // anchorの前にchildを追加
    parent.insertBefore(child, anchor || null)
  }
}
