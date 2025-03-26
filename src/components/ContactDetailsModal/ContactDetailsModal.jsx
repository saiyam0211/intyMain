import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import upiLogo from '../../assets/upi.png';
import cardLogo from '../../assets/card.png'; // Assuming you have a card logo, if not, we can remove or replace it

// Function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const ContactDetailsModal = ({ isOpen, onClose, phoneNumber, email, id, contactType, onUnlock }) => {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const { getToken } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState({
    designerCredits: 0,
    craftsmanCredits: 0,
    viewedDesigners: [],
    viewedCraftsmen: []
  });
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [actualPhoneNumber, setActualPhoneNumber] = useState('');
  const [actualEmail, setActualEmail] = useState('');
  
  // Get user ID from Clerk or fallback to localStorage for backward compatibility
  const userId = isSignedIn && user ? user.id : localStorage.getItem('userId');
  const isLoggedIn = isSignedIn || !!localStorage.getItem('userId');
  
  // Get auth headers for API requests
  const getAuthHeaders = async () => {
    try {
      const token = await getToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {};
    }
  };
  
  // Fetch subscriptions and user credits on component mount
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptions();
      if (isLoggedIn) {
        fetchUserCredits();
      }
    }
  }, [isOpen, isLoggedIn]);

  // Check if contact is already unlocked
  useEffect(() => {
    if (isLoggedIn && id) {
      const isAlreadyViewed = contactType === 'designer'
        ? userCredits.viewedDesigners.includes(id)
        : userCredits.viewedCraftsmen.includes(id);
      
      setContactUnlocked(isAlreadyViewed);
      
      if (isAlreadyViewed) {
        // Fetch actual contact details if already unlocked
        fetchActualContactDetails();
      }
    }
  }, [isLoggedIn, id, userCredits.viewedDesigners, userCredits.viewedCraftsmen]);
  
  // Fetch actual contact details
  const fetchActualContactDetails = async () => {
    try {
      // This would be replaced with an actual API call to get unmasked details
      // For now, we'll unmask the masked details for demonstration
      if (phoneNumber) {
        // Simulate unmasking by replacing X with random digits
        const unmaskedPhone = phoneNumber.replace(/X/g, () => Math.floor(Math.random() * 10));
        setActualPhoneNumber(unmaskedPhone);
      }
      
      if (email) {
        // Simulate unmasking the email
        const [username, domain] = email.split('@');
        const unmaskedUsername = username.replace(/X/g, () => String.fromCharCode(97 + Math.floor(Math.random() * 26)));
        const unmaskedDomain = domain.replace('xxxxx.com', 'gmail.com');
        setActualEmail(`${unmaskedUsername}@${unmaskedDomain}`);
      }
    } catch (error) {
      console.error('Error fetching actual contact details:', error);
    }
  };
  
  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/subscriptions?type=${contactType || 'designer'}`);
      setSubscriptions(response.data);
      
      // Select the first subscription by default
      if (response.data.length > 0) {
        setSelectedSubscription(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user credits
  const fetchUserCredits = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/credits/${userId}`,
        { headers }
      );
      
      setUserCredits(response.data);
      
      // Check if this contact is already unlocked
      const isAlreadyViewed = contactType === 'designer'
        ? response.data.viewedDesigners.includes(id)
        : response.data.viewedCraftsmen.includes(id);
      
      setContactUnlocked(isAlreadyViewed);
      
      if (isAlreadyViewed) {
        fetchActualContactDetails();
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };
  
  // Handle subscription selection
  const handleSubscriptionSelect = (subscription) => {
    setSelectedSubscription(subscription);
  };
  
  // Handle payment using Razorpay
  const handleProceedToPayment = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to purchase credits');
      return;
    }
    
    if (!selectedSubscription) {
      toast.error('Please select a subscription plan');
      return;
    }
    
    try {
      // Create order
      const headers = await getAuthHeaders();
      console.log('Using auth headers:', headers);
      
      try {
        const orderResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/create-order`,
          {
            subscriptionId: selectedSubscription._id,
            userId
          },
          { headers }
        );
        
        // Load Razorpay script if not already loaded
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          toast.error('Failed to load payment gateway. Please try again later.');
          return;
        }
        
        // Initialize Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_QlRKi8hhbOXwiK",
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'inty',
          description: `${selectedSubscription.name} - ${selectedSubscription.contactsCount} contacts`,
          order_id: orderResponse.data.orderId,
          handler: function(response) {
            // Handle successful payment
            verifyPayment(response);
          },
          prefill: {
            name: user?.fullName || 'User Name',
            email: user?.primaryEmailAddress?.emailAddress || 'user@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#008060'
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('Error creating order:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        toast.error(`Failed to initiate payment: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error in payment flow:', error);
      toast.error('Failed to initiate payment process');
    }
  };
  
  // Verify payment with backend
  const verifyPayment = async (paymentResponse) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/verify-payment`,
        {
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          userId
        },
        { headers }
      );
      
      // Update user credits
      setUserCredits(response.data.credits);
      
      toast.success('Payment successful! You now have credits to view contact details.');
      
      // Automatically use credit to view this contact if we have an ID
      if (id) {
        useCredit();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Payment verification failed');
    }
  };
  
  // Use credit to view contact details
  const useCredit = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to use credits');
      return;
    }
    
    // If contact is already unlocked, no need to use credit
    if (contactUnlocked) {
      toast.info('Contact is already unlocked');
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/use-credit`,
        {
          userId,
          contactId: id,
          contactType: contactType || 'designer'
        },
        { headers }
      );
      
      // Update credits in state
      setUserCredits({
        ...userCredits,
        designerCredits: response.data.designerCredits,
        craftsmanCredits: response.data.craftsmanCredits,
        viewedDesigners: contactType === 'designer' 
          ? [...userCredits.viewedDesigners, id]
          : userCredits.viewedDesigners,
        viewedCraftsmen: contactType === 'craftsman'
          ? [...userCredits.viewedCraftsmen, id]
          : userCredits.viewedCraftsmen
      });
      
      // Update contactUnlocked state
      setContactUnlocked(true);
      
      // Fetch actual contact details
      fetchActualContactDetails();
      
      // Call the onUnlock callback if provided
      if (typeof onUnlock === 'function') {
        onUnlock();
      }
      
      toast.success('Contact unlocked successfully');
    } catch (error) {
      console.error('Error using credit:', error);
      
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Not enough credits');
      } else {
        toast.error('Failed to unlock contact');
      }
    }
  };
  
  // Check if this contact is already unlocked (user has enough credits)
  const hasEnoughCredits = contactType === 'designer' 
    ? userCredits.designerCredits > 0 
    : userCredits.craftsmanCredits > 0;
  
  // Determine if we should show actual contact details
  const availableCredits = contactType === 'designer'
    ? userCredits.designerCredits
    : userCredits.craftsmanCredits;

  // Handle login redirect
  const handleLoginRedirect = () => {
    onClose(); // Close the modal
    openSignIn(); // Open Clerk sign-in modal
  };

  // Check for welcome credits when user logs in
  useEffect(() => {
    if (isSignedIn && user) {
      checkForWelcomeCredits();
    }
  }, [isSignedIn, user]);

  // Function to check and add welcome credits for new users
  const checkForWelcomeCredits = async () => {
    if (!user || !isSignedIn) return;
    
    try {
      const headers = await getAuthHeaders();
      
      // Call the welcome credits endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/welcome-credits`,
        { userId: user.id },
        { headers }
      );
      
      console.log('Welcome credits response:', response.data);
      
      if (response.data.message.includes('already received')) {
        console.log('User already received welcome credits');
      } else {
        toast.success('Welcome bonus credits added to your account!');
        // Update the local credits state
        setUserCredits(prevCredits => ({
          ...prevCredits,
          designerCredits: response.data.credits.designerCredits,
          craftsmanCredits: response.data.credits.craftsmanCredits
        }));
      }
    } catch (error) {
      console.error('Error checking welcome credits:', error);
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-xl font-bold mb-4">Contact Details</h2>
          
          <div className="space-y-2">
            {contactUnlocked ? (
              <>
                <p className="font-medium">Phone: <span className="bg-white/20 px-2 py-1 rounded">{actualPhoneNumber || phoneNumber}</span></p>
                <p className="font-medium">Email: <span className="bg-white/20 px-2 py-1 rounded">{actualEmail || email}</span></p>
                <div className="mt-2 text-sm bg-white/10 p-2 rounded">
                  <p className="text-white/80 mb-1">✓ Contact details unlocked</p>
                  <p className="text-white/80">You can now contact this professional directly.</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium">Phone: {phoneNumber}</p>
                <p className="font-medium">Email: {email}</p>
                <div className="mt-2 text-sm bg-white/10 p-2 rounded">
                  <p className="text-white/80">Purchase credits to unlock contact details.</p>
                </div>
              </>
            )}
          </div>

          {/* Credits Information */}
          {isLoggedIn && (
            <div className="mt-4 p-3 bg-white/20 rounded-md">
              <p className="font-medium">Your Available Credits:</p>
              <div className="flex justify-between items-center mt-2">
                <span>Designer Credits:</span>
                <span className="font-bold">{userCredits.designerCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Craftsman Credits:</span>
                <span className="font-bold">{userCredits.craftsmanCredits}</span>
              </div>
              
              {(userCredits.designerCredits > 0 || userCredits.craftsmanCredits > 0) && (
                <div className="mt-2 text-xs text-white/80">
                  Each credit unlocks one contact's details.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="w-full md:w-1/2 p-6">
          <h3 className="text-lg font-semibold mb-4">Get Contact Details</h3>
          
          {/* If contact is already unlocked */}
          {contactUnlocked ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="font-medium text-green-700 mb-2">Contact Details Unlocked!</p>
              <p className="text-sm text-green-600">You can now directly contact this professional using their phone number and email.</p>
            </div>
          ) : isLoggedIn && hasEnoughCredits ? (
            <div>
              <p className="text-gray-700 mb-4">
                You have {availableCredits} {contactType} credits available. Use one credit to view this contact.
              </p>
              <button
                onClick={useCredit}
                className="w-full bg-[#008060] text-white py-2 rounded-md hover:bg-[#006452] transition duration-300"
              >
                Use 1 Credit to Unlock
              </button>
            </div>
          ) : (
            <>
              {/* Subscription Selection */}
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Select a subscription plan:</p>
                
                {loading ? (
                  <div className="animate-pulse h-20 bg-gray-200 rounded-md"></div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {subscriptions.map((subscription) => (
                      <div 
                        key={subscription._id}
                        className={`border p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSubscription?._id === subscription._id 
                            ? 'border-[#008060] bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSubscriptionSelect(subscription)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{subscription.name}</span>
                          <span className="font-bold">₹{subscription.amount}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription.contactsCount} contact{subscription.contactsCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Payment Method Selection */}
              <div className="space-y-4 mb-4">
                <p className="text-gray-700">Select payment method:</p>
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
                onClick={isLoggedIn ? handleProceedToPayment : handleLoginRedirect}
                disabled={!selectedSubscription && isLoggedIn}
                className={`w-full py-2 rounded-md transition duration-300 ${
                  (!selectedSubscription && isLoggedIn) 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#008060] text-white hover:bg-[#006452]'
                }`}
              >
                {isLoggedIn ? 'Proceed to Payment' : 'Log in to Purchase'}
              </button>
              
              {!isLoggedIn && (
                <p className="text-sm text-gray-500 mt-2">
                  You need to be logged in to purchase contact credits. Click the button above to sign in.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsModal;