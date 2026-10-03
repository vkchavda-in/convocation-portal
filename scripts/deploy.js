const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== Convocation Production Deployment Pipeline ===");

// 1. Verify environment configuration file
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env configuration file not found at the root!");
  console.error("Please create a .env file containing your database and production keys before deploying.");
  process.exit(1);
}

// Read and parse env file to check DATABASE_URL
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL')) {
  console.error("Error: DATABASE_URL is not defined in your .env file!");
  process.exit(1);
}

// 2. Generate Prisma Client
console.log("\nGenerating Prisma Client...");
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error("Failed to generate Prisma Client:", error.message);
  process.exit(1);
}

// 3. Run migrations
console.log("\nApplying database migrations...");
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (error) {
  console.error("Failed to apply database migrations:", error.message);
  process.exit(1);
}

// 4. Smart Seeding Check (checks database contents before executing seeds to prevent wiping out data)
console.log("\nChecking database seeding status...");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runDeployment() {
  try {
    const pageCount = await prisma.page.count();
    
    if (pageCount === 0) {
      console.log("Database is empty. Seeding initial Convocation page contents...");
      try {
        execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
      } catch (error) {
        console.error("Database seed failed:", error.message);
        process.exit(1);
      }
    } else {
      console.log(`Database already contains ${pageCount} pages. Skipping seed script to prevent data loss.`);
    }
  } catch (err) {
    console.warn("Could not query database for page count, attempting database seed directly:", err.message);
    try {
      execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
    } catch (error) {
      console.error("Database seed failed:", error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }

  // 5. Next.js Build
  console.log("\nCompiling Next.js production build...");
  try {
    execSync('pnpm build', { stdio: 'inherit' });
  } catch (error) {
    console.error("Production build failed:", error.message);
    process.exit(1);
  }

  // 6. PM2 Process Initialization or Reload
  console.log("\nManaging PM2 process lifecycle...");
  
  // Extract custom PORT from .env if it exists
  let port = '30004';
  const portMatch = envContent.match(/^PORT\s*=\s*["']?(\d+)["']?/m);
  if (portMatch && portMatch[1]) {
    port = portMatch[1];
  }
  
  try {
    // Check if am-guni process exists in PM2
    const pm2List = execSync('pm2 jlist').toString();
    const processes = JSON.parse(pm2List);
    const appExists = processes.some(p => p.name === 'am-guni');

    if (appExists) {
      console.log("PM2 process 'am-guni' is already registered. Reloading with updated environments...");
      execSync('pm2 restart am-guni --update-env', { stdio: 'inherit' });
    } else {
      console.log(`Registering and starting new PM2 process 'am-guni' on port ${port}...`);
      execSync(`PORT=${port} pm2 start server.js --name "am-guni"`, { stdio: 'inherit' });
    }
    
    // Save PM2 state to persist on reboots
    console.log("Saving PM2 process list...");
    execSync('pm2 save', { stdio: 'inherit' });
    
    console.log("\n=== Deployment Completed Successfully! ===");
  } catch (error) {
    console.error("PM2 lifecycle action failed:", error.message);
    console.log("Please make sure PM2 is installed globally: npm install -g pm2");
    process.exit(1);
  }
}

runDeployment();
