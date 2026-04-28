import { Search, User } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProducts } from "../hooks/useProducts"
import ProductCard from "../components/ProductCard"

export default function Home() {
  const navigate = useNavigate()
  const { products, loading, error } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return products
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? ''
      const description = product.description?.toLowerCase() ?? ''
      return name.includes(query) || description.includes(query)
    })
  }, [products, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔝 NAVBAR */}
      <div className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between gap-4">

        {/* Category */}
        <h1 className="text-lg font-semibold whitespace-nowrap">
          Toys
        </h1>

        {/* 🔍 Search */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full max-w-md">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or description..."
            className="bg-transparent outline-none px-2 w-full text-sm"
          />
        </div>

        {/* 🧑 Filters */}
        <div className="hidden sm:flex items-center gap-2">
          <button className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200 transition">
            Male
          </button>
          <button className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200 transition">
            Female
          </button>
        </div>

        {/* 👤 Profile */}
        <div
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
          onClick={() => navigate('/profile')}
        >
          <User size={20} />
        </div>
      </div>

      {/* 🛍️ PRODUCTS */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  )
}