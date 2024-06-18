export function resolve(keychain: string, data: unknown): unknown {
  if (typeof data !== 'object' || data === null) throw new Error('data is not a resolvable object')
  const [first, ...rest] = keychain.split('.')
  if (!first) throw new Error('First key is missing')
  if (!rest.length) return (data as Record<string, unknown>)[first]
  if ((data as Record<string, unknown>)[first] === undefined) throw new Error(`Cannot read properties of undefined (reading '${rest.join('.')}')`)
  return resolve(rest.join('.'), (data as Record<string, unknown>)[first])
}
