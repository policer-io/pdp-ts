import logic from './logic'

describe('logic should', () => {
  test('parse json template string with simple variables!', () => {
    const rule = {
      json: '{ "premium": { "$in": [{{first}}, {{second}}, {{third}}] } }',
    }
    const data = {
      first: 23,
      second: true,
      third: 'hello',
    }
    expect(logic.apply(rule, data)).toEqual({
      premium: { $in: [23, true, 'hello'] },
    })
  })

  test('parse json template string nested variable values!', () => {
    const rule = {
      json: '{ "premium": { "$in": [{{first}}, {{second}}, {{third}}] } }',
    }
    const data = {
      first: null,
      second: {
        foo: 1,
        bar: 'hello',
      },
      third: ['one', 'two', 'three'],
    }
    expect(logic.apply(rule, data)).toEqual({
      premium: {
        $in: [
          null,
          {
            foo: 1,
            bar: 'hello',
          },
          ['one', 'two', 'three'],
        ],
      },
    })
  })

  test('parse json template string with nested variable names', () => {
    const rule = { json: '{ "nested": { "item": {{foo.bar.property}}, "listVal": {{items.1}} } }' }
    const data = {
      foo: { bar: { property: 'nice!' } },
      items: [true, false],
    }
    expect(logic.apply(rule, data)).toEqual({ nested: { item: 'nice!', listVal: false } })
  })

  test('parse json template string with local data input!', () => {
    const rule = {
      json: [
        '{ "premium": { "$in": [{{first}}, {{second}}, {{third}}] } }',
        {
          first: 11,
          second: false,
          third: 'byebye',
        },
      ],
    }
    const data = {
      first: 23,
      second: true,
      third: 'hello',
    }
    expect(logic.apply(rule, data)).toEqual({
      premium: { $in: [11, false, 'byebye'] },
    })
  })

  test('parse json template string with local array data input!', () => {
    const rule = {
      json: ['{ "premium": { "$in": [{{0}}, {{1}}, {{2}}] } }', [44, null, 'bella']],
    }
    const data = {
      first: 23,
      second: true,
      third: 'hello',
    }
    expect(logic.apply(rule, data)).toEqual({
      premium: { $in: [44, null, 'bella'] },
    })
  })

  test('parse json template string with computed data input as array!', () => {
    const rule = {
      json: ['{ "premium": { "$in": [{{0}}, {{1}}, {{2}}] } }', [{ json: '{ "foo": 12 }' }, { or: [true, false] }, { '+': [45, 55] }]],
    }
    const data = {
      first: 23,
      second: true,
      third: 'hello',
    }
    expect(logic.apply(rule, data)).toEqual({
      premium: { $in: [{ foo: 12 }, true, 100] },
    })
  })

  test('parsejson template string with computed data input as nested array!', () => {
    const rule = {
      json: ['{{0.1}}', [{ filter: [{ var: 'items' }, { var: '' }] }]],
    }
    const data = {
      items: [{ some: 'value', more: 'info' }, null, { prop: 23 }],
    }
    expect(logic.apply(rule, data)).toEqual({ prop: 23 })
  })

  test('get lenght of array', () => {
    const rule = {
      var: 'items.length',
    }
    const data = {
      items: [{ some: 'value', more: 'info' }, null, { prop: 23 }],
    }
    expect(logic.apply(rule, data)).toBe(3)
  })

  test('throw error if variable is undefined', () => {
    const rule = {
      json: '{ "premium": { "$in": [{{first}}, {{second}}, {{first}}] } }',
    }
    const data = {
      first: 23,
    }
    expect(() => {
      logic.apply(rule, data)
    }).toThrow(new Error('Variable {{second}} is undefined!'))
  })
})
