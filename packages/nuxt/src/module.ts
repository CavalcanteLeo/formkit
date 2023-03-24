import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { NuxtModule } from '@nuxt/schema'
import { defineNuxtModule, addPluginTemplate, createResolver } from '@nuxt/kit'
// import { addCustomTab } from '@nuxt/devtools/kit'

export interface ModuleOptions {
  defaultConfig: boolean
  configFile?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'FormKit',
    configKey: 'formkit',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    defaultConfig: true,
    configFile: undefined,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add FormKit typescript types explicitly.
    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ types: '@formkit/vue' })
    })

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.build.transpile.push('@formkit/vue')

    const configPath = await resolver.resolvePath(
      options.configFile || 'formkit.config',
      {
        cwd: nuxt.options.rootDir,
        extensions: ['.ts', '.mjs', '.js'],
      }
    )
    const configFileExists = existsSync(configPath)
    let config = 'defaultConfig'
    let importStatement = ''
    if (!configFileExists && options.configFile) {
      throw new Error(`FormKit configuration was not located at ${configPath}`)
    } else if (configFileExists) {
      importStatement = `import config from '${configPath}'`
      config = options.defaultConfig ? 'defaultConfig(config)' : 'config'
    } else if (!configFileExists && !options.defaultConfig) {
      throw new Error(
        'FormKit defaultConfig was set to false, but not FormKit config file could be found.'
      )
    }

    // addCustomTab({
    //   name: 'formkit',
    //   title: 'FormKit',
    //   icon: 'vscode-icons:file-type-formkit',
    //   view: {
    //     type: 'iframe',
    //     src: 'https://formkit.com/getting-started/what-is-formkit',
    //   },
    // })

    addPluginTemplate({
      src: await resolver.resolve('runtime/plugin.mjs'),
      filename: 'formkitPlugin.mjs',
      options: { importStatement, config },
    })
  },
})

export default module
