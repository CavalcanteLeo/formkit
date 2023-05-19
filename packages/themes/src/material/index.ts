import { FormKitNode, FormKitPlugin } from '@formkit/core'
import { buttonFamily } from './inputs/button'
import { textFamily } from './inputs/text-field'

const materialDesignPlugin: FormKitPlugin = (node: FormKitNode) => {
  buttonFamily(node)
  textFamily(node)
}

export default materialDesignPlugin
