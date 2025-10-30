import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Save, X, Upload, ShoppingCart, Users, TrendingUp, Calendar, Search, Filter, Download, ExternalLink, Copy, Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Product, type Order } from '../../lib/supabase';

const categories = ['Toys', 'Gifts', 'Kitchen & Home decor', 'Jewellery', 'Jhumka', 'Earrings', 'Hair accessories'];

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [viewingImages, setViewingImages] = useState<{orderId: string, itemIndex: number} | null>(null);
  const [viewingProductImages, setViewingProductImages] = useState<Product | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    visibleProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: categories[0],
    price: '',
    description: '',
    images: [] as string[],
    visible: true,
    parent_product_id: '',
    variant_name: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  useEffect(() => {
    calculateStats();
  }, [products, orders]);

  const calculateStats = () => {
    const totalProducts = products.length;
    const visibleProducts = products.filter(p => p.visible).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total_amount, 0);

    setStats({
      totalProducts,
      visibleProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        description: newProduct.description.trim(),
        images: newProduct.images.filter(img => img.trim() !== ''),
        visible: newProduct.visible,
        parent_product_id: newProduct.parent_product_id || null,
        variant_name: newProduct.variant_name.trim() || 'Default'
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      setNewProduct({
        name: '',
        category: categories[0],
        price: '',
        description: '',
        images: [],
        visible: true,
        parent_product_id: '',
        variant_name: ''
      });
      setShowAddProduct(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          images: product.images,
          visible: product.visible,
          parent_product_id: product.parent_product_id || null,
          variant_name: product.variant_name || 'Default'
        })
        .eq('id', product.id);

      if (error) throw error;

      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleCopyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (error) {
      console.error('Failed to copy order ID:', error);
    }
  };

  const addImageUrl = () => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: [...(editingProduct.images || []), '']
      });
    } else {
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, '']
      });
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    if (editingProduct) {
      const updatedImages = [...(editingProduct.images || [])];
      updatedImages[index] = url;
      setEditingProduct({
        ...editingProduct,
        images: updatedImages
      });
    } else {
      const updatedImages = [...newProduct.images];
      updatedImages[index] = url;
      setNewProduct({
        ...newProduct,
        images: updatedImages
      });
    }
  };

  const removeImageUrl = (index: number) => {
    if (editingProduct) {
      const updatedImages = editingProduct.images?.filter((_, i) => i !== index) || [];
      setEditingProduct({
        ...editingProduct,
        images: updatedImages
      });
    } else {
      const updatedImages = newProduct.images.filter((_, i) => i !== index);
      setNewProduct({
        ...newProduct,
        images: updatedImages
      });
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone.includes(searchTerm) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get parent products for variant selection
  const parentProducts = products.filter(p => p.parent_product_id === null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your UnboxTrendz store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visible Products</p>
                <p className="text-2xl font-bold text-gray-800">{stats.visibleProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({stats.totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders ({stats.totalOrders})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'products' ? 'Search products...' : 'Search orders...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {activeTab === 'products' ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>

            {activeTab === 'products' && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </button>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                      {editingProduct?.id === product.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(editingProduct); }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select
                                value={editingProduct.category}
                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {categories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                              <input
                                type="number"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Product</label>
                              <select
                                value={editingProduct.parent_product_id || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, parent_product_id: e.target.value || null })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">None (Standalone Product)</option>
                                {parentProducts.filter(p => p.id !== editingProduct.id).map(parent => (
                                  <option key={parent.id} value={parent.id}>{parent.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                              <input
                                type="text"
                                value={editingProduct.variant_name || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, variant_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Red, Large, Premium"
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingProduct.visible}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, visible: e.target.checked })}
                                  className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Visible</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={editingProduct.description}
                              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                            {editingProduct.images?.map((image, index) => (
                              <div key={index} className="flex gap-2 mb-2">
                                <input
                                  type="url"
                                  value={image}
                                  onChange={(e) => updateImageUrl(index, e.target.value)}
                                  placeholder="Enter image URL"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImageUrl(index)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addImageUrl}
                              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Image
                            </button>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4 flex-1">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <div className="relative">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5Ob0ltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                                    }}
                                  />
                                  {product.images.length > 1 && (
                                    <button
                                      onClick={() => setViewingProductImages(product)}
                                      className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs font-medium hover:bg-opacity-60 transition-all"
                                    >
                                      +{product.images.length - 1} more
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              {product.images && product.images.length > 0 && (
                                <button
                                  onClick={() => setViewingProductImages(product)}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  View All ({product.images.length})
                                </button>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.visible 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.visible ? 'Visible' : 'Hidden'}
                                </span>
                                {product.parent_product_id && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    Variant: {product.variant_name || 'Default'}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">{product.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Category: {product.category}</span>
                                <span>Price: ₹{product.price}</span>
                                <span>Images: {product.images?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders found</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                            <button
                              onClick={() => handleCopyOrderId(order.id)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Copy full order ID"
                            >
                              {copiedOrderId === order.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-gray-600">Customer: {order.customer_name}</p>
                          <p className="text-gray-600">Phone: {order.customer_phone}</p>
                          <p className="text-gray-600">Total: ₹{order.total_amount}</p>
                          <p className="text-gray-600">Payment: {order.payment_mode.toUpperCase()}</p>
                          <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="block w-full px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            Delete Order
                          </button>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item, index) => {
                            // Find the product in the products list to get its images
                            const product = products.find(p => p.id === item.id);
                            
                            return (
                              <div key={index} className="bg-white p-3 rounded-lg">
                                <div className="flex items-start space-x-3">
                                  {/* Item Image */}
                                  <div className="flex-shrink-0">
                                    {item.images && item.images.length > 0 ? (
                                      <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5Ob0ltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Item Details */}
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        <span className="text-gray-600 ml-2">(x{item.quantity})</span>
                                      </div>
                                      <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Category: {item.category}</p>
                                    {item.images && item.images.length > 0 && (
                                      <button
                                        onClick={() => setViewingImages({ orderId: order.id, itemIndex: index })}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        title="View product images"
                                      >
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        View Images ({item.images.length})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="border-t mt-2 pt-2 flex justify-between items-center font-semibold">
                          <span>Total (including delivery ₹{order.delivery_charge}):</span>
                          <span>₹{order.total_amount}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Delivery Address:</h4>
                        <p className="text-sm text-gray-600">
                          {order.delivery_house_no}, {order.delivery_landmark && `${order.delivery_landmark}, `}
                          {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Product</label>
                    <select
                      value={newProduct.parent_product_id}
                      onChange={(e) => setNewProduct({ ...newProduct, parent_product_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">None (Standalone Product)</option>
                      {parentProducts.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                    <input
                      type="text"
                      value={newProduct.variant_name}
                      onChange={(e) => setNewProduct({ ...newProduct, variant_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Red, Large, Premium"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.visible}
                        onChange={(e) => setNewProduct({ ...newProduct, visible: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                  {newProduct.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="Enter image URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </button>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Order Item Images Modal */}
      {viewingImages && (() => {
        const order = orders.find(o => o.id === viewingImages.orderId);
        const item = order?.order_items[viewingImages.itemIndex];
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Product Images - {item?.name}
                  </h2>
                  <button
                    onClick={() => setViewingImages(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {item && item.images && item.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.images.map((image, idx) => (
                      <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${item.name} - Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No images available for this product</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {item?.name}</p>
                    <p><span className="font-medium">Price:</span> ₹{item?.price}</p>
                    <p><span className="font-medium">Quantity:</span> {item?.quantity}</p>
                    <p><span className="font-medium">Category:</span> {item?.category}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setViewingImages(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Product Images Modal */}
      {viewingProductImages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Product Images - {viewingProductImages.name}
                </h2>
                <button
                  onClick={() => setViewingProductImages(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {viewingProductImages.images && viewingProductImages.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingProductImages.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${viewingProductImages.name} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No images available for this product</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {viewingProductImages.name}</p>
                  <p><span className="font-medium">Category:</span> {viewingProductImages.category}</p>
                  <p><span className="font-medium">Price:</span> ₹{viewingProductImages.price}</p>
                  <p><span className="font-medium">Description:</span> {viewingProductImages.description}</p>
                  {viewingProductImages.variant_name && viewingProductImages.variant_name !== 'Default' && (
                    <p><span className="font-medium">Variant:</span> {viewingProductImages.variant_name}</p>
                  )}
                  <p><span className="font-medium">Status:</span> {viewingProductImages.visible ? 'Visible' : 'Hidden'}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewingProductImages(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
