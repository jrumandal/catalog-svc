import { registerEnumType } from '@nestjs/graphql';

/**
 * Sort order for the `products` query.
 *
 * Mirrors the canonical `ProductSort` enum in `graphql/catalog.graphql`.
 */
export enum ProductSort {
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  NAME_ASC = 'NAME_ASC',
  NAME_DESC = 'NAME_DESC',
}

registerEnumType(ProductSort, { name: 'ProductSort' });
