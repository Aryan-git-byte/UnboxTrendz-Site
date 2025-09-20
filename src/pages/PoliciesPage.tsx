import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Truck, RefreshCw, FileText } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Policies - Terms, Privacy, Shipping & Returns | UnboxTrendz</title>
        <meta name="description" content="Read UnboxTrendz policies including terms & conditions, privacy policy, shipping & delivery, and cancellation & refund policies for online shopping in India." />
        <meta name="keywords" content="UnboxTrendz policies, terms conditions, privacy policy, shipping policy, return policy, refund policy" />
        <link rel="canonical" href="https://unboxtrendz.in/policies" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Policies</h1>
        <p className="text-gray-600">Important information about our terms, privacy, and services</p>
      </div>

      <div className="space-y-8">
        {/* Terms & Conditions */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
          </div>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-600 mb-4">
              By accessing and using UNBOXTRENDZ, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Product Information</h3>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Ordering Process</h3>
            <p className="text-gray-600 mb-4">
              Orders are placed through WhatsApp communication. All orders are subject to availability and confirmation of the order price.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Limitation of Liability</h3>
            <p className="text-gray-600 mb-4">
              UnboxTrendz shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services.
            </p>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
          </div>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Information We Collect</h3>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, such as when you contact us through WhatsApp for orders or inquiries.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">How We Use Your Information</h3>
            <p className="text-gray-600 mb-4">
              We use the information we collect to process your orders, communicate with you about your purchases, and improve our services.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Information Sharing</h3>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Security</h3>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </section>

        {/* Shipping & Delivery */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <Truck className="h-8 w-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Shipping & Delivery</h2>
          </div>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Delivery Areas</h3>
            <p className="text-gray-600 mb-4">
              We currently deliver across India. Delivery charges and timeframes vary based on your location and will be communicated during the order process.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Processing Time</h3>
            <p className="text-gray-600 mb-4">
              Orders are typically processed within 1-2 business days. You will receive updates about your order status through WhatsApp.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Delivery Time</h3>
            <p className="text-gray-600 mb-4">
              Delivery takes minimum 3 days and maximum 7 days depending on location. Express delivery options may be available for certain areas.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Delivery Issues</h3>
            <p className="text-gray-600 mb-4">
              If you experience any issues with delivery, please contact us immediately through WhatsApp, and we will work to resolve the problem.
            </p>
          </div>
        </section>

        {/* Cancellation & Refund */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <RefreshCw className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Cancellation & Refund Policy</h2>
          </div>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Cancellation</h3>
            <p className="text-gray-600 mb-4">
              You can cancel your order within 24 hours of placing it, provided it hasn't been shipped. Contact us through WhatsApp to cancel your order.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Return Policy</h3>
            <p className="text-gray-600 mb-4">
            Returns are accepted within 7 days of delivery for items that are unused, in original condition, and in original packaging.
            ➡️ Important: An unboxing/opening video is required as proof to process any return.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Refund Process</h3>
            <p className="text-gray-600 mb-4">
              Refunds will be processed within 5-7 business days after we receive and inspect the returned item. Refunds will be credited to your original payment method.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Non-Returnable Items</h3>
            <p className="text-gray-600 mb-4">
              Certain items such as personalized products, perishable goods, and intimate items cannot be returned for hygiene and safety reasons.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Damaged or Defective Items</h3>
            <p className="text-gray-600 mb-4">
              If you receive a damaged or defective item, contact us immediately with photos and the unboxing video. We will arrange a replacement or full refund.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about these policies or need assistance with your order, please don't hesitate to contact us:
          </p>
          <div className="bg-white rounded-lg p-4 inline-block">
            <p className="text-gray-800 font-semibold">WhatsApp: Available for orders and support</p>
            <p className="text-gray-600 text-sm mt-1">Click "Order via WhatsApp" on any product to get in touch</p>
          </div>
        </section>
      </div>
    </div>
  );
}
