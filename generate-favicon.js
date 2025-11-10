const fs = require('fs');
const https = require('https');

// Since we can't easily convert images in Node without external libraries,
// we'll create a simple SVG favicon that matches the Lesotho flag colors

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Blue stripe -->
  <rect width="100" height="33" fill="#002868"/>
  
  <!-- White stripe with black hat symbol -->
  <rect y="33" width="100" height="34" fill="#FFFFFF"/>
  
  <!-- Traditional Basotho hat (Mokorotlo) in center -->
  <g transform="translate(50, 50)">
    <ellipse cx="0" cy="-5" rx="12" ry="8" fill="#000000"/>
    <path d="M -12,-5 Q -12,0 -8,3 L -4,5 L 4,5 L 8,3 Q 12,0 12,-5 Z" fill="#000000"/>
    <ellipse cx="0" cy="-8" rx="10" ry="6" fill="#000000"/>
    <rect x="-1" y="-15" width="2" height="7" fill="#000000"/>
    <circle cx="0" cy="-15" r="2" fill="#000000"/>
  </g>
  
  <!-- Green stripe -->
  <rect y="67" width="100" height="33" fill="#009543"/>
</svg>`;

// Write SVG file
fs.writeFileSync('public/favicon.svg', svgContent);

console.log('✅ Created favicon.svg');
console.log('📝 You can now update your HTML to use this favicon');
