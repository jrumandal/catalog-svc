import { Args, ID, Query } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Category } from '../dto/category.type';
import { Product } from '../dto/product.type';
import { ProductAttribute } from '../dto/product-attribute.type';
import { ProductFilterInput } from '../dto/product-filter.input';
import { ProductSort } from '../dto/product-sort.enum';

/**
 * Catalog GraphQL resolver.
 *
 * Backed by Prisma (real DB) — see `prisma/schema.prisma`. The catalog domain
 * is read-only for the storefront: `products`, `product`, `categories`.
 *
 * Money is stored as integer cents (`price`) + `currency` in the DB and mapped
 * to the `Money` GraphQL type (`amount` + `currency`).
 */

/** Recursive shape of a Prisma `Category` row (with optional nested children). */
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CategoryRow[];
};

@Injectable()
export class CatalogResolver {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List products, optionally filtered/sorted.
   *
   * Filters: category (slug), minPrice/maxPrice (cents), inStock, search
   * (name/description), sort (price/name asc/desc).
   */
  @Query(() => [Product], { description: 'List products with optional filters.' })
  async products(
    @Args('input', { nullable: true }) input?: ProductFilterInput,
  ): Promise<Product[]> {
    const where = this.buildWhere(input);
    const orderBy = this.buildOrderBy(input?.sort);

    const rows = await this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        categories: { include: { category: true } },
        attributes: true,
      },
    });

    return rows.map((row) => this.toProduct(row));
  }

  /**
   * Fetch a single product by id (or null if not found).
   */
  @Query(() => Product, {
    nullable: true,
    description: 'Fetch a single product by id.',
  })
  async product(@Args('id', { type: () => ID }) id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        attributes: true,
      },
    });

    return row ? this.toProduct(row) : null;
  }

  /**
   * List all categories (with their direct children).
   */
  @Query(() => [Category], { description: 'List all categories.' })
  async categories(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { children: true },
    });

    return rows.map((row) => this.toCategory(row));
  }

  // ---- private helpers ----

  private buildWhere(
    input?: ProductFilterInput,
  ): Record<string, unknown> {
    if (!input) return {};

    const where: Record<string, unknown> = {};

    if (input.category) {
      where.categories = { some: { category: { slug: input.category } } };
    }

    if (input.minPrice != null || input.maxPrice != null) {
      const price: Record<string, unknown> = {};
      if (input.minPrice != null) price.gte = input.minPrice;
      if (input.maxPrice != null) price.lte = input.maxPrice;
      where.price = price;
    }

    if (input.inStock != null) {
      where.inStock = input.inStock;
    }

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sort?: ProductSort | null,
  ): { price?: 'asc' | 'desc'; name?: 'asc' | 'desc' } {
    switch (sort) {
      case ProductSort.PRICE_ASC:
        return { price: 'asc' };
      case ProductSort.PRICE_DESC:
        return { price: 'desc' };
      case ProductSort.NAME_ASC:
        return { name: 'asc' };
      case ProductSort.NAME_DESC:
        return { name: 'desc' };
      default:
        return { name: 'asc' };
    }
  }

  private toProduct(row: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    imageUrl: string | null;
    inStock: boolean;
    categories: {
      productId: string;
      categoryId: string;
      category: {
        id: string;
        name: string;
        slug: string;
        parentId: string | null;
      };
    }[];
    attributes: { name: string; value: string }[];
  }): Product {
    const product = new Product();
    product.id = row.id;
    product.name = row.name;
    product.description = row.description;
    product.price = { amount: row.price, currency: row.currency };
    product.imageUrl = row.imageUrl;
    product.inStock = row.inStock;
    product.categories = row.categories.map((pc) => this.toCategory(pc.category));
    product.attributes = row.attributes.map((a) => {
      const attr = new ProductAttribute();
      attr.name = a.name;
      attr.value = a.value;
      return attr;
    });
    return product;
  }

  private toCategory(row: CategoryRow): Category {
    const category = new Category();
    category.id = row.id;
    category.name = row.name;
    category.slug = row.slug;
    category.parentId = row.parentId;
    category.children = row.children?.map((c) => this.toCategory(c)) ?? [];
    return category;
  }
}
