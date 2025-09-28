import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid2x2 as Grid, List, ShoppingBag, Star, Plus, Share2, Check, Search, X, Eye } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

const categories = ['Toys', 'Gifts', 'Kitchen & Home decor', 'Jewellery', 'Jhumka', 'Earrings', 'Hair accessories'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'relevance', label: 'Most Relevant' },
];

// Fuzzy search utility functions
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  const n = str2.length;
  const m = str1.length;

  if (n === 0) return m;
  if (m === 0) return n;

  for (let i = 0; i <= n; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[n][m];
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  return (maxLength - levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())) / maxLength;
};

const getSearchRelevance = (product: Product, query: string): number => {
  const lowerQuery = query.toLowerCase();
  const lowerName = product.name.toLowerCase();
  const lowerDescription = product.description?.toLowerCase() || '';
  const lowerCategory = product.category.toLowerCase();

  // Exact matches get highest score
  if (lowerName.includes(lowerQuery)) return 100;
  if (lowerDescription.includes(lowerQuery)) return 80;
  if (lowerCategory.includes(lowerQuery)) return 70;

  // Fuzzy matching for typos
  const nameWords = lowerName.split(' ');
  const descWords = lowerDescription.split(' ');
  const queryWords = lowerQuery.split(' ');

  let maxScore = 0;

  // Check each query word against product words
  queryWords.forEach(qWord => {
    if (qWord.length < 2) return;

    // Check name words
    nameWords.forEach(nWord => {
      const similarity = calculateSimilarity(qWord, nWord);
      if (similarity > 0.7) {
        maxScore = Math.max(maxScore, similarity * 90);
      }
    });

    // Check description words
    descWords.forEach(dWord => {
      if (dWord.length > 2) {
        const similarity = calculateSimilarity(qWord, dWord);
        if (similarity > 0.7) {
          maxScore = Math.max(maxScore, similarity * 60);
        }
      }
    });

    // Check category similarity
    const catSimilarity = calculateSimilarity(qWord, lowerCategory);
    if (catSimilarity > 0.7) {
      maxScore = Math.max(maxScore, catSimilarity * 50);
    }
  });

  return maxScore;
};

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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products for search
  const { addToCart } = useCart();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    const productId = searchParams.get('product_id');
    const search = searchParams.get('search');
    
    if (category) {
      setSelectedCategory(category);
    }
    if (productId) {
      setTargetProductId(productId);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Scroll to and highlight specific product when products are loaded
  useEffect(() => {
    if (products.length > 0 && targetProductId && !loading) {
      const targetProduct = products.find(product => product.id === targetProductId);
      
      if (targetProduct) {
        setTimeout(() => {
          const element = document.getElementById(`product-${targetProductId}`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            setHighlightedProductId(targetProductId);
            
            setTimeout(() => {
              setHighlightedProductId(null);
            }, 3000);
          }
        }, 100);
      }
      
      setTargetProductId(null);
    }
  }, [products, targetProductId, loading]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      // Filter out variants - only show products where parent_product_id is null
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visible', true)
        .is('parent_product_id', null); // Only fetch parent products, not variants

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products based on search, category, and sort options
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter with fuzzy matching
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const searchResults = filtered
        .map(product => ({
          product,
          relevance: getSearchRelevance(product, query)
        }))
        .filter(result => result.relevance > 30) // Threshold for relevance
        .sort((a, b) => b.relevance - a.relevance)
        .map(result => result.product);
      
      filtered = searchResults;
    }

    // Apply sorting
    if (searchQuery.trim() && sortBy === 'relevance') {
      // Already sorted by relevance above
      return filtered;
    }

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    setProducts(filteredAndSortedProducts);
  }, [filteredAndSortedProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateSearchParams({ category: category || undefined });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateSearchParams({ search: query || undefined });
    
    // Auto-set sort to relevance when searching
    if (query.trim() && sortBy !== 'relevance') {
      setSortBy('relevance');
    }
  };

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    updateSearchParams({ search: undefined });
    setSortBy('newest');
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop</h1>
        <p className="text-gray-600">Discover our amazing collection of trending products</p>
      </div>

      {/* Smart Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products... "
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600 text-center">
              {products.length > 0 ? (
                <span>Found {products.length} result{products.length !== 1 ? 's' : ''} for "{searchQuery}"</span>
              ) : (
                <span className="text-orange-600">No close matches found for "{searchQuery}". Try different keywords.</span>
              )}
            </div>
          )}
        </div>
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
                  <Link 
                    to={`/shop/${product.id}`}
                    className={`relative overflow-hidden block ${viewMode === 'grid' ? '' : 'w-32 flex-shrink-0'}`}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className={`w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer ${viewMode === 'list' ? 'h-32' : ''}`}
                      />
                    ) : (
                      <div className={`w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer ${viewMode === 'list' ? 'h-32' : 'h-64'}`}>
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    </div>
                    
                    {/* Multiple images indicator */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </Link>
                  
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
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                        {product.name}
                        {product.variant_name && product.variant_name !== 'Default' && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            ({product.variant_name})
                          </span>
                        )}
                      </h3>
                    </Link>
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
                        
                        <Link
                          to={`/shop/${product.id}`}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                          title="View product details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
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
                {searchQuery 
                  ? `No products match your search "${searchQuery}". Try different keywords or check for typos.`
                  : selectedCategory 
                    ? `No products available in the ${selectedCategory} category.`
                    : 'No products available at the moment.'
                }
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    updateSearchParams({ search: undefined, category: undefined });
                    setSortBy('newest');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show All Products
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}