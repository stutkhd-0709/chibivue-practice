import fs from 'node:fs'
import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { parse } from '../../compiler-sfc'
import { compile } from '../../compiler-dom'
import { rewriteDefault } from '../../compiler-sfc/rewriteDefault'

export default function vitePluginChibivue(): Plugin {
  const filter = createFilter(/\.vue$/)

  return {
    name: 'vite:chibivue',

    // resolveId -> load -> transformで呼ばれる 
    // もしモジュールの依存関係があったら再度上のフローになる
    // resolveIdは実際に存在しないファイルがあったときに、そのファイルをどのように扱うのか処理する
    // transformで`import {id}.css`をするとApp.vue.cssをimportすることになるが、それは仮想ファイルのため
    // resoleveIdにhookされて、どのように処理するのか決めるみたいな感じ
    resolveId(id) {
      console.log('id', id)
      // このidは実際には存在しないパスだが、loadで仮想的にハンドリングするのでidを返してあげる (読み込み可能だということにする)
      if (id.match(/\.vue\.css$/)) return id
      // ここでreturnされないidに関しては、実際にそのファイルが存在していたらそのファイルが解決されるし、存在していなければ存在しないというエラーになる
    },
    load(id) {
      // .vue.cssがloadされた(importが宣言され、読み込まれた)時のハンドリング
      if (id.match(/\.vue\.css$/)) {
        const filename = id.replace(/\.css$/, '')
        const content = fs.readFileSync(filename, 'utf-8') // sfcファイルを取得
        const { descriptor } = parse(content, { filename }) // sfcをparse

        // contentをjoinsして結果にする
        const styles = descriptor.styles.map(it => it.content).join('\n')
        return { code: styles }
      }
    },

    transform(code, id) {
      console.log('transform', id)
      if (!filter(id)) return

      const outputs = []
      outputs.push("import * as ChibiVue from 'chibivue'\n")
      outputs.push(`import '${id}.css'`) // ${id}.cssのimport文を宣言しておく

      const { descriptor } = parse(code, { filename: id })

      const SFC_MAIN = '_sfc_main'
      const scriptCode = rewriteDefault(
        descriptor.script?.content ?? '',
        SFC_MAIN
      )
      outputs.push(scriptCode)

      const templateCode = compile(descriptor.template?.content ?? '', {
        isBrowser: false,
      })
      outputs.push(templateCode)

      outputs.push('\n')
      outputs.push(`export default { ...${SFC_MAIN}, render }`)

      return { code: outputs.join('\n') }
    },
  }
}