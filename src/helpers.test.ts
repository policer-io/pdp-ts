import { resolve } from './helpers'

describe('resolve helper should', () => {
  const data = {
    not: 'nested',
    some: { nested: { object: 'value' } },
    more: [{ vals: ['in', 'array'] }, { vals: ['other', 'list'] }],
  }

  test('resolve not nested value', () => {
    expect(resolve('not', data)).toBe('nested')
  })

  test('resolve nested object', () => {
    expect(resolve('some.nested.object', data)).toBe('value')
  })

  test('resolve nested array', () => {
    expect(resolve('more.0.vals.1', data)).toBe('array')
  })

  test('throw error if data is not an object', () => {
    expect(() => resolve('more.0.vals.1', 123)).toThrow(new Error('data is not a resolvable object'))
  })

  test('throw error if first key is missing', () => {
    expect(() => resolve('.0.vals.1', data)).toThrow(new Error('First key is missing'))
  })

  test('throw error if keychain is missing', () => {
    expect(() => resolve('', data)).toThrow(new Error('First key is missing'))
  })

  test('throw error if parent property is undefined', () => {
    // prettier-ignore
    expect(() => resolve('missing.nested.object', data)).toThrow(new Error('Cannot read properties of undefined (reading \'nested.object\')'))
  })
})
