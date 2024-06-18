import type { CanResult, MergeType, Payload, Policy } from './types'
import axios from 'axios'
import { io } from 'socket.io-client'
import DEFAULT_LOGGER from 'pino'
import logic from './logic'
import {
  DEFAULT_HOSTNAME,
  DEFAULT_MERGE_FILTERS_RULE,
  DEFAULT_MERGE_GRANTS_RULE,
  DEFAULT_MERGE_PROJECTIONS_RULE,
  DEFAULT_MERGE_SETTERS_RULE,
  DEFAULT_SOCKET_DISABLE,
  DEFAULT_SOCKET_PROTOCOL,
  DEFAULT_SOCKET_TIMEOUT,
  DEFAULT_SSL,
} from './defaults'

class PDP<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Attributes extends Record<string, any> = Record<string, unknown>,
  RoleName extends string = string,
  FilterResult = unknown,
  ProjectionResult = unknown,
  SetterResult = unknown,
> {
  private policy: Policy<RoleName>

  private options: Required<Omit<Options<RoleName>, 'logger' | 'socket' | 'onUpdated' | 'policy'>> & Pick<Options<RoleName>, 'onUpdated'>

  private socket: ReturnType<typeof io> | undefined

  private controller: AbortController | undefined

  private logger: Logger

  /**
   * flag that indicates if the PDP instance is connected to the policer API
   */
  get connected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Private constructor. Do not use for initialisation. Use static `PDP.create()` method for initialisation instead.
   *
   * @param {Policy<RoleName>} policy
   * @param {Options} options
   * @memberof PDP
   */
  private constructor(policy: Policy<RoleName>, options: Options<RoleName>) {
    // initialize options and logger
    const { logger = DEFAULT_LOGGER(), socket = {}, policy: localPolicy, ...rest } = options
    const { protocol = DEFAULT_SOCKET_PROTOCOL, onConnect, onDisconnect, onUpdate, disable = DEFAULT_SOCKET_DISABLE } = socket
    this.options = { hostname: DEFAULT_HOSTNAME, ssl: DEFAULT_SSL, ...rest }
    this.logger = logger
    const { applicationId, hostname, ssl } = this.options

    // set initial policy
    this.policy = policy

    if (!disable && !localPolicy) {
      // setup websocket connection to listen for policy update events
      this.logger.debug({ uri: `${protocol}${ssl ? 's' : ''}://${hostname}` }, 'Connecting to socket')
      this.socket = io(`${protocol}${ssl ? 's' : ''}://${hostname}`)
      this.socket.on('connect', () => {
        onConnect && onConnect()
        this.logger.debug({ socket: this.socket?.id }, 'Socket connection established')
      })
      this.socket.on('disconnect', (reason) => {
        onDisconnect && onDisconnect(reason)
        this.logger.debug({ reason }, 'Socket connection disconnected')
      })
      this.socket.on(`${policy.tenant}/${applicationId}/policy:update`, async (acknowledge) => {
        onUpdate && onUpdate(`${policy.tenant}/${applicationId}/policy:update`)
        await this.update()
        // acknowlege successful update
        acknowledge && acknowledge(`${policy.tenant}/${applicationId}/policy:updated`)
      })
    }
  }

  /**
   * static method to async create new PDP instance and load policy
   *
   * @static
   * @param {Options} options - the options for configuring the policy decision point (PDP)
   * @return {*}
   * @memberof PDP
   */
  static async create<RoleName extends string = string>(options: Options<RoleName>) {
    const { applicationId, hostname = DEFAULT_HOSTNAME, logger = DEFAULT_LOGGER(), ssl = DEFAULT_SSL, socket = {}, policy: localPolicy } = options
    const { timeout = DEFAULT_SOCKET_TIMEOUT, disable = DEFAULT_SOCKET_DISABLE } = socket
    logger.debug(undefined, `Creating PDP instance for application ${applicationId}`)
    const {
      data: { data: policy },
    } = localPolicy
      ? { data: { data: localPolicy } }
      : await axios<Payload<Policy<RoleName>>>({
          method: 'GET',
          baseURL: `http${ssl ? 's' : ''}://${hostname}/api`,
          url: `/applications/${applicationId}/policy`,
        })
    if (!policy) throw new Error(`Could not load policy for application ${applicationId}`)

    const instance = new this(policy, options)

    if (!disable) {
      // wait for the socket to establish an initial connection
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`socket connection timeout of ${timeout}ms exceeded`))
        }, timeout)
        function checkConnection() {
          logger.debug({ connected: instance.connected }, 'Check connection')
          if (instance.connected) {
            clearTimeout(timer)
            return resolve()
          }
          setTimeout(checkConnection, 500)
        }
        checkConnection()
      })
      logger.info(undefined, `Created PDP instance for application ${applicationId} and started listening for policy updates`)
    } else {
      logger.warn(undefined, `Created PDP instance for application ${applicationId} without listening for policy update signals`)
    }

    return instance
  }

  /**
   * method to perform a policy check for a user/pricipal given one or a set of roles, an operation and some attributes
   *
   * @param {(RoleName | RoleName[])} role - one role or a set of roles the principal has
   * @param {string} operation - the operation the user/principal wants to perform
   * @param {Attributes} [attributes] - any given attribute further characterizing the principal/user or the resource/document the operation is performed on.
   * @return {*}  {CanResult<FilterResult, ProjectionResult, SetterResult>}
   * @memberof PDP
   */
  can(role: RoleName | RoleName[], operation: string, attributes?: Attributes): CanResult<FilterResult, ProjectionResult, SetterResult> {
    const roles = typeof role === 'string' ? [role] : role
    if (!roles.length) throw new Error('Roles array is empty.')

    // prettier-ignore
    this.logger.debug({ roles, operation, attributes }, `perform policy check for operation '${operation}' for roles '${roles.join('\', \'')}'`)

    // evaluate policy for all roles provided
    const rolesResults = roles.map((roleName): CanResult<FilterResult, ProjectionResult, SetterResult> => {
      // test if all role names exist on policy
      const role = this.policy.roles.find(({ name }) => name === roleName)
      if (!role) throw new Error(`Role ${roleName} does not exist on policy!`)

      // filter permissions that match the operation (incl. wildcard permissoins)
      const permissions = role.permissions.filter((permission) => new RegExp(`^${permission.name.replace(/\*/g, '.*')}$`).test(operation))

      if (!permissions.length) {
        // if no permission matches
        if (role.inherits.length) {
          // check if role inherits roles and try with inherited roles
          const inherited = role.inherits.map((roleName) => {
            const { name } = this.policy.roles.find(({ name }) => name === roleName) || {}
            if (name === undefined) throw new Error(`Can not resolve inherited role '${roleName}'`)
            return name
          })
          this.logger.debug({ operation, role: role.name, inherited }, 'try inherited roles because no permission matches operation')
          return this.can(inherited, operation, attributes)
        } else {
          const result: CanResult<FilterResult, ProjectionResult, SetterResult> = { grant: false }
          // if no inheritable roles, deny permission
          this.logger.debug({ operation, role: role.name, ...result }, `no permission matching operation ${operation}`)
          return result
        }
      } else {
        // evaluate matching permissions
        const permissionsResults = permissions.map((permission): CanResult<FilterResult, ProjectionResult, SetterResult> => {
          const result: CanResult<FilterResult, ProjectionResult, SetterResult> = {
            // if condition, evaluate, else allow
            grant: permission.condition ? logic.apply(permission.condition.rule, attributes) : true,
            // if filter, evalate, else set undefined
            filter: permission.filter ? logic.apply(permission.filter.rule, attributes) : undefined,
            // if projection, evaluate, else set undefined
            projection: permission.projection ? logic.apply(permission.projection.rule, attributes) : undefined,
            // if setter, evaluate, else set undefined
            setter: permission.setter ? logic.apply(permission.setter.rule, attributes) : undefined,
          }
          this.logger.debug({ operation, permission: permission.name, role: role.name, ...result }, `computed can result for permission ${permission.name}`)
          return result
        })

        // merge all evaluated permissions into one result
        return this.merge(permissionsResults, operation, 'permissions')
      }
    })

    // merge all evaluated roles into one result
    const principalResult = this.merge(rolesResults, operation, 'roles')

    // evaluate global policy
    const globalResult: CanResult<FilterResult, ProjectionResult, SetterResult> = {
      grant: this.policy.options.global.condition ? logic.apply(this.policy.options.global.condition.rule, attributes) : true,
      filter: this.policy.options.global.filter ? logic.apply(this.policy.options.global.filter.rule, attributes) : undefined,
      projection: this.policy.options.global.projection ? logic.apply(this.policy.options.global.projection.rule, attributes) : undefined,
      setter: this.policy.options.global.setter ? logic.apply(this.policy.options.global.setter.rule, attributes) : undefined,
    }

    // merge principal policy result and global policy result into one
    const result = this.merge([principalResult, globalResult], operation, 'global')
    this.logger.debug({ operation, roles, ...result }, `computed final can result for operation ${operation}`)
    return result
  }

  /**
   * helper method to merge evaluated policies if multiple apply
   *
   * @private
   * @param {CanResult[]} cans - the list of evaluated policies that apply
   * @param {string} operation - the requested operation
   * @param {MergeType} type - the type of the merge (i.e. the reason for merging)
   * @return {*}  {CanResult}
   * @memberof PDP
   */
  private merge(
    cans: CanResult<FilterResult, ProjectionResult, SetterResult>[],
    operation: string,
    type: MergeType
  ): CanResult<FilterResult, ProjectionResult, SetterResult> {
    // if only one permission applies, return that result
    if (cans.length === 1) {
      return cans[0] as CanResult<FilterResult, ProjectionResult, SetterResult>
    }

    // else merge results
    // if (!this.policy.options.merge.filter) throw new Error(`Multiple policies apply but policy lacks filter merge logic (origin: ${type}).`)
    // if (!this.policy.options.merge.projection) throw new Error(`Multiple plicies apply but policy lacks projection merge logic (origin: ${type}).`)
    const joined = cans.reduce(
      (
        joined: {
          grants: CanResult<FilterResult, ProjectionResult, SetterResult>['grant'][]
          filters: CanResult<FilterResult, ProjectionResult, SetterResult>['filter'][]
          projections: CanResult<FilterResult, ProjectionResult, SetterResult>['projection'][]
          setters: CanResult<FilterResult, ProjectionResult, SetterResult>['setter'][]
        },
        can
      ) => {
        joined.grants.push(can.grant)
        joined.filters.push(can.filter)
        joined.projections.push(can.projection)
        joined.setters.push(can.setter)
        return joined
      },
      { grants: [], filters: [], projections: [], setters: [] }
    )
    return {
      grant: logic.apply(this.policy.options.merge.condition?.rule || DEFAULT_MERGE_GRANTS_RULE, { items: joined.grants, type, operation }),
      filter: logic.apply(this.policy.options.merge.filter?.rule || DEFAULT_MERGE_FILTERS_RULE, { items: joined.filters, type, operation }),
      projection: logic.apply(this.policy.options.merge.projection?.rule || DEFAULT_MERGE_PROJECTIONS_RULE, { items: joined.projections, type, operation }),
      setter: logic.apply(this.policy.options.merge.setter?.rule || DEFAULT_MERGE_SETTERS_RULE, { items: joined.setters, type, operation }),
    }
  }

  /**
   * method to refetch updated policy on update signal from socket
   *
   * @private
   * @memberof PDP
   */
  private async update() {
    const { applicationId, hostname, ssl } = this.options
    this.logger.debug(undefined, `Received policy update event for application ${applicationId}`)
    this.controller?.abort()
    this.controller = new AbortController()
    const {
      data: { data: policy },
    } = await axios<Payload<Policy<RoleName>>>({
      method: 'GET',
      baseURL: `http${ssl ? 's' : ''}://${hostname}/api`,
      url: `/applications/${applicationId}/policy`,
      signal: this.controller.signal,
    })
    if (!policy) throw new Error(`Could not load policy for application ${applicationId}`)

    this.policy = policy
    this.options.onUpdated && this.options.onUpdated()
    this.logger.info(undefined, `Policy updated for application ${applicationId}`)
  }

  /**
   * Make sure to gracefully shutdown the PDP and its connection to the policer instance to avoid leaking
   *
   * @memberof PDP
   */
  shutdown() {
    this.logger.info(undefined, `Shutdown PDP instance for application ${this.options.applicationId} gracefully`)
    // close socket connection
    this.socket?.close()
  }
}

export default PDP

type Logger = ReturnType<typeof DEFAULT_LOGGER>

/**
 * PDP initialization options
 */
export interface Options<RoleName extends string = string> {
  /**
   * The application identifier (BSON id)
   *
   * @example "65f0674f39d8a1a5ef805ca7"
   */
  applicationId: string

  /**
   * the hostname of the policer instance managing the policy
   *
   * @default "api.policer.io"
   */
  hostname?: string

  /**
   * Whether to use encryption for secure communication (https, wss).
   *
   * Set `true` to encrypt communication with SSL
   *
   * @default true
   */
  ssl?: boolean

  socket?: SocketOptions

  /**
   * callback that is executed after successful policy update
   */
  onUpdated?: () => void

  /**
   * set your own logger or logger options
   *
   * @default pinojs/pino
   */
  logger?: Logger

  /**
   * allows setting a local policy for offline use
   *
   * **WARNING**: when a local policy is set, the PDP does not fetch and update the policy from policer API
   */
  policy?: Policy<RoleName>
}

/**
 * set options for socket.io connection which listens for policy update signals
 */
type SocketOptions = {
  /**
   * Weahter to use WebSockets (`'ws'`) or HTTP (`'http'`) to listen for Policy Update Events
   *
   * @defaut "ws"
   */
  protocol?: 'ws' | 'http'

  /**
   * time to wait for, to establish initial connection before throwing timeout error
   *
   * @default 5000
   */
  timeout?: number

  /**
   * event handler called on connect event
   */
  onConnect?: () => void

  /**
   * event handler called on disconnect event
   *
   * @param {string} reason - explaining the reason for disconnection
   */
  onDisconnect?: (reason: string) => void

  /**
   * event handler called on update event
   *
   * @param {string} event - the event name the PDP is listening for
   */
  onUpdate?: (event: string) => void

  /**
   * set to `true` if PDP should not establish a socket connection to listen for policy update signals
   *
   * **WARNING**: disabling the socket might result in operating the PDP with an outdated policy and
   * therefore causing access control vulnerabilities in your application.
   *
   * **Do not disable the socket connection in production!**
   *
   * @default false
   */
  disable?: boolean
}
