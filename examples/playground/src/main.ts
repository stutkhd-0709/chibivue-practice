import { createApp, h, reactive } from 'chibivue'

const app = createApp({
  setup() {
    const state = reactive({ count: 0 })
    const colorState = reactive({ color: 'red' })
    const increment = () => {
      state.count++
      // elementのdom更新を動かしてみる
      if (state.count % 2 == 0) {
        colorState.color = 'black'
      } else {
        colorState.color = 'green'
      }
    }

    return function render() {
      return h('div', { id: 'my-app' }, [
        h('p', { style: `color: ${colorState.color};` }, [`count: ${state.count}`]),
        h('button', { onClick: increment }, ['increment']),
      ])
    }
  },
})

app.mount('#app')