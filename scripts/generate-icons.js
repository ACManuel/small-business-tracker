const fs = require('fs');

function generateIconSvg(size) {
  const rx = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#18181b"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${fontSize}" fill="white">MN</text>
</svg>`;
}

fs.writeFileSync('public/icons/icon-192.svg', generateIconSvg(192));
fs.writeFileSync('public/icons/icon-512.svg', generateIconSvg(512));
console.log('SVG icons created');
