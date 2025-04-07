// components/ProfileCard/CraftsmanProfileCard.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt,faStar as faLightStar } from "@fortawesome/free-solid-svg-icons";
import ContactDetailsModal from "../ContactDetailsModal/ContactDetailsModal";
import axios from 'axios';
import { useUser, useAuth } from "@clerk/clerk-react";
import { SignIn } from "@clerk/clerk-react";
import { Button } from "../../components/ui/Button";
import ScheduleMeeting from "../ScheduleMeeting/ScheduleMeeting";
import { Link } from 'react-router-dom';
import review from '../../assets/googlereview.png';

const CraftsmanProfileCard = ({
  id,
  name,
  rate,
  location,
  availableCities = [],
  experience,
  projectsCompleted,
  description,
  email = 'salmanXXXXXX@xxxxx.com',
  phoneNumber = '8165XXXXXX',
  googleReviews = "0",
  rating = "5",
  contactType = "craftsman"
}) => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Get user ID from Clerk or fallback to localStorage for backward compatibility
  const userId = isSignedIn && user ? user.id : localStorage.getItem('userId');
  const isLoggedIn = isSignedIn || !!localStorage.getItem('userId');

  // Get auth headers for API requests
  const getAuthHeaders = async () => {
    if (isSignedIn) {
      const token = await getToken();
      return { Authorization: `Bearer ${token}` };
    } else if (localStorage.getItem('token')) {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    }
    return {};
  };

  // Check if this contact is already unlocked when component mounts
  useEffect(() => {
    const checkContactStatus = async () => {
      if (!isLoggedIn || !id) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const headers = await getAuthHeaders();
        
        const response = await axios.get(`${apiUrl}/payments/credits/${userId}`, { headers });
        
        if (response.data) {
          const { viewedDesigners, viewedCraftsmen } = response.data;
          const isUnlocked = contactType === 'designer' 
            ? viewedDesigners.includes(id)
            : viewedCraftsmen.includes(id);
          
          setIsContactUnlocked(isUnlocked);
        }
      } catch (error) {
        console.error('Error checking contact unlock status:', error);
      }
    };

    checkContactStatus();
  }, [id, contactType, isLoggedIn, userId]);

  const handleContactDirectly = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    
    // Check unlock status again when modal closes
    if (isLoggedIn && id) {
      const checkContactStatus = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const headers = await getAuthHeaders();
          
          const response = await axios.get(`${apiUrl}/payments/credits/${userId}`, { headers });
          
          if (response.data) {
            const { viewedDesigners, viewedCraftsmen } = response.data;
            const isUnlocked = contactType === 'designer' 
              ? viewedDesigners.includes(id)
              : viewedCraftsmen.includes(id);
            
            setIsContactUnlocked(isUnlocked);
          }
        } catch (error) {
          console.error('Error checking contact unlock status:', error);
        }
      };
      
      checkContactStatus();
    }
  };

  // Function to mask name
  const maskName = (name) => {
    if (!name) return 'XXXX XXXX';
    const parts = name.split(' ');
    
    if (parts.length === 1) {
      // If only one word, show first two characters
      return name.substring(0, 2) + 'XXX';
    }
    
    // First name: first two characters + XXX
    const firstName = parts[0].substring(0, 2) + 'XXX';
    
    // Last name: first character + XX
    const lastName = parts[parts.length - 1].substring(0, 1) + 'XX';
    
    return `${firstName} ${lastName}`;
  };

  // Function to mask email
  const maskEmail = (email) => {
    if (!email) return 'xxxxx@xxxxx.com';
    const [username, domain] = email.split('@');
    if (!username || !domain) return 'xxxxx@xxxxx.com';
    
    const maskedUsername = username.substring(0, 2) + 'XXXX';
    const maskedDomain = 'xxxxx.com';
    
    return `${maskedUsername}@${maskedDomain}`;
  };

  // Function to mask phone number
  const maskPhone = (phone) => {
    if (!phone) return 'XXXXXXXXXX';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return 'XXXXXXXXXX';
    
    return digits.substring(0, 4) + 'XXXXXX';
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating || 5);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    const totalStars = 5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`full-${i}`} 
          icon={faStar} 
          className="text-yellow-400" 
        />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon 
          key="half" 
          icon={faStarHalfAlt} 
          className="text-yellow-400" 
        />
      );
    }
    
    // Add empty stars using HTML entities
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`empty-${i}`}
          icon={faLightStar}
          className="text-gray-300"
        />
      );
    }
    
    return stars;
  };

  // Masked information for display
  const maskedName = maskName(name);
  const maskedEmail = maskEmail(email);
  const maskedPhone = maskPhone(phoneNumber);

  return (
    <div className="relative w-full h-full flex">
      {/* Left side - for the image (handled in parent component) */}
      <div className="w-full h-full">
        {/* Green content box */}
        <div className="bg-[rgba(0,100,82,1)] p-3 md:p-6 h-full flex flex-col">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <h2 className="text-lg md:text-3xl font-bold text-white">
                {isContactUnlocked ? name : maskedName}
                {isContactUnlocked && (
                  <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded-full">Unlocked</span>
                )}
              </h2>
              
              {/* Reviews count */}
              <div className="text-white text-xs md:text-base font-medium">{googleReviews} Reviews</div>
            </div>
            
            <div className="flex justify-between items-center mb-2 md:mb-6">
              <div className="flex flex-wrap gap-1 md:gap-3">
                <p className="font-normal text-xs md:text-base text-white">{rate}</p>
                <p className="font-normal text-xs md:text-base text-white">{location}</p>
                {availableCities && availableCities.length > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold">Available in: </span>
                    <span>{availableCities.join(', ')}</span>
                  </div>
                )}
              </div>
              
              {/* Star rating */}
              <div className="flex">
                {renderStars(rating)}
              </div>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col">
            <div className="mb-2 md:mb-4">
              <p className="font-bold text-lg md:text-3xl text-white">{experience}</p>
              <p className="font-normal text-xs md:text-base text-white">Years of Experience</p>
            </div>
            
            <div className="mb-3 md:mb-8">
              <p className="font-bold text-lg md:text-3xl text-white">{projectsCompleted}</p>
              <p className="font-normal text-xs md:text-base text-white">Projects Completed</p>
            </div>
          </div>
          
          <div className="mt-auto flex gap-2 md:gap-4">
            <button
              onClick={() => {
                if (isSignedIn) {
                  setIsContactModalOpen(true);
                } else {
                  alert("Please sign in to contact the craftsman");
                }
              }}
              className="flex-1 h-8 md:h-12 text-sm md:text-base bg-white text-[#006452] hover:bg-gray-50 rounded-md font-medium"
            >
              Contact Directly
            </button>
            
            <button
              onClick={() => {
                console.log("Schedule a Meeting button clicked for craftsman");
                if (isSignedIn) {
                  setIsScheduleOpen(true);
                } else {
                  alert("Please sign in to schedule a meeting");
                }
              }}
              className="flex-1 h-8 md:h-12 text-sm md:text-base bg-white text-[#006452] hover:bg-gray-50 rounded-md font-medium"
            >
              Schedule a Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Contact details modal */}
      {isContactModalOpen && (
        <ContactDetailsModal
          isOpen={isContactModalOpen}
          onClose={handleCloseModal}
          name={name}
          email={email}
          phoneNumber={phoneNumber}
          isUnlocked={isContactUnlocked}
          id={id}
          contactType={contactType}
        />
      )}

      {/* Schedule meeting modal */}
      {isScheduleOpen && (
        <ScheduleMeeting
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          contact={{ id, name, email, phoneNumber }}
          contactType="craftsman"
        />
      )}
    </div>
  );
};

export default CraftsmanProfileCard;