import { type Server as HttpServer, createServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import PDP from './pdp'
import Pino from 'pino'
import { AddressInfo } from 'node:net'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const policy = {
  roles: [
    {
      _id: '65fd72e008cb30d9196f7dd9',
      name: 'reader',
      description: null,
      permissions: [
        {
          _id: '65fc522bc3760d44cf7ed7b3',
          name: 'article:rate',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:28:43.048Z',
          updatedAt: '2024-03-21T15:28:43.048Z',
          __v: 0,
        },
        {
          _id: '65fc5239c3760d44cf7ed7b5',
          name: 'article:share',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:28:57.913Z',
          updatedAt: '2024-03-21T15:28:57.913Z',
          __v: 0,
        },
        {
          _id: '65fc5262c3760d44cf7ed7b7',
          name: 'article:read',
          condition: {
            _id: '65f161d0da740b7b3a7ec396',
            name: 'requireSubscriptionForPremium',
            rule: {
              or: [
                {
                  '!': {
                    var: 'document.isPremium',
                  },
                },
                {
                  and: [
                    {
                      var: 'document.isPremium',
                    },
                    {
                      var: 'user.hasSubscription',
                    },
                  ],
                },
              ],
            },
            type: 'condition',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-13T08:20:32.736Z',
            updatedAt: '2024-03-13T08:20:32.736Z',
            __v: 0,
          },
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:29:38.741Z',
          updatedAt: '2024-03-21T15:29:38.741Z',
          __v: 0,
        },
        {
          _id: '65fd6d7e08cb30d9196f7dbf',
          name: 'article:list',
          condition: null,
          filter: {
            _id: '65fd6cd808cb30d9196f7dbd',
            name: 'filterPremiumWithoutSubscription',
            rule: {
              if: [
                {
                  var: 'user.hasSubscription',
                },
                null,
                {
                  json: '{ "premium": { "$in": [null, false] } }',
                },
              ],
            },
            type: 'filter',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-22T11:34:48.564Z',
            updatedAt: '2024-03-22T11:34:48.564Z',
            __v: 0,
          },
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:37:34.891Z',
          updatedAt: '2024-03-22T11:37:34.891Z',
          __v: 0,
        },
        {
          _id: '65fc522bc3760d44cf7ed7b8',
          name: 'magazine:buy',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:28:43.049Z',
          updatedAt: '2024-03-21T15:28:43.049Z',
          __v: 0,
        },
        {
          _id: '65fc522bc3760d44cf7ed7b9',
          name: 'magazine:list',
          condition: null,
          filter: {
            _id: '65fd6cd808cb30d9196f7dba',
            name: 'filterMagazinesOfNation',
            rule: {
              json: '{ "nation": {{user.nation}} }',
            },
            type: 'filter',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-22T11:34:48.564Z',
            updatedAt: '2024-03-22T11:34:48.564Z',
            __v: 0,
          },
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:28:43.049Z',
          updatedAt: '2024-03-21T15:28:43.049Z',
          __v: 0,
        },
      ],
      inherits: [],
      tenant: '65ef22afe0c9152df2fc1f8a',
      application: '65f0674f39d8a1a5ef805ca7',
      createdAt: '2024-03-22T12:00:32.835Z',
      updatedAt: '2024-03-22T12:00:32.835Z',
      __v: 0,
    },
    {
      _id: '65fd83cf08cb30d9196f7ddb',
      name: 'editor',
      description: null,
      permissions: [
        {
          _id: '65fd6d9808cb30d9196f7dc1',
          name: 'article:list',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:38:00.341Z',
          updatedAt: '2024-03-22T11:38:00.341Z',
          __v: 0,
        },
        {
          _id: '65fd6db208cb30d9196f7dc3',
          name: 'article:read',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:38:26.978Z',
          updatedAt: '2024-03-22T11:38:26.978Z',
          __v: 0,
        },
        {
          _id: '65fd6dbb08cb30d9196f7dc5',
          name: 'article:create',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:38:35.503Z',
          updatedAt: '2024-03-22T11:38:35.503Z',
          __v: 0,
        },
        {
          _id: '65fd6e7c08cb30d9196f7dcb',
          name: 'article:rate',
          condition: {
            _id: '65fd6e5708cb30d9196f7dc9',
            name: 'isNotArticleOwner',
            rule: {
              '!==': [
                {
                  var: 'document.owner',
                },
                {
                  var: 'user.id',
                },
              ],
            },
            type: 'condition',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-22T11:41:11.283Z',
            updatedAt: '2024-03-22T11:41:11.283Z',
            __v: 0,
          },
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:41:48.212Z',
          updatedAt: '2024-03-22T11:41:48.212Z',
          __v: 0,
        },
        {
          _id: '65fd6f3b08cb30d9196f7dd1',
          name: 'article:update',
          condition: {
            _id: '65fd6f1708cb30d9196f7dcf',
            name: 'belongsToOwnDepartment',
            rule: {
              in: [
                {
                  var: 'document.department',
                },
                {
                  var: 'user.departments',
                },
              ],
            },
            type: 'condition',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-22T11:44:23.549Z',
            updatedAt: '2024-03-22T11:44:23.549Z',
            __v: 0,
          },
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:44:59.060Z',
          updatedAt: '2024-03-22T11:44:59.060Z',
          __v: 0,
        },
        {
          _id: '65fc522bc3760d44cf7ed7a9',
          name: 'magazine:list',
          condition: null,
          filter: {
            _id: '65fd6cd808cb30d9196f7daa',
            name: 'filterMagazinesOfContinent',
            rule: {
              json: '{ "continent": {{user.continent}} }',
            },
            type: 'filter',
            tenant: '65ef22afe0c9152df2fc1f8a',
            application: '65f0674f39d8a1a5ef805ca7',
            createdAt: '2024-03-22T11:34:48.564Z',
            updatedAt: '2024-03-22T11:34:48.564Z',
            __v: 0,
          },
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-21T15:28:43.049Z',
          updatedAt: '2024-03-21T15:28:43.049Z',
          __v: 0,
        },
      ],
      inherits: ['reader'],
      tenant: '65ef22afe0c9152df2fc1f8a',
      application: '65f0674f39d8a1a5ef805ca7',
      createdAt: '2024-03-22T13:12:47.747Z',
      updatedAt: '2024-03-22T13:12:47.747Z',
      __v: 0,
    },
    {
      _id: '65fd841e08cb30d9196f7ddd',
      name: 'publisher',
      description: null,
      permissions: [
        {
          _id: '65fd6f5c08cb30d9196f7dd3',
          name: 'article:*',
          condition: null,
          filter: null,
          projection: null,
          setter: null,
          tenant: '65ef22afe0c9152df2fc1f8a',
          application: '65f0674f39d8a1a5ef805ca7',
          createdAt: '2024-03-22T11:45:32.741Z',
          updatedAt: '2024-03-22T11:45:32.741Z',
          __v: 0,
        },
      ],
      inherits: ['editor'],
      tenant: '65ef22afe0c9152df2fc1f8a',
      application: '65f0674f39d8a1a5ef805ca7',
      createdAt: '2024-03-22T13:14:06.232Z',
      updatedAt: '2024-03-22T13:14:06.232Z',
      __v: 0,
    },
  ],
  name: 'pharmassist-p',
  tenant: '65ef22afe0c9152df2fc1f8a',
  options: {
    global: {
      condition: {
        _id: '65fc09d2f4bf072a711ddbd4',
        name: 'userHasMagazine',
        rule: {
          or: [
            { '!': { var: 'document' } },
            {
              and: [
                { var: 'document' },
                {
                  in: [
                    {
                      var: 'document.magazine',
                    },
                    {
                      var: 'user.magazines',
                    },
                  ],
                },
              ],
            },
          ],
        },
        type: 'condition',
        tenant: '65ef22afe0c9152df2fc1f8a',
        application: '65f0674f39d8a1a5ef805ca7',
        createdAt: '2024-03-21T10:20:02.618Z',
        updatedAt: '2024-03-21T10:20:02.618Z',
        __v: 0,
      },
      filter: {
        _id: '65fc09d2f4bf072a711ddbd5',
        name: 'filterMagazines',
        rule: {
          if: [
            { '!': { var: 'document' } },
            {
              json: '{ "magazine": { "$in": {{user.magazines}} } }',
            },
            null,
          ],
        },
        type: 'filter',
        tenant: '65ef22afe0c9152df2fc1f8a',
        application: '65f0674f39d8a1a5ef805ca7',
        createdAt: '2024-03-21T10:20:02.618Z',
        updatedAt: '2024-03-21T10:20:02.618Z',
        __v: 0,
      },

      projection: null,
      setter: {
        name: 'set document organization from user',
        rule: {
          if: [
            { var: 'user.organization' },
            {
              json: ['{ "organization": {{0}} }', [{ var: 'user.organization' }]],
            },
            null,
          ],
        },
        type: 'setter',
        tenant: '65ef22afe0c9152df2fc1f8a',
        application: '65f0674f39d8a1a5ef805ca7',
        _id: '6662cbfaaff2414fd4059979',
        createdAt: '2024-06-07T08:59:38.524Z',
        updatedAt: '2024-06-07T08:59:38.524Z',
        __v: 0,
      },
    },
    merge: {
      condition: null,
      filter: null,
      projection: null,
      setter: null,
    },
  },
  _id: '65f0674f39d8a1a5ef805ca7',
  createdAt: '2024-03-12T14:31:43.375Z',
  updatedAt: '2024-03-21T10:56:03.936Z',
  __v: 2,
}

jest.mock('axios', () => {
  return jest.fn(async () => ({
    data: { data: policy },
  }))
})

describe('pdp socket connection should', () => {
  let port: number
  let io: SocketServer
  let httpServer: HttpServer
  let pdp: PDP

  const onConnect = jest.fn()
  const onUpdate = jest.fn()
  const onUpdated = jest.fn()

  beforeAll((done) => {
    httpServer = createServer()
    io = new SocketServer(httpServer)
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port
      done()
    })
  })

  afterAll(() => {
    pdp.shutdown()
    io.close()
  })

  test('connect', async () => {
    pdp = await PDP.create({
      applicationId: '65f0674f39d8a1a5ef805ca7',
      hostname: `localhost:${port}`,
      ssl: false,
      onUpdated,
      socket: {
        onUpdate,
        onConnect,
      },
      logger: Pino<string>({
        level: 'silent',
        transport: {
          target: 'pino-pretty',
        },
      }),
    })

    expect(onConnect).toHaveBeenCalled()
    expect(pdp.connected).toBe(true)
  })

  test('update on update signal', async () => {
    const [message] = await io.timeout(5000).emitWithAck(`${policy.tenant}/${policy._id}/policy:update`)

    expect(message).toBe(`${policy.tenant}/${policy._id}/policy:updated`)
    expect(onUpdate).toHaveBeenCalled()
    expect(onUpdated).toHaveBeenCalled()
  })
})

describe('pdp should', () => {
  let pdp: PDP

  test('initialize without socket connection.', async () => {
    pdp = await PDP.create({
      applicationId: '65f0674f39d8a1a5ef805ca7',
      hostname: 'mock.policer.io',
      ssl: false,
      socket: {
        disable: true,
      },
      logger: Pino<string>({
        level: 'silent',
        transport: {
          target: 'pino-pretty',
        },
      }),
    })
    expect(pdp).toBeInstanceOf(PDP)
  })

  test('raise error for unknown roles', () => {
    expect(() => pdp.can(['superman'], 'do:whatever')).toThrow('Role superman does not exist on policy!')
  })

  // test reader permissions
  describe('evaluate reader permissions', () => {
    test('allow reader to article:rate if pricipal has access to articles magazine', () => {
      expect(pdp.can(['reader'], 'article:rate', { user: { magazines: ['postillion', 'styler'] }, document: { magazine: 'styler' } })).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow reader to article:rate if principal has no access to article magazine', () => {
      expect(pdp.can(['reader'], 'article:rate', { user: { magazines: ['postillion', 'styler'] }, document: { magazine: 'doggy lovers' } })).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow reader to article:read if article is not premium', () => {
      expect(
        pdp.can(['reader'], 'article:read', { user: { magazines: ['postillion', 'styler'] }, document: { magazine: 'styler', isPremium: false } })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow reader to article:read if article is premium and user has subscription', () => {
      expect(
        pdp.can(['reader'], 'article:read', {
          user: { magazines: ['postillion', 'styler'], hasSubscription: true },
          document: { magazine: 'styler', isPremium: true },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow reader to article:read if article is premium and user dosnt have subscription', () => {
      expect(
        pdp.can(['reader'], 'article:read', {
          user: { magazines: ['postillion', 'styler'], hasSubscription: false },
          document: { magazine: 'styler', isPremium: true },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow reader to article:list only none-premium articles without subscription', () => {
      expect(
        pdp.can(['reader'], 'article:list', {
          user: { magazines: ['postillion', 'styler'], hasSubscription: false },
        })
      ).toEqual({
        grant: true,
        filter: {
          merged: [{ magazine: { $in: ['postillion', 'styler'] } }, { premium: { $in: [null, false] } }],
        },
        projection: null,
        setter: null,
      })
    })

    test('allow reader to article:list all articles with subscription', () => {
      expect(
        pdp.can(['reader'], 'article:list', {
          user: { magazines: ['postillion', 'styler'], hasSubscription: true },
        })
      ).toEqual({
        grant: true,
        filter: {
          merged: [{ magazine: { $in: ['postillion', 'styler'] } }, null],
        },
        projection: null,
        setter: null,
      })
    })
  })

  describe('evaluate editor permissions', () => {
    test('allow editor to article:read for his magazines', () => {
      expect(
        pdp.can('editor', 'article:read', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow editor to article:list all articles for his magazines', () => {
      expect(
        pdp.can('editor', 'article:list', {
          user: { magazines: ['postillion'] },
        })
      ).toEqual({
        grant: true,
        filter: {
          merged: [{ magazine: { $in: ['postillion'] } }, null],
        },
        projection: null,
        setter: null,
      })
    })

    test('allow editor to inherit article:share permission from reader', () => {
      expect(
        pdp.can(['editor'], 'article:share', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow editor to inherit missspelled article:shareS permission from reader', () => {
      expect(
        pdp.can(['editor'], 'article:shareS', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow editor to article:create but apply global organization setter', () => {
      expect(
        pdp.can(['editor'], 'article:create', {
          user: { magazines: ['postillion'], id: '001', organization: 'Lügenpresse AG' },
          document: { magazine: 'postillion', owner: '002' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: {
          merged: [{ organization: 'Lügenpresse AG' }, null],
        },
      })
    })

    test('allow editor to article:rate articles of other authors', () => {
      expect(
        pdp.can(['editor'], 'article:rate', {
          user: { magazines: ['postillion'], id: '001' },
          document: { magazine: 'postillion', owner: '002' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow editor to article:rate own article', () => {
      expect(
        pdp.can(['editor'], 'article:rate', {
          user: { magazines: ['postillion'], id: '001' },
          document: { magazine: 'postillion', owner: '001' },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow editor to article:update documents from own department', () => {
      expect(
        pdp.can(['editor'], 'article:update', {
          user: { magazines: ['postillion'], departments: ['politics', 'economics'] },
          document: { magazine: 'postillion', department: 'economics' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow editor to article:update documents from other department', () => {
      expect(
        pdp.can(['editor'], 'article:update', {
          user: { magazines: ['postillion'], departments: ['politics', 'economics'] },
          document: { magazine: 'postillion', department: 'culture' },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })
  })

  describe('evaluate publisher permissions', () => {
    test('allow publisher to article:share because of wildcard (*)', () => {
      expect(
        pdp.can(['publisher'], 'article:share', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow publisher to article:* for his magazines', () => {
      expect(
        pdp.can(['publisher'], 'article:anything', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow publisher to magazine:create', () => {
      expect(
        pdp.can(['publisher'], 'magazine:create', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow publisher to inherit magazine:buy from reader via editor', () => {
      expect(
        pdp.can(['publisher'], 'magazine:buy', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })
  })

  describe('evaluate multi-role permissios', () => {
    test('allow editor to magazine:rate own article because also has publisher role', () => {
      expect(
        pdp.can(['editor', 'publisher'], 'article:rate', {
          user: { magazines: ['postillion'], id: '001' },
          document: { magazine: 'postillion', owner: '001' },
        })
      ).toEqual({
        grant: true,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('not allow editor, reader to magazine:anything', () => {
      expect(
        pdp.can(['reader', 'editor'], 'article:anything', {
          user: { magazines: ['postillion'] },
          document: { magazine: 'postillion' },
        })
      ).toEqual({
        grant: false,
        filter: null,
        projection: null,
        setter: null,
      })
    })

    test('allow editor, reader to magazine:list but with merged filters from both roles and global filter', () => {
      expect(
        pdp.can(['reader', 'editor'], 'magazine:list', {
          user: { continent: 'europe', nation: 'france', magazines: ['postillion'] },
        })
      ).toEqual({
        grant: true,
        filter: {
          merged: [
            {
              magazine: { $in: ['postillion'] },
            },
            { continent: 'europe' },
            { nation: 'france' },
          ],
        },
        projection: null,
        setter: null,
      })
    })
  })

  test('shutdown gracefully', () => {
    expect(pdp.shutdown()).toBe(void 0)
  })
})
