import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, User, Phone, Mail, MapPin, Home, Landmark, Building, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartModal() {
  const { state, removeFromCart, updateQuantity, clearCart, closeCart } = useCart();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    houseNo: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    paymentMode: 'cod',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!state.isOpen) return null;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerDetails.name.trim() || !customerDetails.phone.trim() || 
        !customerDetails.houseNo.trim() || !customerDetails.city.trim() || 
        !customerDetails.state.trim() || !customerDetails.pincode.trim()) {
      alert('Please fill in all required fields (Name, Phone, House No., City, State, Pincode)');
      return;
    }

    if (state.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format order details for WhatsApp
      let message = ` *New Order from UnboxTrendz*\n\n`;
      message += ` *Customer Details:*\n`;
      message += `Name: ${customerDetails.name}\n`;
      message += `Phone: ${customerDetails.phone}\n`;
      if (customerDetails.alternatePhone) {
        message += `Alternate Phone: ${customerDetails.alternatePhone}\n`;
      }
      if (customerDetails.email) {
        message += `Email: ${customerDetails.email}\n`;
      }
      
      message += `\n *Delivery Address:*\n`;
      message += `House No.: ${customerDetails.houseNo}\n`;
      if (customerDetails.landmark) {
        message += `Landmark: ${customerDetails.landmark}\n`;
      }
      message += `City: ${customerDetails.city}\n`;
      message += `State: ${customerDetails.state}\n`;
      message += `Pincode: ${customerDetails.pincode}\n\n`;
      
      message += ` *Payment Mode:*\n`;
      message += `${customerDetails.paymentMode === 'cod' ? 'Cash on Delivery (COD)' : 'WhatsApp Payment'}\n\n`;
      
      message += ` *Order Items:*\n`;
      state.items.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Category: ${item.category}\n`;
        message += `   Price: ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}\n\n`;
      });
      
      message += ` *Order Summary:*\n`;
      message += `Total Items: ${state.totalItems}\n`;
      message += `Total Amount: ₹${state.totalPrice}\n\n`;
      message += `Please confirm availability and delivery details. Thank you! `;

      const whatsappUrl = `https://wa.me/919386387397?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Show success message
      setShowSuccess(true);
      
      // Clear cart and form after successful order
      setTimeout(() => {
        clearCart();
        setCustomerDetails({ 
          name: '', 
          phone: '', 
          alternatePhone: '',
          email: '', 
          houseNo: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
          paymentMode: 'cod'
        });
        setShowSuccess(false);
        closeCart();
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your order has been sent via WhatsApp. We'll contact you shortly to confirm details.
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2" />
            Shopping Cart ({state.totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some products to get started!</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-lg font-bold text-gray-800">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded-full transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Subtotal ({state.totalItems} items):</span>
                    <span>₹{state.totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Delivery Charge:</span>
                    <span className={deliveryCharge === 0 ? "text-green-600 font-semibold" : ""}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {state.totalPrice < 299 && (
                    <div className="text-xs text-gray-600 italic">
                      Add ₹{299 - state.totalPrice} more for free delivery!
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                      <span>Final Total:</span>
                      <span>₹{finalTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Alternate Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerDetails.alternatePhone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, alternatePhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter alternate phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Delivery Address Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Delivery Address
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Home className="inline h-4 w-4 mr-1" />
                        House No. *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.houseNo}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, houseNo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="House/Flat/Building No."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Landmark className="inline h-4 w-4 mr-1" />
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={customerDetails.landmark}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, landmark: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Near landmark (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="inline h-4 w-4 mr-1" />
                        City *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.city}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="inline h-4 w-4 mr-1" />
                        State *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.state}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.pincode}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, pincode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pincode"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Mode Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Payment Mode *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMode"
                        value="cod"
                        checked={customerDetails.paymentMode === 'cod'}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, paymentMode: e.target.value })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Cash on Delivery (COD)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMode"
                        value="whatsapp"
                        checked={customerDetails.paymentMode === 'whatsapp'}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, paymentMode: e.target.value })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">WhatsApp Payment</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order via WhatsApp'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
