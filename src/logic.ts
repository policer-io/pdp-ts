import logic, { RulesLogic } from 'json-logic-js'
import { resolve } from './helpers'

// json template string parser
const json: Parameters<typeof logic.add_operation>[1] = function (this: unknown, template: unknown, _data?: unknown) {
  if (typeof template !== 'string') throw new TypeError('Can only parse strings!')
  if (typeof this !== 'object') throw new TypeError('this is not of type object')

  // replace variables in string with values {{myVariable}}
  const data = _data && typeof _data === 'object' ? { ..._data } : ({ ...this } as Record<string, unknown>)
  const replaced = [...template.matchAll(/{{(\w+(\.\w+)*)}}/g)].reduce((result, match) => {
    const [matched, group] = match
    if (!group) throw new Error('group is undefined')
    const value = resolve(group, data)
    if (value === undefined) throw new Error(`Variable {{${group}}} is undefined!`)
    return result.replace(matched, JSON.stringify(value))
  }, template)

  return JSON.parse(replaced)
}
logic.add_operation('json', json)

export default logic

type AdditionalOperation = {
  json: string | [string, Record<string, unknown> | Array<unknown>]
}

export type Rule = RulesLogic<AdditionalOperation>
