import { Category } from '@/types'

export const categories: Category[] = [
  {
    id: 'frutos-secos',
    name: 'Frutos Secos',
    slug: 'frutos-secos',
    description: 'Selección premium de frutos secos naturales sin procesar',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&q=80',
    subcategories: ['Almendras', 'Nueces', 'Pistachos', 'Castañas', 'Macadamia'],
    productCount: 12,
  },
  {
    id: 'semillas',
    name: 'Semillas',
    slug: 'semillas',
    description: 'Semillas orgánicas para complementar tu alimentación',
    image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800&q=80',
    subcategories: ['Chía', 'Lino', 'Girasol', 'Zapallo', 'Sésamo'],
    productCount: 10,
  },
  {
    id: 'harinas',
    name: 'Harinas',
    slug: 'harinas',
    description: 'Harinas integrales y alternativas sin gluten',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    subcategories: ['Integral', 'Almond', 'Coco', 'Avena', 'Garbanzo'],
    productCount: 8,
  },
  {
    id: 'proteinas',
    name: 'Proteínas',
    slug: 'proteinas',
    description: 'Suplementos proteicos naturales y vegetales',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
    subcategories: ['Whey', 'Vegetal', 'Caseína', 'Collagen'],
    productCount: 8,
  },
  {
    id: 'snacks',
    name: 'Snacks Saludables',
    slug: 'snacks',
    description: 'Opciones deliciosas y nutritivas para picar entre horas',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
    subcategories: ['Barras', 'Galletas', 'Chips', 'Fruta Deshidratada'],
    productCount: 10,
  },
  {
    id: 'sin-tacc',
    name: 'Sin TACC',
    slug: 'sin-tacc',
    description: 'Productos certificados sin gluten para celíacos',
    image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=800&q=80',
    productCount: 8,
  },
  {
    id: 'keto',
    name: 'Keto',
    slug: 'keto',
    description: 'Alimentos bajos en carbohidratos para dieta cetogénica',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    productCount: 6,
  },
  {
    id: 'vegano',
    name: 'Vegano',
    slug: 'vegano',
    description: 'Productos 100% vegetales y cruelty-free',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    productCount: 10,
  },
  {
    id: 'endulzantes',
    name: 'Endulzantes Naturales',
    slug: 'endulzantes',
    description: 'Alternativas saludables al azúcar refinada',
    image: 'https://images.unsplash.com/photo-1588636876650-351fdb7971a4?w=800&q=80',
    subcategories: ['Stevia', 'Erythritol', 'Miel', 'Maple'],
    productCount: 6,
  },
  {
    id: 'granolas',
    name: 'Granolas',
    slug: 'granolas',
    description: 'Mezclas crujientes de avena, frutos y semillas',
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&q=80',
    productCount: 6,
  },
  {
    id: 'infusiones',
    name: 'Infusiones',
    slug: 'infusiones',
    description: 'Tés, infusiones y hierbas para el bienestar',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    subcategories: ['Té Verde', 'Té Negro', 'Hierbas', 'Matcha'],
    productCount: 8,
  },
  {
    id: 'suplementos',
    name: 'Suplementos',
    slug: 'suplementos',
    description: 'Vitaminas y minerales para complementar tu dieta',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&q=80',
    productCount: 8,
  },
]

export const getCategoryBySlug = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug)

export const getCategoryById = (id: string): Category | undefined =>
  categories.find((c) => c.id === id)