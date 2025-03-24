// components/ProfileCard/CraftsmanProfileCard.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt,faStar as faLightStar } from "@fortawesome/free-solid-svg-icons";
import ContactDetailsModal from "../ContactDetailsModal/ContactDetailsModal";

const CraftsmanProfileCard = ({
  name,
  rate,
  location,
  experience,
  projectsCompleted,
  phoneNumber = '8165XXXXXX',
  email = 'salmanXXXXXX@xxxxx.com',
  googleReviews = "0",
  rating = "5"
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactDirectly = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
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
    <>
      <div className="bg-[rgba(0,100,82,1)] md:p-3.5 p-5  md:rounded-r-lg shadow-lg mx-auto md:pl-14 w-full max-w-md sm:max-w-lg ">
        <div className="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center md:gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-2xl font-bold text-gray-100">{maskedName}</h2>
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
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 md:pl-3 mb-3.5 md:-translate-x-2">
          <button
            onClick={handleContactDirectly}
            className="w-full sm:w-2xl h-10 bg-white text-teal-700 rounded-md"
          >
            Contact Directly
          </button>
          <button className="w-full sm:w-2xl h-10 bg-white text-teal-700 rounded-md">
            Schedule a Meeting
          </button>
        </div>
      </div>

      <ContactDetailsModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
        phoneNumber={maskedPhone}
        email={maskedEmail}
      />
    </>
  );
};

export default CraftsmanProfileCard;
