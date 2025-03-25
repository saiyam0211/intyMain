import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const ScheduleMeeting = ({ company, isOpen, onClose }) => {
  console.log('ScheduleMeeting rendering:', { isOpen, companyName: company?.name });
  const { isSignedIn, user } = useUser();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [meetingType, setMeetingType] = useState('virtual'); // 'virtual' or 'in-person'

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Get available time slots - business hours 10 AM to 6 PM
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      alert('Please login to schedule a meeting');
      return;
    }
    
    if (!date || !time) {
      alert('Please select both date and time');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Format the date and time for Google Calendar
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
      
      // Format start and end times in RFC3339 format
      const startTime = startDateTime.toISOString();
      const endTime = endDateTime.toISOString();
      
      // Create the meeting details
      const meetingDetails = {
        summary: `Meeting with ${company.name}`,
        description: `${meetingType === 'virtual' ? 'Virtual' : 'In-person'} consultation meeting between ${user.primaryEmailAddress?.emailAddress} and ${company.name}`,
        location: meetingType === 'virtual' ? 'Google Meet' : company.location || 'To be determined',
        startTime,
        endTime,
        userEmail: user.primaryEmailAddress?.emailAddress,
        companyEmail: company.email || 'info@inty.co',
        userName: `${user.firstName} ${user.lastName}`,
        companyName: company.name,
        meetingType,
      };
      
      // Create Google Calendar event
      // First, build the URL for Google Calendar
      const baseUrl = 'https://calendar.google.com/calendar/render';
      const action = 'TEMPLATE';
      const text = encodeURIComponent(meetingDetails.summary);
      const dates = `${startTime.replace(/[-:]/g, '').replace('.000', '')}/` +
                    `${endTime.replace(/[-:]/g, '').replace('.000', '')}`;
      const details = encodeURIComponent(meetingDetails.description);
      const location = encodeURIComponent(meetingDetails.location);
      const add = encodeURIComponent(`${meetingDetails.userEmail},${meetingDetails.companyEmail}`);
      
      const googleCalendarUrl = `${baseUrl}?action=${action}&text=${text}&dates=${dates}&details=${details}&location=${location}&add=${add}`;
      
      // Open Google Calendar in a new tab
      window.open(googleCalendarUrl, '_blank');
      
      setSubmitStatus({
        success: true,
        message: "Your meeting has been scheduled! Check your email for confirmation.",
      });
      
      // Optionally, you can also send this data to your backend to track meetings
      // await axios.post('https://your-backend.com/api/meetings', meetingDetails);
      
      setTimeout(() => {
        onClose();
        setDate('');
        setTime('');
        setDuration('30');
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to schedule meeting. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close function with error handling
  const handleClose = () => {
    console.log('Modal close function called');
    try {
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.error('onClose is not a function', onClose);
      }
    } catch (error) {
      console.error('Error in onClose function:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 sm:mx-auto"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Schedule Meeting with {company.name}
        </h2>

        {submitStatus && (
          <div className={`p-3 rounded-md mb-4 ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleCreateMeeting} className="mx-auto mt-0">
          <div className="mb-4">
            <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Type:
            </label>
            <select
              id="meetingType"
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452]"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              required
            >
              <option value="virtual">Virtual (Google Meet)</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date:
            </label>
            <input
              type="date"
              id="date"
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Cannot select dates in the past
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time:
            </label>
            <select
              id="time"
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452]"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select a time</option>
              {getTimeSlots().map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes):
            </label>
            <select
              id="duration"
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#006452]"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors mb-2 sm:mb-0"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#006452] text-white rounded-md hover:bg-[#004d3b] transition-colors flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                "Schedule Meeting"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleMeeting; 