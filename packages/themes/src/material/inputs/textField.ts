import { FormKitNode, FormKitSchemaCondition, FormKitSchemaNode, FormKitTypeDefinition } from '@formkit/core'
import { $attrs, createSection, findSection, textInput, label, icon, prefix, suffix } from '@formkit/inputs'
import { clone } from '@formkit/utils'
import { container, surface, outline } from '../sections'
import userInteractionBindings from '../userInteractionHandlers'

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
    onfocus: '$handlers.focusEnter',
    onblur: '$handlers.focusLeave',
    onpointerdown: '$handlers.stopPropagation',
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
    if (!node.context || typeof node.props?.definition === 'undefined') return

    const definition: FormKitTypeDefinition = clone(node.props.definition)
    if (typeof definition.schema !== 'function') return

    userInteractionBindings(node)

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

      if (node.context) {
        node.context.handlers.log = console.log

        node.context.handlers.innerPointerFocusInput = (e: PointerEvent) => {
          if (!node.context) return

          node.context.handlers.pressedEnter(e)
          node.context.handlers.focusInput(e)
        }

        node.context.handlers.stopPropagation = (e: Event) => {
          e.stopPropagation()
        }
      }

      extensions.inner = {
        attrs: {
          onpointerenter: '$handlers.hoverEnter',
          onpointerleave: '$handlers.hoverLeave',
          onpointerdown: '$handlers.innerPointerFocusInput',
          onpointerup: '$handlers.pressedLeave',
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
