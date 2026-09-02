import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const jobs = [
  // Hero / full-bleed renders
  { src: "temp/Renders/Grand Entrance.jpg", out: "public/images/hero-grand-entrance.webp", width: 1920 },
  { src: "temp/Renders/Commercial Road Entrance 05 View F.jpg", out: "public/images/road-entrance.webp", width: 1920 },
  { src: "temp/Renders/Commercial Elevation 2.jpg", out: "public/images/elevation-2.webp", width: 1920 },
  { src: "temp/Renders/Commercial Elevation.png", out: "public/images/elevation.webp", width: 1920 },
  { src: "temp/Renders/Retail Spaces.jpg", out: "public/images/retail-spaces.webp", width: 1600 },
  { src: "temp/Renders/Boutique Spaces.jpg", out: "public/images/boutique-spaces.webp", width: 1600 },
  // Creatives / office space photos
  { src: "temp/Creatives/Office Spaces1.jpg", out: "public/images/office-1.webp", width: 1200 },
  { src: "temp/Creatives/Office Spaces2.jpg", out: "public/images/office-2.webp", width: 1200 },
  { src: "temp/Creatives/Office Spaces3.jpg", out: "public/images/office-3.webp", width: 1200 },
  { src: "temp/Creatives/Office Spaces4.jpg", out: "public/images/office-4.webp", width: 1200 },
  { src: "temp/Creatives/Office Spaces5.jpg", out: "public/images/office-5.webp", width: 1200 },
  { src: "temp/Creatives/Office Space 70_30.jpeg", out: "public/images/payment-plan.webp", width: 1200 },
  { src: "temp/Creatives/Codename Tangent RERA received.jpeg", out: "public/images/rera-received.webp", width: 1200 },
];

for (const job of jobs) {
  const srcPath = path.join(root, job.src);
  const outPath = path.join(root, job.out);
  await mkdir(path.dirname(outPath), { recursive: true });
  try {
    await sharp(srcPath)
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(outPath);
    console.log(`ok   ${job.src} -> ${job.out}`);
  } catch (err) {
    console.error(`FAIL ${job.src}: ${err.message}`);
  }
}
