import { Product } from '@/types';
import { prisma } from '@/lib/prisma';

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(adaptPrismaProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
    take: 8,
  });

  return products.map(adaptPrismaProduct);
}

export async function getRelatedProducts(productId: string, categoryId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
    take: 4,
  });

  return products.map(adaptPrismaProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      tags: { include: { tag: true } },
      category: true,
      variants: { where: { isActive: true } },
      attributes: true,
    },
  });

  if (!product) return null;

  return adaptPrismaProduct(product);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: categorySlug },
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
  });

  return products.map(adaptPrismaProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
  });

  return products.map(adaptPrismaProduct);
}

export async function getFilteredProducts(filters: {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isKeto?: boolean;
  search?: string;
}): Promise<Product[]> {
  const where: Record<string, unknown> = { isActive: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.minPrice !== undefined) {
    where.basePrice = { gte: filters.minPrice };
  }

  if (filters.maxPrice !== undefined) {
    where.basePrice = { ...(where.basePrice as object), lte: filters.maxPrice };
  }

  if (filters.isOrganic) where.isOrganic = true;
  if (filters.isVegan) where.isVegan = true;
  if (filters.isGlutenFree) where.isGlutenFree = true;
  if (filters.isKeto) where.isKeto = true;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(adaptPrismaProduct);
}

function adaptPrismaProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: unknown;
  stock: number;
  isFeatured: boolean;
  brand: string | null;
  isOrganic: boolean;
  isGlutenFree: boolean;
  isVegan: boolean;
  isKeto: boolean;
  createdAt: Date;
  category?: { slug: string } | null;
  images?: Array<{ url: string }>;
  tags?: Array<{ tag: { name: string } }>;
}): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    shortDescription: product.shortDescription || product.description?.substring(0, 100) || '',
    price: Number(product.basePrice),
    originalPrice: undefined,
    category: product.category?.slug || '',
    subcategory: undefined,
    subcategories: undefined,
    tags: product.tags?.map((t) => t.tag.name) || [],
    images: product.images?.map((img) => img.url) || [],
    ingredients: undefined,
    benefits: undefined,
    nutritionalInfo: undefined,
    stock: product.stock,
    rating: 4.5,
    reviews: 10,
    featured: product.isFeatured,
    promo: undefined,
    brand: product.brand,
    organic: product.isOrganic,
    glutenFree: product.isGlutenFree,
    vegan: product.isVegan,
    keto: product.isKeto,
    createdAt: product.createdAt.toISOString(),
  };
}
