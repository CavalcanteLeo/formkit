import { FormKitNode, FormKitSchemaCondition, FormKitSchemaNode, FormKitTypeDefinition } from '@formkit/core'
import { findSection, buttonLabel, icon } from '@formkit/inputs'
import { clone } from '@formkit/utils'
import { elevation, container, surface, outline } from '../sections'
import userInteractionBindings from '../userInteractionHandlers'

export const buttonFamily = (node: FormKitNode) => {
  if (node.props.family !== 'button') return

  node.on('created', () => {
    if (!node.context || typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    userInteractionBindings(node)

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
          'data-focused': '$state.focus'
        },
      }

      extensions.wrapper = {
        attrs: {
          onpointerenter: '$handlers.hoverEnter',
          onpointerleave: '$handlers.hoverLeave',
          onpointerdown: '$handlers.pressedEnter',
          onpointerup: '$handlers.pressedLeave',
        },
      }

      if (node.context) {
        node.context.handlers.onFocus = () => {
          if (!node.context || node.context.state.pressed) return

          node.context.handlers.focusEnter()
        }
      }

      extensions.input = {
        attrs: {
          onfocus: '$handlers.onFocus',
          onblur: '$handlers.focusLeave',
        },
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

    definition.schemaMemoKey += '-material'
    node.props.definition = definition
  })
}
