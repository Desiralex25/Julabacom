/**
 * Script de renommage des images SVG vers PNG
 * Exécuter une seule fois : node rename-images.js
 */

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');

console.log('🔄 Renommage des fichiers .svg vers .png...\n');

try {
  const files = fs.readdirSync(imagesDir);
  let count = 0;

  files.forEach(file => {
    if (file.endsWith('.svg')) {
      const oldPath = path.join(imagesDir, file);
      const newPath = path.join(imagesDir, file.replace('.svg', '.png'));
      
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${file} → ${file.replace('.svg', '.png')}`);
      count++;
    }
  });

  console.log(`\n🎉 ${count} fichiers renommés avec succès !`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
