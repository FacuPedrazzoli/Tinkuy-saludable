import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frutos-secos' },
      update: {},
      create: {
        name: 'Frutos Secos',
        slug: 'frutos-secos',
        description: 'Amplia selección de frutos secos premium',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'semillas' },
      update: {},
      create: {
        name: 'Semillas',
        slug: 'semillas',
        description: 'Semillas orgánicas y premium',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'harinas' },
      update: {},
      create: {
        name: 'Harinas',
        slug: 'harinas',
        description: 'Harinas sin gluten y alternativas saludables',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'snacks' },
      update: {},
      create: {
        name: 'Snacks',
        slug: 'snacks',
        description: 'Snacks saludables y proteicos',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'endulzantes' },
      update: {},
      create: {
        name: 'Endulzantes',
        slug: 'endulzantes',
        description: 'Endulzantes naturales y bajos en calorías',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'granolas' },
      update: {},
      create: {
        name: 'Granolas',
        slug: 'granolas',
        description: 'Granolas artesanales y saludables',
        sortOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'infusiones' },
      update: {},
      create: {
        name: 'Infusiones',
        slug: 'infusiones',
        description: 'Tés e infusiones premium',
        sortOrder: 7,
      },
    }),
  ]);

  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]));

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'premium' }, update: {}, create: { name: 'Premium', slug: 'premium' } }),
    prisma.tag.upsert({ where: { slug: 'sin-tacc' }, update: {}, create: { name: 'Sin TACC', slug: 'sin-tacc' } }),
    prisma.tag.upsert({ where: { slug: 'vegano' }, update: {}, create: { name: 'Vegano', slug: 'vegano' } }),
    prisma.tag.upsert({ where: { slug: 'keto' }, update: {}, create: { name: 'Keto', slug: 'keto' } }),
    prisma.tag.upsert({ where: { slug: 'organico' }, update: {}, create: { name: 'Orgánico', slug: 'organico' } }),
    prisma.tag.upsert({ where: { slug: 'bestseller' }, update: {}, create: { name: 'Bestseller', slug: 'bestseller' } }),
  ]);

  const tagMap = Object.fromEntries(tags.map(t => [t.slug, t]));

  const products = [
    {
      name: 'Almendras Enteras Premium',
      slug: 'almendras-enteras-premium',
      description: 'Almendras enteras de origen argentino, seleccionadas cuidadosamente. Ricas en proteínas, fibra y grasas saludables.',
      shortDescription: 'Almendras premium seleccionadas, ricas en proteínas y grasas saludables',
      basePrice: 2850,
      originalPrice: 3200,
      categorySlug: 'frutos-secos',
      stock: 45,
      isFeatured: true,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'Naturix',
      promo: '20% OFF',
      images: [
        '/almendras-enteras-premium.png',
        'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=800&q=80',
      ],
      tags: ['premium', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Nueces de Castilla',
      slug: 'nueces-de-castilla',
      description: 'Nueces enteras de la mejor calidad. Excelente fuente de omega-3 y antioxidantes.',
      shortDescription: 'Nueces ricas en omega-3 y antioxidantes',
      basePrice: 3200,
      categorySlug: 'frutos-secos',
      stock: 38,
      isFeatured: true,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'PureNut',
      images: [
        '/nueces-de-castilla.png',
        'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Pistachos Sin Cáscara',
      slug: 'pistachos-sin-cascara',
      description: 'Pistachos sin cáscara tostados ligeramente con sal marina.',
      shortDescription: 'Pistachos tostados con sal marina',
      basePrice: 4500,
      originalPrice: 5000,
      categorySlug: 'frutos-secos',
      stock: 28,
      isFeatured: false,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'GreenNut',
      promo: '10% OFF',
      images: [
        '/pistachos-sin-cascaras.png',
        'https://images.unsplash.com/photo-1567206563064-6f14a07b56a0?w=800&q=80',
      ],
      tags: ['premium', 'sin-tacc', 'vegano'],
    },
    {
      name: 'Mix de Frutos Secos Premium',
      slug: 'mix-frutos-secos-premium',
      description: 'Combinación equilibrada de almendras, nueces, pistachos y castañas de cajú.',
      shortDescription: 'Mix premium de 4 tipos de frutos secos',
      basePrice: 3800,
      categorySlug: 'frutos-secos',
      stock: 52,
      isFeatured: true,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'NatureMix',
      images: [
        '/mix-de-frutos-secos-premium.png',
        'https://images.unsplash.com/photo-1548567628-fa0b9634d3e6?w=800&q=80',
      ],
      tags: ['premium', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Castañas de Cajú',
      slug: 'castanas-de-caju',
      description: 'Castañas de cajú naturales sin tostar. Suave textura y sabor delicado.',
      shortDescription: 'Castañas de cajú naturales',
      basePrice: 2900,
      categorySlug: 'frutos-secos',
      stock: 40,
      isFeatured: false,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'NutriWorld',
      images: [
        '/castanas-de-caju.png',
        'https://images.unsplash.com/photo-1612197527762-8cfb4b634b95?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Macadamia Australiana',
      slug: 'macadamia-australiana',
      description: 'Macadamia de origen australiano, reconocidas mundialmente por su sabor único.',
      shortDescription: 'Macadamia premium importada',
      basePrice: 5500,
      categorySlug: 'frutos-secos',
      stock: 22,
      isFeatured: true,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'AussieNut',
      images: [
        '/macadamia-australiana.png',
        'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=800&q=80',
      ],
      tags: ['premium', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Semillas de Chía Orgánicas',
      slug: 'semillas-chia-organicas',
      description: 'Semillas de chía orgánicas certificadas. Excelente fuente de omega-3, fibra y proteínas.',
      shortDescription: 'Chía orgánica rica en omega-3',
      basePrice: 1800,
      categorySlug: 'semillas',
      stock: 65,
      isFeatured: true,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'BioSeed',
      promo: 'BESTSELLER',
      images: [
        '/semillas-de-chia-organicas.png',
        'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80',
      ],
      tags: ['organico', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Semillas de Lino Doradas',
      slug: 'semillas-lino-doradas',
      description: 'Semillas de lino doradas molidas para mayor absorción de nutrientes.',
      shortDescription: 'Lino dorado molido para mejor absorción',
      basePrice: 1500,
      categorySlug: 'semillas',
      stock: 58,
      isFeatured: false,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'NutriSeed',
      images: [
        '/semillas-de-lino-doradas.png',
        'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Mix de Semillas Premium',
      slug: 'mix-semillas-premium',
      description: 'Combinación de chía, lino, girasol y zapallo.',
      shortDescription: 'Mix de 4 semillas para tu mesa',
      basePrice: 2100,
      categorySlug: 'semillas',
      stock: 47,
      isFeatured: false,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'SeedMix',
      images: [
        '/mix-de-semillas-premium.png',
        'https://images.unsplash.com/photo-1607350141856-ce7498f6b393?w=800&q=80',
      ],
      tags: ['premium', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Semillas de Girasol',
      slug: 'semillas-girasol',
      description: 'Semillas de girasol peladas y tostadas ligeramente.',
      shortDescription: 'Girasol tostado para snacking',
      basePrice: 1200,
      categorySlug: 'semillas',
      stock: 72,
      isFeatured: false,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'SunSeed',
      images: [
        '/semillas-de-girasol.png',
        'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Harina de Almendra Premium',
      slug: 'harina-almendra-premium',
      description: 'Harina de almendra finamente molida, ideal para repostería sin gluten.',
      shortDescription: 'Harina de almendra para repostería',
      basePrice: 2400,
      categorySlug: 'harinas',
      stock: 35,
      isFeatured: true,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'AlmondFlour',
      images: [
        '/harina-de-almendra-premium.png',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Harina de Coco Orgánica',
      slug: 'harina-coco-organica',
      description: 'Harina de coco orgánica, dessecada y finamente tamizada.',
      shortDescription: 'Harina de coco orgánica sin gluten',
      basePrice: 1950,
      categorySlug: 'harinas',
      stock: 42,
      isFeatured: false,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'CocoLife',
      images: [
        '/harina-de-coco-organica.png',
        'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=800&q=80',
      ],
      tags: ['organico', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Harina Integral de Avena',
      slug: 'harina-integral-avena',
      description: 'Harina de avena integral, moleída finamente.',
      shortDescription: 'Harina de avena integral para panadería',
      basePrice: 980,
      categorySlug: 'harinas',
      stock: 88,
      isFeatured: false,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: false,
      isKeto: false,
      brand: 'OatPower',
      images: [
        '/harina-integral-de-avena.png',
        'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano'],
    },
    {
      name: 'Barra Proteica Crunch',
      slug: 'barra-proteica-crunch',
      description: 'Barra proteica con capas de chocolate y maní. 20g de proteína.',
      shortDescription: 'Barra proteica con maní y chocolate',
      basePrice: 850,
      categorySlug: 'snacks',
      stock: 120,
      isFeatured: false,
      isOrganic: false,
      isVegan: false,
      isGlutenFree: true,
      isKeto: true,
      brand: 'ProteinBar',
      images: [
        '/barra-proteica-crunch.png',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
      tags: ['sin-tacc', 'keto'],
    },
    {
      name: 'Cookies Sin Azúcar',
      slug: 'cookies-sin-azucar',
      description: 'Galletas artesanales sin azúcar agregada, endulzadas con stevia.',
      shortDescription: 'Galletas sin azúcar sabor cacao',
      basePrice: 1450,
      categorySlug: 'snacks',
      stock: 68,
      isFeatured: false,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'SweetFree',
      images: [
        '/cookies-sin-azucar.png',
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
      ],
      tags: ['sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Endulzante Natural Stevia',
      slug: 'endulzante-stevia-pura',
      description: 'Stevia pura en polvo, 100% natural. 300 veces más dulce que el azúcar.',
      shortDescription: 'Stevia pura en polvo 100 natural',
      basePrice: 1200,
      categorySlug: 'endulzantes',
      stock: 95,
      isFeatured: true,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'PureSweet',
      images: [
        '/endulzante-natural-stevia.png',
        'https://images.unsplash.com/photo-1571167366136-b57e0cc94b91?w=800&q=80',
      ],
      tags: ['organico', 'sin-tacc', 'vegano', 'keto'],
    },
    {
      name: 'Granola Clásica Premium',
      slug: 'granola-clasica-premium',
      description: 'Granola artesanal con avena, miel y frutos secos.',
      shortDescription: 'Granola artesanal con miel',
      basePrice: 1850,
      categorySlug: 'granolas',
      stock: 52,
      isFeatured: true,
      isOrganic: false,
      isVegan: false,
      isGlutenFree: false,
      isKeto: false,
      brand: 'MorningCrunch',
      images: [
        '/granola-clasica-premium.png',
        'https://images.unsplash.com/photo-1571167366136-b57e0cc94b91?w=800&q=80',
      ],
      tags: ['sin-tacc'],
    },
    {
      name: 'Té Verde Matcha Ceremonial',
      slug: 'te-verde-matcha-ceremonial',
      description: 'Matcha ceremonial de grado premium importado de Japón.',
      shortDescription: 'Matcha japonés ceremonial premium',
      basePrice: 4200,
      categorySlug: 'infusiones',
      stock: 32,
      isFeatured: true,
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      isKeto: true,
      brand: 'MatchaHouse',
      promo: 'NEW',
      images: [
        '/te-verde-matcha.png',
        'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80',
      ],
      tags: ['organico', 'sin-tacc', 'vegano', 'keto'],
    },
  ];

  for (const productData of products) {
    const { images, tags: productTags, categorySlug, ...data } = productData;
    const categoryId = categoryMap[categorySlug]?.id;
    
    if (!categoryId) {
      console.warn(`Category not found: ${categorySlug}`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categoryId,
      },
      create: {
        ...data,
        categoryId,
      },
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.upsert({
        where: {
          id: `${product.id}-img-${i}`,
        },
        update: {
          url: images[i],
          sortOrder: i,
        },
        create: {
          id: `${product.id}-img-${i}`,
          url: images[i],
          sortOrder: i,
          productId: product.id,
        },
      });
    }

    for (const tagSlug of productTags) {
      const tag = tagMap[tagSlug];
      if (tag) {
        await prisma.productTag.upsert({
          where: {
            productId_tagId: {
              productId: product.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            tagId: tag.id,
          },
        });
      }
    }

    console.log(`Product seeded: ${product.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
