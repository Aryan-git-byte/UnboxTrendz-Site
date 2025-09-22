import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after a short delay for better UX every time user enters the site
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-[60] animate-fadeIn overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full max-h-[85vh] animate-scaleIn my-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        
        {/* Promotional poster */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl h-full">
          <img
            src="/Beige Simple Elegant Spa and Beauty Discount Instagram Story (1).png"
            alt="UnboxTrendz - 25% OFF Jewellery with Best Deals - Launching and Festive Discount"
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={handleClose}
          />
          
          {/* Overlay with subtle gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}