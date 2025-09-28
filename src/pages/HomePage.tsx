import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Star, ShoppingBag, Plus, Share2, Check, Eye } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

const categories = [
  { name: 'Gifts', color: 'bg-pink-500', image: '/src/assets/gifts.png', isHero: true },
  { name: 'Toys', color: 'bg-red-500', image: '/src/assets/toys.png' },
  { name: 'Kitchen & Home decor', color: 'bg-orange-500', image: '/src/assets/kitchen-home-decor.png' },
  { name: 'Jewellery', color: 'bg-purple-500', image: '/src/assets/jewellery.png' },
  { name: 'Jhumka', color: 'bg-pink-600', image: '/src/assets/jhumka.png' },
  { name: 'Hair accessories', color: 'bg-indigo-500', image: '/src/assets/hair-accessories.png' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [showAddToCartSuccessId, setShowAddToCartSuccessId] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Structured data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UnboxTrendz",
    "description": "Discover amazing products across toys, gifts, home decor, jewellery, gadgets, and stationery",
    "url": "https://unboxtrendz.in",
    "logo": "https://unboxtrendz.in/logo.png",
    "sameAs": [
      "https://www.facebook.com/unboxtrendz",
      "https://www.instagram.com/unboxtrendz"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "UnboxTrendz",
    "description": "Online store for toys, gifts, home decor, jewellery, gadgets, and stationery",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "areaServed": "India",
    "priceRange": "₹₹"
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = (product: Product) => {
    const message = `Hi! I'm interested in ordering:\n\n*${product.name}*\nCategory: ${product.category}\nPrice: ₹${product.price}\n\nPlease let me know about availability and delivery details.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setShowAddToCartSuccessId(product.id);
    setTimeout(() => setShowAddToCartSuccessId(null), 1000);
  };

  const handleShareProduct = async (product: Product) => {
    const productUrl = `${window.location.origin}/shop/${product.id}`;
    
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedProductId(product.id);
      setTimeout(() => setCopiedProductId(null), 1000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedProductId(product.id);
      setTimeout(() => setCopiedProductId(null), 1000);
    }
  };

  return (
    <div>
      <Helmet>
        <title>UnboxTrendz - Buy Toys, Gifts, Home Decor, Jewellery & Gadgets Online</title>
        <meta name="description" content="Shop amazing toys, gifts, home decor, jewellery, gadgets, and stationery at UnboxTrendz. Discover trendy products with fast shipping across India. Unbox your trend today!" />
        <meta name="keywords" content="toys online India, gifts online shopping, home decor items online, online jewellery store, gadgets online India, stationery online shopping" />
        <link rel="canonical" href="https://unboxtrendz.in/" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      {/* Hero Categories Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Shop by Category</h1>
            <p className="text-gray-600">Explore our diverse range of trending products across India's favorite categories</p>
          </div>
          
          {/* Hero Category - Gifts */}
          {categories.filter(category => category.isHero).map((heroCategory) => (
            <div key={heroCategory.name} className="mb-12">
              <Link
                to={`/shop?category=${encodeURIComponent(heroCategory.name)}`}
                className="group block"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-50"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                      <img
                        src={heroCategory.image}
                        alt={heroCategory.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5JbWFnZTwvdGV4dD4KPHRleHQgeD0iNjQiIHk9Ijg2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-pink-600 transition-colors">
                      {heroCategory.name}
                    </h2>
                    <p className="text-gray-600 mb-6">Discover amazing {heroCategory.name.toLowerCase()} for every occasion</p>
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Shop {heroCategory.name}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          {/* Other Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              !category.isHero && (
                <Link
                  key={category.name}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5JbWFnZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600">Check out our latest and most popular items</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <Link 
                    to={`/shop/${product.id}`}
                    className="relative overflow-hidden block"
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer">
                        <ShoppingBag className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    
                    {/* Multiple images indicator */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-medium">{product.category}</span>
                      <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                    </div>
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex space-x-2 relative">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </button>
                        
                        <Link
                          to={`/shop/${product.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                          title="View product details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleShareProduct(product)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                          title="Share product"
                        >
                          {copiedProductId === product.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </button>
                        
                        {/* Success Messages */}
                        {showAddToCartSuccessId === product.id && (
                          <div className="absolute -top-10 left-0 bg-green-600 text-white text-xs px-3 py-1 rounded-lg shadow-lg z-10 animate-pulse">
                            Product added successfully!
                          </div>
                        )}
                        
                        {copiedProductId === product.id && (
                          <div className="absolute -top-10 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg shadow-lg z-10 animate-pulse">
                            Link copied!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured products available at the moment.</p>
            </div>
          )}

          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
