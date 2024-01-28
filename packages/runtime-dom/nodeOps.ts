/*
DOM操作するためのオブジェクトを実装
DOM = Document Object Element -> ORMみたいなやつか
NodeはElementを拡張したもの
documentにある全てのオブジェクトはNodeである
ElementはNodeの一種類
ex. div, p, a, imgなどなど
他のNodeにはdocument, DocumentFragmentとかある
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
  },

  parentNode: (node) => {
    return node.parentNode;
  }
}
