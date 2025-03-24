import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from "../../assets/logo.png";

const Navbar = ({ isResidentialPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (isProfileOpen && !e.target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isProfileOpen]);

  const linkClasses = isResidentialPage
    ? "cursor-pointer text-white hover:text-[#006452]"
    : "cursor-pointer hover:text-[#006452]";

  const buttonClasses = isResidentialPage
    ? "hidden md:block w-[160px] h-[40px] text-[#006452] bg-white rounded-md text-center leading-[40px] hover:bg-gray-100 transition"
    : "hidden md:block w-[160px] h-[40px] text-white bg-[#006452] rounded-md text-center leading-[40px] hover:bg-[#006452] transition";

  const mobileIconClasses = isResidentialPage
    ? "cursor-pointer text-white"
    : "cursor-pointer";

  return (
    <nav className="flex justify-between items-center w-[89%] m-auto py-4">
      {/* Logo */}
      <div>
        <a href="/"><img src={logo} className="w-[110px]" alt="Logo" /></a>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-10 text-lg font-medium">
        <a href="/">
          <li className={linkClasses}>Home</li>
        </a>
        <a href="/About">
        <li className={linkClasses}>About</li>
        </a>
        <a href="/partner-with-us">
        <li className={linkClasses}>Partner With Us</li>
        </a>
        <a href="/Contact">
        <li className={linkClasses}>Contact</li>
        </a>
      </ul>

      {/* Sign In Button or Profile */}
      {isLoaded && (
        <>
          {isSignedIn ? (
            <div className="hidden md:block profile-dropdown relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                )}
                <ChevronDown
                  size={20}
                  className={isResidentialPage ? "text-white" : "text-black"}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    {user?.fullName || user?.username}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className={buttonClasses}>
              Signin
            </a>
          )}
        </>
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden z-50">
        {isOpen ? (
          <X
            size={30}
            onClick={() => setIsOpen(false)}
            className={mobileIconClasses}
          />
        ) : (
          <Menu
            size={30}
            onClick={() => setIsOpen(true)}
            className={mobileIconClasses}
          />
        )}
      </div>

    {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full z-40 h-full ${
          isResidentialPage ? "bg-[#006452]" : "bg-white"
        } flex flex-col items-center justify-center gap-6 text-lg font-medium transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <X
          size={30}
          onClick={() => setIsOpen(false)}
          className={`absolute top-5 right-5 ${mobileIconClasses}`}
        />

        <a
          href="/"
          className={
            isResidentialPage
              ? "text-white hover:text-gray-200"
              : "hover:text-[#006452]"
          }
          onClick={() => setIsOpen(false)}
        >
          Home
        </a>

        <a
          href="/About"
          className={
            isResidentialPage
              ? "text-white hover:text-gray-200"
              : "hover:text-[#006452]"
          }
          onClick={() => setIsOpen(false)}
        >
          About
        </a>

        <a
          href="/partner-with-us"
          className={
            isResidentialPage
              ? "text-white hover:text-gray-200"
              : "hover:text-[#006452]"
          }
          onClick={() => setIsOpen(false)}
        >
          Partner With Us
        </a>

        <a
          href="/Contact"
          className={
            isResidentialPage
              ? "text-white hover:text-gray-200"
              : "hover:text-[#006452]"
          }
          onClick={() => setIsOpen(false)}
        >
          Contact
        </a>

        {isLoaded && (
          <>
            {isSignedIn ? (
              <div className="flex flex-col items-center gap-4">
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div className="text-center">
                  <div
                    className={
                      isResidentialPage ? "text-white" : "text-gray-700"
                    }
                  >
                    {user?.fullName || user?.username}
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className={
                    isResidentialPage
                      ? "w-[160px] h-[40px] text-[#006452] bg-white rounded-md text-center leading-[40px] hover:bg-gray-100 transition"
                      : "w-[160px] h-[40px] text-white bg-[#006452] rounded-md text-center leading-[40px] hover:bg-[#006452] transition"
                  }
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className={
                  isResidentialPage
                    ? "w-[160px] h-[40px] text-[#006452] bg-white rounded-md text-center leading-[40px] hover:bg-gray-100 transition"
                    : "w-[160px] h-[40px] text-white bg-[#006452] rounded-md text-center leading-[40px] hover:bg-[#006452] transition"
                }
                onClick={() => setIsOpen(false)}
              >
                Signin
              </a>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
