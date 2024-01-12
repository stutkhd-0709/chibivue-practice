interface Invoker extends EventListener {
  value: EventValue
}

type EventValue = Function

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.addEventListener(event, handler)
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.removeEventListener(event, handler)
}

export function patchEvent(
  // &: 交差型で、elはElement型であり、veiというプロパティも持つ
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  value: EventValue | null
) {
  // vei = vue event invokers
  // 同じ要素に対して重複してaddEventさせないために、_veiという名前でinvokerを生やす
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName]

  /*
    _veiはあるelのeventオブジェクトが入ることになる
    ex. onClick: function onClick() {}
    初回は空なので登録作業
    ２回目以降は、そもそもonClickが存在するのか確認
    存在していたら、onClickのfunctionの内容を新しいのに交換だけして、新しいEventListenerは生やさない
  */

  if (value && existingInvoker) {
    // patch
    existingInvoker.value = value
  } else {
    const name = parseName(rawName)
    if (value) {
      // add
      const invoker = (invokers[rawName] = createInvoker(value))
      addEventListener(el, name, invoker)
    } else if (existingInvoker) {
      // remove
      removeEventListener(el, name, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}

function parseName(rowName: string): string {
  // prefixのonを取り除く
  return rowName.slice(2).toLocaleLowerCase()
}

function createInvoker(initialValue: EventValue) {
  // 関数自身にvalueプロパティをセットする関数
  const invoker: Invoker = (e: Event) => {
    invoker.value(e)
  }
  invoker.value = initialValue
  return invoker
}