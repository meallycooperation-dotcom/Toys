import { useEffect, useState } from "react"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { supabase, type Product, type ProductImage } from "../lib/supabase"
import ProductCard from "../components/ProductCard"

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const descriptionLimit = 180

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)

        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single()

        if (productError) throw productError
        setProduct(productData)

        const { data: imagesData, error: imagesError } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", id)
          .order("position", { ascending: true })

        if (imagesError) throw imagesError

        setImages(imagesData || [])
        if (imagesData && imagesData.length > 0) {
          setSelectedImage(imagesData[0])
        }

        if (productData?.category) {
          const { data: relatedData, error: relatedError } = await supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .eq("category", productData.category)
            .neq("id", productData.id)
            .order("created_at", { ascending: false })
            .limit(4)

          if (relatedError) throw relatedError
          setRelatedProducts(relatedData || [])
        } else {
          setRelatedProducts([])
        }
      } catch (err: any) {
        console.error("Error fetching product:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductDetails()
    }
  }, [id])

  if (loading) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[rgba(212,175,55,0.35)] border-t-[#be123c]" />
          <p className="lux-subtitle mt-4">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <p className="text-red-600 mb-4">Error loading product</p>
          <button onClick={() => navigate(`/${location.search}`)} className="lux-primary rounded-full px-4 py-2">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-frame px-4 py-4">
      <div className="lux-header sticky top-0 z-20 rounded-2xl px-4 py-3">
        <button
          onClick={() => navigate(`/${location.search}`)}
          className="flex items-center gap-2 text-[color:var(--text-primary)] transition hover:text-[#d4af37]"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-5xl">
        <div className="lux-card-elevated grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
              <img
                src={selectedImage?.image_url || product.image_url || "https://via.placeholder.com/400"}
                alt={product.name}
                className="h-96 w-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                      selectedImage?.id === image.id
                        ? "border-[#d4af37]"
                        : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(212,175,55,0.35)]"
                    }`}
                  >
                    <img src={image.image_url} alt="Product thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="lux-chip lux-chip-accent w-fit">Featured</p>
              <h1 className="lux-title mt-3 text-3xl sm:text-5xl">{product.name}</h1>
            </div>

            <div className="space-y-2">
              <p className="lux-subtitle text-sm">Price</p>
              <p className="text-4xl font-bold text-[color:var(--text-primary)]">
                {product.currency} {product.price}
              </p>
            </div>

            <div className="space-y-2">
              <p className="lux-subtitle text-sm">Availability</p>
              {product.stock > 0 ? (
                <p className="lux-badge lux-badge-gold w-fit">In Stock ({product.stock} available)</p>
              ) : (
                <p className="lux-badge lux-badge-red w-fit">Out of Stock</p>
              )}
            </div>

            {product.description && (
              <div className="space-y-2">
                <p className="lux-subtitle text-sm">Description</p>
                <p className="leading-relaxed text-[color:var(--text-primary)]/90">
                  {showFullDescription || product.description.length <= descriptionLimit
                    ? product.description
                    : `${product.description.slice(0, descriptionLimit).trimEnd()}...`}
                </p>

                {product.description.length > descriptionLimit && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription((value) => !value)}
                    className="text-sm font-semibold text-[#d4af37] hover:underline"
                  >
                    {showFullDescription ? "See less" : "See more"}
                  </button>
                )}
              </div>
            )}

            {product.stock > 0 && (
              <div className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="lux-subtitle text-sm">Quantity:</span>
                  <div className="flex items-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.12)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 transition hover:bg-[rgba(255,255,255,0.08)]"
                    >
                      -
                    </button>
                    <span className="border-x border-[rgba(255,255,255,0.12)] px-4 py-2">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 transition hover:bg-[rgba(255,255,255,0.08)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart({
                      product_id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity,
                      image_url: product.image_url || "",
                      stock: product.stock,
                    })
                    setAddedToCart(true)
                    setTimeout(() => setAddedToCart(false), 2000)
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${
                    addedToCart ? "bg-green-600 text-white" : "lux-primary"
                  }`}
                >
                  <ShoppingCart size={20} />
                  {addedToCart ? "Added to Cart!" : "Add to Cart"}
                </button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="lux-chip lux-chip-accent w-fit">Related products</p>
                <h2 className="lux-title mt-3 text-3xl">More like this</h2>
              </div>
              <p className="lux-subtitle hidden sm:block">
                Same category, same mood, similar energy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
