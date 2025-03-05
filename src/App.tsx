import React, { useState } from 'react';
import { CreditCard, IndianRupee, Clock, ShoppingBag, Star } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

type PaymentMethod = 'card' | 'upi' | 'paylater';

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  icon: React.ReactNode;
  description: string;
}

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState<boolean>(false);

  const products: Product[] = [
    {
      id: 1,
      name: "Premium Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 2999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Fitness tracking smartwatch with heart rate monitor",
      price: 1999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80"
    },
    {
      id: 3,
      name: "Wireless Speaker",
      description: "Portable Bluetooth speaker with 20-hour battery life",
      price: 999,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80"
    }
  ];

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      title: 'Card Payment',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pay securely with Credit/Debit card'
    },
    {
      id: 'upi',
      title: 'UPI',
      icon: <IndianRupee className="h-6 w-6" />,
      description: 'Pay using UPI apps like GPay, PhonePe'
    },
    {
      id: 'paylater',
      title: 'Pay Later',
      icon: <Clock className="h-6 w-6" />,
      description: 'Pay using Razorpay PayLater'
    }
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: selectedProduct.price }),
      });
      
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Tech Store',
        description: `Payment for ${selectedProduct.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('http://localhost:3000/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const data = await verifyResponse.json();
            if (data.verified) {
              alert('Payment successful!');
              setShowPayment(false);
              setSelectedProduct(null);
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {!showPayment ? (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tech Store</h1>
            <ShoppingBag className="h-8 w-8 text-blue-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-gray-500">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
          <button
            onClick={() => setShowPayment(false)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Products
          </button>
          
          {selectedProduct && (
            <>
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-500">{selectedProduct.description}</p>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="text-2xl font-bold text-gray-900">₹{selectedProduct.price}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Payment Method
                </label>
                <div className="grid gap-3">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMethod(option.id)}
                      className={`flex items-center p-4 border rounded-lg transition-all ${
                        selectedMethod === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`${
                        selectedMethod === option.id ? 'text-blue-500' : 'text-gray-400'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className={`font-medium ${
                          selectedMethod === option.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? 'Processing...' : `Pay ₹${selectedProduct.price} Now`}
                </button>
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">
            Secure payments powered by Razorpay
          </p>
        </div>
      )}
    </div>
  );
}

export default App;