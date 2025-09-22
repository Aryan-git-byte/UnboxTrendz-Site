import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartModal from './CartModal';
import PromoPopup from './PromoPopup';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAdmin, signOut } = useAuth();
  const { state: cartState, openCart } = useCart();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.jpg" 
                alt="UnboxTrendz Logo" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">UNBOXTRENDZ</h1>
                <p className="text-xs text-gray-600 -mt-1">Unbox Your Trend</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {!isAdminRoute && (
                <>
                  <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                  <Link to="/shop" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Shop
                  </Link>
                  <Link to="/policies" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Policies
                  </Link>
                </>
              )}
              {/* Shopping Cart - Always visible */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.totalItems}
                  </span>
                )}
              </button>
              {isAdmin && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </nav>

            {/* Mobile cart icon and menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Shopping Cart - Mobile */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.totalItems}
                  </span>
                )}
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                {!isAdminRoute && (
                  <>
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/shop"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      to="/policies"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Policies
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Cart Modal */}
      <CartModal />

      {/* Promotional Popup */}
      <PromoPopup />

      {/* Footer */}
      {!isAdminRoute && (
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img 
                  src="/logo.jpg" 
                  alt="UnboxTrendz Logo" 
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">UNBOXTRENDZ</h3>
                  <p className="text-sm text-gray-400">Unbox Your Trend</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                © 2024 UNBOXTRENDZ. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}