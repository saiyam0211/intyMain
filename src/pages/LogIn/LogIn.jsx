import React from 'react'
import { SignIn } from "@clerk/clerk-react";
import Navbar from '../../components/Navbar/Navbar';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';
  
  return (
    <>
      <Navbar />
      <div className='clerk-container'>
        <SignIn redirectUrl={returnUrl} />
      </div>
    </>
  )
}

export default Login;