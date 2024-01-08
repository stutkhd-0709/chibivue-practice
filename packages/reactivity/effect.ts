import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    // fnを実行する前のactiveEffectを保持しておいて、実行が終わった後元に戻す
    // これをしないとどんどん上書きして、意図しない挙動になるらしい
    let parent: ReactiveEffect | undefined = activeEffect
    activeEffect = this
    const res = this.fn() // effect実行
    activeEffect = parent
    return res
  }
}

// unknown型は型安全なany
// unknown型の変数を、具体的に定まった型のある変数に代入することはできない

// track: targetMapに関数を登録する関数
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    // dep: 副作用関数
    depsMap.set(key, (dep = createDep()))
  }

  // ここで初めてeffectを追加してる
  // それより上は空のdepを追加してるだけ
  if (activeEffect) {
    dep.add(activeEffect)
  }
}

// trigger: targetMapに登録された作用を実行する関数
export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)

  if (dep) {
    const effects = [...dep]
    for (const effect of effects) {
      effect.run()
    }
  }
}