import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, ShoppingCart, Users, TrendingUp, Calendar, Search, Filter, Download, ExternalLink, Copy, Check, AlertCircle, Loader2, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
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

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone.includes(searchTerm) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const parentProducts = products.filter(p => p.parent_product_id === null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your UnboxTrendz store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Visible Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.visibleProducts}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.totalRevenue}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Products ({stats.totalProducts})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders ({stats.totalOrders})</span>
                </div>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              
              {activeTab === 'products' ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Product
                </button>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                      {editingProduct?.id === product.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(editingProduct); }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                              <input
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
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
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingProduct.visible}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, visible: e.target.checked })}
                                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Visible</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
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
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addImageUrl}
                              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Image
                            </button>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="inline-flex items-center px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4 flex-1">
                            {product.images && product.images.length > 0 && (
                              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-md">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                  onClick={() => setShowImagePreview(product.images[0])}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  product.visible 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {product.visible ? 'Visible' : 'Hidden'}
                                </span>
                                {product.parent_product_id && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                                    Variant: {product.variant_name || 'Default'}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                              <div className="flex items-center flex-wrap gap-4 text-sm">
                                <span className="flex items-center text-gray-700">
                                  <Package className="h-4 w-4 mr-1 text-blue-600" />
                                  <strong>Category:</strong>&nbsp;{product.category}
                                </span>
                                <span className="flex items-center text-gray-700">
                                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                                  <strong>Price:</strong>&nbsp;₹{product.price}
                                </span>
                                <span className="flex items-center text-gray-700">
                                  <ImageIcon className="h-4 w-4 mr-1 text-purple-600" />
                                  <strong>Images:</strong>&nbsp;{product.images?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-5 w-5" />
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No orders found</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrders.has(order.id);
                    return (
                      <div key={order.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-xl font-bold text-gray-800">
                                  Order #{order.id.slice(0, 8)}
                                </h3>
                                <button
                                  onClick={() => handleCopyOrderId(order.id)}
                                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                  title="Copy full order ID"
                                >
                                  {copiedOrderId === order.id ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                  {formatStatus(order.status)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Customer</p>
                                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                                  <p className="text-gray-600">{order.customer_phone}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Order Details</p>
                                  <p className="font-semibold text-gray-800">₹{order.total_amount}</p>
                                  <p className="text-gray-600">{order.payment_mode.toUpperCase()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Date</p>
                                  <p className="font-semibold text-gray-800">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-gray-600">
                                    {new Date(order.created_at).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-3 ml-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-colors ${getStatusColor(order.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              
                              <button
                                onClick={() => toggleOrderExpanded(order.id)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-sm font-medium">{isExpanded ? 'Hide' : 'Show'} Details</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Order Details */}
                        {isExpanded && (
                          <div className="p-6 space-y-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Package className="h-5 w-5 mr-2 text-blue-600" />
                                Order Items ({order.order_items.length})
                              </h4>
                              <div className="space-y-3">
                                {order.order_items.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                    <div className="flex items-center space-x-4 flex-1">
                                      {item.images && item.images.length > 0 ? (
                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-md">
                                          <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                            onClick={() => setShowImagePreview(item.images[0])}
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                                          <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-gray-800 truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Unit Price: ₹{item.price} × {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-lg font-bold text-gray-800">₹{item.price * item.quantity}</p>
                                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Order Summary */}
                              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>₹{order.total_amount - order.delivery_charge}</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge:</span>
                                    <span>₹{order.delivery_charge}</span>
                                  </div>
                                  <div className="border-t border-blue-300 pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold text-gray-800">
                                      <span>Total Amount:</span>
                                      <span>₹{order.total_amount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Customer & Delivery Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Customer Information */}
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                  <Users className="h-5 w-5 mr-2 text-green-600" />
                                  Customer Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">Name</p>
                                    <p className="font-semibold text-gray-800">{order.customer_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Phone</p>
                                    <p className="font-semibold text-gray-800">{order.customer_phone}</p>
                                  </div>
                                  {order.customer_alternate_phone && (
                                    <div>
                                      <p className="text-gray-500">Alternate Phone</p>
                                      <p className="font-semibold text-gray-800">{order.customer_alternate_phone}</p>
                                    </div>
                                  )}
                                  {order.customer_email && (
                                    <div>
                                      <p className="text-gray-500">Email</p>
                                      <p className="font-semibold text-gray-800">{order.customer_email}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Delivery Address */}
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                                  Delivery Address
                                </h4>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  <p className="font-semibold">{order.delivery_house_no}</p>
                                  {order.delivery_landmark && <p>{order.delivery_landmark}</p>}
                                  <p>{order.delivery_city}, {order.delivery_state}</p>
                                  <p className="font-semibold mt-1">PIN: {order.delivery_pincode}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
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
                      placeholder="0.00"
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
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.visible}
                        onChange={(e) => setNewProduct({ ...newProduct, visible: e.target.checked })}
                        className="mr-2 h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Make Visible</span>
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
                    placeholder="Enter product description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
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
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image URL
                  </button>
                </div>

                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImagePreview(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={showImagePreview}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
} text-gray-700">
                                  <Package className="h-4 w-4 mr-1 text-blue-600" />
                                  <strong>Category:</strong>&nbsp;{product.category}
                                </span>
                                <span className="flex items-center text-gray-700">
                                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                                  <strong>Price:</strong>&nbsp;₹{product.price}
                                </span>
                                <span className="flex items-center
