import React from 'react'
import { SignUp } from "@clerk/clerk-react";
import Navbar from '../../components/Navbar/Navbar';
import { useLocation } from 'react-router-dom';

const Register = () => {
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';
  
  return (
    <>
      <Navbar />
      <div className='clerk-container'>
        <SignUp redirectUrl={returnUrl} />
      </div>
    </>
  )
}

export default Register;