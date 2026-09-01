import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  AppConfigModule,
  HealthModule,
  SharedModule,
} from '@jrumandal/shared';
import { AppController } from './app.controller';
import { CatalogResolver } from './resolvers/catalog.resolver';

/**
 * Root module for the catalog service.
 *
 * Wires together:
 *  - `AppConfigModule` (from `@jrumandal/shared`) — typed env config, global
 *  - `SharedModule` (from `@jrumandal/shared`) — provides the global `PrismaService`
 *  - `HealthModule` (from `@jrumandal/shared`) — `/health` with a Prisma DB ping
 *  - `GraphQLModule` (Apollo) — auto-generates the schema from resolvers + DTOs
 *
 * The resolvers + DTOs mirror the canonical `graphql/catalog.graphql`.
 */
@Module({
  imports: [
    AppConfigModule,
    SharedModule,
    HealthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: {
        path: './dist/schema.gql',
      },
      playground: true,
      introspection: true,
    }),
  ],
  controllers: [AppController],
  providers: [CatalogResolver],
})
export class AppModule {}
