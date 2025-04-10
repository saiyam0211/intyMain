import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import logo from "../../assets/logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    setEmail("");
  };

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and Description Section */}
          <div className="text-center sm:text-left space-y-4">
            <img src={logo} alt="Logo" className="h-12 mx-auto sm:mx-0 mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Transform your space into something extraordinary with inty's expert interior design services.
            </p>
            <div className="flex justify-center sm:justify-start gap-6 pt-2">
              <a href="https://www.facebook.com/share/1BPc7Pywr5/?mibextid=wwXIfr" 
                className="transform hover:scale-110 transition-transform duration-200">
                <FaFacebook className="text-blue-500 text-2xl" />
              </a>
              <a href="https://www.instagram.com/invites/contact/?igsh=1ncvrpyd5462u&utm_content=vo1rp7e" 
                className="transform hover:scale-110 transition-transform duration-200">
                <FaInstagram className="text-pink-500 text-2xl" />
              </a>
              <a href="https://www.linkedin.com/company/interiorwaale/" 
                className="transform hover:scale-110 transition-transform duration-200">
                <FaLinkedinIn className="text-blue-400 text-2xl" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold mb-4 text-white">Quick Links</h2>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors duration-200">Home</a></li>
              <li><a href="/About" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="/partner-with-us" className="text-gray-400 hover:text-white transition-colors duration-200">Partner With Us</a></li>
              <li><a href="/residential-space" className="text-gray-400 hover:text-white transition-colors duration-200">Residential Space</a></li>
              <li><a href="/residential-space?spaceType=Commercial" className="text-gray-400 hover:text-white transition-colors duration-200">Commercial Space</a></li>
              <li><a href="/cost-estimator" className="text-gray-400 hover:text-white transition-colors duration-200">Cost Estimator</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors duration-200">Blog</a></li>
            </ul>
          </div>

          {/* Contact Information Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold mb-4 text-white">Contact Us</h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <FaPhone className="text-[#006452] text-lg" />
                <a href="tel:+918792484298" className="text-gray-400 hover:text-white transition-colors duration-200">
                  +91 87924 84298
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <FaEnvelope className="text-[#006452] text-lg" />
                <a href="mailto:inty.operations@gmail.com" className="text-gray-400 hover:text-white transition-colors duration-200">
                inty.operations@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3">
                <FaMapMarkerAlt className="text-[#006452] text-lg" />
                <span className="text-gray-400">Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold mb-4 text-white">Stay Updated</h2>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and design inspiration.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[#006452] focus:ring-1 focus:ring-[#006452] transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#006452] hover:bg-[#005443] text-white py-2 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} inty. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <a href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
