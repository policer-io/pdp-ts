[![logo-light-long-2](https://github.com/policer-io/.github/assets/16650977/c39ad4a3-7a5c-40b6-9a69-5be3a3c50255)](https://policer.io)

# Policy Decision Point — Typescript/Javascript

The [policer.io](https://policer.io) Policy Decision Point (PDP) client library for typescript and javascript projects.

[![Pipeline](https://github.com/policer-io/pdp-ts/actions/workflows/test.yml/badge.svg)](https://github.com/policer-io/pdp-ts/actions/workflows/test.yml)
[![npm](https://img.shields.io/static/v1?label=shipped+with&message=npm&color=cd0000)](https://www.npmjs.com/package/@policer-io/pdp-ts)
[![embrio.tech](https://img.shields.io/static/v1?label=🚀+by&message=EMBRIO.tech&color=24ae5f)](https://embrio.tech)

## :star: Give us a Star!

### Support the project by giving it a GitHub Star!

[![GitHub Repo stars](https://img.shields.io/github/stars/policer-io/pdp-ts?label=GitHub%20%E2%AD%90%EF%B8%8F)](https://github.com/policer-io/pdp-ts)

## :gem: Why `@policer-io/pdp-ts`?

Advanced access control with one line of code with policy as data:

```typescript
const {
  grant, // allow or deny access
  filter, // generate DB query filters
  projection, // show or hide document properties
  setter, // set document properties
} = pdp.can(
  ['editor', 'publisher'], // the user's roles
  'article:publish', // the operation to check
  {
    user: { _id: 'some-user-id-003' },
    document: {
      published: false,
      createdBy: 'other-user-id-007',
    },
  } // attributes of user, document or context
)
```

[Learn more](https://policer.io/#features) about the benefits and features of policer.io!

## :floppy_disk: Installation

### Prerequisites

- Node >= v20.x is required
- policer.io Policy Center instance ([learn more](https://policer.io/#about))
  - self-hosted
  - https://cloud.policer.io (coming soon)

### Install

Use yarn command

    yarn add @policer-io/pdp-ts

or npm command

    npm install --save @policer-io/pdp-ts

## :orange_book: Usage

### Connect to Policy Center

The PDP connects to a policer.io Center Instance to load the policy (roles and permissions) for a given application. Therefore create and connect a `PDP` instance with:

```typescript
import PDP from '@policer-io/pdp-ts'

type RoleName = 'reader' | 'editor' | 'publisher'

const pdp = await PDP.create<RoleName>({
  applicationId: '65f0674f39d8a1a5ef805ca7',
  hostname: 'cloud.policer.io',
})
```

### Make Policy Decisions

```typescript
//// 1. prepare policy decision inputs

/** the user's roles */
const roles: RoleName[] = ['editor', 'publisher']
/** the operation to check */
const operation: string = 'article:publishBatch'
/** attributes of user, document or context */
const attributes: Record<string, unknown> = {
  user: {
    _id: 'some-user-id-003',
    magazine: 'The New Yorker',
  },
  document: {
    published: false,
    createdBy: 'other-user-id-007',
  },
}

//// 2. perform policy decision/check

const { grant, filter, projection, setter } = pdp.can(roles, operation, attributes)

//// 3. use policy decision result

if (grant) {
  // if authorized

  // query documents and document properties based on policy decision result (`filter` & `projection`)
  const articles = await db.articles.find({ $and: [{ status: 'ready' }, filter] }, projection).exec()

  // set or overwrite some document fields based on policy decision result (`setter`), for example `article.magazine`
  articles.forEach((article) => {
    publish({ ...article, ...setter })
  })
} else {
  // if not authorized

  throw new Error('403 Forbidden')
}
```

## :bug: Bugs

Please report bugs by creating a [bug issue](https://github.com/policer-io/pdp-ts/issues/new?assignees=&labels=Bug&template=bug.md&title=).

## :construction_worker_man: Contribute

You can contribute to policer.io by

- improving typescript PDP (this package)
- implementing policer.io PDP for other programming languages
- developing on the policer.io ecosystem in general

Either way, [let's talk](https://policer.io/contact/)!

### Development

#### Prerequisites

- [Node Version Manager](https://github.com/nvm-sh/nvm)
  - node: version specified in [`.nvmrc`](/.nvmrc)
- [Yarn](https://classic.yarnpkg.com/en/)

#### Install

    yarn install

#### Test

    yarn test

or

    yarn test:watch

#### Commit

This repository uses commitlint to enforce commit message conventions. You have to specify the type of the commit in your commit message. Use one of the [supported types](https://github.com/pvdlg/conventional-changelog-metahub#commit-types).

    git commit -m "[type]: my perfect commit message"

## :speech_balloon: Contact

Talk to us via [policer.io](https://policer.io/contact/)

## :lock_with_ink_pen: License

The code is licensed under the [MIT License](https://github.com/policer-io/pdp-ts/blob/main/LICENSE)
