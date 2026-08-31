import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * A product category (supports a single level of nesting via `parentId`).
 *
 * Mirrors the canonical `Category` type in `graphql/catalog.graphql`.
 */
@ObjectType()
export class Category {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => [Category])
  children!: Category[];
}
