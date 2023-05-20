import {
  FormKitNode,
  FormKitTypeDefinition,
  FormKitSchemaCondition,
  FormKitSchemaNode,
} from '@formkit/core'
import { clone } from '@formkit/utils'
import { fromSchema } from '../schema'

export const textFamily = (node: FormKitNode) => {
  if (node.props.family !== 'text') return

  node.addProps(['variant'])

  node.on('created', () => {
    node.props.variant = node.props.variant || 'filled'
    node.props.placeholder = undefined

    if (typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    const originalSchema = definition.schema
    const hos = (
      extensions: Record<
        string,
        FormKitSchemaCondition | Partial<FormKitSchemaNode>
      > = {}
    ) => {
      extensions.outer = {
        attrs: {
          'data-has-value': '$_value !== "" && $_value !== undefined',
        },
      }

      const inputSchema = originalSchema(extensions)
      const schemaBuilder = fromSchema(inputSchema)

      const inputSection = schemaBuilder.fromSection('input')
      const labelSection = schemaBuilder.cutSection('label')

      // TODO: added to satisfy typescript below, should probably be
      // more surgical about what we're doing here
      if (!schemaBuilder || !inputSection || !labelSection) return inputSchema

      const inner = schemaBuilder.fromSection('inner')
      if (inner) {
        inner.insertStart({
          $el: 'div',
          attrs: {
            class: 'mdf-surface',
          },
        })
      }

      const fieldSection = {
        if: '$slots.field',
        then: '$slots.field',
        else: {
          $el: 'div',
          attrs: {
            class: 'mdf-field',
          },
          meta: { section: 'field' },
          children: [inputSection.schema, labelSection],
        },
      }

      schemaBuilder.replaceSection('input')(fieldSection)

      return inputSchema
    }

    definition.schema = hos
    node.props.definition = definition

    node.props.innerClass = (reactiveNode: FormKitNode) => ({
      'mdf-text-field': true,
      [`mdf-text-field--${reactiveNode.props.variant}`]: true,
    })
  })
}
