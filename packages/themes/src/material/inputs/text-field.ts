import { FormKitNode, FormKitSchemaCondition, FormKitSchemaNode, FormKitTypeDefinition } from '@formkit/core'
import { createSection, findSection, textInput, label, icon, prefix, suffix, $attrs } from '@formkit/inputs'
import { clone } from '@formkit/utils'
import { container, surface, outline } from '../sections'
import { hoverStateHandler, pressedStateHandler, focusStateHandler } from '../state-handlers'

const fieldSection = createSection('field', () => ({
  $el: 'div',
  attrs: {
    class: 'mdf-field'
  }
}))(
  () => ({
    if: '$slots.prefix',
    $el: 'span',
    attrs: { class: 'mdf-prefix' },
    children: [prefix()({})]
  }),
  $attrs({
    onpointerdown: '$handlers.stopPropagation',
    onBlur: '$handlers.onFocusLeave'
  }, textInput()),
  label('$label'),
  () => ({
    if: '$slots.suffix',
    $el: 'span',
    attrs: { class: 'mdf-suffix' },
    children: [suffix()({})]
  }),
)

export const textFamily = (node: FormKitNode) => {
  if (node.props.family !== 'text') return

  node.on('created', () => {
    if (!node.context) return
    if (typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    hoverStateHandler(node);
    pressedStateHandler(node);
    focusStateHandler(node);

    node.context.handlers.stopPropagation = (e: PointerEvent) => {
      e.stopImmediatePropagation();

      if (!node.context) return

      node.context.state.focus = true
    }

    node.context.handlers.onpointerdown = (e: PointerEvent) => {
      if (!node.context) return

      node.context.handlers.onPressedEnter();
      node.context.handlers.onFocusEnter(e);
    }

    node.addProps(['variant'])
    node.props.variant = node.props.variant || 'filled'
    node.props.placeholder = undefined

    const originalSchema = definition.schema

    definition.schema = (extensions: Record<string, FormKitSchemaCondition | Partial<FormKitSchemaNode>> = {}) => {
      extensions.outer = {
        attrs: {
          'data-variant': '$variant',
          'data-disabled': '$disabled === "" || $disabled || undefined',
          'data-populated': '$_value !== "" && $_value !== undefined',
          'data-hovered': '$state.hover',
          'data-pressed': '$state.pressed',
          'data-focused': '$state.focus'
        },
      }

      extensions.inner = {
        attrs: {
          onpointerenter: '$handlers.onHoverEnter',
          onpointerleave: '$handlers.onHoverLeave',
          onpointerdown: '$handlers.onpointerdown',
          onpointerup: '$handlers.onPressedLeave',
        },
        children: [
          container,
          surface,
          outline,
          icon('prefix', 'label')({}),
          fieldSection({}),
          icon('suffix')({})
        ]
      }

      const inputSchema = originalSchema(extensions)

      for (const sectionName of ['label']) {
        const [parentChildren, section] = findSection(inputSchema, sectionName)

        if (parentChildren && section) {
          parentChildren.splice(parentChildren.indexOf(section), 1)
        }
      }

      return inputSchema
    }

    node.props.definition = definition
  })
}
