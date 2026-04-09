import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Pac-Man chomping a cursor — the BoringOS logo
function createLogoSvg(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38;
  const padding = s * 0.12;

  // Pac-Man mouth angle
  const mouthAngle = 35 * (Math.PI / 180);
  const startAngle = mouthAngle;
  const endAngle = Math.PI * 2 - mouthAngle;

  // Calculate arc path
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  // Eye position
  const eyeX = cx + r * 0.25;
  const eyeY = cy - r * 0.45;
  const eyeR = r * 0.12;

  // Cursor position (being chomped)
  const cursorX = cx + r * 0.95;
  const cursorW = Math.max(2, s * 0.04);
  const cursorH = r * 0.5;
  const cursorY = cy - cursorH / 2;

  // Dots
  const dotR = Math.max(1.5, s * 0.025);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" rx="${s * 0.2}" fill="#0a0a0f"/>
    <path d="M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2} L ${cx} ${cy} Z" fill="#00FF88"/>
    <circle cx="${eyeX}" cy="${eyeY}" r="${eyeR}" fill="#0a0a0f"/>
    <rect x="${cursorX}" y="${cursorY}" width="${cursorW}" height="${cursorH}" rx="1" fill="#00FF88" opacity="0.5"/>
    <circle cx="${cx + r * 1.25}" cy="${cy}" r="${dotR}" fill="#00FF88" opacity="0.3"/>
    <circle cx="${cx + r * 1.5}" cy="${cy}" r="${dotR * 0.7}" fill="#00FF88" opacity="0.2"/>
  </svg>`;
}

async function generate() {
  // Favicon 32x32
  const favicon32 = createLogoSvg(32);
  await sharp(Buffer.from(favicon32)).png().toFile(join(publicDir, "favicon-32x32.png"));
  console.log("Generated favicon-32x32.png");

  // Favicon 16x16
  const favicon16 = createLogoSvg(16);
  await sharp(Buffer.from(favicon16)).png().toFile(join(publicDir, "favicon-16x16.png"));
  console.log("Generated favicon-16x16.png");

  // Apple touch icon 180x180
  const apple = createLogoSvg(180);
  await sharp(Buffer.from(apple)).png().toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // Android icon 192x192
  const android192 = createLogoSvg(192);
  await sharp(Buffer.from(android192)).png().toFile(join(publicDir, "icon-192.png"));
  console.log("Generated icon-192.png");

  // Large icon 512x512
  const large = createLogoSvg(512);
  await sharp(Buffer.from(large)).png().toFile(join(publicDir, "icon-512.png"));
  console.log("Generated icon-512.png");

  // Favicon.ico (from 32x32)
  await sharp(Buffer.from(favicon32)).png().toFile(join(publicDir, "favicon.png"));
  console.log("Generated favicon.png");

  // OG image 1200x630
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0a0a0f"/>

    <!-- Grid -->
    ${Array.from({ length: 30 }).map((_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="630" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`).join("")}
    ${Array.from({ length: 16 }).map((_, i) => `<line x1="0" y1="${i * 40}" x2="1200" y2="${i * 40}" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`).join("")}

    <!-- Pac-Man logo -->
    <g transform="translate(120, 200)">
      <path d="M 80 0 A 60 60 0 1 0 80 -2 L 0 0 Z" fill="#00FF88" transform="rotate(35, 0, 0)"/>
      <circle cx="15" cy="-30" r="7" fill="#0a0a0f"/>
    </g>

    <!-- Dots trail -->
    <circle cx="250" cy="240" r="6" fill="#00FF88" opacity="0.4"/>
    <circle cx="290" cy="240" r="6" fill="#00FF88" opacity="0.3"/>
    <circle cx="330" cy="240" r="6" fill="#00FF88" opacity="0.2"/>

    <!-- Title -->
    <text x="400" y="220" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#e4e4e7">
      We handle the
    </text>
    <text x="400" y="295" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#00FF88">
      boring stuff.
    </text>
    <text x="400" y="370" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#e4e4e7">
      You change the world.
    </text>

    <!-- Subtitle -->
    <text x="400" y="430" font-family="system-ui, sans-serif" font-size="22" fill="#71717a">
      The framework for building agentic platforms.
    </text>

    <!-- URL -->
    <text x="400" y="560" font-family="monospace" font-size="20" fill="#00FF88" opacity="0.6">
      boringos.dev
    </text>
  </svg>`;

  await sharp(Buffer.from(ogSvg)).png().toFile(join(publicDir, "og-image.png"));
  console.log("Generated og-image.png");

  // Clean logo SVG for public
  const cleanLogo = createLogoSvg(120);
  writeFileSync(join(publicDir, "logo.svg"), cleanLogo);
  console.log("Updated logo.svg");

  console.log("\nAll icons generated!");
}

generate().catch(console.error);
