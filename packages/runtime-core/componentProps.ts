import { hasOwn } from "../shared/general"
import { reactive } from "../reactivity"
import { camelize } from "../shared/general"
import { Data, ComponentInternalInstance } from "./component"

export type Props = Record<string, PropsOptions | null>

export interface PropsOptions<T = any> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: null | undefined | object
}

/*
任意の数と型の引数を取り、その引数を使用して
新しい`T`型のインスタンスを生成するコンストラクタ関数の型
*/
export type PropType<T> = {
  // argsで受け取った値を使って、PropTypeというインスタンスを作成するContructor型
  // ref. https://stackoverflow.com/a/39614325
  new (...args: any[]): T & {}
}

export function initProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
) {
  const props: Data = {}
  setFullProps(instance, rawProps, props)
  instance.props = reactive(props)
}

export function updateProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
) {
  const { props } = instance

  Object.entries(rawProps ?? {}).forEach(([key, value]) => {
    props[camelize(key)] = value
  })
}

function setFullProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
  props: Data,
) {
  const options = instance.propsOptions

  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]

      // kebab -> camel
      let camelKey
      if (options && hasOwn(options, (camelKey = camelize(key)))) {
        props[camelKey] = value
      }
    }
  }
}