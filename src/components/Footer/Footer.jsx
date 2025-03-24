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
    <footer className="bg-black text-white py-12 px-4 md:px-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* Logo and Social Icons */}
        <div>
          <img src={logo} alt="Logo" className="mx-auto md:mx-0 mb-4" />
          <p className="text-gray-300 mb-4">Transform your space into something extraordinary with Inty's expert interior design services.</p>
          <div className="flex justify-center md:justify-start gap-4">
            <a href="https://www.facebook.com/share/1BPc7Pywr5/?mibextid=wwXIfr" className="hover:opacity-75 transition-opacity">
              <FaFacebook className="text-blue-500 text-2xl cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/invites/contact/?igsh=1ncvrpyd5462u&utm_content=vo1rp7e" className="hover:opacity-75 transition-opacity">
              <FaInstagram className="text-pink-500 text-2xl cursor-pointer" />
            </a>
            <a href="https://www.linkedin.com/company/interiorwaale/" className="hover:opacity-75 transition-opacity">
              <FaLinkedinIn className="text-blue-400 text-2xl cursor-pointer" />
            </a>
          </div>
        </div>
        
        {/* Footer Links */}
        <div>
          <h2 className="font-bold text-lg mb-3">Inty</h2>
          <ul className="space-y-2">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/About" className="hover:underline">About Us</a></li>
            <li><a href="/partner-with-us" className="hover:underline">Partner With Us</a></li>
            <li><a href="/residential-space" className="hover:underline">Residential Space</a></li>
            <li><a href="/residential-space?spaceType=Commercial" className="hover:underline">Commercial Space</a></li>
            <li><a href="/cost-estimator" className="hover:underline">Cost Estimator</a></li>
            <li><a href="/blog" className="hover:underline">Blog</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="font-bold text-lg mb-3">Contact Us</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaPhone className="text-gray-400" />
              <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-gray-400" />
              <a href="mailto:info@inty.in" className="hover:underline">info@inty.in</a>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <span>Mumbai, Maharashtra, India</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h2 className="font-bold text-lg mb-3">Stay Updated</h2>
          <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates and design inspiration.</p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-gray-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto mt-8 pt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Inty. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Service</a>
            <a href="/sitemap" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
