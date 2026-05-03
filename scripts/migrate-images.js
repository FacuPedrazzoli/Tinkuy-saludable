const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SUPABASE_URL = 'https://tinkuy.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
const BUCKET_NAME = 'products';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const productsMap = {
  'almendras-Enteras-Premium.png': 'Almendras Enteras Premium',
  'nueces-de-castilla.png': 'Nueces de Castilla',
  'pistachos-sin-cascaras.png': 'Pistachos Sin Cáscara',
  'mix-de-frutos-secos-premium.png': 'Mix de Frutos Secos Premium',
  'castanas-de-caju.png': 'Castañas de Cajú',
  'macadamia-australiana.png': 'Macadamia Australiana',
  'semillas-de-chia-organicas.png': 'Semillas de Chía Orgánicas',
  'semillas-de-lino-doradas.png': 'Semillas de Lino Doradas',
  'mix-de-semillas-premium.png': 'Mix de Semillas Premium',
  'semillas-de-girasol.png': 'Semillas de Girasol',
  'harina-de-almendra-premium.png': 'Harina de Almendra Premium',
  'harina-de-coco-organica.png': 'Harina de Coco Orgánica',
  'harina-integral-de-avena.png': 'Harina Integral de Avena',
  'barra-proteica-crunch.png': 'Barra Proteica Crunch',
  'cookies-sin-azucar.png': 'Cookies Sin Azúcar',
  'endulzante-natural-stevia.png': 'Endulzante Natural Stevia',
  'granola-clasica-premium.png': 'Granola Clásica Premium',
  'te-verde-matcha.png': 'Té Verde Matcha Ceremonial',
  'yerba-mate-compuesta.png': 'Yerba Mate Compuesta',
  'leche-de-coco-entera.png': 'Leche de Coco Entera',
  'crackers-de-semillas.png': 'Crackers de Semillas',
  'hummus-oriental.png': 'Hummus Oriental',
  'miel-de-maple-pure.png': 'Miel de Maple Pure',
  'pasta-de-datiles.png': 'Pasta de Dátiles',
  'bizcochos-vainilla-sin-tacc.png': 'Bizcochos Vainilla Sin TACC',
  'panaderia-mix-sin-gluten.png': 'Panadería Mix Sin Gluten',
  'te-rojo-pu-erh.png': 'Té Rojo Pu-Erh',
  'vitamina-d3-k2.png': 'Vitamina D3 + K2',
  'omega-3-fish-oil.png': 'Omega 3 Fish Oil',
  'mantequilla-de-mani-creamy.png': 'Mantequilla de Maní Creamy',
  'harina-de-garbanzos.png': 'Harina de Garbanzo',
  'mix-frutos-del-bosque.png': 'Mix Frutos del Bosque',
  'whey-protein-concentrate.png': 'Whey Protein Concentrate',
  'proteina-vegetal-isolate.png': 'Proteína Vegetal Isolate',
};

async function compressAndUpload(imagePath, productName) {
  const fileName = path.basename(imagePath);
  const outputFileName = fileName.replace(/\.[^.]+$/, '.webp');
  const outputPath = path.join(__dirname, 'compressed', outputFileName);

  if (!fs.existsSync(path.join(__dirname, 'compressed'))) {
    fs.mkdirSync(path.join(__dirname, 'compressed'), { recursive: true });
  }

  console.log(`Compressing ${fileName}...`);
  await sharp(imagePath)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  console.log(`Uploading ${outputFileName} to Supabase...`);
  const fileBuffer = fs.readFileSync(outputPath);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(outputFileName, fileBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });

  if (uploadError) {
    console.error(`Error uploading ${fileName}:`, uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(outputFileName);

  fs.unlinkSync(outputPath);

  return { url: urlData.publicUrl, productName, fileName: outputFileName };
}

async function getProductIdByName(productName) {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .ilike('name', productName)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.log(`Product not found: ${productName}`);
    return null;
  }
  return data[0].id;
}

async function insertProductImage(productId, url, isPrimary = true) {
  if (!productId) return;

  const { error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: url,
      is_primary: isPrimary,
      sort_order: 0,
    });

  if (error) {
    console.log(`Error inserting image for ${productId}:`, error.message);
  } else {
    console.log(`Image inserted for product ${productId}`);
  }
}

async function migrateImages() {
  console.log('Starting image migration...\n');

  const publicDir = path.join(__dirname, '..', 'public');
  const results = [];

  for (const [fileName, productName] of Object.entries(productsMap)) {
    const imagePath = path.join(publicDir, fileName);

    if (!fs.existsSync(imagePath)) {
      console.log(`File not found: ${imagePath}`);
      continue;
    }

    const result = await compressAndUpload(imagePath, productName);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n--- Uploading to database ---\n');

  for (const result of results) {
    const productId = await getProductIdByName(result.productName);
    await insertProductImage(productId, result.url, true);
  }

  console.log('\nMigration complete!');
  console.log(`Total images processed: ${results.length}`);
}

migrateImages().catch(console.error);
