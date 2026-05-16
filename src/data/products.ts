import { Product } from '@/types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aceite de Coco Virgen',
    slug: 'aceite-de-coco-virgen',
    description: 'Aceite de coco virgen prensado en frío, ideal para cocinar y cuidado personal. Rico en ácidos grasos de cadena media.',
    shortDescription: 'Aceite de coco virgen prensado en frío',
    price: 1890,
    category: 'aceites',
    tags: ['orgánico', 'vegano', 'sin gluten'],
    images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800'],
    stock: 50,
    rating: 4.8,
    reviews: 124,
    featured: true,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Miel de Abelhas Nativas',
    slug: 'miel-de-abelhas-nativas',
    description: 'Miel pura de abejas nativas del norte, sin procesar. Dulzor natural y propiedades antibacterianas.',
    shortDescription: 'Miel pura de abejas nativas',
    price: 2450,
    category: 'endulzantes',
    tags: ['orgánico', 'sin procesar'],
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'],
    stock: 30,
    rating: 4.9,
    reviews: 89,
    featured: true,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: false,
    keto: false,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Quinoa Real Boliviana',
    slug: 'quinoa-real-boliviana',
    description: 'Quinoa real de Bolivia, cosechada a más de 3000 metros de altitud. Fuente excepcional de proteína vegetal completa.',
    shortDescription: 'Quinoa real de altura, proteína vegetal completa',
    price: 1650,
    category: 'granos',
    tags: ['orgánico', 'vegano', 'sin gluten', 'alto protein'],
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'],
    stock: 75,
    rating: 4.7,
    reviews: 156,
    featured: true,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: false,
    createdAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '4',
    name: 'Cacao Criollo Peruano',
    slug: 'cacao-criollo-peruano',
    description: 'Cacao criollo de Piura, Perú. El cacao más fino del mundo con notas florales y frutales únicas.',
    shortDescription: 'Cacao criollo premium de Perú',
    price: 3200,
    category: 'superalimentos',
    tags: ['orgánico', 'vegano', 'antioxidante'],
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800'],
    stock: 25,
    rating: 4.9,
    reviews: 67,
    featured: true,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: true,
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '5',
    name: 'Sacha Inchi',
    slug: 'sacha-inchi',
    description: 'Semillas de sacha inchi-orgullo amazónico. Rico en omega 3, 6 y 9, perfecto para snacks saludables.',
    shortDescription: 'Semillas omega 3 del amazonas',
    price: 2100,
    category: 'superalimentos',
    tags: ['orgánico', 'vegano', 'omega 3'],
    images: ['https://images.unsplash.com/photo-1514996550219-62672472c2df?w=800'],
    stock: 40,
    rating: 4.6,
    reviews: 45,
    featured: false,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: true,
    createdAt: '2024-01-02T10:00:00Z',
  },
  {
    id: '6',
    name: 'Yacón Orgánico',
    slug: 'yacon-organico',
    description: 'Raíz de yacón cultivada orgánicamente. Endulzante natural con prebióticos y bajo índice glucémico.',
    shortDescription: 'Endulzante natural con prebióticos',
    price: 1450,
    category: 'endulzantes',
    tags: ['orgánico', 'vegano', 'bajo índice glucémico'],
    images: ['https://images.unsplash.com/photo-1593510987046-1f8fcfc512a0?w=800'],
    stock: 60,
    rating: 4.5,
    reviews: 38,
    featured: false,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: false,
    createdAt: '2023-12-28T10:00:00Z',
  },
  {
    id: '7',
    name: 'Chía Negra Orgánica',
    slug: 'chia-negra-organica',
    description: 'Semillas de chía negra de México. Excelente fuente de omega 3 y fibra dietética.',
    shortDescription: 'Chía mexicana rica en omega 3',
    price: 1250,
    category: 'semillas',
    tags: ['orgánico', 'vegano', 'omega 3', 'fibra'],
    images: ['https://images.unsplash.com/photo-1514996550219-62672472c2df?w=800'],
    stock: 100,
    rating: 4.7,
    reviews: 203,
    featured: false,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: true,
    createdAt: '2023-12-20T10:00:00Z',
  },
  {
    id: '8',
    name: 'Maca Roja en Polvo',
    slug: 'maca-roja-en-polvo',
    description: 'Maca roja en polvo de Junín, Perú. Adaptógeno natural que ayuda a mejorar la energía y el ánimo.',
    shortDescription: 'Adaptógeno energético del Perú',
    price: 2800,
    category: 'superalimentos',
    tags: ['orgánico', 'vegano', 'adaptógeno'],
    images: ['https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800'],
    stock: 35,
    rating: 4.8,
    reviews: 91,
    featured: true,
    brand: 'Tinkuy',
    organic: true,
    glutenFree: true,
    vegan: true,
    keto: false,
    createdAt: '2023-12-15T10:00:00Z',
  },
];

export async function getAllProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS.filter(p => p.stock > 0);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS.filter(p => p.featured && p.stock > 0).slice(0, 8);
}

export async function getRelatedProducts(productId: string, categoryId: string): Promise<Product[]> {
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!product) return [];
  
  return MOCK_PRODUCTS
    .filter(p => p.category === product.category && p.id !== productId && p.stock > 0)
    .slice(0, 4);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find(p => p.slug === slug && p.stock > 0) || null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return MOCK_PRODUCTS.filter(p => p.category === categorySlug && p.stock > 0);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    p =>
      (p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)) &&
      p.stock > 0
  );
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
  return MOCK_PRODUCTS.filter(p => {
    if (p.stock <= 0) return false;
    if (filters.categorySlug && p.category !== filters.categorySlug) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.isOrganic && !p.organic) return false;
    if (filters.isVegan && !p.vegan) return false;
    if (filters.isGlutenFree && !p.glutenFree) return false;
    if (filters.isKeto && !p.keto) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}