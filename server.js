/**
 * Custom production server for Convocation website.
 *
 * WHY THIS EXISTS:
 * Next.js caches the public/ directory at startup in production mode.
 * Images uploaded via the CMS to public/uploads/ after the server starts
 * would return 404 until PM2 is restarted.
 *
 * This server intercepts /uploads/ requests and reads files directly from
 * disk in real-time, bypassing the Next.js static cache with path traversal security.
 */

const next = require('next')
const http = require('http')
const path = require('path')
const fs = require('fs')
const url = require('url')

const app = next({ dev: false })
const handle = app.getRequestHandler()

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.pdf']

app.prepare().then(() => {
  const uploadsDir = path.resolve(__dirname, 'public', 'uploads')

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url)
    const pathname = parsedUrl.pathname || ''

    // Intercept /uploads/ requests and serve from disk directly
    if (pathname.startsWith('/uploads/')) {
      const rawFilename = pathname.slice('/uploads/'.length)
      const safeFilename = path.basename(rawFilename)
      const filePath = path.resolve(uploadsDir, safeFilename)

      // Path traversal security: ensure filePath stays strictly inside uploadsDir
      if (!filePath.startsWith(uploadsDir)) {
        res.statusCode = 403
        return res.end('Forbidden')
      }

      const ext = path.extname(filePath).toLowerCase()

      // Security: Only allow known image/document extensions
      if (!allowedExtensions.includes(ext)) {
        res.statusCode = 403
        return res.end('Forbidden')
      }

      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.statusCode = 404
          return res.end('Not found')
        }

        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
        }

        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        res.setHeader('X-Content-Type-Options', 'nosniff')

        if (ext === '.svg') {
          res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'")
        }

        fs.createReadStream(filePath).pipe(res)
      })
      return
    }

    // All other requests go to Next.js
    handle(req, res, parsedUrl)
  })

  // IMPORTANT: Always use process.env.PORT — Webuzo sets this externally
  const port = process.env.PORT || 5000
  server.listen(port, () => {
    console.log(`> Convocation production server ready on port ${port}`)
  })
})
