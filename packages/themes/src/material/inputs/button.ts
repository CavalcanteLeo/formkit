import { FormKitNode, FormKitSchemaCondition, FormKitSchemaNode, FormKitTypeDefinition } from '@formkit/core'
import { findSection, buttonLabel, icon, prefix, suffix } from '@formkit/inputs'
import { clone } from '@formkit/utils'
import { elevation, container, surface, outline } from '../sections'

export const buttonFamily = (node: FormKitNode) => {
  if (node.props.family !== 'button') return

  node.on('created', () => {
    if (typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    node.addProps(['variant'])
    node.props.variant = node.props.variant || 'elevated'

    const originalSchema = definition.schema

    definition.schema = (extensions: Record<string, FormKitSchemaCondition | Partial<FormKitSchemaNode>> = {}) => {
      extensions.outer = {
        attrs: {
          'data-variant': '$variant'
        },
      }

      extensions.wrapper = {
        $el: null
      }

      extensions.input = {
        children: [
          elevation,
          container,
          surface,
          outline,
          icon('prefix')({}),
          prefix()({}),
          buttonLabel('$label || $ui.submit.value')({}),
          suffix()({}),
          icon('suffix')({})
        ]
      }

      const inputSchema = originalSchema(extensions);

      for (const sectionName of ['messages', 'help']) {
        const [parentChildren, section] = findSection(inputSchema, sectionName)

        if (parentChildren && section) {
          parentChildren.splice(parentChildren.indexOf(section), 1)
        }
      }

      return inputSchema;
    }

    node.props.definition = definition
  })
}
