import { Field, ObjectType } from '@nestjs/graphql';

/**
 * A product attribute (name/value pair) attached to a product.
 *
 * Mirrors the canonical `ProductAttribute` type in `graphql/catalog.graphql`.
 */
@ObjectType()
export class ProductAttribute {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  value!: string;
}
