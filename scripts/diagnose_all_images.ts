import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  
  for (const page of pages) {
    let sections: any = page.sections;
    if (typeof sections === 'string') {
      try { sections = JSON.parse(sections); } catch (e) {}
    }
    if (!Array.isArray(sections)) continue;

    const issues: string[] = [];

    sections.forEach((s: any) => {
      function check(obj: any, p = '') {
        if (!obj) return;
        if (typeof obj === 'string') {
          if (obj.match(/\.(png|jpg|jpeg|webp|avif|svg)$/i) || obj.startsWith('/uploads/') || obj.startsWith('/assets/') || obj.includes('wp-content')) {
            if (obj.startsWith('/') || obj.startsWith('./')) {
              const localPath = path.join(process.cwd(), 'public', obj.replace(/^\//, ''));
              if (!fs.existsSync(localPath)) {
                issues.push(`[${s.id}] Missing local file: "${obj}" at ${p}`);
              }
            } else if (obj.startsWith('http')) {
              issues.push(`[${s.id}] Remote URL (which may 404): "${obj}" at ${p}`);
            }
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((it, i) => check(it, `${p}[${i}]`));
        } else if (typeof obj === 'object') {
          for (const k of Object.keys(obj)) check(obj[k], p ? `${p}.${k}` : k);
        }
      }
      check(s.data);
    });

    if (issues.length > 0) {
      console.log(`\nPage: ${page.slug} (${page.title}) -> ${issues.length} problematic images:`);
      issues.slice(0, 10).forEach(iss => console.log('  ', iss));
      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more`);
      }
    }
  }

  // Also check settings
  const settings = await prisma.setting.findMany();
  for (const s of settings) {
    try {
      const val = JSON.parse(s.value);
      function checkVal(obj: any, p = '') {
        if (!obj) return;
        if (typeof obj === 'string') {
          if (obj.match(/\.(png|jpg|jpeg|webp|avif|svg)$/i) || obj.startsWith('/uploads/') || obj.startsWith('/assets/') || obj.includes('wp-content')) {
            if (obj.startsWith('/') || obj.startsWith('./')) {
              const localPath = path.join(process.cwd(), 'public', obj.replace(/^\//, ''));
              if (!fs.existsSync(localPath)) console.log(`Setting [${s.key}]: missing file ${obj}`);
            } else if (obj.startsWith('http')) {
              console.log(`Setting [${s.key}]: remote URL ${obj}`);
            }
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((it, i) => checkVal(it, `${p}[${i}]`));
        } else if (typeof obj === 'object') {
          for (const k of Object.keys(obj)) checkVal(obj[k], p ? `${p}.${k}` : k);
        }
      }
      checkVal(val);
    } catch (e) {}
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
