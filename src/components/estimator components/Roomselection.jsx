// RoomSelection.js
import React, { useEffect, useState } from 'react';

const roomTypes = [
  { name: 'Living Room', defaultCount: 1 },
  { name: 'Kitchen', defaultCount: 1 },
  { name: 'Bedroom', defaultCount: 1 },
  { name: 'Bathroom', defaultCount: 1 },
  { name: 'Dining', defaultCount: 1 }
];

// Default room counts for special home types
const specialHomeTypeCounts = {
  'Villa': { 'Bedroom': 4, 'Bathroom': 4 },
  'Duplex': { 'Bedroom': 4, 'Bathroom': 3 },
  'Penthouse': { 'Bedroom': 3, 'Bathroom': 3 }
};

const RoomSelection = ({ formData, setFormData }) => {
  const [roomCounts, setRoomCounts] = useState({
    'Living Room': 1,
    'Kitchen': 1,
    'Bedroom': 1,
    'Bathroom': 1,
    'Dining': 1
  });

  // Maximum limits for bedroom and bathroom based on home type
  const getMaxRoomLimits = () => {
    // Check if it's a special home type first
    if (specialHomeTypeCounts[formData.homeType]) {
      return {
        'Bedroom': specialHomeTypeCounts[formData.homeType]['Bedroom'],
        'Bathroom': specialHomeTypeCounts[formData.homeType]['Bathroom']
      };
    }
    
    // Otherwise process as regular BHK
    const homeType = formData.homeType?.split(' ')[0]; // Extract the number from home type (e.g., "3" from "3 BHK")
    const bhkNumber = parseInt(homeType) || 1;
    
    return {
      'Bedroom': bhkNumber,
      'Bathroom': bhkNumber
    };
  };

  useEffect(() => {
    // When component mounts or formData.homeType changes, initialize room counts
    if (formData.homeType) {
      let initialCounts = { ...roomCounts };
      
      // Check if it's a special home type
      if (specialHomeTypeCounts[formData.homeType]) {
        initialCounts = {
          ...initialCounts,
          'Bedroom': specialHomeTypeCounts[formData.homeType]['Bedroom'],
          'Bathroom': specialHomeTypeCounts[formData.homeType]['Bathroom']
        };
      } else {
        // Extract number of bedrooms and bathrooms from home type
        const homeType = formData.homeType?.split(' ')[0]; // Extract the number from home type (e.g., "3" from "3 BHK")
        const bhkNumber = parseInt(homeType) || 1;
        
        // Set default counts based on home type
        initialCounts = { 
          ...initialCounts,
          'Bedroom': bhkNumber, // Set bedrooms to match BHK number
          'Bathroom': bhkNumber // Set bathrooms to match BHK number
        };
      }
      
      setRoomCounts(initialCounts);
      
      // Update rooms in formData based on initial counts
      updateFormDataRooms(initialCounts);
    }
  }, [formData.homeType]);

  const updateFormDataRooms = (counts) => {
    const selectedRooms = [];
    
    // For each room type, add multiple entries based on count
    Object.entries(counts).forEach(([room, count]) => {
      if (count > 0) {
        // If count is 1, just add the room name
        if (count === 1) {
          selectedRooms.push(room);
        } else {
          // If count > 1, add numbered rooms (e.g., Bedroom 1, Bedroom 2, etc.)
          for (let i = 1; i <= count; i++) {
            selectedRooms.push(`${room} ${i}`);
          }
        }
      }
    });
    
    setFormData({ ...formData, rooms: selectedRooms });
  };

  const incrementRoom = (roomType) => {
    // Get maximum limits based on home type
    const maxLimits = getMaxRoomLimits();
    
    // Check if the room type has a limit and if it's already at maximum
    if (
      (roomType === 'Bedroom' || roomType === 'Bathroom') && 
      roomCounts[roomType] >= maxLimits[roomType]
    ) {
      // Don't increment beyond the BHK limit for bedrooms and bathrooms
      return;
    }
    
    const newCounts = { ...roomCounts, [roomType]: roomCounts[roomType] + 1 };
    setRoomCounts(newCounts);
    updateFormDataRooms(newCounts);
  };

  const decrementRoom = (roomType) => {
    if (roomCounts[roomType] > 0) {
      const newCounts = { ...roomCounts, [roomType]: roomCounts[roomType] - 1 };
      setRoomCounts(newCounts);
      updateFormDataRooms(newCounts);
    }
  };

  // Get maximum limits for UI display
  const maxLimits = getMaxRoomLimits();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-[#006452]">
        Select Rooms
      </h2>
      <div className="space-y-4">
        {Object.keys(roomCounts).map((roomType) => (
          <div 
            key={roomType} 
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <div className="text-base sm:text-lg font-medium">
              {roomType}
              {(roomType === 'Bedroom' || roomType === 'Bathroom') && (
                <span className="text-sm text-gray-500 ml-2">
                  (Max: {maxLimits[roomType]})
                </span>
              )}
            </div>
            <div className="flex items-center">
              <button
                onClick={() => decrementRoom(roomType)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#006452] text-white flex items-center justify-center shadow-sm hover:bg-[#005443] transition-colors"
                aria-label={`Decrease ${roomType}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <span className="mx-3 sm:mx-4 text-lg sm:text-xl font-semibold min-w-[20px] text-center">
                {roomCounts[roomType]}
              </span>
              
              <button
                onClick={() => incrementRoom(roomType)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  (roomType === 'Bedroom' || roomType === 'Bathroom') && roomCounts[roomType] >= maxLimits[roomType]
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#006452] text-white hover:bg-[#005443]'
                }`}
                aria-label={`Increase ${roomType}`}
                disabled={(roomType === 'Bedroom' || roomType === 'Bathroom') && roomCounts[roomType] >= maxLimits[roomType]}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelection;