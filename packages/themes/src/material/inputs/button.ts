import { FormKitNode } from '@formkit/core'
import { clone } from '@formkit/utils'
import { fromSchema } from '../schema'

export const buttonFamily = (node: FormKitNode) => {
  if (node.props.family !== 'button') return

  node.addProps(['variant'])

  node.on('created', () => {
    node.props.variant = node.props.variant || 'elevated'

    if (typeof node.props?.definition === 'undefined') return

    const definition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    const originalSchema = definition.schema
    const hos = (extensions = {}) => {
      const inputSchema = originalSchema(extensions)
      const schemaBuilder = fromSchema(inputSchema)

      ;['messages', 'help'].forEach((sectionName) =>
        schemaBuilder.removeSection(sectionName)
      )
      const inputSection = schemaBuilder.fromSection('input')

      if (inputSection) {
        inputSection.insertStart({
          $el: 'div',
          attrs: {
            class: 'mdf-outline',
          },
        })

        inputSection.insertStart({
          $el: 'div',
          attrs: {
            class: 'mdf-surface',
          },
        })

        inputSection.insertStart({
          $el: 'div',
          attrs: {
            class: 'mdf-elevation',
          },
        })
      }

      return inputSchema
    }

    definition.schema = hos
    node.props.definition = definition

    node.props.inputClass = (reactiveNode: FormKitNode) => ({
      'mdf-button': true,
      [`mdf-button--${reactiveNode.props.variant}`]: true,
    })
  })
}
