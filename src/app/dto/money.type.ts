import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * Monetary amount in integer cents + ISO currency code.
 *
 * Mirrors the canonical `Money` type in `graphql/catalog.graphql` and the
 * shared `Money` type in `graphql/gateway.graphql`. Money is always stored
 * as integer cents to avoid floating-point drift.
 */
@ObjectType()
export class Money {
  @Field(() => Int)
  amount!: number;

  @Field(() => String)
  currency!: string;
}
