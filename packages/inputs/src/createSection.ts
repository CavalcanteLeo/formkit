import { extend } from '@formkit/utils'
import {
  FormKitSchemaNode,
  FormKitExtendableSchemaRoot,
  isDOM,
  isComponent,
  FormKitSchemaDOMNode,
  FormKitSchemaComponent,
  FormKitSchemaFormKit,
} from '@formkit/core'

/**
 * A function that is called with an extensions argument and returns a valid
 * schema node.
 *
 * @public
 */
export interface FormKitSchemaExtendableSection {
  (extensions: Record<string, Partial<FormKitSchemaNode>>): FormKitSchemaNode
  _s?: string
}

/**
 * A function that when called, returns a function that can in turn be called
 * with an extension parameter.
 *
 * @public
 */
export interface FormKitSection<T = FormKitSchemaExtendableSection> {
  (...children: Array<FormKitSchemaExtendableSection | string>): T
}

/**
 * Creates a new reusable section.
 *
 * @param section - A single section of schema
 * @param el - The element or a function that returns a schema node.
 * @param root - When true, returns a FormKitExtendableSchemaRoot. When false,
 * returns a FormKitSchemaExtendableSection.
 *
 * @returns Returns a {@link @formkit/core#FormKitExtendableSchemaRoot
 * | FormKitExtendableSchemaRoot} or a {@link
 * @formkit/core#FormKitSchemaExtendableSection | FormKitSchemaExtendableSection}.
 *
 * @public
 */
export function createSection(
  section: string,
  el: string | null | (() => FormKitSchemaNode),
  root: true
): FormKitSection<FormKitExtendableSchemaRoot>

/**
 * @param section - A single section of schema
 * @param el - The element or a function that returns a schema node.
 *
 * @public
 */
export function createSection(
  section: string,
  el: string | null | (() => FormKitSchemaNode)
): FormKitSection<FormKitSchemaExtendableSection>

/**
 * @param section - A single section of schema
 * @param el - The element or a function that returns a schema node.
 * @param root - When false, returns a FormKitSchemaExtendableSection.
 *
 * @public
 */
export function createSection(
  section: string,
  el: string | (() => FormKitSchemaNode),
  root: false
): FormKitSection<FormKitSchemaExtendableSection>

export function createSection(
  section: string,
  el: string | null | (() => FormKitSchemaNode),
  root = false
): FormKitSection<
  FormKitExtendableSchemaRoot | FormKitSchemaExtendableSection
> {
  return (...children: Array<FormKitSchemaExtendableSection | string>) => {
    const extendable = (
      extensions: Record<string, Partial<FormKitSchemaNode>>
    ) => {
      const node = !el || typeof el === 'string' ? { $el: el } : el()
      if (isDOM(node) || isComponent(node)) {
        if (!node.meta) {
          node.meta = { section }
        }
        if (children.length && !node.children) {
          node.children = [
            ...children.map((child) =>
              typeof child === 'string' ? child : child(extensions)
            ),
          ]
        }
        if (isDOM(node)) {
          node.attrs = {
            class: `$classes.${section}`,
            ...(node.attrs || {}),
          }
        }
      }
      return {
        if: `$slots.${section}`,
        then: `$slots.${section}`,
        else:
          section in extensions
            ? extendSchema(node, extensions[section])
            : node,
      }
    }
    extendable._s = section
    return root ? createRoot(extendable) : extendable
  }
}

/**
 * Returns an extendable schema root node.
 *
 * @param rootSection - Creates the root node.
 *
 * @returns {@link @formkit/core#FormKitExtendableSchemaRoot | FormKitExtendableSchemaRoot}
 *
 * @internal
 */
export function createRoot(
  rootSection: FormKitSchemaExtendableSection
): FormKitExtendableSchemaRoot {
  return (extensions: Record<string, Partial<FormKitSchemaNode>>) => {
    return [rootSection(extensions)]
  }
}

/**
 * Type guard for schema objects.
 *
 * @param schema - returns `true` if the node is a schema node but not a string
 * or conditional.
 *
 * @returns `boolean`
 *
 * @public
 */
export function isSchemaObject(
  schema: Partial<FormKitSchemaNode>
): schema is
  | FormKitSchemaDOMNode
  | FormKitSchemaComponent
  | FormKitSchemaFormKit {
  return (
    typeof schema === 'object' &&
    ('$el' in schema || '$cmp' in schema || '$formkit' in schema)
  )
}

/**
 * Extends a single schema node with an extension. The extension can be any
 * partial node including strings.
 *
 * @param schema - The base schema node.
 * @param extension - The values to extend on the base schema node.
 *
 * @returns {@link @formkit/core#FormKitSchemaNode | FormKitSchemaNode}
 *
 * @public
 */
export function extendSchema(
  schema: FormKitSchemaNode,
  extension: Partial<FormKitSchemaNode> = {}
): FormKitSchemaNode {
  if (typeof schema === 'string') {
    return isSchemaObject(extension) || typeof extension === 'string'
      ? extension
      : schema
  } else if (Array.isArray(schema)) {
    return isSchemaObject(extension) ? extension : schema
  }
  return extend(schema, extension) as FormKitSchemaNode
}
