import { has } from '@formkit/utils'
import {
  FormKitSchemaNode,
  FormKitLibrary,
  createError,
  FormKitOptions,
  createNode,
} from '@formkit/core'
import FormKitGenerator from './components/FormKitGenerator'
import { App, Plugin } from 'vue'

/**
 * Augment Vue’s globalProperties.
 */
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $formkit: FormKitVuePlugin
  }
}

/**
 * Configuration options for the FormKit Vue plugin.
 * @public
 */
export interface FormKitVueConfig {
  alias: string
  library: FormKitLibrary
  nodeOptions: FormKitOptions
}

/**
 * The global instance of the FormKit plugin.
 */
export interface FormKitVuePlugin {
  schema: (type: string) => FormKitSchemaNode[]
}

/**
 * The Create a new instance of the FormKit plugin for Vue.
 * @param app - A Vue application
 * @param config - FormKit Vue plugin configuration options
 */
function createPlugin(
  app: App<any>,
  config: FormKitVueConfig
): FormKitVuePlugin {
  app.component(config.alias, FormKitGenerator)
  // Create root node that is only used for plugin behaviors
  const pluginNode = createNode({
    type: 'group',
    plugins: config.nodeOptions.plugins,
  })
  return {
    schema: (type) => {
      if (has(config.library, type)) {
        return config.library[type].schema
      }
      createError(pluginNode, 100)
    },
  }
}

/**
 * These are the absolute minimum configuration options
 * to boot up FormKit.
 */
export const minConfig: FormKitVueConfig = {
  alias: 'FormKit',
  library: {},
  nodeOptions: {},
}

/**
 * Create the FormKit plugin.
 */
const formKitPlugin: Plugin = {
  install(app, options): void {
    /**
     * Extend the default configuration options.
     */
    const config = Object.assign({}, minConfig, options)

    /**
     * Register the global $formkit plugin property.
     */
    app.config.globalProperties.$formkit = createPlugin(app, config)
  },
}

export default formKitPlugin
