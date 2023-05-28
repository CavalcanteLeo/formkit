import { FormKitNode, FormKitSchemaCondition, FormKitSchemaNode, FormKitTypeDefinition } from '@formkit/core'
import { findSection, buttonLabel, icon } from '@formkit/inputs'
import { clone } from '@formkit/utils'
import { elevation, container, surface, outline } from '../sections'
import { hoverStateHandler, pressedStateHandler } from '../state-handlers'

export const buttonFamily = (node: FormKitNode) => {
  if (node.props.family !== 'button') return

  node.on('created', () => {
    if (!node.context || typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    hoverStateHandler(node);
    pressedStateHandler(node);

    node.addProps(['variant'])
    node.props.variant = node.props.variant || 'elevated'

    const originalSchema = definition.schema

    definition.schema = (extensions: Record<string, FormKitSchemaCondition | Partial<FormKitSchemaNode>> = {}) => {
      extensions.outer = {
        attrs: {
          'data-variant': '$variant',
          'data-disabled': '$disabled === "" || $disabled || undefined',
          'data-hovered': '$state.hover',
          'data-pressed': '$state.pressed',
        },
      }

      extensions.wrapper = {
        attrs: {
          onpointerenter: '$handlers.onHoverEnter',
          onpointerleave: '$handlers.onHoverLeave',
          onpointerdown: '$handlers.onPressedEnter',
          onpointerup: '$handlers.onPressedLeave',
        },
      }

      extensions.input = {
        children: [
          elevation,
          container,
          surface,
          outline,
          icon('prefix')({}),
          buttonLabel('$label || $ui.submit.value')({}),
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
