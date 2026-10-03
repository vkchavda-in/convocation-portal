import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const prisma = new PrismaClient();

async function testUrl(urlStr: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (urlStr.startsWith('/') || urlStr.startsWith('./')) {
    const filePath = path.join(process.cwd(), 'public', urlStr.replace(/^\//, ''));
    const exists = fs.existsSync(filePath);
    return { ok: exists, error: exists ? undefined : 'Local file missing' };
  }
  
  return new Promise((resolve) => {
    try {
      const client = urlStr.startsWith('https') ? https : http;
      const req = client.request(urlStr, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      req.end();
    } catch (e: any) {
      resolve({ ok: false, error: e.message });
    }
  });
}

async function main() {
  const pages = await prisma.page.findMany();
  console.log('Testing all image URLs across all pages...');
  
  const allImageUrls = new Set<string>();
  
  function extractUrls(obj: any) {
    if (!obj) return;
    if (typeof obj === 'string') {
      if (obj.match(/\.(png|jpg|jpeg|webp|avif|svg)$/i) || obj.startsWith('/uploads/') || obj.startsWith('/assets/images/') || obj.includes('wp-content/uploads')) {
        allImageUrls.add(obj);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(extractUrls);
    } else if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) extractUrls(obj[k]);
    }
  }

  for (const p of pages) {
    extractUrls(p.sections);
  }

  const settings = await prisma.setting.findMany();
  for (const s of settings) {
    extractUrls(s.value);
  }

  console.log(`Total unique image URLs found: ${allImageUrls.size}`);
  for (const u of allImageUrls) {
    const res = await testUrl(u);
    console.log(`[${res.ok ? 'OK' : 'FAIL ❌'}] ${u} (Status: ${res.status || res.error || 'N/A'})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
