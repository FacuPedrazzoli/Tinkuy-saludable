const categoryImages: Record<string, string> = {
  'frutos-secos': 'https://images.unsplash.com/photo-1536591378896-a53d3b2c4a77?w=400&q=80',
  'semillas': 'https://images.unsplash.com/photo-1609619385005-40e8a5c2e2c5?w=400&q=80',
  'harinas': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80',
  'proteinas': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  'sin-tacc': 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400&q=80',
  'keto': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80',
  'vegano': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  'endulzantes': 'https://images.unsplash.com/photo-1588636876650-351fdb7971a4?w=400&q=80',
  'granolas': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&q=80',
  'infusiones': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80',
  'suplementos': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
}

const subcategoryImages: Record<string, string> = {
  'Almendras': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80',
  'Nueces': 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=80',
  'Pistachos': 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?w=400&q=80',
  'Castañas': 'https://images.unsplash.com/photo-1606914501449-5a96b6d4566b?w=400&q=80',
  'Macadamia': 'https://images.unsplash.com/photo-1550258988-1c3b8e72e0d2?w=400&q=80',
  'Chía': 'https://images.unsplash.com/photo-1611765081858-3a558021f961?w=400&q=80',
  'Lino': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&q=80',
  'Girasol': 'https://images.unsplash.com/photo-1599468504677-6b1a7b3c3a0d?w=400&q=80',
  'Almond': 'https://images.unsplash.com/photo-1600834521757-09b147888348?w=400&q=80',
  'Coco': 'https://images.unsplash.com/photo-1550411294-875a0b3a3f42?w=400&q=80',
  'Avena': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80',
  'Garbanzo': 'https://images.unsplash.com/photo-1515543904321-c5acf8e4e1f0?w=400&q=80',
  'Vegetal': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
  'Whey': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
  'Barras': 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&q=80',
  'Galletas': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  'Chips': 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&q=80',
  'Untables': 'https://images.unsplash.com/photo-1611250188496-e966043a0629?w=400&q=80',
  'Fruta Deshidratada': 'https://images.unsplash.com/photo-1425934398893-310f0090a034?w=400&q=80',
  'Stevia': 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=400&q=80',
  'Dátiles': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80',
  'Maple': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&q=80',
  'Matcha': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'Té Rojo': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
  'Té Blanco': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&q=80',
}

export function getProductImage(category: string, subcategory?: string): string {
  if (subcategory && subcategoryImages[subcategory]) {
    return subcategoryImages[subcategory]
  }
  return categoryImages[category] || categoryImages['snacks']
}

export function getDefaultProductImage(): string {
  return 'https://images.unsplash.com/photo-1536591378896-a53d3b2c4a77?w=400&q=80'
}

export function validateProductImage(imageUrl: string | undefined, category: string, subcategory?: string): string {
  if (!imageUrl) {
    return getProductImage(category, subcategory)
  }

  return imageUrl
}