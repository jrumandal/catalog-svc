import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Category } from './category.type';
import { Money } from './money.type';
import { ProductAttribute } from './product-attribute.type';

/**
 * A catalog product.
 *
 * Mirrors the canonical `Product` type in `graphql/catalog.graphql`.
 * `price` is a `Money` (integer cents + currency) to avoid float drift.
 */
@ObjectType()
export class Product {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Money)
  price!: Money;

  @Field(() => String, { nullable: true })
  imageUrl?: string | null;

  @Field(() => Boolean)
  inStock!: boolean;

  @Field(() => [Category])
  categories!: Category[];

  @Field(() => [ProductAttribute])
  attributes!: ProductAttribute[];
}
