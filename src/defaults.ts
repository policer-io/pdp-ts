import type { Rule } from './logic'

export const DEFAULT_HOSTNAME = 'api.policer.io'

export const DEFAULT_SSL = true

export const DEFAULT_SOCKET_PROTOCOL = 'ws'

export const DEFAULT_SOCKET_DISABLE = false

export const DEFAULT_SOCKET_TIMEOUT = 5000

export const DEFAULT_MERGE_GRANTS_RULE: Rule = {
  if: [
    // if multiple permissions apply, grant if one allows
    { '===': [{ var: 'type' }, 'permissions'] },
    { reduce: [{ var: 'items' }, { or: [{ var: 'current' }, { var: 'accumulator' }] }, false] },
    // if multiple roles apply, grant if one allows
    { '===': [{ var: 'type' }, 'roles'] },
    { reduce: [{ var: 'items' }, { or: [{ var: 'current' }, { var: 'accumulator' }] }, false] },
    // else, if global and permission condition apply, grant if all allow
    { reduce: [{ var: 'items' }, { and: [{ var: 'current' }, { var: 'accumulator' }] }, true] },
  ],
}

export const DEFAULT_MERGE_FILTERS_RULE: Rule = {
  if: [
    // if all items to be merged are null
    {
      or: [{ all: [{ var: 'items' }, { '!': { var: '' } }] }, { '!': { var: 'items' } }],
    },
    // return null
    null,
    // else return json object with array of merged items
    {
      json: [
        '{ "merged": {{0}} }',
        [
          {
            reduce: [
              { var: 'items' },
              {
                if: [
                  // if a item to be merged are already a list of merged items
                  { var: 'current.merged' },
                  // merge list of items
                  {
                    merge: [{ var: 'current.merged' }, { var: 'accumulator' }],
                  },
                  // else merge singele item
                  { merge: [{ var: 'current' }, { var: 'accumulator' }] },
                ],
              },
              [],
            ],
          },
        ],
      ],
    },
  ],
}

export const DEFAULT_MERGE_PROJECTIONS_RULE: Rule = DEFAULT_MERGE_FILTERS_RULE
export const DEFAULT_MERGE_SETTERS_RULE: Rule = DEFAULT_MERGE_FILTERS_RULE
