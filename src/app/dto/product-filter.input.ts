import { Field, InputType } from '@nestjs/graphql';
import { ProductSort } from './product-sort.enum';

/**
 * Filter/sort options for the `products` query.
 *
 * Mirrors the canonical `ProductFilterInput` in `graphql/catalog.graphql`.
 * All fields are optional; the resolver applies whichever are provided.
 */
@InputType()
export class ProductFilterInput {
  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => Number, { nullable: true })
  minPrice?: number | null;

  @Field(() => Number, { nullable: true })
  maxPrice?: number | null;

  @Field(() => Boolean, { nullable: true })
  inStock?: boolean | null;

  @Field(() => ProductSort, { nullable: true })
  sort?: ProductSort | null;

  @Field(() => String, { nullable: true })
  search?: string | null;
}
