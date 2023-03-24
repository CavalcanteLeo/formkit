import { createNode } from '../src/node'
import { resetRegistry, getNode, deregister } from '../src/registry'
import { beforeEach, describe, expect, it } from 'vitest'

describe('registry', () => {
  beforeEach(() => resetRegistry())
  it('automatically registers nodes in the global registry by id', () => {
    const node = createNode({ props: { id: 'foobar' } })
    expect(getNode('foobar')).toBe(node)
  })

  it('does not register nodes by name', () => {
    createNode({ name: 'justin' })
    expect(getNode('justin')).toBe(undefined)
  })

  it('automatically registers root nodes by id over name', () => {
    const node = createNode({ name: 'justin', props: { id: 'boo' } })
    expect(getNode('justin')).toBe(undefined)
    expect(getNode('boo')).toBe(node)
  })

  it('automatically registers nodes in the global registry', () => {
    const node = createNode({ props: { id: 'foobar' } })
    expect(getNode('foobar')).toBe(node)
  })

  it('can remove nodes in the global registry', () => {
    const node = createNode({ props: { id: 'foobar' } })
    expect(getNode('foobar')).toBe(node)
    deregister(node)
    expect(getNode('foobar')).toBe(undefined)
  })
})
