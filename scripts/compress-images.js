const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const INPUT_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, '..', 'compressed');
const ZIP_FILE = path.join(__dirname, '..', 'compressed-images.zip');

const IMAGE_FILES = [
  'almendras-Enteras-Premium.png',
  'nueces-de-castilla.png',
  'pistachos-sin-cascaras.png',
  'mix-de-frutos-secos-premium.png',
  'castanas-de-caju.png',
  'macadamia-australiana.png',
  'semillas-de-chia-organicas.png',
  'semillas-de-lino-doradas.png',
  'mix-de-semillas-premium.png',
  'semillas-de-girasol.png',
  'harina-de-almendra-premium.png',
  'harina-de-coco-organica.png',
  'harina-integral-de-avena.png',
  'barra-proteica-crunch.png',
  'cookies-sin-azucar.png',
  'endulzante-natural-stevia.png',
  'granola-clasica-premium.png',
  'te-verde-matcha.png',
  'yerba-mate-compuesta.png',
  'leche-de-coco-entera.png',
  'crackers-de-semillas.png',
  'hummus-oriental.png',
  'miel-de-maple-pure.png',
  'pasta-de-datiles.png',
  'bizcochos-vainilla-sin-tacc.png',
  'panaderia-mix-sin-gluten.png',
  'te-rojo-pu-erh.png',
  'vitamina-d3-k2.png',
  'omega-3-fish-oil.png',
  'mantequilla-de-mani-creamy.png',
  'harina-de-garbanzos.png',
  'mix-frutos-del-bosque.png',
  'whey-protein-concentrate.png',
  'proteina-vegetal-isolate.png',
];

async function compressImages() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Comprimiendo imágenes...\n');
  const results = [];
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  for (const fileName of IMAGE_FILES) {
    const inputPath = path.join(INPUT_DIR, fileName);
    const outputFileName = fileName.replace(/\.[^.]+$/, '.webp');
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    if (!fs.existsSync(inputPath)) {
      console.log(`❌ No encontrado: ${fileName}`);
      continue;
    }

    const originalStats = fs.statSync(inputPath);
    totalOriginalSize += originalStats.size;

    await sharp(inputPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const compressedStats = fs.statSync(outputPath);
    totalCompressedSize += compressedStats.size;

    const originalMB = (originalStats.size / 1024 / 1024).toFixed(2);
    const compressedKB = (compressedStats.size / 1024).toFixed(0);

    console.log(`✅ ${fileName}`);
    console.log(`   ${originalMB}MB → ${compressedKB}KB`);

    results.push({
      original: fileName,
      compressed: outputFileName,
      originalSize: originalStats.size,
      compressedSize: compressedStats.size,
    });
  }

  console.log('\n--- Resumen ---');
  const originalTotalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const compressedTotalMB = (totalCompressedSize / 1024 / 1024).toFixed(2);
  const ratio = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);

  console.log(`Total original: ${originalTotalMB} MB`);
  console.log(`Total comprimido: ${compressedTotalMB} MB`);
  console.log(`Reducción: ${ratio}%`);
  console.log(`\nImágenes comprimidas en: ${OUTPUT_DIR}`);

  console.log('\nGenerando ZIP...');
  const output = fs.createWriteStream(ZIP_FILE);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(OUTPUT_DIR, false);
  await archive.finalize();

  const zipStats = fs.statSync(ZIP_FILE);
  const zipMB = (zipStats.size / 1024 / 1024).toFixed(2);
  console.log(`ZIP creado: ${ZIP_FILE} (${zipMB} MB)`);

  console.log('\n✨ Listo para subir a Supabase Storage!');
}

compressImages().catch(console.error);
