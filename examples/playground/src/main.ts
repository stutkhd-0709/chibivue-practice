import { createApp, h, reactive } from 'chibivue'

// const CounterComponent = {
//   setup() {
//     const state = reactive({ count: 0 })
//     const increment = () => state.count++

//     return () => {
//       return h('div', {}, [
//         h('p', { style: 'color: red' }, [`count: ${state.count}`]),
//         h('button', { onClick: increment }, ['increment'])
//       ])
//     }
//   },
// }

const MyComponent = {
  props: { someMessage: { type: String } },

  setup(props: any, { emit }: any) {
    return () =>
      h('div', {}, [
        h('p', {}, [`someMessage: ${props.someMessage}`]),
        h('button', { onClick: () => emit('click:change-message') }, [
          'change message',
        ]),
      ])
  },
}

const app = createApp({
  setup() {
    const state = reactive({ message: 'hello' })
    const changeMessage = () => {
      state.message += '!'
    }

    return () =>
      h('div', { id: 'my-app' }, [
        h(
          MyComponent,
          {
            'some-message': state.message,
            'onClick:change-message': changeMessage,
          },
          [],
        ),
      ])
  },
})

// const app = createApp({
//   setup() {
//     // const state = reactive({ change: false })
//     // const change = () => state.change = !state.change

//     return () => {
//       return h('div', { id: 'my-app' }, [
//         // h('div', {}, [
//         //   h('p', {}, [`changeComponent: ${state.change}`]),
//         //   h('button', { onClick: change }, ['change']),
//         // ]),
//         h(CounterComponent, {}, []),
//         h(CounterComponent, {}, []),
//         h(CounterComponent, {}, []),
//       ])
//     }
//   }
// })

// const MyComponent = {
//   setup() {
//     return () => h('p', {}, ['hello'])
//   },
// }

// const app = createApp({
//   setup() {
//     return () => {
//       return h(MyComponent, {}, [])
//     }
//   }
// })

app.mount('#app')