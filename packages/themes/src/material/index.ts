import { FormKitNode, FormKitPlugin } from '@formkit/core'
import { buttonFamily } from './inputs/button'
import { textFamily } from './inputs/textField'

const materialDesignPlugin: FormKitPlugin = (node: FormKitNode) => {
  buttonFamily(node)
  textFamily(node)
}

export default materialDesignPlugin
