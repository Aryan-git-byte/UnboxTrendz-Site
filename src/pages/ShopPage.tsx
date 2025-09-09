import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, Grid, List, ShoppingBag, Star, Plus, Share2, Check } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

const categories = ['Toys', 'Gifts', 'Kitchen & Home decor', 'Jewellery', 'Gadgets', 'Stationery'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [showAddToCartSuccessId, setShowAddToCartSuccessId] = useState<string | null>(null);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Dynamic meta description based on selected category
  const getMetaDescription = () => {
    if (selectedCategory) {
      return `Shop premium ${selectedCategory.toLowerCase()} online at UnboxTrendz. Discover amazing ${selectedCategory.toLowerCase()} with fast shipping across India. Best prices guaranteed!`;
    }
    return "Browse our complete collection of toys, gifts, home decor, jewellery, gadgets, and stationery. Find the perfect trendy products at UnboxTrendz with fast India-wide delivery.";
  };

  const getPageTitle = () => {
    if (selectedCategory) {
      return `${selectedCategory} Online - Premium Collection | UnboxTrendz`;
    }
    return "Shop All Products - Toys, Gifts, Decor & More | UnboxTrendz";
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    const category = searchParams.get('category');
    const productId = searchParams.get('product_id');
    if (category) {
      setSelectedCategory(category);
    }
    if (productId) {
      setTargetProductId(productId);
    }
  }, [searchParams]);

  // Scroll to and highlight specific product when products are loaded
  useEffect(() => {
    if (products.length > 0 && targetProductId && !loading) {
      const targetProduct = products.find(product => product.id === targetProductId);
      
      if (targetProduct) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          const element = document.getElementById(`product-${targetProductId}`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Highlight the product
            setHighlightedProductId(targetProductId);
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
              setHighlightedProductId(null);
            }, 3000);
          }
        }, 100);
      }
      
      // Clear the target product ID after processing
      setTargetProductId(null);
    }
  }, [products, targetProductId, loading]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('visible', true);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
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
    const productUrl = `${window.location.origin}/shop?product_id=${product.id}`;
    
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <meta name="keywords" content={selectedCategory ? `${selectedCategory.toLowerCase()} online, buy ${selectedCategory.toLowerCase()} India, ${selectedCategory.toLowerCase()} shopping` : "toys online, gifts India, home decor, jewellery online, gadgets store, stationery shopping"} />
        <link rel="canonical" href={selectedCategory ? `https://unboxtrendz.in/shop?category=${encodeURIComponent(selectedCategory)}` : "https://unboxtrendz.in/shop"} />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {selectedCategory ? `${selectedCategory} Collection` : 'Shop All Products - Complete Collection'}
        </h1>
        <p className="text-gray-600">
          {selectedCategory 
            ? `Discover our premium ${selectedCategory.toLowerCase()} collection with fast shipping across India`
            : 'Discover our amazing collection of trending products across all categories'
          }
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg mb-4"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Filter Panel */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={() => handleCategoryChange('')}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className={`bg-gray-200 ${viewMode === 'grid' ? 'h-64' : 'h-32'}`}></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <div 
                  key={product.id} 
                  id={`product-${product.id}`}
                  className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${viewMode === 'list' ? 'flex' : ''} ${
                    highlightedProductId === product.id 
                      ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl transform scale-105' 
                      : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-64' : 'w-32 h-32 flex-shrink-0'}`}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    {highlightedProductId === product.id && (
                      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                        <p className="text-blue-700 text-sm font-medium">📍 Shared Product</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-medium">{product.category}</span>
                      <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex space-x-2 relative">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleShareProduct(product)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">
                {selectedCategory 
                  ? `No products available in the ${selectedCategory} category.`
                  : 'No products available at the moment.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}