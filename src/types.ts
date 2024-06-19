export interface Policy<RoleName extends string = string> extends TenantDocument {
  name: string
  roles: Role<RoleName>[]
  options: PolicyOptions
}

export interface Role<RoleName extends string = string> {
  /**
   * name of the role
   *
   * @example "reader"
   */
  name: RoleName

  /**
   * description of the role
   */
  description: string

  permissions: Permission[]

  /**
   * references to roleIds that are inherited
   */
  inherits: ObjectId[]
}

export interface Permission {
  name: string
  condition: null | Logic
  filter: null | Logic
  projection: null | Logic
  setter: null | Logic
}

export interface Logic {
  name: string
  rule: JsonLogicRule
  type: 'condition' | 'filter' | 'projection'
}

export interface PolicyOptions {
  global: {
    condition: null | Logic
    filter: null | Logic
    projection: null | Logic
    setter: null | Logic
  }
  merge: {
    condition: null | Logic
    filter: null | Logic
    projection: null | Logic
    setter: null | Logic
  }
}

/**
 * BSON ObjectId
 *
 * @format ObjectId
 * @pattern ^[a-f\d]{24}$
 * @example "507f1f77bcf86cd799439022"
 */
type ObjectId = string

/**
 * JsonLogic rule with [supported operations](https://jsonlogic.com/operations.html)
 *
 * @example {"==" : [ { "var" : "document.owner" }, { "var" : "user._id" } ] }
 */
type JsonLogicRule = Record<string, unknown>

interface TenantDocument {
  tenant: ObjectId
}

/**
 * The policer API payload structure
 */
export interface Payload<Data = unknown> {
  /**
   * the status code
   *
   * @example 200
   */
  statusCode: number

  /**
   * the status description
   *
   * @example "OK"
   */
  status: string

  /** the info message */
  message: string

  /** the response data */
  data?: Data

  /** the total count of document */
  count?: number
}

export interface CanResult<FilterResult = unknown, ProjectionResult = unknown, SetterResult = unknown> {
  grant: boolean
  filter?: FilterResult | null
  projection?: ProjectionResult | null
  setter?: SetterResult | null
}

/**
 * If multiple policies apply a permission merge is required. The `MergeType` specifies the origin of multiple applying permissions.
 *
 * - `'permissions'`: an operation matches with multiple permissions of a role
 * - `'roles'`: a principal/user has multiple roles
 * - `'global'`: a role-based permission rule applies as well as a globally valid rule
 */
export type MergeType = 'permissions' | 'roles' | 'global'
