import { parse } from 'path'
import { generate } from './codegen'
import { baseParse } from './parse'

export function baseCompile(template: string) {
  const parseResult = baseParse(template.trim())
  console.log(parseResult)
  const code = generate(parseResult)
  return code
}