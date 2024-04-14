// これはNodeの種類を表すもの
// 注意するべきは、このNodeはHTMLのNodeのことではなく、テンプレートコンパイラで扱う粒度であるということ
// なので、ElementやTextだけでなくAttributeも１つのNodeとして扱われる
// これはVue.jsの設計に沿った粒度で、今後ディレクティブを実装する際などに役立つ
export const enum NodeTypes {
  ELEMENT,
  TEXT,
  INTERPOLATION, // マスタッシュ構文 {{  }}

  ATTRIBUTE,
  DIRECTIVE, // @click, v-bind, v-modelなど
}

// 全てのNodeはtypeとlocを持っている
// locというのはlocationのことで、このNodeがソースコード（テンプレート文字列)のどこに該当するのか情報を保持する
// 何行目のどこにあるかなど
export interface Node {
  type: NodeTypes,
  loc: SourceLocation,
}

// ElementのNode
export interface ElementNode extends Node {
  type: NodeTypes.ELEMENT
  tag: string // eg. "div"
  props: Array<AttributeNode | DirectiveNode> // eg. { name: "class", value: { content: "container" } }とDirective
  children: TemplateChildNode[]
  isSelfClosing: boolean // eg. <img /> => true
}

// ElementNodeが持つ属性
// ただのRecord<string, string>と表現してもいいが
// Vueに習って、name(string)とvalue(TextNode)を持つようにしてる
export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE
  name: string
  value: TextNode | undefined
}

export type TemplateChildNode = ElementNode | TextNode | InterpolationNode

export interface TextNode extends Node {
  type: NodeTypes.TEXT
  content: string
}

export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION,
  content: string // マスタッシュの中に記述された内容(今回はsetupで定義された単一の変数名が入る)
}

export interface DirectiveNode extends Node {
  type: NodeTypes.DIRECTIVE
  // v-name:arg="exp"という形で表す
  // eg. v-on:click="increment"の場合は、{ name: 'on', arg: 'click', exp="increment" }
  name: string
  arg: string
  exp: string
}

// locationの情報、Nodeはこの情報を持つ
// start, endに位置情報が入る
// sourceに実際のコード(文字列)が入る
export interface SourceLocation {
  start: Position
  end: Position
  source: string
}

export interface Position {
  offset: number // from start of file
  line: number
  column: number
}