import plugin from 'tailwindcss/plugin.js'

const outerAttributes = [
  'disabled',
  'invalid',
  'errors',
  'complete',
  'loading',
  'submitted',
  'multiple',
  'has-prefix-icon',
  'has-suffix-icon',
]

/**
 * The FormKit plugin for Tailwind
 * @public
 */
const FormKitVariants = plugin(function ({ matchVariant }) {
  const attributes = outerAttributes.reduce((a, v) => ({ ...a, [v]: v }), {})

  matchVariant(
    'formkit',
    (value = '', { modifier }) => {
      return modifier
        ? [
            `[data-${value}='true']:merge(.group\\/${modifier})&`,
            `[data-${value}='true']:merge(.group\\/${modifier}) &`,
          ]
        : [
            `[data-${value}='true']:not([data-type='repeater'])&`,
            `[data-${value}='true']:not([data-type='repeater']) &`,
          ]
    },
    { values: attributes }
  )
})

export default FormKitVariants
