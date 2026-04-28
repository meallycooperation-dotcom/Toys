import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase, type Product, type ProductImage } from '../lib/supabase'
import { ChevronLeft, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (productError) throw productError

        setProduct(productData)

        // Fetch product images
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('position', { ascending: true })

        if (imagesError) throw imagesError

        setImages(imagesData || [])
        if (imagesData && imagesData.length > 0) {
          setSelectedImage(imagesData[0])
        }

      } catch (err: any) {
        console.error('Error fetching product:', err)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading product</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm p-6">

          {/* 🖼️ Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage?.image_url || product.image_url || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage?.id === image.id
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt="Product thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📋 Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Price</p>
              <p className="text-4xl font-bold text-gray-900">
                {product.currency} {product.price}
              </p>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Availability</p>
              {product.stock > 0 ? (
                <p className="text-green-600 font-medium">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Description</p>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-l border-r">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
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
                      quantity: quantity,
                      image_url: product.image_url || '',
                      stock: product.stock,
                    })
                    setAddedToCart(true)
                    setTimeout(() => setAddedToCart(false), 2000)
                  }}
                  className={`w-full py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold ${
                    addedToCart
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
