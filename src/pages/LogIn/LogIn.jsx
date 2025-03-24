import React from 'react'
import { SignIn } from "@clerk/clerk-react";
import Navbar from '../../components/Navbar/Navbar';

const Login = () => {
  return (
    <>
      <Navbar />
      <div className='clerk-container'>
        <SignIn redirectUrl="/" />
      </div>
    </>
  )
}

export default Login;