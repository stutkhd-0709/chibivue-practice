import { track, trigger } from './effect'
import { reactive } from './reactive'

// Proxy -> オブジェクトを作成する段階
// Reflect -> 既存のオブジェクトに対する処理

export const mutableHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: object) {
    track(target, key)

    // すでにあるオブジェクトに対して操作可能
    const res = Reflect.get(target, key, receiver)

    // objectの場合はreactiveにしてあげる
    // これによりネストしたオブジェクトもリアクティブにできる
    if ( res !== null && typeof res === 'object' ) {
      return reactive(res)
    }

    return res
  },

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    let oldValue = (target as any)[key]
    Reflect.set(target, key, value, receiver)
    // 値が変わったかどうかをチェックしてあげておく
    if (hasChanged(value, oldValue)) {
      trigger(target, key)
    }
    return true
  }
}

const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)