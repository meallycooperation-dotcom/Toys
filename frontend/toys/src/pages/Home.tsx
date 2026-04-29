import { Search, ShoppingCart, User } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { useCart } from "../context/CartContext"
import { useProducts } from "../hooks/useProducts"

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()
  const { products, loading, error } = useProducts()
  const { totalItems } = useCart()
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get("q") || "")
  const [activeCategory, setActiveCategory] = useState<"all" | "male" | "female">(
    () => (new URLSearchParams(location.search).get("category") as "male" | "female" | null) || "all"
  )
  const [activeLevel, setActiveLevel] = useState<"all" | "intense" | "luxurious" | "playful">(
    () => (new URLSearchParams(location.search).get("level") as "intense" | "luxurious" | "playful" | null) || "all"
  )

  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim())
    }

    if (activeCategory !== "all") {
      params.set("category", activeCategory)
    }

    if (activeLevel !== "all") {
      params.set("level", activeLevel)
    }

    setSearchParams(params, { replace: true })
  }, [searchTerm, activeCategory, activeLevel, setSearchParams])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? ""
      const description = product.description?.toLowerCase() ?? ""
      const matchesSearch = !query || name.includes(query) || description.includes(query)
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory
      const matchesLevel = activeLevel === "all" || product.level === activeLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [products, searchTerm, activeCategory, activeLevel])

  if (loading) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[rgba(212,175,55,0.35)] border-t-[#be123c]" />
          <p className="lux-subtitle mt-4">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <button onClick={() => window.location.reload()} className="lux-primary rounded-full px-4 py-2">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-frame">
      <div className="lux-header sticky top-0 z-30 px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="lux-title text-4xl sm:text-5xl">Toys</h1>
            <p className="lux-subtitle max-w-2xl text-sm sm:text-base">
              Deep passion, erotic, and warm light for a richer shopping mood.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="lux-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3 lg:w-full lg:max-w-3xl">
              <Search size={18} className="text-[color:var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or description..."
                className="w-full bg-transparent outline-none text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`lux-chip ${activeCategory === "male" ? "lux-chip-accent" : ""}`}
                onClick={() => setActiveCategory("male")}
                type="button"
              >
                Male
              </button>
              <button
                className={`lux-chip ${activeCategory === "female" ? "lux-chip-accent" : ""}`}
                onClick={() => setActiveCategory("female")}
                type="button"
              >
                Female
              </button>
              <button
                className={`lux-chip ${activeCategory === "all" ? "lux-chip-accent" : ""}`}
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                All
              </button>
              <button
                className="lux-icon-button"
                onClick={() => navigate("/cart")}
                aria-label="View cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-[#be123c] px-1 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                className="lux-icon-button"
                onClick={() => navigate("/profile")}
                aria-label="View profile"
              >
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="lux-card-elevated relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle,rgba(212,175,55,0.2),transparent_65%)] blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="lux-chip lux-chip-accent w-fit">Curated selection</p>
              <h2 className="lux-title mt-3 text-3xl sm:text-4xl">
                Passion in bed. Confidence in sofa. Finish in floor.
              </h2>
              <p className="lux-subtitle mt-3 text-sm sm:text-base">
                Choose your sensual level
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveLevel("intense")}
                className={`lux-badge ${activeLevel === "intense" ? "lux-badge-red" : ""}`}
              >
                Intense
              </button>
              <button
                type="button"
                onClick={() => setActiveLevel("luxurious")}
                className={`lux-badge ${activeLevel === "luxurious" ? "lux-badge-gold" : ""}`}
              >
                Luxurious
              </button>
              <button
                type="button"
                onClick={() => setActiveLevel("playful")}
                className={`lux-badge ${activeLevel === "playful" ? "lux-chip-accent" : ""}`}
              >
                Playful
              </button>
              <button
                type="button"
                onClick={() => setActiveLevel("all")}
                className={`lux-badge ${activeLevel === "all" ? "lux-chip-accent" : ""}`}
              >
                All Levels
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-10 pt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} queryString={location.search} />
          ))
        ) : (
          <div className="lux-card-elevated col-span-full p-8 text-center">
            <p className="text-lg font-semibold">No products match this filter.</p>
            <p className="lux-subtitle mt-2">Try switching the category or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
