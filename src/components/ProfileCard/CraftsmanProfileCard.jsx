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

const CraftsmanProfileCard = ({
  id,
  name,
  rate,
  location,
  experience,
  projectsCompleted,
  phoneNumber = '8165XXXXXX',
  email = 'salmanXXXXXX@xxxxx.com',
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
    <div className="relative group w-full sm:w-[350px] h-[600px] bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mt-8">
      <div className="bg-[rgba(0,100,82,1)] md:p-3.5 p-5 md:rounded-r-lg shadow-lg mx-auto md:pl-14 w-full max-w-md sm:max-w-lg">
        <div className="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center md:gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-2xl font-bold text-gray-100">
              {isContactUnlocked ? name : maskedName}
              {isContactUnlocked && (
                <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded-full">Unlocked</span>
              )}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start md:gap-4 gap-2 mt-2">
              <p className="font-normal text-sm text-gray-50">{rate}</p>
              <p className="font-normal text-sm text-gray-50">{location}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {/* Google Reviews section */}
            <div className="text-white text-sm mt-1 font-medium">{googleReviews} Reviews</div>
            
            {/* Star rating */}
            <div className="flex mt-1">
              {renderStars(rating)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:pl-3 pl-2">
          <div className="flex flex-col md:gap-1.5 text-center sm:text-left">
            <p className="font-bold text-xl text-gray-100">{experience}</p>
            <p className="font-normal text-base text-gray-100">Years of Experience</p>
            <p className="font-bold text-xl text-gray-100">{projectsCompleted}</p>
            <p className="font-normal text-base text-gray-100">Projects Completed</p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-3 mb-6 mt-1">
          <Button
            onClick={() => {
              if (isSignedIn) {
                setIsContactModalOpen(true);
              } else {
                alert("Please sign in to contact the craftsman");
              }
            }}
            className="bg-[#B0CBCD] hover:bg-[#8eb7ba] text-[#00312D] w-[311px] h-[44px] rounded-md"
          >
            Contact Directly
          </Button>
          <Button
            onClick={() => {
              console.log("Schedule a Meeting button clicked for craftsman");
              if (isSignedIn) {
                setIsScheduleOpen(true);
              } else {
                alert("Please sign in to schedule a meeting");
              }
            }}
            className="bg-white hover:bg-gray-100 border border-[#B0CBCD] text-[#00312D] w-[311px] h-[44px] rounded-md"
          >
            Schedule a Meeting
          </Button>
        </div>
      </div>

      <ScheduleMeeting 
        contact={{ id, name, email, phoneNumber }} 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        contactType="craftsman"
      />

      <ContactDetailsModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
        phoneNumber={maskedPhone}
        email={maskedEmail}
        id={id}
        contactType={contactType}
        onUnlock={() => setIsContactUnlocked(true)}
      />
    </div>
  );
};

export default CraftsmanProfileCard;