const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Resolve output path to Desktop. Check standard paths and parent directory (useful if workspace is on Desktop)
const parentDir = path.dirname(process.cwd());
const isParentDesktop = path.basename(parentDir).toLowerCase() === 'desktop';
const desktopPath = path.join(os.homedir(), 'Desktop');

const zipPath = isParentDesktop
  ? path.join(parentDir, 'am_guni_deploy.zip')
  : (fs.existsSync(desktopPath) ? path.join(desktopPath, 'am_guni_deploy.zip') : path.join(process.cwd(), 'am_guni_deploy.zip'));

console.log(`Packaging project files to: ${zipPath}...`);

const pythonScript = `
import zipfile
import os

zip_path = r"${zipPath.replace(/\\/g, '\\\\')}"
src_dir = os.getcwd()

# Folders and files to include
include_folders = ['src', 'public', 'prisma', 'scripts']
include_files = [
    'package.json', 
    'pnpm-lock.yaml', 
    'pnpm-workspace.yaml',
    '.gitignore',
    '.env.production-template',
    'server.js', 
    'next.config.mjs', 
    'tsconfig.json', 
    'postcss.config.mjs', 
    'README.md', 
    'project_report.md'
]

# Exclusions to ignore during compression
exclude_extensions = ['.db', '.log', '.zip', '.local', '.sqlite']
exclude_dirs = {'node_modules', '.next', '.git', 'backups', 'scratch'}

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zout:
    # Add root files
    for f in include_files:
        p = os.path.join(src_dir, f)
        if os.path.exists(p):
            zout.write(p, f)
            
    # Add folders recursively
    for folder in include_folders:
        for root, dirs, files in os.walk(os.path.join(src_dir, folder)):
            # Filter out excluded directories in-place to prevent os.walk from entering them
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in exclude_extensions or file.startswith('.env'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, src_dir)
                zout.write(full_path, rel_path)

print("ZIP archive created successfully!")
`;

const tempPyFile = path.join(process.cwd(), 'temp_pack.py');
fs.writeFileSync(tempPyFile, pythonScript);

let success = false;
const pythonCmds = ['python', 'python3', 'py'];

for (const cmd of pythonCmds) {
  try {
    execSync(`${cmd} temp_pack.py`, { stdio: 'inherit' });
    success = true;
    break;
  } catch (error) {
    // Silence errors and try the next command in the list
  }
}

if (!success) {
  console.error("Failed to generate ZIP archive. Please ensure Python is installed and in your PATH (tried python, python3, py).");
  if (fs.existsSync(tempPyFile)) {
    fs.unlinkSync(tempPyFile);
  }
  process.exit(1);
} else {
  if (fs.existsSync(tempPyFile)) {
    fs.unlinkSync(tempPyFile);
  }
}

