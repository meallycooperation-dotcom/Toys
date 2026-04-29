import { useEffect } from "react"

type SeoProps = {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://toys-tau.vercel.app"
const SITE_NAME = "Toys"

function upsertMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector)

  if (existing) {
    existing.setAttribute("content", content)
    return
  }

  const meta = document.createElement("meta")
  meta.setAttribute(attribute, value)
  meta.setAttribute("content", content)
  document.head.appendChild(meta)
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']")
  if (!link) {
    link = document.createElement("link")
    link.rel = "canonical"
    document.head.appendChild(link)
  }
  link.href = href
}

export default function Seo({ title, description, path = "/", noIndex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    const fullUrl = new URL(path, SITE_URL).toString()
    const robots = noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"

    document.title = fullTitle
    upsertMeta('meta[name="description"]', "name", "description", description)
    upsertMeta('meta[name="robots"]', "name", "robots", robots)
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle)
    upsertMeta('meta[property="og:description"]', "property", "og:description", description)
    upsertMeta('meta[property="og:url"]', "property", "og:url", fullUrl)
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website")
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image")
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle)
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description)
    upsertCanonical(fullUrl)
  }, [description, noIndex, path, title])

  return null
}
