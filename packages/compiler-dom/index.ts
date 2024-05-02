import { baseCompile, baseParse } from '../compiler-core'
import { CompilerOptions } from '../compiler-core/options'

export function compile(template: string, option?: CompilerOptions) {
  // Required -> genericsの型でオプション(?)を取り除いた型として表現する => 全て必須になる
  const defaultOption: Required<CompilerOptions> = { isBrowser: true }
  if (option) Object.assign(defaultOption, option)
  return baseCompile(template, defaultOption)
}

export function parse(template: string) {
  return baseParse(template)
}