const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const outputDirectory = process.argv[3];

if (!input || !outputDirectory) {
  console.error('Usage: node scripts/extract-embedded-assets.js <html> <asset-directory>');
  process.exit(1);
}

const extensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const html = fs.readFileSync(input, 'utf8');
const pattern = /data:([^;,]+)(?:;[^,]*)?;base64,([A-Za-z0-9+/=\r\n]+)/g;
const written = new Map();
let references = 0;

fs.mkdirSync(outputDirectory, { recursive: true });

const rewritten = html.replace(pattern, (match, mimeType, encoded) => {
  const extension = extensions[mimeType];
  if (!extension) return match;

  const contents = Buffer.from(encoded.replace(/\s/g, ''), 'base64');
  const digest = crypto.createHash('sha256').update(contents).digest('hex').slice(0, 16);
  const filename = `${digest}.${extension}`;
  const destination = path.join(outputDirectory, filename);

  if (!written.has(filename)) {
    fs.writeFileSync(destination, contents);
    written.set(filename, contents.length);
  }

  references += 1;
  return path.relative(path.dirname(input), destination).split(path.sep).join('/');
});

fs.writeFileSync(input, rewritten, 'utf8');

const bytes = [...written.values()].reduce((total, size) => total + size, 0);
console.log(`Extracted ${written.size} unique assets from ${references} references (${bytes} bytes).`);
