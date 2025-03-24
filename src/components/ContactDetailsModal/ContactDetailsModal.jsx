import React, { useState } from 'react';
import upiLogo from '../../assets/upi.png';
import cardLogo from '../../assets/card.png'; // Assuming you have a card logo, if not, we can remove or replace it

const ContactDetailsModal = ({ isOpen, onClose, phoneNumber, email }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  if (!isOpen) return null;

  const handleProceed = () => {
    // Add your payment and contact details retrieval logic here
    console.log('Proceeding with payment method:', selectedPaymentMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 p-4">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[800px] flex flex-col md:flex-row">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 text-gray-700 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        {/* Contact Details Section */}
        <div className="w-full md:w-1/2 p-6 bg-[#008060] text-white rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          <h2 className="text-xl font-bold mb-4">Get Contact Details</h2>
          
          <div className="space-y-2">
            <p className="font-medium">Phone: {phoneNumber}</p>
            <p className="font-medium">Email: {email}</p>
          </div>

          {/* Pricing Information */}
          <div className="mt-4 bg-white/20 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span>1 Contact Details</span>
              <span className="font-bold">₹200</span>
            </div>
            <div className="flex justify-between items-center">
              <span>10 Contact Details</span>
              <span className="font-bold">₹1300</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="w-full md:w-1/2 p-6">
          <h3 className="text-lg font-semibold mb-4">Pay and get contact details</h3>
          
          <div className="space-y-4">
            <label className="flex items-center border rounded-md p-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="upi"
                checked={selectedPaymentMethod === 'upi'}
                onChange={() => setSelectedPaymentMethod('upi')}
                className="mr-3"
              />
              <img 
                src={upiLogo} 
                alt="UPI Logo" 
                className="w-6 h-6 mr-2"
              />
              <span className="flex items-center">
                UPI Pay
              </span>
            </label>

            <label className="flex items-center border rounded-md p-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="card"
                checked={selectedPaymentMethod === 'card'}
                onChange={() => setSelectedPaymentMethod('card')}
                className="mr-3"
              />
              <img 
                src={cardLogo} 
                alt="Card Logo" 
                className="w-6 h-6 mr-2"
              />
              <span className="flex items-center">
                Pay with Card
              </span>
            </label>
          </div>

          {/* Proceed Button */}
          <button 
            onClick={handleProceed}
            className="w-full mt-6 bg-[#008060] text-white py-2 rounded-md hover:bg-[#006452] transition duration-300"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsModal;