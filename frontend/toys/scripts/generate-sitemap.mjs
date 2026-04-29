import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")
const publicDir = path.join(projectRoot, "public")
const envPath = path.join(projectRoot, ".env")

function parseEnvFile(contents) {
  const result = {}

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const equalsIndex = line.indexOf("=")
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex).trim()
    let value = line.slice(equalsIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

async function loadEnv() {
  const env = { ...process.env }

  try {
    const fileContents = await fs.readFile(envPath, "utf8")
    Object.assign(env, parseEnvFile(fileContents))
  } catch {
    // It's fine if the local env file is missing in CI or clean installs.
  }

  return env
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

async function fetchProducts(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseAnonKey = env.VITE_SUPABASE_ANNON_KEY || env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return []
  }

  const url = new URL("/rest/v1/products", supabaseUrl)
  url.searchParams.set("select", "id,updated_at,created_at")
  url.searchParams.set("is_active", "eq.true")

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Supabase product fetch failed (${response.status})`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

async function main() {
  const env = await loadEnv()
  const siteUrl = (env.VITE_SITE_URL || "https://toys-tau.vercel.app").replace(/\/+$/, "")
  const publicRoutes = [
    { loc: "/", lastmod: new Date().toISOString(), changefreq: "daily", priority: "1.0" },
  ]

  let productRoutes = []

  try {
    const products = await fetchProducts(env)
    productRoutes = products
      .filter((product) => product?.id)
      .map((product) => ({
        loc: `/product/${product.id}`,
        lastmod: formatDate(product.updated_at || product.created_at),
        changefreq: "weekly",
        priority: "0.8",
      }))
  } catch (error) {
    console.warn(`Sitemap product fetch skipped: ${error.message}`)
  }

  const urls = [...publicRoutes, ...productRoutes]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (entry) => `  <url>\n` +
          `    <loc>${escapeXml(`${siteUrl}${entry.loc}`)}</loc>\n` +
          `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n` +
          `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>\n` +
          `    <priority>${escapeXml(entry.priority)}</priority>\n` +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`

  const robots = `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /signup\nDisallow: /cart\nDisallow: /checkout\nDisallow: /profile\nDisallow: /orders\nSitemap: ${siteUrl}/sitemap.xml\n`

  await fs.mkdir(publicDir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8"),
    fs.writeFile(path.join(publicDir, "robots.txt"), robots, "utf8"),
  ])

  console.log(`Generated sitemap.xml and robots.txt with ${urls.length} URL(s).`)
}

main().catch((error) => {
  console.error("Failed to generate sitemap:", error)
  process.exitCode = 1
})
