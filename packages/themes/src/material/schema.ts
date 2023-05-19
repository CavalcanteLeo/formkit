import { findSection } from '@formkit/inputs'
import { FormKitSchemaDefinition, FormKitSchemaNode } from '@formkit/core'

export const fromSchema = (inputSchema: FormKitSchemaDefinition) => {
  const removeSection = (sectionName: string) => {
    const [parentChildren, section] = findSection(inputSchema, sectionName)

    if (parentChildren && section) {
      parentChildren.splice(parentChildren.indexOf(section), 1)
    }
  }

  const fromSection = (sectionName: string) => {
    const [parentChildren, sectionSchema] = findSection(
      inputSchema,
      sectionName
    )

    if (!(parentChildren && sectionSchema)) return

    const insertBefore = (section: any) => {
      parentChildren.unshift(section)
    }

    const insertStart = (section: any) => {
      // TODO: fix this type
      ;(sectionSchema.else as Record<string, any>).children.unshift(section)
    }

    const insertEnd = (section: any) => {
      // TODO: fix this type
      ;(sectionSchema.else as Record<string, any>).push(section)
    }

    const insertAfter = (section: any) => {
      parentChildren.push(section)
    }

    return {
      schema: sectionSchema,
      insertBefore,
      insertStart,
      insertEnd,
      insertAfter,
    }
  }

  const cutSection = (sectionName: string) => {
    const [parentChildren, section] = findSection(inputSchema, sectionName)

    if (parentChildren && section) {
      parentChildren.splice(parentChildren.indexOf(section), 1)
    }

    return section
  }

  const replaceSection =
    (sectionName: string) => (sections: FormKitSchemaNode) => {
      const [parentChildren, section] = findSection(inputSchema, sectionName)

      if (parentChildren && section) {
        parentChildren.splice(parentChildren.indexOf(section), 1, sections)
      }
    }

  return {
    removeSection,
    fromSection,
    cutSection,
    replaceSection,
  }
}
