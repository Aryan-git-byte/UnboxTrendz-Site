// src/lib/orderMemoGenerator.ts

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_alternate_phone?: string | null;
  customer_email?: string | null;
  delivery_house_no: string;
  delivery_landmark?: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  payment_mode: string;
  total_amount: number;
  delivery_charge: number;
  order_items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    images?: string[];
  }>;
  status: string;
  created_at?: string;
}

// Helper function to format payment mode
const formatPaymentMode = (mode: string): string => {
  switch (mode) {
    case 'cod':
      return 'Cash on Delivery (COD)';
    case 'razorpay':
      return 'Online Payment';
    default:
      return mode;
  }
};

// Helper function to format order status
const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Order Placed';
    case 'confirmed':
      return 'Payment Confirmed';
    case 'payment_pending':
      return 'Payment Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Payment Failed';
    default:
      return status;
  }
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to download HTML as PDF using browser's built-in PDF generation
export const downloadOrderMemo = (order: Order): void => {
  try {
    const html = generateOrderMemoHtml(order);
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load, then trigger download
      setTimeout(() => {
        printWindow.print();
        
        // Close the window after a delay (user can cancel if needed)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    } else {
      // Fallback: create downloadable HTML file
      downloadHtmlFile(html, `order-memo-${order.id}.html`);
    }
  } catch (error) {
    console.error('Error downloading memo:', error);
    throw error;
  }
};

// Alternative function to download as HTML file directly
export const downloadHtmlFile = (htmlContent: string, filename: string): void => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

// Enhanced function to download as PDF using jsPDF (if available)
export const downloadOrderMemoPDF = async (order: Order): Promise<void> => {
  try {
    // Check if jsPDF is available (you'll need to install it)
    if (typeof window !== 'undefined' && (window as any).jsPDF) {
      const { jsPDF } = (window as any);
      const doc = new jsPDF();
      
      // Generate PDF content
      const html = generateOrderMemoHtml(order);
      await doc.html(html, {
        callback: function (doc: any) {
          doc.save(`order-memo-${order.id}.pdf`);
        },
        margin: [10, 10, 10, 10],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 190,
        windowWidth: 675
      });
    } else {
      // Fallback to browser print-to-PDF
      downloadOrderMemo(order);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to HTML download
    const html = generateOrderMemoHtml(order);
    downloadHtmlFile(html, `order-memo-${order.id}.html`);
  }
};

// Main function to generate order memo HTML
export const generateOrderMemoHtml = (order: Order): string => {
  const subtotal = order.total_amount - order.delivery_charge;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Memo - ${order.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .memo-container {
          border: 2px solid #3B82F6;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        
        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .tagline {
          font-size: 1rem;
          opacity: 0.9;
          font-style: italic;
        }
        
        .memo-title {
          background: #F3F4F6;
          padding: 20px;
          border-bottom: 2px solid #E5E7EB;
        }
        
        .memo-title h2 {
          color: #1F2937;
          font-size: 1.8rem;
          text-align: center;
        }
        
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 0.9rem;
          color: #6B7280;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #3B82F6;
        }
        
        .customer-details, .delivery-address {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3B82F6;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        
        .detail-label {
          font-weight: bold;
          color: #374151;
          min-width: 140px;
        }
        
        .detail-value {
          color: #6B7280;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table th {
          background: #3B82F6;
          color: white;
          padding: 15px 10px;
          text-align: left;
          font-weight: bold;
        }
        
        .items-table td {
          padding: 15px 10px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .items-table tr:nth-child(even) {
          background: #F9FAFB;
        }
        
        .items-table tr:hover {
          background: #F3F4F6;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .summary {
          background: #EFF6FF;
          padding: 25px;
          border-radius: 8px;
          border: 2px solid #DBEAFE;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        
        .summary-row.total {
          border-top: 2px solid #3B82F6;
          padding-top: 15px;
          margin-top: 15px;
          font-size: 1.2rem;
          font-weight: bold;
          color: #1F2937;
        }
        
        .payment-status {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: bold;
        }
        
        .status-pending {
          background: #FEF3C7;
          color: #D97706;
        }
        
        .status-confirmed {
          background: #D1FAE5;
          color: #059669;
        }
        
        .status-failed {
          background: #FEE2E2;
          color: #DC2626;
        }
        
        .footer {
          background: #F3F4F6;
          padding: 25px;
          text-align: center;
          border-top: 2px solid #E5E7EB;
          color: #6B7280;
        }
        
        .footer-title {
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
        }
        
        .contact-info {
          margin: 10px 0;
        }
        
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          
          .memo-container {
            border: 1px solid #000;
            border-radius: 0;
            box-shadow: none;
          }
          
          .header {
            background: #3B82F6 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .summary {
            background: #F0F0F0 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .items-table th {
            background: #3B82F6 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .customer-details, .delivery-address {
            background: #F9F9F9 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
        
        /* Additional styles for better PDF generation */
        .download-note {
          position: fixed;
          top: 10px;
          right: 10px;
          background: #3B82F6;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 0.8rem;
          z-index: 1000;
        }
        
        @media screen {
          .download-note {
            display: block;
          }
        }
        
        @media print {
          .download-note {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="download-note">
        Press Ctrl+P (or Cmd+P on Mac) to save as PDF
      </div>
      <div class="memo-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">UnboxTrendz</div>
          <div class="tagline">Your Style, Delivered</div>
        </div>
        
        <!-- Title -->
        <div class="memo-title">
          <h2>ORDER MEMO</h2>
          <div class="order-info">
            <span><strong>Order ID:</strong> ${order.id}</span>
            <span><strong>Date:</strong> ${formatDate(order.created_at)}</span>
          </div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Customer Details -->
          <div class="section">
            <h3 class="section-title">Customer Information</h3>
            <div class="customer-details">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${order.customer_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${order.customer_phone}</span>
              </div>
              ${order.customer_alternate_phone ? `
                <div class="detail-row">
                  <span class="detail-label">Alternate Phone:</span>
                  <span class="detail-value">${order.customer_alternate_phone}</span>
                </div>
              ` : ''}
              ${order.customer_email ? `
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${order.customer_email}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Delivery Address -->
          <div class="section">
            <h3 class="section-title">Delivery Address</h3>
            <div class="delivery-address">
              <div class="detail-row">
                <span class="detail-label">House No.:</span>
                <span class="detail-value">${order.delivery_house_no}</span>
              </div>
              ${order.delivery_landmark ? `
                <div class="detail-row">
                  <span class="detail-label">Landmark:</span>
                  <span class="detail-value">${order.delivery_landmark}</span>
                </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">City:</span>
                <span class="detail-value">${order.delivery_city}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">State:</span>
                <span class="detail-value">${order.delivery_state}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pincode:</span>
                <span class="detail-value">${order.delivery_pincode}</span>
              </div>
            </div>
          </div>
          
          <!-- Order Items -->
          <div class="section">
            <h3 class="section-title">Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items.map((item, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₹${item.price}</td>
                    <td class="text-right">₹${item.price * item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Payment Summary -->
          <div class="section">
            <h3 class="section-title">Payment Summary</h3>
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal (${order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                <span>₹${subtotal}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Charge:</span>
                <span>₹${order.delivery_charge}</span>
              </div>
              <div class="summary-row total">
                <span>Final Total:</span>
                <span>₹${order.total_amount}</span>
              </div>
              <div class="summary-row" style="margin-top: 20px;">
                <span>Payment Mode:</span>
                <span><strong>${formatPaymentMode(order.payment_mode)}</strong></span>
              </div>
              <div class="summary-row">
                <span>Order Status:</span>
                <span class="payment-status status-${order.status.includes('confirmed') ? 'confirmed' : order.status.includes('failed') || order.status.includes('cancelled') ? 'failed' : 'pending'}">
                  ${formatOrderStatus(order.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-title">Thank you for shopping with UnboxTrendz!</div>
          <div class="contact-info">
            <div>📧 Email: support@unboxtrendz.com</div>
            <div>📞 Phone: +91-XXXXXXXXXX</div>
            <div>🌐 Website: www.unboxtrendz.com</div>
          </div>
          <div style="margin-top: 15px; font-size: 0.85rem;">
            This is a computer-generated invoice. No signature required.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};