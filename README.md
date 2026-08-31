# `@server/catalog-svc` — Catalog microservice

The **catalog-svc** is the NestJS microservice that owns the **catalog domain**
(products, categories). It exposes a GraphQL API (via `@nestjs/graphql` +
Apollo) backed by **Prisma** (PostgreSQL), and is one of the three upstream
services that the **api-gateway** stitches together.

> **Package name is `@server/catalog-svc`** — see `package.json`.
> **Status:** Faithful port of the reference `libs/server/catalog-svc`,
> re-homed as a standalone, independently versioned repository.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /` | Service info (name, status, links). |
| `POST /graphql` | GraphQL endpoint (catalog domain). |
| `GET /api-docs` | Swagger UI (OpenAPI). |
| `GET /health` | Health check (Prisma DB ping) — from `@server/shared`. |

Default port: **4001** (override with `PORT`).

## GraphQL schema

The schema is **auto-generated** by `@nestjs/graphql` from the resolvers + DTOs
(`autoSchemaFile: ./dist/schema.gql`). It mirrors the canonical
`graphql/catalog.graphql`:

```graphql
type Query {
  products(input: ProductFilterInput): [Product!]!
  product(id: ID!): Product
  categories: [Category!]!
}

type Product {
  id: ID!
  name: String!
  description: String
  price: Money!
  imageUrl: String
  inStock: Boolean!
  categories: [Category!]!
  attributes: [ProductAttribute!]!
}

type Category {
  id: ID!
  name: String!
  slug: String!
  parentId: ID
  children: [Category!]!
}

type Money {
  amount: Int!
  currency: String!
}

type ProductAttribute {
  name: String!
  value: String!
}

input ProductFilterInput {
  category: String
  minPrice: Float
  maxPrice: Float
  inStock: Boolean
  sort: ProductSort
  search: String
}

enum ProductSort {
  PRICE_ASC
  PRICE_DESC
  NAME_ASC
  NAME_DESC
}
```

## Data model (Prisma)

The service is backed by the **shared Prisma schema** in `@server/shared`
(`prisma/schema.prisma`). The catalog domain uses the `Product`, `Category`,
`ProductCategory`, and `ProductAttribute` models. Money is stored as integer
cents (`price`) + `currency` and mapped to the `Money` GraphQL type.

> The Prisma schema, migrations, and seed live in **`server-shared`** so all
> three services share one database contract. This service consumes the
> generated `PrismaClient` through `@server/shared`'s `PrismaService`.

## Consuming `@server/shared`

`app.module.ts` imports `AppConfigModule`, `SharedModule`, and `HealthModule`
from `@server/shared`; `main.ts` applies the global `AllExceptionsFilter` and
`LoggingInterceptor`. This gives the service, for free:

- typed env config
- a global `PrismaService` (shared `PrismaClient`)
- a `/health` endpoint with a Prisma DB ping
- structured request logging
- a consistent error envelope for every exception

`@server/shared` is a **workspace dependency** (`workspace:*`). In this
standalone repo it resolves through the pnpm workspace link to
`server-shared/dist/index.js` (main) + `dist/index.d.ts` (types) — so
**`server-shared` must be built (`tsc` → `dist/`) before this repo is
typechecked, tested, or built**. CI does this automatically (see
`.github/workflows/ci.yml`).

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Node 22 LTS, CommonJS |
| Framework | NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/platform-express`, `@nestjs/swagger`) |
| GraphQL | `@nestjs/graphql` + `@nestjs/apollo` (Apollo) |
| ORM | Prisma 6 (shared schema from `@server/shared`) |
| Build | `tsc` → `dist/` (CommonJS) |
| Tests | Jest + ts-jest |
| Lint | ESLint 9 (flat) + typescript-eslint |
| Types | TypeScript 5.9 |

## Repository layout

```
catalog-svc/
├── .github/workflows/ci.yml   # lint → typecheck → test → build
├── .npmrc                     # @server → GitHub Packages
├── .nvmrc                     # Node 22
├── .env.example               # PORT, DATABASE_URL, …
├── eslint.config.mjs          # flat ESLint 9 config
├── jest.config.cts            # Jest + ts-jest
├── package.json               # @server/catalog-svc (private)
├── tsconfig.json              # base compiler options
├── tsconfig.build.json        # build → dist/
├── tsconfig.spec.json         # test (Jest)
└── src/
    ├── main.ts                # bootstrap (Swagger + /graphql + /health)
    └── app/
        ├── app.module.ts
        ├── app.controller.ts
        ├── app.controller.spec.ts
        ├── dto/               # GraphQL types (Product, Category, Money, …)
        └── resolvers/         # CatalogResolver (Prisma-backed)
```

## Build & run

```bash
pnpm install
pnpm build          # tsc → dist/
pnpm start          # node dist/main.js
pnpm dev            # tsx watch src/main.ts
pnpm test           # Jest
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
```

> **Prerequisite:** `server-shared` must be built first (it provides
> `@server/shared` + the generated Prisma client). In CI this is automatic;
> locally run `cd ../server-shared && pnpm install && pnpm prisma:generate &&
> pnpm build` before building this service.

## Dependencies

The service declares (in `package.json`):

- `@nestjs/graphql` + `@nestjs/apollo` — GraphQL schema generation + Apollo.
- `@nestjs/*` — the NestJS runtime (common, core, config, platform-express, swagger, terminus).
- `@server/shared` — shared config / Prisma / health / logging (workspace dep).
- `graphql` — the GraphQL runtime.
