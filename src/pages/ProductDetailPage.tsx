import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, ShoppingBag, Plus, Share2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('visible', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setShowAddToCartSuccess(true);
    setTimeout(() => setShowAddToCartSuccess(false), 2000);
  };

  const handleShareProduct = async () => {
    if (!product) return;
    const productUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedProduct(true);
      setTimeout(() => setCopiedProduct(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedProduct(true);
      setTimeout(() => setCopiedProduct(false), 2000);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev === product.images.length - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? product.images.length - 1 : prev - 1;
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-12 bg-gray-200 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{product.name} - UnboxTrendz</title>
        <meta name="description" content={`${product.description} - Buy ${product.name} online at UnboxTrendz. Category: ${product.category}. Price: ₹${product.price}`} />
        <meta name="keywords" content={`${product.name}, ${product.category}, online shopping India, UnboxTrendz`} />
        <link rel="canonical" href={`https://unboxtrendz.in/shop/${product.id}`} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/shop" className="hover:text-blue-600 transition-colors">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 transition-colors">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-md">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-auto object-cover"
                />
                
                {/* Navigation arrows - only show if multiple images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-300"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-300"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {product.images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {product.category}
              </span>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="text-3xl font-bold text-blue-600 mb-6">₹{product.price}</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <div className="flex space-x-4 relative">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              
              <button
                onClick={handleShareProduct}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                title="Share product"
              >
                {copiedProduct ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </button>
              
              {/* Success Messages */}
              {showAddToCartSuccess && (
                <div className="absolute -top-12 left-0 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-10 animate-pulse">
                  Product added to cart successfully!
                </div>
              )}
              
              {copiedProduct && (
                <div className="absolute -top-12 right-0 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-10 animate-pulse">
                  Product link copied!
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-800">Category:</span>
                <p className="text-gray-600">{product.category}</p>
              </div>
              <div>
                <span className="font-medium text-gray-800">Price:</span>
                <p className="text-gray-600">₹{product.price}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Why Choose UnboxTrendz?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fast shipping across India</li>
                <li>• Quality products guaranteed</li>
                <li>• Easy returns and exchanges</li>
                <li>• Customer support available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Shop Button */}
      <div className="mt-12 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Shop
        </Link>
      </div>
    </div>
  );
}