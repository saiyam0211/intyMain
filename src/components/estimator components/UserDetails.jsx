import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const UserDetails = ({ formData, setFormData }) => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  // Fetch user details from Clerk when component mounts
  useEffect(() => {
    if (isSignedIn && user) {
      // Pre-fill form with Clerk user data
      setFormData((prev) => ({
        ...prev,
        userDetails: {
          ...prev.userDetails,
          name: user.fullName || user.firstName + ' ' + user.lastName || prev.userDetails.name,
          email: user.primaryEmailAddress?.emailAddress || prev.userDetails.email,
        }
      }));
    }
  }, [isSignedIn, user, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      userDetails: { ...prev.userDetails, [name]: value }
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-[#006452]">
        Enter Your Details
      </h2>
      
      {isSignedIn ? (
        <p className="text-center mb-4 text-green-600">
        </p>
      ) : (
        <p className="text-center mb-4 text-gray-600">
          Please provide your contact information.
        </p>
      )}
      
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.userDetails.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452] text-sm sm:text-base"
            required
            readOnly={isSignedIn && user?.fullName}
          />
          {isSignedIn && user?.fullName && (
            <div className="absolute right-3 top-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#006452]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.userDetails.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452] text-sm sm:text-base"
            required
            readOnly={isSignedIn && user?.primaryEmailAddress}
          />
          {isSignedIn && user?.primaryEmailAddress && (
            <div className="absolute right-3 top-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#006452]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.userDetails.phone}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452] text-sm sm:text-base"
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.userDetails.city}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006452] text-sm sm:text-base"
          required
        />
      </div>
    </div>
  );
};

export default UserDetails;